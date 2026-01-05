import {
    isZabbixErrorResult,
    ParsedArgs,
    ZabbixCreateOrUpdateParams,
    ZabbixCreateOrUpdateRequest,
    ZabbixErrorResult,
    ZabbixParams,
    ZabbixRequest,
    ZabbixResult
} from "./zabbix-request.js";
import {ApiError, ImportUserRightResult, UserRole, UserRoleInput, UserRoleModule} from "../generated/graphql.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {ZabbixQueryModulesRequest} from "./zabbix-module.js";
import {ApiErrorCode} from "../model/model_enum_values.js";

export class ZabbixPrepareGetModulesRequest<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixRequest<T, A> {
    protected modules: UserRoleModule[];

    async prepare(zabbixAPI: ZabbixAPI, args?: A): Promise<ZabbixErrorResult | T | undefined> {
        let result = super.prepare(zabbixAPI, args);
        if (!isZabbixErrorResult(result)) {
            this.modules = await new ZabbixQueryModulesRequest(
                this.authToken, this.cookie).executeRequestThrowError(zabbixAPI);
        }
        return result;
    }
}

export class ZabbixQueryUserRolesRequest extends ZabbixPrepareGetModulesRequest<UserRole[]> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("role.get", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            output: "extend",
            selectRules: "extend",
        };
    }

    async executeRequestReturnError(zabbixApi: ZabbixAPI, args?: ParsedArgs): Promise<UserRole[] | ZabbixErrorResult> {
        let prepResult = await this.prepare(zabbixApi, args);
        if (prepResult) {
            return prepResult
        }
        let result = await super.executeRequestReturnError(zabbixApi, args);
        if (isZabbixErrorResult(result)) {
            return result
        }
        for (let userRole of result) {
            for (let userRoleModule of userRole.rules?.modules || []) {
                for (let module of this.modules) {
                    if (module.moduleid == userRoleModule.moduleid) {
                        userRoleModule.id = module.id;
                        userRoleModule.relative_path = module.relative_path;
                        break;
                    }
                }
            }
        }
        return result;
    }
}

export class ZabbixImportUserRolesParams extends ParsedArgs {
    constructor(public userRoles: UserRoleInput[], public dryRun: boolean = false) {
        super();
    }
}

export class ZabbixImportUserRolesRequest extends ZabbixPrepareGetModulesRequest<ImportUserRightResult[],
    ZabbixImportUserRolesParams> {
    constructor(zabbixAuthToken: any, cookie: any) {
        super("role.create.import", zabbixAuthToken, cookie);
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ZabbixImportUserRolesParams): Promise<ImportUserRightResult[] | ZabbixErrorResult> {
        let prepResult = await this.prepare(zabbixAPI, args);
        if (isZabbixErrorResult(prepResult)) {
            return prepResult
        }
        let results: ImportUserRightResult[] = [];
        for (let userRole of args?.userRoles || []) {
            let errors: ApiError[] = [];
            let rules: any = undefined;
            if (userRole.rules) {
                let modules: UserRoleModule[] = []
                for (let userRoleModule of userRole.rules.modules || []) {
                    let found = false;
                    for (let module of this.modules) {
                        if (module.moduleid == userRoleModule.moduleid &&
                            (!userRoleModule.id || module.id == userRoleModule.id)) {
                            found = true;
                            modules.push(
                                {
                                    moduleid: userRoleModule.moduleid,
                                    status: userRoleModule.status,
                                }
                            );
                            break;
                        }
                        if (module.id == userRoleModule.id) {
                            if (userRoleModule.moduleid && userRoleModule.moduleid != module.moduleid) {
                                errors.push(
                                    {
                                        code: ApiErrorCode.OK,
                                        message: `WARNING: Module found and permissions set, but target moduleid=${module.moduleid} does not match`,
                                        data: userRoleModule,
                                    }
                                )
                                modules.push(
                                    {
                                        moduleid: module.moduleid,
                                        status: userRoleModule.status,
                                    }
                                )
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        errors.push(
                            {
                                code: ApiErrorCode.ZABBIX_MODULE_NOT_FOUND,
                                message: `Module with ID ${userRoleModule.id} not found`,
                                data: userRoleModule,
                            }
                        )
                    }
                }
                rules = {
                    ui: userRole.rules.ui,
                    "ui.default_access": userRole.rules.ui_default_access,
                    modules: modules,
                    "modules.default_access": userRole.rules.modules_default_access,
                    "api.access": userRole.rules.api_access,
                    "api.mode": userRole.rules.api_mode,
                    api: userRole.rules.api,
                    actions: userRole.rules.actions,
                    "actions.default_access": userRole.rules.actions_default_access,
                }
            }

            let params = new ZabbixCreateOrUpdateParams({
                name: userRole.name,
                type: userRole.type,
                rules: rules,
            }, args?.dryRun)
            let createUserRoleRequest = new ZabbixCreateOrUpdateRequest<
                { roleids: string[] }, ZabbixQueryUserRolesRequest, ZabbixCreateOrUpdateParams>(
                "role", "roleid", ZabbixQueryUserRolesRequest, this.authToken, this.cookie);
            let result = await createUserRoleRequest.executeRequestReturnError(zabbixAPI, params);
            if (isZabbixErrorResult(result)) {
                errors.push(result.error);
                results.push(
                    {
                        name: userRole.name,
                        errors: errors,
                        message: result.error.message || "Error creating user role",
                    }
                )
            } else {
                results.push({
                    name: userRole.name,
                    id: result.roleids[0],
                    errors: errors,
                    message: createUserRoleRequest.message,
                });
            }
        }
        return results;
    }
}
