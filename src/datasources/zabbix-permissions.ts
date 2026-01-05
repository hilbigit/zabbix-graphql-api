import {ParsedArgs, ZabbixRequest} from "./zabbix-request.js";


class ZabbixQueryTemplateGroupPermissionsRequest extends ZabbixRequest<
    {
        groupid: string,
        name: string
    }[]> {
    constructor(authToken?: string | null, cookie?: string) {
        super("templategroup.get.permissions", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs) {
        return {
            "output": [
                "usrgrpid",
                "name",
                "gui_access",
                "users_status"
            ], ...args?.zabbix_params,
            "selectTemplateGroupRights": [
                "id",
                "permission"
            ]
        };
    }
}


interface ZabbixUserGroupResponse {
    usrgrpid: string,
    name: string,
    gui_access: string,
    users_status: string,
    templategroup_rights:
        {
            id: string,
            permission: string
        }[]
}

class ZabbixQueryUserGroupPermissionsRequest extends ZabbixRequest<ZabbixUserGroupResponse[]> {
    constructor(authToken?: string | null, cookie?: string) {
        super("usergroup.get.permissions", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs) {
        return {
            ...super.createZabbixParams(args),
            "params": {
                "output": [
                    "groupid",
                    "name"
                ],
                "searchWildcardsEnabled": true,
                "search": {
                    "name": [
                        "Permissions/*"
                    ]
                }
            },
            "id": 1
        };
    }

}
