import {isZabbixErrorResult, ParsedArgs, ZabbixParams} from "./zabbix-request.js";
import {Permission} from "../schema/generated/graphql.js";
import {
    FIND_ZABBIX_EDGE_DEVICE_BASE_GROUP_PREFIX,
    ZABBIX_EDGE_DEVICE_BASE_GROUP,
    ZabbixAPI,
    zabbixPrivilegeEscalationToken
} from "./zabbix-api.js";
import {logger} from "../logging/logger.js";
import {ZabbixRequestWithPermissions} from "./zabbix-permissions.js";

export interface CreateHostGroupResult {
    groupids: string[]
}

const hostGroupReadWritePermissions = {
    permissions: [
        {
            objectName: "Hostgroup",
            permission: Permission.ReadWrite
        }]
}

/**
 * Request to create a host group in Zabbix.
 */
export class ZabbixCreateHostGroupRequest extends ZabbixRequestWithPermissions<CreateHostGroupResult> {
    /**
     * @param _authToken - Ignored, as privilege escalation token is used.
     * @param cookie - Optional session cookie.
     */
    constructor(_authToken?: string | null, cookie?: string) {
        super("hostgroup.create", zabbixPrivilegeEscalationToken, cookie, hostGroupReadWritePermissions);
    }
}

/**
 * Parameters for querying host groups from Zabbix.
 */
export class ZabbixQueryHostgroupsParams extends ParsedArgs {
    search_name: string | undefined

    /**
     * @param args - The raw arguments.
     */
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

/**
 * Request to query host groups from Zabbix.
 */
export class ZabbixQueryHostgroupsRequest extends ZabbixRequestWithPermissions<ZabbixQueryHostgroupsResult[],
    ZabbixQueryHostgroupsParams> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     * @param hostGroupReadPermissions - Optional host group read permissions.
     */
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

/**
 * Request to delete host groups in Zabbix.
 */
export class ZabbixDeleteHostGroupsRequest extends ZabbixRequestWithPermissions<{ groupids: string[] }> {
    /**
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     */
    constructor(authToken?: string | null, cookie?: string | null) {
        super("hostgroup.delete", authToken, cookie, hostGroupReadWritePermissions);
    }
}

export class GroupHelper {
    public static groupFullName(groupName: string) {
        return groupName == ZABBIX_EDGE_DEVICE_BASE_GROUP ? groupName : `${ZABBIX_EDGE_DEVICE_BASE_GROUP}/${GroupHelper.groupShortName(groupName)}`
    }

    static groupShortName(groupName: string) {
        return groupName.replace(FIND_ZABBIX_EDGE_DEVICE_BASE_GROUP_PREFIX, "")
    }

    /**
     * Finds host group IDs by their names.
     * @param groupNames - The names of the host groups to find.
     * @param zabbixApi - The Zabbix API instance.
     * @param zabbixAuthToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     * @returns A promise that resolves to an array of host group IDs.
     */
    public static async findHostGroupIdsByName(groupNames: string[], zabbixApi: ZabbixAPI, zabbixAuthToken?: string | null, cookie?: string | null) {
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
