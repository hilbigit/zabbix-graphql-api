import {SortOrder, StorageItemType} from "../schema/generated/graphql.js";
import {ParsedArgs, ZabbixParams, ZabbixRequest, ZabbixResult} from "./zabbix-request.js";

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
