import {ParsedArgs, ZabbixParams, ZabbixRequest} from "./zabbix-request.js";
import {UserRoleModule} from "../schema/generated/graphql.js";

/**
 * Request to query modules from Zabbix.
 */
export class ZabbixQueryModulesRequest extends ZabbixRequest<UserRoleModule[]> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(authToken?: string | null, cookie?: string | null) {
        super("module.get", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            output: "extend"
        }
    }

}
