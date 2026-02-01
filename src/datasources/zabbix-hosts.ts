import {CreateHostResponse, Device, Host, ZabbixHost} from "../schema/generated/graphql.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {
    isZabbixErrorResult,
    ParsedArgs,
    ZabbixErrorResult,
    ZabbixParams,
    ZabbixRequest,
    ZabbixResult
} from "./zabbix-request.js";
import {ZabbixHistoryGetParams, ZabbixQueryHistoryRequest} from "./zabbix-history.js";


export class ZabbixQueryHostsGenericRequest<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixRequest<T, A> {
    public static PATH = "host.get";

    constructor(path: string, authToken?: string | null, cookie?: string | null) {
        super(path, authToken, cookie);
    }

    createZabbixParams(args?: A): ZabbixParams {
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


export class ZabbixQueryHostsGenericRequestWithItems<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixQueryHostsGenericRequest<T, A> {
    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
    }

    createZabbixParams(args?: A): ZabbixParams {
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
                "hostgroups",
                "items",
                "description",
                "parentTemplates"
            ],
        };
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: A): Promise<ZabbixErrorResult | T> {
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

export class ZabbixQueryHostsGenericRequestWithItemsAndInventory<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixQueryHostsGenericRequestWithItems<T, A> {
    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
    }

    createZabbixParams(args?: A): ZabbixParams {
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

export class ZabbixQueryDevicesArgs extends ParsedArgs {
    constructor(public args?: any) {
        if (!args?.tag_deviceType ||
            (Array.isArray(args.tag_deviceType) && !args.tag_deviceType.length)) {
            args.tag_deviceType_exists = true;
        }
        super(args);
    }
}

export class ZabbixQueryDevices  extends ZabbixQueryHostsGenericRequestWithItemsAndInventory<Device[], ZabbixQueryDevicesArgs> {
    constructor(authToken?: string | null, cookie?: string) {
        super("host.get.with_items", authToken, cookie);
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
            this.inventory_mode = 0;
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
    inventory_mode?: number

    inventory?: {
        location: String
        location_lat?: String
        location_lon?: String
    }
    templates?: any
    groups?: any
}


export class ZabbixCreateHostRequest extends ZabbixRequest<CreateHostResponse> {
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

export class ZabbixDeleteHostsRequest extends ZabbixRequest<{ hostids: string[] }> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("host.delete", authToken, cookie);
    }
}
