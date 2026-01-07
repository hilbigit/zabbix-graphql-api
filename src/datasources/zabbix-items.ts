import {ParsedArgs, ZabbixRequest} from "./zabbix-request.js";
import {ZabbixItem} from "../schema/generated/graphql";


export class ZabbixQueryItemsRequest extends ZabbixRequest<ZabbixItem[]> {
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

