import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult, ZabbixParams, ZabbixRequest} from "./zabbix-request.js";
import {ApiErrorCode, DeviceCommunicationType, StorageItemType} from "../model/model_enum_values.js";
import {ZabbixHistoryGetParams, ZabbixHistoryPushResult, ZabbixQueryHistoryRequest} from "./zabbix-history.js";
import {zabbixAPI, ZabbixAPI} from "./zabbix-api.js";
import {ZabbixForceCacheReloadRequest} from "./zabbix-script.js";
import {logger} from "../logging/logger.js";
import {sleep} from "../common_utils.js";
import {
    GroupValueLocator,
    MutationStoreGroupValueArgs,
    QueryGetGroupValueArgs,
    SortOrder
} from "../schema/generated/graphql.js";
import {ZabbixCreateHostRequest, ZabbixQueryHostsMetaRequest} from "./zabbix-hosts.js";
import {GroupHelper} from "./zabbix-hostgroups.js";
import {ZabbixQueryItemRequest} from "./zabbix-templates.js";

export class ZabbixGroupValueLocatorParams extends ParsedArgs {
    constructor(params: { locator: GroupValueLocator }) {
        super(params);
    }

    get locator(): GroupValueLocator {
        return (this._zabbix_params as { locator: GroupValueLocator }).locator;
    }
}

export class ZabbixStoreValueInItemParams extends ZabbixGroupValueLocatorParams {
    constructor(params: MutationStoreGroupValueArgs) {
        super(params);
    }

    get value(): any {
        return (this._zabbix_params as MutationStoreGroupValueArgs).value;
    }
}

const isUpdateValueInItemParams = (locator: GroupValueLocator): boolean =>
    !!locator.itemid;


export class ZabbixCreateOrUpdateStorageItemRequest extends ZabbixRequest<
    {
        "itemids": string[],
        "hostids"?: string[]
    }, ZabbixStoreValueInItemParams> {
    static MAX_ZABBIX_ITEM_STORAGE_PERIOD = "9125d"; // Maximum possible value is 25 years, which corresponds to 9125 days

    hostid: string | undefined
    private createdHostids: string[] = [];
    private itemid: string | undefined;

    async prepare(zabbixAPI: ZabbixAPI, _args?: ZabbixStoreValueInItemParams): Promise<ZabbixErrorResult | {
        itemids: string[],
        hostids?: string[]
    } | undefined> {
        let locator = _args?.locator;
        if (!locator) {
            return {
                error: {
                    message: "Missing locator in request"
                }
            };
        }
        if (!isUpdateValueInItemParams(locator) && !locator.host) {
            if (!locator.valueType) {
                return {
                    error: {
                        message: "valueType in request is mandatory if itemid and host are not present"
                    }
                };
            }
            let groupid = 0;
            if (locator.groupid) {
                groupid = locator.groupid;
            } else if (locator.groupName) {
                let groups = await GroupHelper.findHostGroupIdsByName([locator.groupName], zabbixAPI, this.authToken, this.cookie)
                if (groups?.length) {
                    groupid = groups[0]
                } else {
                    return {
                        error: {
                            message: "Unable to find group=" + locator.groupName
                        }
                    };
                }

            } else {
                return {
                    error: {
                        message: "If groupid is empty groupName must be present in request"
                    }
                };
            }
            let hosts = await new ZabbixQueryHostsMetaRequest(this.authToken, this.cookie).executeRequestReturnError(zabbixAPI,
                new ParsedArgs({
                    groupids: groupid,
                    tags: [
                        {tag: "valueType", value: locator.valueType, operator: 1}
                    ]
                }));
            if (!isZabbixErrorResult(hosts) && hosts && hosts.length <= 1) {
                let hostid: string;
                if (hosts.length == 0) {
                    let createHostResult = await new ZabbixCreateHostRequest(this.authToken, this.cookie)
                        .executeRequestThrowError(
                            zabbixAPI,
                            new ParsedArgs({
                                host: locator.valueType + "-store-" + groupid,
                                hostgroupids: [groupid],
                                tags: [
                                    {tag: "valueType", value: locator.valueType}
                                ]
                            })
                        )
                    if (isZabbixErrorResult(createHostResult)) {
                        return {
                            error: {
                                message: "Unable to create host for storing value in item",
                                code: ApiErrorCode.ZABBIX_HOST_NOT_FOUND,
                                path: this.path,
                                data: createHostResult,
                            }
                        }
                    }
                    const hostids = (createHostResult.hostids || []).filter((id): id is number => id !== null && id !== undefined).map(id => id.toString());
                    this.createdHostids = hostids;
                    hostid = hostids[0];
                } else {
                    hostid = hosts[0].hostid!;
                }

                this.hostid = hostid;

                // Now check if item already exists on this host with this key
                const items = await new ZabbixQueryItemRequest(this.authToken || null, this.cookie || null).executeRequestReturnError(zabbixAPI,
                    new ParsedArgs({
                        hostids: hostid,
                        filter_key_: locator.key
                    }));

                if (!isZabbixErrorResult(items) && items && items.length > 0) {
                    this.itemid = items[0].itemid;
                    this.path = "item.update";
                    // @ts-ignore
                    this.requestBodyTemplate.method = "item.update";
                }
            } else {
                return {
                    error: {
                        message: "Request for retrieving host for storing value in item was expected to deliver exactly one or no host.",
                        code: ApiErrorCode.ZABBIX_HOST_NOT_FOUND,
                        path: this.path,
                        data: hosts,
                    }
                }
            }
            return super.prepare(zabbixAPI, _args);
        }
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ZabbixStoreValueInItemParams, output?: string[]): Promise<ZabbixErrorResult | {
        itemids: string[],
        hostids?: string[]
    }> {
        const result = await super.executeRequestReturnError(zabbixAPI, args, output);
        if (!isZabbixErrorResult(result)) {
            if (this.createdHostids.length > 0) {
                result.hostids = this.createdHostids;
            } else if (this.hostid) {
                result.hostids = [this.hostid];
            }
        }
        return result;
    }

    createZabbixParams(args?: ZabbixStoreValueInItemParams): ZabbixParams {
        if (args?.locator) {
            let createOrUpdateItemParams = {
                key_: args.locator.key,
                name: args.locator.name || args.locator.key,
                "type": DeviceCommunicationType.ZABBIX_TRAP.valueOf(),
                "history": ZabbixCreateOrUpdateStorageItemRequest.MAX_ZABBIX_ITEM_STORAGE_PERIOD,
                "value_type": StorageItemType.Text.valueOf()
            }

            if (this.itemid) {
                return {
                    itemid: this.itemid,
                    ...createOrUpdateItemParams
                }
            }

            // When update path is selected by caller via args.locator.itemid, ensure we pass itemid
            if (isUpdateValueInItemParams(args.locator)) {
                return {
                    itemid: String(args.locator.itemid),
                    ...createOrUpdateItemParams
                }
            }

            return {
                hostid: this.hostid,
                ...createOrUpdateItemParams
            }

        }

        return {};

    }

}

export class ZabbixStoreObjectInItemHistoryRequest extends ZabbixRequest<ZabbixHistoryPushResult, ZabbixStoreValueInItemParams> {
    // After creating an item or host zabbix needs some time before the created object can be referenced in other
    // operations - the reason is the config-cache. In case of having ZBX_CACHEUPDATEFREQUENCY=1 (seconds) set within the
    // Zabbix - config the delay of 1 second will be sufficient
    private static readonly ZABBIX_DELAY_UNTIL_CONFIG_CHANGED: number = 0
    public itemid: number | undefined
    public hostid: number | undefined

    constructor(authToken?: string | null, cookie?: string) {
        super("history.push.jsonobject", authToken, cookie);
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: ZabbixStoreValueInItemParams): Promise<any> {
        // Create or update zabbix Item
        this.itemid = args?.locator.itemid ?? undefined;
        let timeoutForValueUpdate = this.itemid ? 0 : ZabbixStoreObjectInItemHistoryRequest.ZABBIX_DELAY_UNTIL_CONFIG_CHANGED;

        // Create or update item
        let result: {
            "itemids": string[],
            "hostids"?: string[]
        } | undefined = await new ZabbixCreateOrUpdateStorageItemRequest(
            this.itemid ? "item.update.storeiteminhistory" : "item.create.storeiteminhistory",
            this.authToken, this.cookie).executeRequestThrowError(zabbixAPI, args)

        if (result && result.hasOwnProperty("itemids") && result.itemids.length > 0) {
            const newItemid = Number(result.itemids[0]);
            if (!isNaN(newItemid)) {
                this.itemid = newItemid;
            }
            if (result.hostids && result.hostids.length > 0) {
                const newHostid = Number(result.hostids[0]);
                if (!isNaN(newHostid)) {
                    this.hostid = newHostid;
                }
            }
            let scriptExecResult =
                await new ZabbixForceCacheReloadRequest(this.authToken, this.cookie).executeRequestThrowError(zabbixAPI)
            if (scriptExecResult.response != "success") {
                logger.error(`cache reload not successful: ${scriptExecResult.value}`)
            }
            await sleep(timeoutForValueUpdate).promise
        }

        if (!this.itemid) {
            this.prepResult = {
                error: {
                    message: "Unable to create/update item",
                    code: ApiErrorCode.ZABBIX_NO_ITEM_PUSH_ITEM,
                    path: this.path,
                    args: args,
                }
            }
        }
    }

    createZabbixParams(args?: ZabbixStoreValueInItemParams): ZabbixParams {
        return {
            itemid: this.itemid,
            value: JSON.stringify(args?.value)
        }
    }

}

export class GroupValueHelper {
    public static async findStorageItem(locator: GroupValueLocator, zabbixAPI: ZabbixAPI, authToken?: string | null, cookie?: string | null): Promise<{ hostid?: string, itemid?: string } | ZabbixErrorResult> {
        let hostid: string | undefined;
        let itemid: string | undefined = locator.itemid?.toString();

        if (itemid) return { itemid };

        if (locator.host) {
            const hosts = await new ZabbixQueryHostsMetaRequest(authToken, cookie).executeRequestReturnError(zabbixAPI,
                new ParsedArgs({ filter_host: locator.host }));
            if (isZabbixErrorResult(hosts)) return hosts;
            if (hosts?.length) {
                hostid = hosts[0].hostid;
            }
        } else if (locator.valueType) {
            let groupid = locator.groupid;
            if (!groupid && locator.groupName) {
                let groups = await GroupHelper.findHostGroupIdsByName([locator.groupName], zabbixAPI, authToken, cookie)
                if (groups?.length) {
                    groupid = groups[0]
                } else {
                    return { error: { message: "Unable to find group=" + locator.groupName } };
                }
            }
            if (groupid) {
                let hosts = await new ZabbixQueryHostsMetaRequest(authToken, cookie).executeRequestReturnError(zabbixAPI,
                    new ParsedArgs({
                        groupids: groupid,
                        tags: [{tag: "valueType", value: locator.valueType, operator: 1}]
                    }));
                if (isZabbixErrorResult(hosts)) return hosts;
                if (hosts?.length) {
                    hostid = hosts[0].hostid;
                }
            } else {
                return { error: { message: "Missing groupid or groupName" } };
            }
        }

        if (hostid && !itemid) {
            const items = await new ZabbixQueryItemRequest(authToken, cookie).executeRequestReturnError(zabbixAPI,
                new ParsedArgs({
                    hostids: hostid,
                    filter_key_: locator.key
                }));
            if (isZabbixErrorResult(items)) return items;
            if (items?.length) {
                itemid = items[0].itemid;
            }
        }

        return { hostid, itemid };
    }
}

export class ZabbixGetGroupValueRequest extends ZabbixRequest<any, ZabbixGroupValueLocatorParams> {
    constructor(authToken?: string | null, cookie?: string) {
        super("history.get", authToken, cookie);
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ZabbixGroupValueLocatorParams): Promise<any> {
        const locator = args?.locator;
        if (!locator) return { error: { message: "Missing locator" } };

        const lookupResult = await GroupValueHelper.findStorageItem(locator, zabbixAPI, this.authToken, this.cookie);
        if (isZabbixErrorResult(lookupResult)) return lookupResult;

        const itemid = lookupResult.itemid;
        if (!itemid) return null;

        const history = await new ZabbixQueryHistoryRequest(this.authToken, this.cookie).executeRequestReturnError(zabbixAPI, new ZabbixHistoryGetParams(
            [Number(itemid)],
            ["value"],
            1,
            StorageItemType.Text,
            undefined,
            undefined,
            ["clock"],
            SortOrder.Desc
        ));

        if (!isZabbixErrorResult(history) && history?.length) {
            try {
                return JSON.parse(history[0].value);
            } catch (e) {
                return history[0].value;
            }
        }

        return null;
    }
}