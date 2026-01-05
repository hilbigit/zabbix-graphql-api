import {ParsedArgs, ZabbixParams, ZabbixRequest, ZabbixResult, ZabbixValueType} from "./zabbix-request.js";

export class ZabbixQueryItemsMetaRequest extends ZabbixRequest<any> {
    createZabbixParams(args?: ParsedArgs) {
        return {
            "templated": false,
            output: [
                "itemid",
                "key_",
                "hostid"
            ], ...args?.zabbix_params
        };
    }
}

export type QueryZabbixItemResponse = {
    value_type: string;
    itemid: string,
    name: string,
    status?: string,
    key_?: string,
    lastvalue: string | null
    lastclock: string | null
    tags?: {
        tag: string,
        value: string
    }[]
    hosts?: {
        hostid: number,
        host: string,
        templateid?: number,
        name: string
    }[]
}

export class ZabbixQueryItemsRequest extends ZabbixRequest<QueryZabbixItemResponse[]> {
    constructor(authToken?: string | null, cookie?: string) {
        super("item.get", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs) {
        return {
            "templated": false,
            "selectHosts": [
                "templateid",
                "hostid",
                "host",
                "name",
                "description",
            ],
            "selectTags": [
                "tag",
                "value"
            ],
            output: [
                "itemid",
                "name",
                "key_",
                "hostid",
                "status",
                "type",
                "description",
            ], ...args?.zabbix_params
        };
    }
}


export class ZabbixQueryItemsByIdRequest extends ZabbixRequest<QueryZabbixItemResponse[]> {
    constructor(authToken?: string | null, cookie?: string) {
        super("item.get.itembyid", authToken, cookie);
    }
    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        let filter: { key_: string | null } | null = null
        if (args?.zabbix_params?.hasOwnProperty("id")) {
            // @ts-ignore
            args.zabbix_params["filter"] = {
                // @ts-ignore
                ...args?.zabbix_params.filter, "key_": args?.zabbix_params.id
            }
            // @ts-ignore
            delete args.zabbix_params["id"]
        }
        return {
            filter: filter,
            "selectTags": ["tag", "value"],
            "inheritedTags": true,
            "output": [
                "lastvalue",
                "lastclock",
                "value_type",
                "hostid",
                "itemid",
                "name",
                "status",
                "key_"
            ], ...args?.zabbix_params,
        }
    };
}


export interface ZabbixStoreValueInItemParams extends ZabbixParams {
    hostid?: number
    itemid?: number
    key: string
    name: string
    tags: {
        tag: string,
        value?: string
    }[]
    value: Object
}

const isStoreValueInItem = (value: ZabbixParams): value is ZabbixStoreValueInItemParams =>
    "hostid" in value && !!value.hostid && "name" in value && "key" in value && "value" in value;

const isUpdateValueInItemParams = (value: ZabbixParams): value is ZabbixUpdateValueInItemParams =>
    "itemid" in value && !!value.itemid && isStoreValueInItem(value);

export interface ZabbixUpdateValueInItemParams extends ZabbixStoreValueInItemParams {
    itemid: number
}

export enum ZabbixItemType {
    ZABBIX_TRAPPER = 2,
    ZABBIX_SCRIPT = 21
}

export class ZabbixCreateOrUpdateStorageItemRequest extends ZabbixRequest<any> {
    static MAX_ZABBIX_ITEM_STORAGE_PERIOD = "9125d"; // Maximum possible value is 25 years, which corresponds to 9125 days

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        if (args && isStoreValueInItem(args?.zabbix_params)) {
            // Attention!! Zabbix status
            // can not be used as expected:
            // 1. Status 0 means enabled, all other values mean disabled
            // 2. If the status of the item is disabled the value will not be
            // evaluated - this means we can't use the item status to reflect
            // the activation status of the controlProgram, as we also want
            // to read the values of disabled controlPrograms..
            let createOrUpdateItemParams = {
                key_: args.zabbix_params.key,
                name: args.zabbix_params.name,
                tags: args.zabbix_params.tags,
                "type": ZabbixItemType.ZABBIX_TRAPPER.valueOf(),
                "history": ZabbixCreateOrUpdateStorageItemRequest.MAX_ZABBIX_ITEM_STORAGE_PERIOD,
                "value_type": ZabbixValueType.TEXT.valueOf()
            }

            if (isUpdateValueInItemParams(args.zabbix_params)) {
                return {
                    itemid: args.zabbix_params.itemid,
                    ...createOrUpdateItemParams
                };
            }
                return {
                    hostid: args.zabbix_params.hostid,
                    ...createOrUpdateItemParams
            }

        }

        return args?.zabbix_params || {};

    }

}

export interface ZabbixDeleteItemResponse extends ZabbixResult {
    itemids: {
        itemid: string | string[]
    }
}

export class ZabbixDeleteItemRequest extends ZabbixRequest<ZabbixDeleteItemResponse> {
    constructor(authToken?: string | null, cookie?: string) {
        super("item.delete", authToken, cookie);
    }
}

export interface ZabbixCreateOrUpdateItemResponse extends ZabbixResult {
    "itemids": string[]
}

export class ZabbixCreateOrUpdateItemRequest extends ZabbixRequest<ZabbixCreateOrUpdateItemResponse> {
    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
    }
}


