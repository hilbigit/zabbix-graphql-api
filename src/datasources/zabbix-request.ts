import {ApiError} from "../schema/generated/graphql.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {ApiErrorCode} from "../model/model_enum_values.js";
import {logger} from "../logging/logger.js";
import {GraphQLError} from "graphql";

class ZabbixRequestBody {
    public jsonrpc = "2.0"
    public method
    public id = 1
    public params?: ZabbixParams

    constructor(method: string) {
        this.method = method;
    }

}

export interface ZabbixResult {
}

export type ZabbixErrorResult = {
    error: ApiError
}
export const isZabbixErrorResult = (value: any): value is ZabbixErrorResult => value instanceof Object && "error" in value && !!value.error;

export interface ZabbixParams {
    [key: string]: any
}

export interface ZabbixWithTagsParams extends ZabbixParams {
    tags?: { tag: string; operator: number; value?: any; }[]
}

export class ParsedArgs {
    public name_pattern?: string
    public distinct_by_name?: boolean;
    public zabbix_params: ZabbixParams[] | ZabbixParams

    constructor(params?: any) {
        if (Array.isArray(params)) {
            this.zabbix_params = params.map(arg => this.parseArgObject(arg))
        } else {
            this.zabbix_params = this.parseArgObject(params)
        }
    }

    getParam(paramName: string): any {
        if (this.zabbix_params instanceof Array) {
            return undefined
        }
        // @ts-ignore
        return paramName in this.zabbix_params ? this.zabbix_params[paramName] : undefined
    }

    parseArgObject(args?: any) {
        if (args && (typeof args !== 'object' || args.constructor !== Object)) {
            return args;
        }
        let result: ZabbixParams
        if (args && typeof args === 'object' && args.constructor === Object) {
            if ("name_pattern" in args && typeof args["name_pattern"] == "string") {
                if (args["name_pattern"]) {
                    this.name_pattern = args["name_pattern"]
                }
                delete args["name_pattern"]
            }
            if ("distinct_by_name" in args) {
                this.distinct_by_name = !(!args["distinct_by_name"])
                delete args["distinct_by_name"]
            }
            if ("groupidsbase" in args) {
                if (!("groupids" in args) || !args.groupids) {
                    // @ts-ignore
                    args["groupids"] = args.groupidsbase
                }
                delete args.groupidsbase
            }
            let filterTagStatements: { tag: string; operator: number; value?: any; }[] = []
            let filterStatements = {}
            for (let argsKey in args) {
                // @ts-ignore
                let argsValue = args[argsKey]
                if (argsKey.startsWith("tag_")) {
                    if (argsKey.endsWith("_exists")) {
                        filterTagStatements.push({
                            "tag": argsKey.slice(4, -7),
                            "operator": argsValue ? 4 : 5
                        })
                    } else if (argsValue !== null) {
                        let argsArray = Array.isArray(argsValue) ? argsValue : [argsValue]
                        argsArray.forEach((tagValue) => {
                            filterTagStatements.push({
                                "tag": argsKey.slice(4),
                                "operator": 1,
                                "value": tagValue,
                            })
                        })
                    }

                    // @ts-ignore
                    delete args[argsKey]
                }
                if (argsKey.startsWith("filter_") && argsValue) {
                    // @ts-ignore
                    filterStatements[argsKey.slice(7)] = argsValue
                    // @ts-ignore
                    delete args[argsKey]
                }
            }

            if (Object.keys(filterStatements).length) {
                args = {
                    ...args,
                    filter: filterStatements
                }
            }
            if (filterTagStatements?.length) {
                let tagsFilter: ZabbixWithTagsParams = {
                    tags: filterTagStatements
                }
                result = {
                    ...tagsFilter,
                    ...args,
                    inheritedTags: true,
                }
            } else {
                result = args
            }
        } else {
            result = {}
        }

        if (this.name_pattern) {
            if (!("search" in result)) {
                (<any>result).search = {}
            }
            (<any>result).search.name = this.name_pattern;
            (<any>result).search.host = this.name_pattern;
            (<any>result).searchByAny = true;
        }

        return result
    }
}

export class ZabbixRequest<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> {
    protected requestBodyTemplate: ZabbixRequestBody;
    protected method: string
    protected prepResult: T | ZabbixErrorResult | undefined = undefined

    constructor(public path: string, public authToken?: string | null, public cookie?: string | null) {
        this.method = path.split(".", 2).join(".");
        this.requestBodyTemplate = new ZabbixRequestBody(this.method);
    }

    createZabbixParams(args?: A): ZabbixParams {
        return args?.zabbix_params || {}
    }

    getRequestBody(args?: A, zabbixParams?: ZabbixParams): ZabbixRequestBody {
        let params: ZabbixParams
        if (Array.isArray(args?.zabbix_params)) {
            params = args?.zabbix_params.map(paramsObj => {
                if (paramsObj !== null && typeof paramsObj === 'object' && paramsObj.constructor === Object) {
                    return {...this.requestBodyTemplate.params, ...paramsObj}
                }
                return paramsObj;
            })
        } else {
            params = {...this.requestBodyTemplate.params, ...zabbixParams ?? this.createZabbixParams(args)}
        }
        return params ? {
            ...this.requestBodyTemplate,
            params: params
        } : this.requestBodyTemplate
    };

    headers() {
        let headers: {
            "Content-Type": string
            Accept: string
            'Access-Control-Allow-Headers': string
            Cookie?: string,
            Authorization?: string
        } = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Headers': 'Content-Type'
        };
        if (this.cookie) {
            headers.Cookie = this.cookie
        }
        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`
        }
        return headers
    }


    async prepare(zabbixAPI: ZabbixAPI, _args?: A): Promise<T | ZabbixErrorResult | undefined> {
        // If prepare returns something else than undefined, the execution will be skipped and the
        // result returned
        return this.prepResult;
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: A): Promise<T | ZabbixErrorResult> {
        let prepareResult = await this.prepare(zabbixAPI, args);
        if (prepareResult) {
            return prepareResult;
        }
        let requestBody = this.getRequestBody(args);

        try {

            const result_promise = zabbixAPI.post<T | ZabbixErrorResult>(this.path, {
                body: {...requestBody}, headers: this.headers()
            });

            return result_promise.then(response => {
                if (isZabbixErrorResult(response)) {
                    return response as ZabbixErrorResult;
                }
                return response as T;
            })
        } catch (e) {
            const msg = `Unable to execute zabbix request body=${JSON.stringify(requestBody)}: ${JSON.stringify(e)}`
            logger.error(msg)
            return {
                error: {
                    code: -1,
                    message: msg,
                    data: e
                }
            } as ZabbixErrorResult
        }
    }

    async executeRequestThrowError(zabbixApi: ZabbixAPI, args?: A): Promise<T> {
        let response = await this.executeRequestReturnError(zabbixApi, args);
        if (isZabbixErrorResult(response)) {
            throw new GraphQLError(`Called Zabbix path ${this.path} with error: ${response.error.message || "Zabbix error."} ${response.error.data}`, {
                extensions: {
                    path: response.error.path || this.path,
                    args: response.error.args || args,
                    code: response.error.code,
                    data: response.error.data
                },
            });
        } else {
            return response as unknown as T;
        }
    }

}

export class ZabbixCreateOrUpdateParams extends ParsedArgs {
    constructor(args: any, public dryRun = true) {
        super(args);
    }
}

export class ZabbixCreateOrUpdateRequest<
    T extends ZabbixResult,
    P extends ZabbixRequest<ZabbixResult>,
    A extends ZabbixCreateOrUpdateParams = ZabbixCreateOrUpdateParams> extends ZabbixRequest<T, A> {
    constructor(public entity: string,
                public updateExistingIdFieldname: string,
                private prepareType: new (authToken?: string | null, cookie?: string | null) => P, authToken?: string | null, cookie?: string | null) {
        super(entity + ".create.orupdate", authToken, cookie);
    }

    public message: string = "";

    async prepare(zabbixAPI: ZabbixAPI, args?: A): Promise<ZabbixErrorResult | T | undefined> {
        let prepResult = await super.prepare(zabbixAPI, args);
        let nameParam = args?.getParam("name");
        if (prepResult || !nameParam) {
            return prepResult;
        }
        let existingItems = await new this.prepareType(this.authToken, this.cookie)
            .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                filter: {
                    name: nameParam
                }
            })) as Record<string, any>[] | ZabbixErrorResult;
        if (isZabbixErrorResult(existingItems)) {
            this.message = "Error getting existing " + this.entity + "(s)";
            this.prepResult = existingItems;
            return existingItems;
        }
        if (existingItems.length > 1) {
            this.message = "Multiple existing " + this.entity + "(s) found for existing args";
            this.prepResult = {
                error: {
                    code: ApiErrorCode.ZABBIX_MULTIPLE_USERGROUPS_FOUND,
                    message: this.message,
                    data: args,
                }
            }
            return this.prepResult;
        }
        if (existingItems.length == 1) {
            this.message = "Updating existing user group";
            if (args?.dryRun) {
                this.prepResult = {
                    error: {
                        code: ApiErrorCode.OK,
                        message: "Not updating existing user group, dry run enabled",
                        data: args,
                    }
                }
            } else {
                let updateParams: Record<string, any> = {
                    ...args?.zabbix_params
                }
                updateParams[this.updateExistingIdFieldname] = existingItems[0][this.updateExistingIdFieldname];
                this.prepResult = await new ZabbixRequest<any>(this.entity + ".update", this.authToken, this.cookie)
                    .executeRequestReturnError(zabbixAPI, new ParsedArgs(updateParams));
            }
        } else {
            this.message = "Creating " + this.entity + " - name not found";
            if (args?.dryRun) {
                this.prepResult = {
                    error: {
                        code: ApiErrorCode.OK,
                        message: "Not creating " + this.entity + ", dry run enabled",
                        data: args,
                    }
                }
            }
        }

        return this.prepResult
    }
}





