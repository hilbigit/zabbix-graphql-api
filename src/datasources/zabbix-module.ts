import {ParsedArgs, ZabbixParams, ZabbixRequest} from "./zabbix-request.js";
import {UserRoleModule} from "../schema/generated/graphql.js";

export class ZabbixQueryModulesRequest extends ZabbixRequest<UserRoleModule[]> {
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
