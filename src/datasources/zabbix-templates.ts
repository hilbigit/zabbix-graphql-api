
import { ZabbixRequest } from "./zabbix-request.js";



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


