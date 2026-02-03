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

export interface ZabbixHistoryPushInput {
    timestamp: string
    value: any,
}

export interface ZabbixHistoryPushResult {
    response: string,
    data: { itemid: string, error?: string[] | ApiError }[],
    error?: ApiError | string[]
}

export class ZabbixHistoryPushParams extends ParsedArgs {
    constructor(public values: ZabbixHistoryPushInput[], public itemid?: string,
                public key?: string,
                public host?: string,) {
        super();
    }
}

export class ZabbixHistoryPushRequest extends ZabbixRequest<ZabbixHistoryPushResult, ZabbixHistoryPushParams> {
    constructor(authToken?: string | null, cookie?: string) {
        super("history.push", authToken, cookie);
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: ZabbixHistoryPushParams): Promise<ZabbixHistoryPushResult | ZabbixErrorResult | undefined> {
        if (!args) return undefined;


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
