import {ZabbixRequest} from "./zabbix-request.js";


export interface ZabbixQueryTemplateResponse {
    templateid: string,
    uuid: string,
    name: string,
}


export class ZabbixQueryTemplatesRequest extends ZabbixRequest<ZabbixQueryTemplateResponse[]> {
    constructor(authToken?: string | null, cookie?: string | null,) {
        super("template.get", authToken, cookie);
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


