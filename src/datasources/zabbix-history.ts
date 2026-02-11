import {ApiError, SortOrder, StorageItemType} from "../schema/generated/graphql.js";
import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult, ZabbixParams, ZabbixRequest, ZabbixResult} from "./zabbix-request.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {GraphQLError} from "graphql";

export interface ZabbixValue {
    itemid?: string,
    key?: string,
    host?: string,
    value: string,
    clock: number,
    ns: number
}

export interface ZabbixExportValue extends ZabbixValue, ZabbixResult {
    itemid?: string
}

/**
 * Parameters for querying history from Zabbix.
 */
export class ZabbixHistoryGetParams extends ParsedArgs {
    time_from_ms: number | undefined
    time_till_ms: number | undefined

    /**
     * @param itemids - The IDs of the items to query history for.
     * @param output - The list of fields to return.
     * @param limit - The maximum number of values to return.
     * @param history - The storage item type (e.g., float, integer, character, text, log).
     * @param time_from - The start time for the history query.
     * @param time_until - The end time for the history query.
     * @param sortfield - The field to sort the results by.
     * @param sortorder - The sort order (ASC or DESC).
     */
    constructor(public itemids: number[] | number | string | string[],
                public output: string[] = ["value", "itemid", "clock", "ns"],
                public limit: number | null | undefined = undefined,
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

/**
 * Request to query history from Zabbix.
 */
export class ZabbixQueryHistoryRequest extends ZabbixRequest<ZabbixExportValue[], ZabbixHistoryGetParams> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
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

export interface ZabbixHistoryPushInput {
    timestamp: string
    value: any,
}

export interface ZabbixHistoryPushResult {
    response: string,
    data: { itemid: string, error?: string[] | ApiError }[],
    error?: ApiError | string[]
}

/**
 * Parameters for pushing history to Zabbix.
 */
export class ZabbixHistoryPushParams extends ParsedArgs {
    /**
     * @param values - The history values to push.
     * @param itemid - Optional item ID to push history for.
     * @param key - Optional item key to push history for.
     * @param host - Optional host name to push history for.
     */
    constructor(public values: ZabbixHistoryPushInput[], public itemid?: string,
                public key?: string,
                public host?: string,) {
        super();
    }
}

/**
 * Request to push history to Zabbix.
 */
export class ZabbixHistoryPushRequest extends ZabbixRequest<ZabbixHistoryPushResult, ZabbixHistoryPushParams> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(authToken?: string | null, cookie?: string) {
        super("history.push", authToken, cookie);
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: ZabbixHistoryPushParams): Promise<ZabbixHistoryPushResult | ZabbixErrorResult | undefined> {
        if (!args) return undefined;

        const version = await zabbixAPI.getVersion();
        if (version < "7.0.0") {
            throw new GraphQLError(`history.push is only supported in Zabbix 7.0.0 and newer. Current version is ${version}. For older versions, please use Zabbix trapper items and zabbix_sender protocol.`);
        }

        if (!args.itemid && (!args.key || !args.host)) {
            throw new GraphQLError("if itemid is empty both key and host must be filled");
        }

        return super.prepare(zabbixAPI, args);
    }

    createZabbixParams(args?: ZabbixHistoryPushParams): ZabbixParams {
        if (!args) return [];
        return args.values.map(v => {
            const date = new Date(v.timestamp);
            const result: any = {
                value: typeof v.value === 'string' ? v.value : JSON.stringify(v.value),
                clock: Math.floor(date.getTime() / 1000),
                ns: (date.getTime() % 1000) * 1000000
            };
            if (args.itemid) {
                result.itemid = args.itemid;
            } else {
                result.host = args.host;
                result.key = args.key;
            }
            return result as ZabbixValue;
        });
    }
}
