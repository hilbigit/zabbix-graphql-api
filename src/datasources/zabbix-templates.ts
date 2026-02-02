import {ZabbixRequest, ParsedArgs, isZabbixErrorResult, ZabbixParams, ZabbixErrorResult} from "./zabbix-request.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {logger} from "../logging/logger.js";


export interface ZabbixQueryTemplateResponse {
    templateid: string,
    host: string,
    uuid: string,
    name: string,
    items?: any[]
}


export class ZabbixQueryTemplatesRequest extends ZabbixRequest<ZabbixQueryTemplateResponse[]> {
    constructor(authToken?: string | null, cookie?: string | null,) {
        super("template.get", authToken, cookie);
        this.skippableZabbixParams.set("selectItems", "items");
    }

    createZabbixParams(args?: ParsedArgs, output?: string[]): ZabbixParams {
        return this.optimizeZabbixParams({
            "selectItems": "extend",
            "output": "extend",
            ...args?.zabbix_params
        }, output);
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ParsedArgs, output?: string[]): Promise<ZabbixErrorResult | ZabbixQueryTemplateResponse[]> {
        let result = await super.executeRequestReturnError(zabbixAPI, args, output);

        if (result && !isZabbixErrorResult(result) && Array.isArray(result) && (!output || output.includes("items.preprocessing"))) {
            const templateids = result.map(t => t.templateid);
            if (templateids.length > 0) {
                // Batch fetch preprocessing for all items of these templates
                const allItems = await new ZabbixQueryItemRequest(this.authToken, this.cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({
                    templateids: templateids,
                    selectPreprocessing: "extend"
                }));

                if (!isZabbixErrorResult(allItems) && Array.isArray(allItems)) {
                    const itemidToPreprocessing = new Map<string, any>();
                    allItems.forEach((item: any) => {
                        itemidToPreprocessing.set(item.itemid, item.preprocessing);
                    });

                    for (let template of result) {
                        for (let item of template.items || []) {
                            item.preprocessing = itemidToPreprocessing.get(item.itemid.toString());
                        }
                    }
                }
            }
        }

        return result;
    }
}


export interface ZabbixQueryTemplateGroupResponse {
    groupid: string,
    name: string,
    uuid: string
}

export class ZabbixQueryTemplateGroupRequest extends ZabbixRequest<ZabbixQueryTemplateGroupResponse[]> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("templategroup.get", authToken, cookie);
    }
}


export class ZabbixCreateTemplateGroupRequest extends ZabbixRequest<{ groupids: string[] }> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("templategroup.create", authToken, cookie);
    }
}

export class ZabbixCreateTemplateRequest extends ZabbixRequest<{ templateids: string[] }> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("template.create", authToken, cookie);
    }
}

export class ZabbixQueryItemRequest extends ZabbixRequest<any[]> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("item.get", authToken, cookie);
    }
}

export class ZabbixCreateItemRequest extends ZabbixRequest<{ itemids: string[] }> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("item.create", authToken, cookie);
    }
}

export class ZabbixDeleteTemplatesRequest extends ZabbixRequest<{ templateids: string[] }> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("template.delete", authToken, cookie);
    }
}

export class ZabbixDeleteTemplateGroupsRequest extends ZabbixRequest<{ groupids: string[] }> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("templategroup.delete", authToken, cookie);
    }
}


export class TemplateHelper {
    public static async findTemplateIdsByName(templateNames: string[], zabbixApi: ZabbixAPI, zabbixAuthToken?: string, cookie?: string) {
        let result: number[] = []
        for (let templateName of templateNames) {
            // Use name_pattern which now searches both visibility name and technical name (host)
            let templates = await new ZabbixQueryTemplatesRequest(zabbixAuthToken, cookie).executeRequestReturnError(zabbixApi, new ParsedArgs({
                name_pattern: templateName
            }), ["templateid", "host"])

            if (isZabbixErrorResult(templates) || !templates?.length) {
                logger.error(`Unable to find templateName=${templateName}`)
                return null
            }
            result.push(...templates.map((t: ZabbixQueryTemplateResponse) => Number(t.templateid)))
        }
        return result
    }
}


