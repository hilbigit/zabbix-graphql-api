import {ParsedArgs, ZabbixRequest} from "./zabbix-request.js";
import {ZabbixItem} from "../schema/generated/graphql.js";


/**
 * Request to query items from Zabbix.
 */
export class ZabbixQueryItemsRequest extends ZabbixRequest<ZabbixItem[]> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(authToken?: string | null, cookie?: string) {
        super("item.get", authToken, cookie);
    }

    /**
     * Creates the parameters for the Zabbix API request.
     * @param args - The parsed arguments for the request.
     * @returns The Zabbix parameters.
     */
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
