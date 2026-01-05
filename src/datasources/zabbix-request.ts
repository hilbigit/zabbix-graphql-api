import {ApiError, InputMaybe, QueryHasPermissionsArgs, UserPermission} from "../generated/graphql.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {ApiErrorCode, Permission, PermissionNumber} from "../model/model_enum_values.js";
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
}

export interface ZabbixWithTagsParams extends ZabbixParams {
    tags?: { tag: string; operator: number; value: any; }[]
}

export enum ZabbixValueType {
    TEXT = 4,
}

export class ParsedArgs {
    public name_pattern?: string
    public distinct_by_name?: boolean;
    public zabbix_params: ZabbixParams[] | ZabbixParams

    constructor(params?: any) {
        if (Array.isArray(params)) {
            this.zabbix_params = params.map(arg => this.parseArgObject(arg))
        } else if (params instanceof Object) {
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

    parseArgObject(args?: Object) {
        let result: ZabbixParams
        if (args) {
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
            let filterTagStatements: { tag: string; operator: number; value: any; }[] = []
            let filterStatements = {}
            for (let argsKey in args) {
                // @ts-ignore
                let argsValue = args[argsKey]
                if (argsKey.startsWith("tag_") && argsValue !== null) {
                    let argsArray = Array.isArray(argsValue) ? argsValue : [argsValue]
                    argsArray.forEach((tagValue) => {
                        filterTagStatements.push({
                            "tag": argsKey.slice(4),
                            "operator": 1,
                            "value": tagValue,
                        })
                    })
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
            if ("search" in result) {
                (<any> result.search).name = this.name_pattern
            } else {
                (<any> result).search = {
                    name: this.name_pattern,
                }
            }
        }

        return result
    }
}

export class ZabbixRequest<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> {
    protected requestBodyTemplate: ZabbixRequestBody;
    protected method: string
    protected prepResult: T | ZabbixErrorResult | undefined = undefined

    constructor(public path: string, public authToken?: string | null, public cookie?: string | null,
                protected permissionsNeeded?: QueryHasPermissionsArgs) {
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
                return {...this.requestBodyTemplate.params, ...paramsObj}
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

    async assureUserPermissions(zabbixAPI: ZabbixAPI) {
        if (this.permissionsNeeded &&
            !await ZabbixPermissionsHelper.hasUserPermissions(zabbixAPI, this.permissionsNeeded, this.authToken, this.cookie)) {
            return {
                error: {
                    message: "User does not have the required permissions",
                    code: ApiErrorCode.PERMISSION_ERROR,
                    path: this.path,
                    args: this.permissionsNeeded
                }
            }
        } else {
            return undefined
        }
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: A): Promise<T | ZabbixErrorResult | undefined> {
        // If prepare returns something else than undefined the execution will be skipped and the
        // result returned
        this.prepResult = await this.assureUserPermissions(zabbixAPI);
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

class ZabbixQueryTemplateGroupPermissionsRequest extends ZabbixRequest<
    {
        groupid: string,
        name: string
    }[]> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("templategroup.get.permissions", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs) {
        return {
            ...super.createZabbixParams(args),
            output: [
                "groupid",
                "name"
            ],
            searchWildcardsEnabled: true,
            search: {
                name: [
                    ZabbixPermissionsHelper.ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX + "/*"
                ]
            }
        };
    }
}


interface ZabbixUserGroupResponse {
    usrgrpid: string,
    name: string,
    gui_access: string,
    users_status: string,
    templategroup_rights:
        {
            id: string,
            permission: Permission
        }[]
}

class ZabbixQueryUserGroupPermissionsRequest extends ZabbixRequest<ZabbixUserGroupResponse[]> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("usergroup.get.permissions", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs) {
        return {
            ...super.createZabbixParams(args),
            "output": [
                "usrgrpid",
                "name",
                "gui_access",
                "users_status"
            ], ...args?.zabbix_params,
            "selectTemplateGroupRights": [
                "id",
                "permission"
            ]
        };
    }
}

export class ZabbixPermissionsHelper {
    private static permissionObjectNameCache: Map<string, string | null> = new Map()
    public static ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX = process.env.ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX || "Permissions"

    public static async getUserPermissions(zabbixAPI: ZabbixAPI, zabbixAuthToken?: string, cookie?: string,
                                           objectNames?: InputMaybe<string[]> | undefined): Promise<UserPermission[]> {
        return Array.from((await this.getUserPermissionNumbers(zabbixAPI, zabbixAuthToken, cookie, objectNames)).entries()).map(value => {
            return {
                objectName: value[0],
                permission: this.mapPermissionToZabbixEnum(value[1])
            }
        });
    }

    public static async getUserPermissionNumbers(zabbixAPI: ZabbixAPI, zabbixAuthToken?: string | null, cookie?: string | null, objectNamesFilter?: InputMaybe<string[]> | undefined): Promise<Map<string, PermissionNumber>> {
        const userGroupPermissions = await new ZabbixQueryUserGroupPermissionsRequest(zabbixAuthToken, cookie).executeRequestThrowError(zabbixAPI)

        // Prepare the list of templateIds that are not loaded yet
        const templateIdsToLoad = new Set(userGroupPermissions.flatMap(usergroup => usergroup.templategroup_rights.map(templateGroupRight => templateGroupRight.id)));

        // Remove all templateIds that are already in the permissionObjectNameCache
        templateIdsToLoad.forEach(id => {
            if (this.permissionObjectNameCache.has(id)) {
                templateIdsToLoad.delete(id);
            }
        })

        if (templateIdsToLoad.size > 0) {
            // Load all templateIds that are not in the permissionObjectNameCache
            const missingPermissionGroupNames = await new ZabbixQueryTemplateGroupPermissionsRequest(zabbixAuthToken, cookie)
                .executeRequestThrowError(zabbixAPI, new ParsedArgs({groupids: Array.from(templateIdsToLoad)}));
            missingPermissionGroupNames.forEach(group => {
                this.permissionObjectNameCache.set(group.groupid, group.name.replace(ZabbixPermissionsHelper.ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX + "/", ""))
            })
        }

        // Merge the permissions from the user groups. The merge function will first merge the permissions from the template groups
        let permissions = new Map<string, PermissionNumber>();
        userGroupPermissions.forEach(usergroup => {
            permissions = this.mergeTemplateGroupPermissions(usergroup, permissions, objectNamesFilter);
        })
        return permissions;
    }


    private static mergeTemplateGroupPermissions(usergroup: ZabbixUserGroupResponse,
                                                 currentTemplateGroupPermissions: Map<string, PermissionNumber>,
                                                 objectNames: InputMaybe<string[]> | undefined): Map<string, PermissionNumber> {
        // First we have to find the minimum permission for each template group as this is always superseeding the higher permission if it is set within a user group
        let minPermissionsInUserGroup: Map<string, PermissionNumber> = new Map();

        let objectNamesFilter = this.createMatcherFromWildcardArray(objectNames);

        usergroup.templategroup_rights.forEach(templateGroupPermission => {
            const objectName = this.permissionObjectNameCache.get(templateGroupPermission.id);
            if (objectName && (objectNamesFilter == undefined || objectNamesFilter.test(objectName))) {
                const permissionValue = Number(templateGroupPermission.permission) as PermissionNumber;
                const minPermissionWithinThisGroup = minPermissionsInUserGroup.get(objectName);
                if (minPermissionWithinThisGroup == undefined || minPermissionWithinThisGroup > permissionValue) {
                    minPermissionsInUserGroup.set(objectName, permissionValue);
                }
            }
        })

        // Then we have to find the highest permission compared to the permissions resulting from other user groups as on a
        // user group level the higher permission is always superseeding the lower permission
        minPermissionsInUserGroup.forEach((minPermissionInUserGroup, objectName) => {
            const maxPermissionBetweenGroups = currentTemplateGroupPermissions.get(objectName);
            if (maxPermissionBetweenGroups == undefined || maxPermissionBetweenGroups < minPermissionInUserGroup) {
                currentTemplateGroupPermissions.set(objectName, minPermissionInUserGroup);
            }
        })
        return currentTemplateGroupPermissions;
    }

    private static mapZabbixPermission(zabbixPermission: Permission): PermissionNumber {
        switch (zabbixPermission) {
            case Permission.Read:
                return PermissionNumber.Read
            case Permission.ReadWrite:
                return PermissionNumber.ReadWrite
            case Permission.Deny:
            default:
                return PermissionNumber.Deny
        }
    }

    private static mapPermissionToZabbixEnum(permission: PermissionNumber): Permission {
        switch (permission) {
            case PermissionNumber.Read:
                return Permission.Read
            case PermissionNumber.ReadWrite:
                return Permission.ReadWrite
            case PermissionNumber.Deny:
            default:
                return Permission.Deny
        }
    }

    private static createMatcherFromWildcardArray(array: InputMaybe<string[]> | undefined): RegExp | undefined {
        if (!array) {
            return undefined;
        }
        // Escape all values in the array and create regexp that allows the * wildcard which will be a .* in the regexp
        return new RegExp(array.map(value => "^" + this.escapeRegExp(value).replace(/\\\*/gi, ".*") + "$").join("|"));
    }

    private static escapeRegExp(value: string) {
        let result = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        return result;
    }

    public static async hasUserPermissions(zabbixAPI: ZabbixAPI, args: QueryHasPermissionsArgs, zabbixAuthToken?: string | null, cookie?: string | null): Promise<boolean> {
        let permissions = await this.getUserPermissionNumbers(zabbixAPI, zabbixAuthToken, cookie);
        for (const permission of args.permissions) {
            const existingPermission = permissions.get(permission.objectName);
            if (permission.permission != Permission.Deny) {
                if (existingPermission == undefined || existingPermission < this.mapZabbixPermission(permission.permission)) {
                    return false;
                }
            }
        }
        return true;
    }
}
