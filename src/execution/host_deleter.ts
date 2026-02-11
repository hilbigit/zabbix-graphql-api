import {DeleteResponse} from "../schema/generated/graphql.js";
import {
    ZabbixDeleteHostsRequest,
    ZabbixQueryHostsGenericRequest,
} from "../datasources/zabbix-hosts.js";
import {
    ZabbixDeleteHostGroupsRequest,
    ZabbixQueryHostgroupsRequest,
    ZabbixQueryHostgroupsParams,
    GroupHelper
} from "../datasources/zabbix-hostgroups.js";
import {isZabbixErrorResult, ParsedArgs} from "../datasources/zabbix-request.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";

/**
 * Handles deleting hosts and host groups from Zabbix.
 */
export class HostDeleter {

    /**
     * Deletes hosts based on their IDs or a name pattern.
     * @param hostids - The IDs of the hosts to delete.
     * @param name_pattern - Optional wildcard name pattern for filtering hosts.
     * @param zabbixAuthToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     * @returns A promise that resolves to an array of delete responses.
     */
    public static async deleteHosts(hostids: number[] | null | undefined, name_pattern?: string | null, zabbixAuthToken?: string, cookie?: string): Promise<DeleteResponse[]> {
        const result: DeleteResponse[] = [];
        let idsToDelete = hostids ? [...hostids] : [];

        if (name_pattern) {
            const queryResult = await new ZabbixQueryHostsGenericRequest("host.get", zabbixAuthToken, cookie)
                .executeRequestReturnError(zabbixAPI, new ParsedArgs({ name_pattern: name_pattern }));
            
            if (!isZabbixErrorResult(queryResult) && Array.isArray(queryResult)) {
                const foundIds = queryResult.map((t: any) => Number(t.hostid));
                // Merge and deduplicate
                idsToDelete = Array.from(new Set([...idsToDelete, ...foundIds]));
            }
        }

        if (idsToDelete.length === 0) {
            return [];
        }
        
        const deleteResult = await new ZabbixDeleteHostsRequest(zabbixAuthToken, cookie)
            .executeRequestReturnError(zabbixAPI, new ParsedArgs(idsToDelete));

        if (isZabbixErrorResult(deleteResult)) {
            let errorMessage = deleteResult.error.message;
            if (deleteResult.error.data) {
                errorMessage += " " + (typeof deleteResult.error.data === 'string' ? deleteResult.error.data : JSON.stringify(deleteResult.error.data));
            }
            for (const id of idsToDelete) {
                result.push({
                    id: id,
                    message: errorMessage,
                    error: deleteResult.error
                });
            }
        } else if (deleteResult?.hostids) {
            for (const id of idsToDelete) {
                result.push({
                    id: id,
                    message: `Host ${id} deleted successfully`
                });
            }
        }

        return result;
    }

    /**
     * Deletes host groups based on their IDs or a name pattern.
     * @param groupids - The IDs of the host groups to delete.
     * @param name_pattern - Optional wildcard name pattern for filtering host groups.
     * @param zabbixAuthToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     * @returns A promise that resolves to an array of delete responses.
     */
    public static async deleteHostGroups(groupids: number[] | null | undefined, name_pattern?: string | null, zabbixAuthToken?: string, cookie?: string): Promise<DeleteResponse[]> {
        const result: DeleteResponse[] = [];
        let idsToDelete = groupids ? [...groupids] : [];

        if (name_pattern) {
            const queryResult = await new ZabbixQueryHostgroupsRequest(zabbixAuthToken, cookie)
                .executeRequestReturnError(zabbixAPI, new ZabbixQueryHostgroupsParams({ 
                    filter_name: GroupHelper.groupFullName(name_pattern) 
                }));

            if (!isZabbixErrorResult(queryResult) && Array.isArray(queryResult)) {
                const foundIds = queryResult.map(g => Number(g.groupid));
                // Merge and deduplicate
                idsToDelete = Array.from(new Set([...idsToDelete, ...foundIds]));
            }
        }

        if (idsToDelete.length === 0) {
            return [];
        }

        const deleteResult = await new ZabbixDeleteHostGroupsRequest(zabbixAuthToken, cookie)
            .executeRequestReturnError(zabbixAPI, new ParsedArgs(idsToDelete));

        if (isZabbixErrorResult(deleteResult)) {
            let errorMessage = deleteResult.error.message;
            if (deleteResult.error.data) {
                errorMessage += " " + (typeof deleteResult.error.data === 'string' ? deleteResult.error.data : JSON.stringify(deleteResult.error.data));
            }
            for (const id of idsToDelete) {
                result.push({
                    id: id,
                    message: errorMessage,
                    error: deleteResult.error
                });
            }
        } else if (deleteResult?.groupids) {
            for (const id of idsToDelete) {
                result.push({
                    id: id,
                    message: `Host group ${id} deleted successfully`
                });
            }
        }

        return result;
    }
}
