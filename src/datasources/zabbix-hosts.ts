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
import {ZabbixQueryItemRequest} from "./zabbix-templates.js";


/**
 * Generic request to query hosts from Zabbix.
 */
export class ZabbixQueryHostsGenericRequest<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixRequest<T, A> {
    public static PATH = "host.get";

    /**
     * @param path - The Zabbix API method path.
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(path: string, authToken?: string | null, cookie?: string | null) {
        super(path, authToken, cookie);
        this.skippableZabbixParams.set("selectParentTemplates", "parentTemplates");
        this.skippableZabbixParams.set("selectTags", "tags");
        this.skippableZabbixParams.set("selectInheritedTags", "tags");
        this.skippableZabbixParams.set("selectHostGroups", "hostgroups");
        this.impliedFields.set("deviceType", ["tags"]);
        this.impliedFields.set("hostType", ["tags"]);
    }

    /**
     * Executes the request and returns the result or an error.
     * @param zabbixAPI - The Zabbix API instance.
     * @param args - The parsed arguments for the request.
     * @param output - The list of fields to return.
     * @returns A promise that resolves to the result or an error.
     */
    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: A, output?: string[]): Promise<ZabbixErrorResult | T> {
        return await super.executeRequestReturnError(zabbixAPI, args, output);
    }

    /**
     * Creates the parameters for the Zabbix API request.
     * @param args - The parsed arguments for the request.
     * @param output - The list of fields to return.
     * @returns The Zabbix parameters.
     */
    createZabbixParams(args?: A, output?: string[]): ZabbixParams {
        const params: any = {
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
                "description",
            ]
        };

        return this.optimizeZabbixParams(params, output);
    }
}


/**
 * Request to query host metadata from Zabbix.
 */
export class ZabbixQueryHostsMetaRequest extends ZabbixQueryHostsGenericRequest<Host[]> {
    public static PATH = "host.get.meta";

    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
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


/**
 * Generic request to query hosts with their items from Zabbix.
 */
export class ZabbixQueryHostsGenericRequestWithItems<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixQueryHostsGenericRequest<T, A> {
    /**
     * @param path - The Zabbix API method path.
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
        this.skippableZabbixParams.set("selectItems", "items");
        this.impliedFields.set("state", ["items", "items.lastclock", "items.lastvalue"]);
    }

    createZabbixParams(args?: A, output?: string[]): ZabbixParams {
        return this.optimizeZabbixParams({
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
                "error",
                "units",
                "history",
                "delay",
                "description",
                "preprocessing",
                "tags",
                "master_itemid",
            ],
            output: [
                "hostid",
                "host",
                "name",
                "description",
            ],
        }, output);
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: A, output?: string[]): Promise<ZabbixErrorResult | T> {
        let result = await super.executeRequestReturnError(zabbixAPI, args, output);

        if (result && !isZabbixErrorResult(result) && (!output || output.includes("items.preprocessing"))) {
            const hosts = <ZabbixHost[]>result;
            const hostids = hosts.map(h => h.hostid);
            
            if (hostids.length > 0) {
                // Batch fetch preprocessing for all items of these hosts
                const allItems = await new ZabbixQueryItemRequest(this.authToken, this.cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({
                    hostids: hostids,
                    selectPreprocessing: "extend"
                }));

                if (!isZabbixErrorResult(allItems) && Array.isArray(allItems)) {
                    const itemidToPreprocessing = new Map<string, any>();
                    allItems.forEach((item: any) => {
                        itemidToPreprocessing.set(item.itemid, item.preprocessing);
                    });

                    for (let device of hosts) {
                        for (let item of device.items || []) {
                            item.preprocessing = itemidToPreprocessing.get(item.itemid.toString());
                        }
                    }
                }
            }
        }

        if (result && !isZabbixErrorResult(result) && (!output || output.includes("state.current") || output.includes("items.lastclock") || output.includes("items.lastvalue"))) {
            const hosts = <ZabbixHost[]>result;
            for (let device of hosts) {
                for (let item of device.items || []) {
                    if (!item.lastclock || !Number(item.lastclock)) {
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

/**
 * Generic request to query hosts with their items and inventory from Zabbix.
 */
export class ZabbixQueryHostsGenericRequestWithItemsAndInventory<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixQueryHostsGenericRequestWithItems<T, A> {
    /**
     * @param path - The Zabbix API method path.
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
        this.skippableZabbixParams.set("selectInventory", "inventory");
    }

    createZabbixParams(args?: A, output?: string[]): ZabbixParams {
        return this.optimizeZabbixParams({
            ...super.createZabbixParams(args),
            selectInventory: [
                "location", "location_lat", "location_lon"
            ]
        }, output);
    }
}

export class ZabbixQueryHostsRequestWithItemsAndInventory extends ZabbixQueryHostsGenericRequestWithItemsAndInventory<ZabbixHost[]> {
    constructor(authToken?: string | null, cookie?: string) {
        super("host.get.with_items", authToken, cookie);
    }
}

/**
 * Arguments for querying devices.
 */
export class ZabbixQueryDevicesArgs extends ParsedArgs {
    /**
     * @param args - The raw arguments.
     */
    constructor(public args?: any) {
        if (!args?.tag_deviceType ||
            (Array.isArray(args.tag_deviceType) && !args.tag_deviceType.length)) {
            args.tag_deviceType_exists = true;
        }
        super(args);
    }
}

/**
 * Request to query devices from Zabbix.
 */
export class ZabbixQueryDevices  extends ZabbixQueryHostsGenericRequestWithItemsAndInventory<Device[], ZabbixQueryDevicesArgs> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
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
    macros?: { macro: string, value: string }[];
    tags?: { tag: string, value: string }[];
    additionalParams?: any;
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
        if (inputParams.macros) {
            this.macros = inputParams.macros;
        }
        if (inputParams.tags) {
            this.tags = inputParams.tags;
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
    macros?: { macro: string, value: string }[]
    tags?: { tag: string, value: string }[]
}


/**
 * Request to create a host in Zabbix.
 */
export class ZabbixCreateHostRequest extends ZabbixRequest<CreateHostResponse> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(authToken?: string | null, cookie?: string | null) {
        super("host.create", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        if (args && isZabbixCreateHostInputParams(args.zabbix_params)) {
            return {...new ZabbixCreateHostParams(args.zabbix_params), ...args.zabbix_params.additionalParams};
        }

        return args?.zabbix_params || {};
    }
}

/**
 * Request to delete hosts in Zabbix.
 */
export class ZabbixDeleteHostsRequest extends ZabbixRequest<{ hostids: string[] }> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(authToken?: string | null, cookie?: string | null) {
        super("host.delete", authToken, cookie);
    }
}
