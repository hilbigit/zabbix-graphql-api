import {
    CreateTemplate,
    CreateTemplateGroup,
    CreateTemplateGroupResponse,
    ImportTemplateResponse,
    InputMaybe
} from "../schema/generated/graphql.js";
import {logger} from "../logging/logger.js";
import {
    ZabbixCreateItemRequest,
    ZabbixCreateTemplateGroupRequest,
    ZabbixCreateTemplateRequest,
    ZabbixQueryTemplateGroupRequest,
    ZabbixQueryTemplatesRequest
} from "../datasources/zabbix-templates.js";
import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult} from "../datasources/zabbix-request.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";

export class TemplateImporter {

    public static async importTemplateGroups(templateGroups: InputMaybe<Array<CreateTemplateGroup>> | undefined, zabbixAuthToken?: string, cookie?: string) {
        if (!templateGroups) {
            return null
        }
        let result: CreateTemplateGroupResponse[] = []
        for (let group of templateGroups) {
            let createGroupResult: { groupids: string[] } | ZabbixErrorResult | undefined = undefined;
            
            // Try to find if it exists by name first
            let groups = await new ZabbixQueryTemplateGroupRequest(zabbixAuthToken, cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({
                filter_name: group.groupName
            }))
            
            let groupid = 0
            let message: string | undefined = undefined
            
            if (!isZabbixErrorResult(groups) && groups?.length) {
                groupid = Number(groups[0].groupid)
                message = `Template group ${group.groupName} already exists with groupid=${groupid} - skipping`
                logger.debug(message)
            } else {
                createGroupResult = await new ZabbixCreateTemplateGroupRequest(zabbixAuthToken, cookie)
                    .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                        name: group.groupName,
                        uuid: group.uuid
                    }))
                
                if (isZabbixErrorResult(createGroupResult)) {
                    let errorMessage = createGroupResult.error.message;
                    if (createGroupResult.error.data) {
                        errorMessage += " " + (typeof createGroupResult.error.data === 'string' ? createGroupResult.error.data : JSON.stringify(createGroupResult.error.data));
                    }
                    result.push({
                        groupName: group.groupName,
                        message: `Unable to create template group ${group.groupName}: ${errorMessage}`,
                        error: createGroupResult.error
                    })
                    continue
                } else if (createGroupResult?.groupids?.length) {
                    groupid = Number(createGroupResult.groupids[0])
                }
            }

            if (groupid) {
                result.push({
                    groupName: group.groupName,
                    groupid: groupid,
                    message: message
                })
            } else {
                result.push({
                    groupName: group.groupName,
                    message: `Unable to create template group ${group.groupName}: Unknown error`,
                    error: { message: "Unknown error - no groupid returned" }
                })
            }
        }
        return result
    }

    public static async importTemplates(templates: InputMaybe<Array<CreateTemplate>> | undefined, zabbixAuthToken?: string, cookie?: string) {
        if (!templates) {
            return null
        }
        let result: ImportTemplateResponse[] = []
        for (let template of templates) {
            // 1. Resolve Group IDs
            let groupids = template.groupids
            if (!groupids || groupids.length === 0) {
                let groups = await new ZabbixQueryTemplateGroupRequest(zabbixAuthToken, cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({
                    filter_name: template.groupNames
                }))

                if (isZabbixErrorResult(groups) || !groups?.length) {
                    result.push({
                        host: template.host,
                        message: `Unable to find template groups=${template.groupNames}`
                    })
                    continue
                }
                groupids = groups.map(g => Number(g.groupid))
            }

            // 2. Resolve Linked Templates IDs
            let linkedTemplates: { templateid: string }[] = []
            if (template.templates && template.templates.length > 0) {
                let templateNames = template.templates.map(t => t.name)
                let queryResult = await new ZabbixQueryTemplatesRequest(zabbixAuthToken, cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({
                    filter_host: templateNames
                }))

                if (isZabbixErrorResult(queryResult)) {
                    let errorMessage = queryResult.error.message;
                    if (queryResult.error.data) {
                        errorMessage += " " + (typeof queryResult.error.data === 'string' ? queryResult.error.data : JSON.stringify(queryResult.error.data));
                    }
                    result.push({
                        host: template.host,
                        message: `Error querying linked templates: ${errorMessage}`,
                        error: queryResult.error
                    })
                    continue
                }
                linkedTemplates = queryResult.map(t => ({ templateid: t.templateid }))
            }

            // 3. Create Template
            let templateCreateParams: any = {
                host: template.host,
                name: template.name || template.host,
                groups: groupids.map(id => ({ groupid: id })),
                uuid: template.uuid,
                templates: linkedTemplates,
                tags: template.tags?.map(t => ({ tag: t.tag, value: t.value || "" })),
                macros: template.macros
            }

            let templateImportResult = await new ZabbixCreateTemplateRequest(zabbixAuthToken, cookie)
                .executeRequestReturnError(zabbixAPI, new ParsedArgs(templateCreateParams))

                if (isZabbixErrorResult(templateImportResult) || !templateImportResult?.templateids?.length) {
                    let errorMessage = isZabbixErrorResult(templateImportResult) ? templateImportResult.error.message : "Unknown error";
                    if (isZabbixErrorResult(templateImportResult) && templateImportResult.error.data) {
                        errorMessage += " " + (typeof templateImportResult.error.data === 'string' ? templateImportResult.error.data : JSON.stringify(templateImportResult.error.data));
                    }
                    result.push({
                        host: template.host,
                        message: `Unable to import template=${template.host}: ${errorMessage}`,
                        error: isZabbixErrorResult(templateImportResult) ? templateImportResult.error : undefined
                    })
                    continue
                }

            let templateid = templateImportResult.templateids[0]

            // 4. Create Items if any
            if (template.items && template.items.length > 0) {
                const createdItemKeyToId = new Map<string, string>();
                let itemsToCreate = [...template.items];
                let retry = true;
                
                while (retry && itemsToCreate.length > 0) {
                    retry = false;
                    const remainingItems: typeof itemsToCreate = [];
                    
                    for (let item of itemsToCreate) {
                        if (item.master_item && !createdItemKeyToId.has(item.master_item.key)) {
                            remainingItems.push(item);
                            continue;
                        }

                        let { key, master_item, ...itemData } = item;
                        let itemCreateParams: any = {
                            ...itemData,
                            key_: key,
                            hostid: templateid,
                            preprocessing: item.preprocessing?.map(p => ({
                                type: p.type,
                                params: p.params.join("\n"),
                                error_handler: p.error_handler ?? 0,
                                error_handler_params: p.error_handler_params ?? ""
                            })),
                            tags: item.tags?.map(t => ({ tag: t.tag, value: t.value || "" }))
                        }

                        if (master_item) {
                            itemCreateParams.master_itemid = createdItemKeyToId.get(master_item.key);
                        }

                        let itemResult = await new ZabbixCreateItemRequest(zabbixAuthToken, cookie)
                            .executeRequestReturnError(zabbixAPI, new ParsedArgs(itemCreateParams))

                        if (isZabbixErrorResult(itemResult)) {
                            let errorMessage = itemResult.error.message;
                            if (itemResult.error.data) {
                                errorMessage += " " + (typeof itemResult.error.data === 'string' ? itemResult.error.data : JSON.stringify(itemResult.error.data));
                            }
                            logger.error(`Unable to create item ${item.name} for template ${template.host}: ${errorMessage}`)
                        } else if (itemResult?.itemids?.length) {
                            createdItemKeyToId.set(key, itemResult.itemids[0]);
                            retry = true;
                        }
                    }
                    itemsToCreate = remainingItems;
                }

                if (itemsToCreate.length > 0) {
                    logger.error(`Unable to create ${itemsToCreate.length} items for template ${template.host} due to missing master items: ${itemsToCreate.map(i => i.name).join(", ")}`);
                }
            }

            result.push({
                host: template.host,
                templateid: templateid
            })
        }
        return result
    }
}
