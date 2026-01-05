import {ZabbixAPI} from "./zabbix-api.js";
import {ApiError, SortOrder, StorageItemType} from "../generated/graphql.js";
import {ZabbixCreateOrUpdateStorageItemRequest} from "./zabbix-items.js";
import {ZabbixForceCacheReloadRequest} from "./zabbix-script.js";
import {logger} from "../logging/logger.js";
import {ApiErrorCode} from "../model/model_enum_values.js";
import {ParsedArgs, ZabbixParams, ZabbixRequest, ZabbixResult} from "./zabbix-request.js";
import {sleep} from "../common_utils";

export interface ZabbixValue {
    key?: string,
    host?: string,
    value: string,
    clock: number,
    ns: number
}

export interface ZabbixExportValue extends ZabbixValue, ZabbixResult {
    itemid?: string
}

export class ZabbixHistoryGetParams extends ParsedArgs {
    time_from_ms: number | undefined
    time_till_ms: number | undefined

    constructor(public itemids: number[] | number | string | string[],
        public output: string[] = ["value", "itemid", "clock", "ns"],
        public limit: number | null = Array.isArray(itemids) ? itemids.length : 1,
        public history: StorageItemType | string = StorageItemType.Text,
        time_from?: Date,
        time_until?: Date,
        public sortfield: string[] = ["clock", "ns"],
        public sortorder: SortOrder | null = SortOrder.Desc,
    ) {
        super();
        this.time_from_ms = time_from ? Math.floor(new Date(time_from).getTime() / 1000) : undefined
        this.time_till_ms = time_until ? Math.floor(new Date(time_until).getTime() / 1000) : undefined
    }
}

export class ZabbixQueryHistoryRequest extends ZabbixRequest<ZabbixExportValue[], ZabbixHistoryGetParams> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("history.get", authToken, cookie);
    }

    createZabbixParams(args?: ZabbixHistoryGetParams): ZabbixParams {
        return {
            itemids: args?.itemids,
            output: args?.output,
            limit: args?.limit,
            history: args?.history?.valueOf(),
            sortfield: args?.sortfield,
            sortorder: args?.sortorder == SortOrder.Asc ? "ASC" : "DESC",
            time_from: args?.time_from_ms,
            time_till: args?.time_till_ms,
        }
    }
}


export interface ZabbixHistoryPushResult {
    response: string,
    data: { itemid: string, error?: string[] | ApiError }[],
    error?: ApiError | string[]
}

export class ZabbixHistoryPushRequest extends ZabbixRequest<ZabbixHistoryPushResult> {
    constructor(authToken?: string | null, cookie?: string) {
        super("history.push", authToken, cookie);
    }
}

export class ZabbixStoreObjectInItemHistoryRequest extends ZabbixRequest<ZabbixHistoryPushResult> {
    // After creating an item or host zabbix needs some time before the created object can be referenced in other
    // operations - the reason is the config-cache. In case of having ZBX_CACHEUPDATEFREQUENCY=1 (seconds) set within the
    // Zabbix - config the delay of 1 second will be sufficient
    private static readonly ZABBIX_DELAY_UNTIL_CONFIG_CHANGED: number = 0
    public itemid: number | undefined

    constructor(authToken?: string | null, cookie?: string) {
        super("history.push.jsonobject", authToken, cookie);
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: ParsedArgs): Promise<any> {
        // Create or update zabbix Item
        let success = false;
        this.itemid = Number(args?.getParam("itemid"))
        let timeoutForValueUpdate = this.itemid ? 0 : ZabbixStoreObjectInItemHistoryRequest.ZABBIX_DELAY_UNTIL_CONFIG_CHANGED;

        // Create or update controlprogram - item
        let result: {
            "itemids": string[]
        } | undefined = await new ZabbixCreateOrUpdateStorageItemRequest(
            this.itemid ? "item.update.storeiteminhistory" : "item.create.storeiteminhistory",
            this.authToken, this.cookie).executeRequestThrowError(zabbixAPI, args)

        // logger.debug(`Create/update item itemid=${this.itemid}, hostid=${this.zabbixHostId} lead to result=`, JSON.stringify(result));

        if (result && result.hasOwnProperty("itemids") && result.itemids.length > 0) {
            this.itemid = Number(result.itemids[0]);
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

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            itemid: this.itemid,
            value: JSON.stringify(args?.getParam("value"))
        }
    }

}
