import {ZabbixAPI} from "./zabbix-api.js";
import {ApiErrorCode} from "../model/model_enum_values.js";
import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult, ZabbixParams, ZabbixRequest} from "./zabbix-request.js";
import {ZabbixQueryHostsMetaRequest} from "./zabbix-hosts.js";

export class ZabbixForceCacheReloadParams extends ParsedArgs {
    constructor(public hostid: number) {
        super();
    }
}

export class ZabbixForceCacheReloadRequest extends ZabbixRequest<{
    response: string
    value: string
}, ZabbixForceCacheReloadParams> {
    private static ZABBIX_RELOAD_CACHE_SCRIPT_NAME = "Reload configuration cache";
    private static reloadCacheScriptId = 0;
    private reloadCacheHostId = 0;
    private static ZABBIX_RELOAD_CACHE_SCRIPT_PARAMS = {
        "name": this.ZABBIX_RELOAD_CACHE_SCRIPT_NAME,
        "command": "/usr/lib/zabbix/alertscripts/config_cache_reload.sh",
        "host_access": "2",
        "description": "Reload the configuration cache making config changes like new hosts/items visible to zabbix_server. Without this new values cannot be received.",
        "type": "0",
        "execute_on": "1",
        "timeout": "30s",
        "scope": "2"
    };

    constructor(authToken?: string | null, cookie?: string | null) {
        super("script.execute", authToken, cookie);
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: ZabbixForceCacheReloadParams) {
        this.reloadCacheHostId = args?.hostid || 0;
        if (!this.reloadCacheHostId) {
            let someHost = await new ZabbixQueryHostsMetaRequest(this.authToken, this.cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({limit: 1}))
            if (!isZabbixErrorResult(someHost) && someHost && someHost.length && someHost[0].hostid) {
                this.reloadCacheHostId = Number(someHost[0].hostid)
            } else {
                this.prepResult = {
                    error: {
                        message: "Unable to find host for executing scripts",
                        code: ApiErrorCode.ZABBIX_HOST_NOT_FOUND,
                        path: this.path,
                        args: args,
                    }
                } as ZabbixErrorResult
                return this.prepResult
            }
        }
        if (!args?.zabbix_params?.hasOwnProperty("scriptid") && !ZabbixForceCacheReloadRequest.reloadCacheScriptId) {
            let scriptResult = await new ZabbixRequest<{
                scriptid: string
            }[]>("script.get", this.authToken, this.cookie).executeRequestThrowError(zabbixAPI, new ParsedArgs(
                {filter_name: ZabbixForceCacheReloadRequest.ZABBIX_RELOAD_CACHE_SCRIPT_NAME}))
            if (scriptResult && scriptResult.length && scriptResult[0].scriptid) {
                ZabbixForceCacheReloadRequest.reloadCacheScriptId = Number(scriptResult[0].scriptid)
            } else {
                let createScriptResult = await new ZabbixRequest<{
                    scriptids: string[]
                }>("script.create", this.authToken, this.cookie).executeRequestThrowError(zabbixAPI,
                    new ParsedArgs(ZabbixForceCacheReloadRequest.ZABBIX_RELOAD_CACHE_SCRIPT_PARAMS))
                if (!isZabbixErrorResult(createScriptResult) && createScriptResult?.scriptids && createScriptResult.scriptids.length) {
                    ZabbixForceCacheReloadRequest.reloadCacheScriptId = Number(createScriptResult.scriptids[0]);
                } else {
                    this.prepResult = {
                        error: {
                            message: "Unable to find or create script for reloading cache",
                            code: ApiErrorCode.ZABBIX_SCRIPT_NOT_FOUND,
                            data: createScriptResult,
                            path: this.path,
                            args: args,
                        }
                    } as ZabbixErrorResult
                }
            }
            return this.prepResult
        }
    }

    createZabbixParams(_args?: ZabbixForceCacheReloadParams): ZabbixParams {
        return {
            "scriptid": ZabbixForceCacheReloadRequest.reloadCacheScriptId,
            "hostid": this.reloadCacheHostId,
        }
    }

}
