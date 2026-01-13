import {isZabbixErrorResult, ParsedArgs, ZabbixParams} from "./zabbix-request.js";
import {Permission} from "../schema/generated/graphql.js";
import {
    FIND_ZABBIX_EDGE_DEVICE_BASE_GROUP_PREFIX,
    ZABBIX_EDGE_DEVICE_BASE_GROUP,
    ZabbixAPI,
    zabbixSuperAuthToken
} from "./zabbix-api.js";
import {logger} from "../logging/logger.js";
import {ZabbixRequestWithPermissions} from "./zabbix-permissions.js";

export interface CreateHostGroupResult {
    groupids: string[]
}

const hostGroupReadWritePermissions = {
    permissions: [
        {
            objectName: "Hostgroup/ConstructionSite",
            permission: Permission.ReadWrite
        }]
}

export class ZabbixCreateHostGroupRequest extends ZabbixRequestWithPermissions<CreateHostGroupResult> {
    constructor(_authToken?: string | null, cookie?: string) {
        super("hostgroup.create", zabbixSuperAuthToken, cookie, hostGroupReadWritePermissions);
    }
}

export class ZabbixQueryHostgroupsParams extends ParsedArgs {
    search_name: string | undefined

    constructor(args?: any) {
        super(args);
        if ("search_name" in args && typeof (args.search_name) == "string") {
            this.search_name = args.search_name
            delete args.search_name
        }
    }
}

export type ZabbixQueryHostgroupsResult = {
    groupid: string,
    name: string,
    uuid: string
}

export class ZabbixQueryHostgroupsRequest extends ZabbixRequestWithPermissions<ZabbixQueryHostgroupsResult[],
    ZabbixQueryHostgroupsParams> {
    constructor(authToken?: string | null, cookie?: string | null, hostGroupReadPermissions?: any) {
        super("hostgroup.get", authToken, cookie, hostGroupReadPermissions,);
    }

    createZabbixParams(args?: ZabbixQueryHostgroupsParams): ZabbixParams {
        let search = args?.search_name ? {
            "search": {
                "name": [
                    args.search_name
                ]
            }
        } : undefined
        return {
            "searchWildcardsEnabled": true,
            "output": ["groupid", "name", "uuid"],
            ...args?.zabbix_params,
            ...search
        }
    };

}


export class GroupHelper {
    public static groupFullName(groupName: string) {
        return groupName == ZABBIX_EDGE_DEVICE_BASE_GROUP ? groupName : `${ZABBIX_EDGE_DEVICE_BASE_GROUP}/${GroupHelper.groupShortName(groupName)}`
    }

    static groupShortName(groupName: string) {
        return groupName.replace(FIND_ZABBIX_EDGE_DEVICE_BASE_GROUP_PREFIX, "")
    }

    public static async findHostGroupIdsByName(groupNames: string[], zabbixApi: ZabbixAPI, zabbixAuthToken?: string, cookie?: string) {
        let result: number[] = []
        for (let groupName of groupNames) {
            let queryGroupsArgs = new ZabbixQueryHostgroupsParams({
                filter_name: GroupHelper.groupFullName(groupName)
            });
            let groups = await new ZabbixQueryHostgroupsRequest(zabbixAuthToken, cookie).executeRequestReturnError(zabbixApi, queryGroupsArgs)

            if (isZabbixErrorResult(groups) || !groups?.length) {
                logger.error(`Unable to find groupName=${groupName}`)
                return []
            }
            result.push(...groups.map((group) => Number(group.groupid)))
        }
        return result
    }
}
