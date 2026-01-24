
import {DeleteResponse} from "../schema/generated/graphql.js";
import {
    ZabbixDeleteTemplateGroupsRequest,
    ZabbixDeleteTemplatesRequest,
    ZabbixQueryTemplateGroupRequest,
    ZabbixQueryTemplatesRequest
} from "../datasources/zabbix-templates.js";
import {isZabbixErrorResult, ParsedArgs} from "../datasources/zabbix-request.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";

export class TemplateDeleter {

    public static async deleteTemplates(templateids: number[] | null | undefined, name_pattern?: string | null, zabbixAuthToken?: string, cookie?: string): Promise<DeleteResponse[]> {
        const result: DeleteResponse[] = [];
        let idsToDelete = templateids ? [...templateids] : [];

        if (name_pattern) {
            const queryResult = await new ZabbixQueryTemplatesRequest(zabbixAuthToken, cookie)
                .executeRequestReturnError(zabbixAPI, new ParsedArgs({ name_pattern: name_pattern }));
            
            if (!isZabbixErrorResult(queryResult) && Array.isArray(queryResult)) {
                const foundIds = queryResult.map(t => Number(t.templateid));
                // Merge and deduplicate
                idsToDelete = Array.from(new Set([...idsToDelete, ...foundIds]));
            }
        }

        if (idsToDelete.length === 0) {
            return [];
        }
        
        // Zabbix template.delete accepts an array of template IDs
        const deleteResult = await new ZabbixDeleteTemplatesRequest(zabbixAuthToken, cookie)
            .executeRequestReturnError(zabbixAPI, new ParsedArgs(idsToDelete));

        if (isZabbixErrorResult(deleteResult)) {
            let errorMessage = deleteResult.error.message;
            if (deleteResult.error.data) {
                errorMessage += " " + (typeof deleteResult.error.data === 'string' ? deleteResult.error.data : JSON.stringify(deleteResult.error.data));
            }
            // If the whole batch fails, we report the error for each ID
            for (const id of idsToDelete) {
                result.push({
                    id: id,
                    message: errorMessage,
                    error: deleteResult.error
                });
            }
        } else if (deleteResult?.templateids) {
            for (const id of idsToDelete) {
                result.push({
                    id: id,
                    message: `Template ${id} deleted successfully`
                });
            }
        }

        return result;
    }

    public static async deleteTemplateGroups(groupids: number[] | null | undefined, name_pattern?: string | null, zabbixAuthToken?: string, cookie?: string): Promise<DeleteResponse[]> {
        const result: DeleteResponse[] = [];
        let idsToDelete = groupids ? [...groupids] : [];

        if (name_pattern) {
            const queryResult = await new ZabbixQueryTemplateGroupRequest(zabbixAuthToken, cookie)
                .executeRequestReturnError(zabbixAPI, new ParsedArgs({ name_pattern: name_pattern }));

            if (!isZabbixErrorResult(queryResult) && Array.isArray(queryResult)) {
                const foundIds = queryResult.map(g => Number(g.groupid));
                // Merge and deduplicate
                idsToDelete = Array.from(new Set([...idsToDelete, ...foundIds]));
            }
        }

        if (idsToDelete.length === 0) {
            return [];
        }

        const deleteResult = await new ZabbixDeleteTemplateGroupsRequest(zabbixAuthToken, cookie)
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
                    message: `Template group ${id} deleted successfully`
                });
            }
        }

        return result;
    }
}
