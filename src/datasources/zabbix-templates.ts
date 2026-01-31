import {ZabbixRequest, ParsedArgs, isZabbixErrorResult, ZabbixParams} from "./zabbix-request.js";
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
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            "selectItems": "extend",
            "output": "extend",
            ...args?.zabbix_params
        };
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
            let templates = await new ZabbixQueryTemplatesRequest(zabbixAuthToken, cookie).executeRequestReturnError(zabbixApi, new ParsedArgs({
                filter_name: templateName
            }))

            if (isZabbixErrorResult(templates) || !templates?.length) {
                logger.error(`Unable to find templateName=${templateName}`)
                return null
            }
            result.push(...templates.map((t) => Number(t.templateid)))
        }
        return result
    }
}


