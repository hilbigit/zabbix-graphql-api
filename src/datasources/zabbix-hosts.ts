import {Host, ZabbixHost} from "../generated/graphql.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {
    isZabbixErrorResult,
    ParsedArgs,
    ZabbixErrorResult,
    ZabbixParams,
    ZabbixRequest,
    ZabbixResult
} from "./zabbix-request.js";
import {QueryZabbixItemResponse} from "./zabbix-items.js";
import {ZabbixExportValue, ZabbixHistoryGetParams, ZabbixQueryHistoryRequest} from "./zabbix-history.js";


export class ZabbixQueryHostsGenericRequest<T extends ZabbixResult> extends ZabbixRequest<T> {
    public static PATH = "host.get";

    constructor(path: string, authToken?: string | null, cookie?: string | null) {
        super(path, authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            selectParentTemplates: [
                "templateid",
                "name"
            ],
            selectTags: [
                "tag",
                "value"
            ],
            selectInheritedTags: [
                "tag",
                "value"
            ],
            selectHostGroups: ["groupid", "name", "uuid"],
            output: [
                "hostid",
                "host",
                "name",
                "hostgroups",
                "description",
                "parentTemplates"
            ]
        };
    }
}


export class ZabbixQueryHostsMetaRequest extends ZabbixQueryHostsGenericRequest<Host[]> {
    public static PATH = "host.get.meta";

    constructor(authToken?: string | null, cookie?: string | null) {
        super(ZabbixQueryHostsMetaRequest.PATH, authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            inheritedTags: true
        };
    }
}

export class ZabbixQueryHostsWithDeviceTypeMetaRequest extends ZabbixQueryHostsGenericRequest<Host[]> {
    public static PATH = "host.get.meta_with_device_type"

    constructor(authToken?: string | null, cookie?: string | null) {
        super(ZabbixQueryHostsWithDeviceTypeMetaRequest.PATH, authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            tags: [
                {
                    "tag": "deviceType",
                    "operator": 4
                }
            ],
            inheritedTags: true
        };
    }
}

export class ZabbixQueryHostsGenericRequestWithItems<T extends ZabbixResult> extends ZabbixQueryHostsGenericRequest<T> {
    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            selectItems: [
                "itemid",
                "key_",
                "lastvalue",
                "lastclock",
                "name",
                "type",
                "value_type",
                "status",
            ],
            output: [
                "hostid",
                "host",
                "name",
                "hostgroup",
                "items",
                "description",
                "parentTemplates"
            ],
        };
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ParsedArgs): Promise<ZabbixErrorResult | T> {
        let result = await super.executeRequestReturnError(zabbixAPI, args);

        if (result && !isZabbixErrorResult(result)) {
            for (let device of <ZabbixHost[]>result) {
                for (let item of device.items || []) {
                    if (!item.lastclock ) {
                        let values = await new ZabbixQueryHistoryRequest(this.authToken, this.cookie).executeRequestReturnError(
                            zabbixAPI, new ZabbixHistoryGetParams(item.itemid, ["clock", "value", "itemid"], 1, item.value_type))
                        if (isZabbixErrorResult(values)) {
                            return values;
                        }
                        if (values.length) {
                            let latestValue = values[0];
                            item.lastvalue = latestValue.value;
                            item.lastclock = latestValue.clock;
                        } else {
                            item.lastvalue = null;
                            item.lastclock = null;
                        }
                    }
                }
            }

        }

        return result;
    }
}

export class ZabbixQueryHostsGenericRequestWithItemsAndInventory<T extends ZabbixResult> extends ZabbixQueryHostsGenericRequestWithItems<T> {
    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            selectInventory: [
                "location", "location_lat", "location_lon"
            ]
        };
    }
}

export class ZabbixQueryHostsRequestWithItemsAndInventory extends ZabbixQueryHostsGenericRequestWithItemsAndInventory<ZabbixHost[]> {
    constructor(authToken?: string | null, cookie?: string) {
        super("host.get.with_items", authToken, cookie);
    }
}

export class ZabbixQueryHostWithInventoryRequest extends ZabbixRequest<any> {
    constructor(authToken?: string | null, cookie?: string) {
        super("host.get.with_inventory", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            selectInventory: [
                "location", "location_lat", "location_lon"
            ],
            output: [
                "hostid",
                "host",
                "name",
                "hostgroup",
                "description",
                "parentTemplates"
            ],
        };
    }
}


const isZabbixCreateHostInputParams = (value: ZabbixParams): value is ZabbixCreateHostInputParams => "host" in value && !!value.host;

export interface ZabbixCreateHostInputParams extends ZabbixParams {
    host: string
    name: string
    description: string
    location?: {
        name: String,
        location_lat?: String,
        location_lon?: String,
    }
    templateids?: [number];
    hostgroupids?: [number];
    additionalParams?: [number];
}


class ZabbixCreateHostParams implements ZabbixParams {
    constructor(inputParams: ZabbixCreateHostInputParams) {
        this.host = inputParams.host;
        this.name = inputParams.name;
        this.description = inputParams.description;
        if (inputParams.location) {
            this.inventory = {
                location: inputParams.location.name,
                location_lat: inputParams.location.location_lat,
                location_lon: inputParams.location.location_lon,
            }
        }
        if (inputParams.templateids) {
            this.templates = inputParams.templateids.map((templateid) => {
                return {templateid: templateid}
            });
        }
        if (inputParams.hostgroupids) {
            this.groups = inputParams.hostgroupids.map((groupid) => {
                return {groupid: groupid}
            });
        }
    }

    host: string
    name: string
    description: string

    inventory?: {
        location: String
        location_lat?: String
        location_lon?: String
    }
    templates?: any
    groups?: any
}


export class ZabbixCreateHostRequest extends ZabbixRequest<{
    hostids: number[]
}> {
    constructor(authToken?: string | null, cookie?: string) {
        super("host.create", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        if (args && isZabbixCreateHostInputParams(args.zabbix_params)) {
            return {...new ZabbixCreateHostParams(args.zabbix_params), ...args.zabbix_params.additionalParams};
        }

        return args?.zabbix_params || {};
    }
}

export class ZabbixQueryHostRequest extends ZabbixQueryHostsGenericRequest<any> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("host.get", authToken, cookie);
    }
}


export class ZabbixCreateOrFindHostRequest extends ZabbixCreateHostRequest {

    constructor(protected groupid: number, protected templateid: number, authToken?: string | null, cookie?: string,) {
        super(authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return super.createZabbixParams(args);
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: ParsedArgs) {
        // Lookup host of appropriate type (by template) and groupName
        // or create one if not found. If multiple hosts are found the first
        // will be taken

        let queryHostArgs = new ParsedArgs({
            groupids: this.groupid,
            templateids: this.templateid,
        });
        let hosts: {
            hostid: number
        }[] = await new ZabbixQueryHostRequest(this.authToken, this.cookie)
            .executeRequestThrowError(zabbixAPI, queryHostArgs)
        // logger.debug("Query hosts args=", JSON.stringify(queryHostArgs), "lead to result=", JSON.stringify(hosts));
        if (hosts && hosts.length > 0) {
            // If we found a host and return it as prep result the execution of the create host request will be skipped
            this.prepResult = {
                hostids: [hosts[0].hostid]
            }
        }
        return this.prepResult;

    }
}
