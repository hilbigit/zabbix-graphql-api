import {
    ApiError,
    DeviceValueExportResponse,
    QueryExportDeviceValueHistoryArgs,
    StorageItemType
} from "../generated/graphql.js";
import {ApiErrorCode, ApiErrorMessage} from "../model/model_enum_values.js";

import {QueryZabbixItemResponse, ZabbixQueryItemsRequest} from "../datasources/zabbix-items.js";
import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult} from "../datasources/zabbix-request.js";
import {ZabbixHistoryGetParams, ZabbixQueryHistoryRequest} from "../datasources/zabbix-history.js";
import {zabbixAPI} from "../datasources/zabbix-api";

type FilterCombo = {
    deviceKey: string,
    attributeName: string
}
type ItemMapResponse = {
    items?: Map<number, FilterCombo>,
    error?: ApiError
}

export class HostValueExporter {
    static async exportDeviceData(args: QueryExportDeviceValueHistoryArgs, zabbixAuthToken?: string, cookie?: string): Promise<DeviceValueExportResponse> {
        let itemMapResponse: ItemMapResponse = await HostValueExporter.queryItemsForFilterArgs(args, zabbixAuthToken, cookie);
        if (itemMapResponse.error || !itemMapResponse.items) {
            return {
                error: itemMapResponse.error
            }
        }
        let itemMap = itemMapResponse.items;
        let items = Array.from(itemMap.keys());
        if (!items.length) {
            return {
                result: []
            }
        }
        let history = await new ZabbixQueryHistoryRequest(zabbixAuthToken, cookie).executeRequestThrowError(
            zabbixAPI, new ZabbixHistoryGetParams(
                items, ["value", "itemid", "clock", "ns"],
                args.limit,
                args.type || StorageItemType.Float,
                args.time_from, args.time_until,
                ["clock"],
                args.sortOrder,
            ))

        if (isZabbixErrorResult(history)) {
            return {
                error: {
                    data: history.error.data,
                    code: ApiErrorCode.ZABBIX_ITEM_NOT_FOUND,
                    message: ApiErrorMessage.ZABBIX_UNABLE_TO_RETRIEVE_HISTORY
                }
            }
        }
        return {
            result: history.map(historyItem => {
                let itemid = +historyItem.itemid!;
                let filter = itemMap.get(itemid);
                if (!filter) {
                    return undefined
                }
                let timestamp: Date = new Date((+historyItem.clock * 1000) + (historyItem.ns / 1000));
                return {
                    attributeKey: filter?.attributeName,
                    value: historyItem.value,
                    deviceKey: filter?.deviceKey,
                    itemid: itemid,
                    timestamp: timestamp,
                }

            }).filter(result => !!result)
        }
    }

    static async queryItemsForFilterArgs(args: QueryExportDeviceValueHistoryArgs, zabbixAuthToken?: string, cookie?: string): Promise<ItemMapResponse> {
        let deviceKeys = args.deviceKey_filter
        let attributeNames = args.attribute_filter

        let items: QueryZabbixItemResponse[] | ZabbixErrorResult = await new ZabbixQueryItemsRequest(zabbixAuthToken, cookie)
            .executeRequestReturnError(zabbixAPI, new ParsedArgs(
                {
                    filter: {
                        host: deviceKeys,
                        key_: attributeNames
                    },
                    tags: [{"tag": "hasValue", "operator": 1, "value": "true"}]
                }))

        if (isZabbixErrorResult(items)) {
            return {
                error: {
                    data: items.error.data,
                    code: ApiErrorCode.ZABBIX_ITEM_NOT_FOUND,
                    message: ApiErrorMessage.ZABBIX_UNABLE_TO_RETRIEVE_ITEMS_ACCORDING_TO_FILTER
                }
            }
        }

        let result: Map<number, FilterCombo> = new Map();

        items.forEach(item => {
            let deviceKey = item.hosts?.length ? item.hosts[0].host : undefined
            if (!item.itemid || !deviceKey || !item.key_) {
                return
            }
            result.set(+item.itemid, {
                deviceKey: deviceKey,
                attributeName: item.key_
            })
        })

        return {
            items: result
        }
    }
}
