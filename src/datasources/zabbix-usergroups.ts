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
import {
    ApiError,
    ImportUserRightResult, Permission,
    UserGroup,
    UserGroupInput,
    ZabbixGroupRight,
    ZabbixGroupRightInput
} from "../schema/generated/graphql.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {ZabbixQueryTemplateGroupRequest, ZabbixQueryTemplateGroupResponse} from "./zabbix-templates.js";
import {ZabbixQueryHostgroupsRequest, ZabbixQueryHostgroupsResult} from "./zabbix-hostgroups.js";
import {ApiErrorCode} from "../model/model_enum_values.js";


abstract class ZabbixPrepareGetTemplatesAndHostgroupsRequest<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixRequest<T, A> {
    protected templategroups: ZabbixQueryTemplateGroupResponse[];
    protected hostgroups: ZabbixQueryHostgroupsResult[];

    constructor(path: string, authToken?: string | null, cookie?: string) {
        super(path, authToken, cookie);
    }

    async prepare(zabbixAPI: ZabbixAPI, args?: A): Promise<ZabbixErrorResult | T | undefined> {
        let prepResult = await super.prepare(zabbixAPI, args);
        if (prepResult) {
            return prepResult;
        }
        let templategroups = await new ZabbixQueryTemplateGroupRequest(this.authToken, this.cookie)
            .executeRequestReturnError(zabbixAPI);
        if (isZabbixErrorResult(templategroups)) {
            this.prepResult = templategroups;
            return templategroups;
        }
        this.templategroups = templategroups;
        let hostgroups =
            await new ZabbixQueryHostgroupsRequest(this.authToken, this.cookie)
                .executeRequestReturnError(zabbixAPI);
        if (isZabbixErrorResult(hostgroups)) {
            this.prepResult = hostgroups;
            return hostgroups;
        }
        this.hostgroups = hostgroups;

        return undefined
    }
}

export class ZabbixExportUserGroupArgs extends ParsedArgs {
    public exclude_hostgroups_pattern?: RegExp | undefined = undefined;

    constructor(name_pattern?: string | null, exclude_hostgroups_pattern_str?: string | null) {
        super(name_pattern? {name_pattern: name_pattern} : undefined);
        if (exclude_hostgroups_pattern_str) {
            this.exclude_hostgroups_pattern = new RegExp(exclude_hostgroups_pattern_str);
        }
    }
}

export class ZabbixExportUserGroupsRequest extends ZabbixPrepareGetTemplatesAndHostgroupsRequest<
    UserGroup[], ZabbixExportUserGroupArgs> {
    constructor(authToken?: string | null, cookie?: string) {
        super("usergroup.get.withuuids", authToken, cookie);
    }

    createZabbixParams(args?: ZabbixExportUserGroupArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            output: "extend",
            selectTemplateGroupRights: "extend",
            selectHostGroupRights: "extend"
        };
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ZabbixExportUserGroupArgs): Promise<ZabbixErrorResult | UserGroup[]> {
        let result = await super.executeRequestReturnError(zabbixAPI, args);
        if (!isZabbixErrorResult(result)) {
            for (let userGroup of result) {
                for (let template_permission of userGroup.templategroup_rights || []) {
                    for (let templategroup of this.templategroups) {
                        if (templategroup.groupid == template_permission.id.toString()) {
                            template_permission.uuid = templategroup.uuid;
                            template_permission.name = templategroup.name;
                            break;
                        }
                    }
                }
                let filtered_hostgroup_permission: ZabbixGroupRight [] = [];

                for (let hostgroup_permission of userGroup.hostgroup_rights || []) {
                    for (let hostgroup of this.hostgroups) {
                        if (hostgroup.groupid == hostgroup_permission.id.toString()) {
                            hostgroup_permission.uuid = hostgroup.uuid;
                            hostgroup_permission.name = hostgroup.name;
                            break;
                        }
                    }
                    if (!args?.exclude_hostgroups_pattern || !hostgroup_permission.name || !args.exclude_hostgroups_pattern.test(hostgroup_permission.name)) {
                        filtered_hostgroup_permission.push(hostgroup_permission);
                    }

                }
                userGroup.hostgroup_rights = filtered_hostgroup_permission;
            }
        }
        return result;
    }
}

export class ZabbixQueryUserGroupsRequest extends ZabbixRequest<UserGroup[]> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("usergroup.get", authToken, cookie);
    }

    createZabbixParams(args?: ParsedArgs): ZabbixParams {
        return {
            ...super.createZabbixParams(args),
            output: "extend",
        };
    }
}

export class ZabbixImportUserGroupsParams extends ParsedArgs {
    constructor(public usergroups: UserGroupInput[], public dryRun = true) {
        super();
    }
}

export class ZabbixImportUserGroupsRequest
    extends ZabbixPrepareGetTemplatesAndHostgroupsRequest<ImportUserRightResult[],
        ZabbixImportUserGroupsParams> {
    constructor(zabbixAuthToken: any, cookie: any) {
        super("usergroup.create.import", zabbixAuthToken, cookie);
    }

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ZabbixImportUserGroupsParams): Promise<ZabbixErrorResult | ImportUserRightResult[]> {
        let prepareResult = await this.prepare(zabbixAPI, args);
        if (prepareResult) {
            return prepareResult;
        }

        let results: ImportUserRightResult[] = [];
        let hostGroupsToPropagete: number[] = []
        let createGroupRequest = new ZabbixCreateOrUpdateRequest<
            ZabbixCreateUserGroupResponse, ZabbixQueryUserGroupsRequest, ZabbixCreateOrUpdateParams>(
            "usergroup", "usrgrpid", ZabbixQueryUserGroupsRequest, this.authToken, this.cookie);
        for (let userGroup of args?.usergroups || []) {
            let templategroup_rights = this.calc_templategroup_rights(userGroup);
            let hostgroup_rights = this.calc_hostgroup_rights(userGroup);

            let errors: ApiError[] = [];

            let params = new ZabbixCreateOrUpdateParams({
                name: userGroup.name,
                gui_access: userGroup.gui_access,
                users_status: userGroup.users_status,
                hostgroup_rights: hostgroup_rights.hostgroup_rights,
                templategroup_rights: templategroup_rights.templategroup_rights,
            }, args?.dryRun)
            let result = await createGroupRequest.executeRequestReturnError(zabbixAPI, params);
            if (isZabbixErrorResult(result)) {

                errors.push(result.error);
                results.push(
                    {
                        name: userGroup.name,
                        errors: errors,
                        message: result.error.message || "Error creating user group",
                    }
                )
            } else {
                hostGroupsToPropagete.push(
                    ...hostgroup_rights.hostgroup_rights.map(
                        value => value.id));
                results.push(
                    {
                        name: userGroup.name,
                        id: result.usrgrpids[0],
                        message: createGroupRequest.message,
                        errors: errors,
                    }
                )
            }
            errors.push(...templategroup_rights.errors);
            errors.push(...hostgroup_rights.errors);
        }

        // If user groups were imported: Propagate group permissions to group children
        if (hostGroupsToPropagete.length > 0) {
            // Propagate group permissions to group children, filter duplicate groupids first
            await new ZabbixPropagateHostGroupsRequest(this.authToken, this.cookie)
                .executeRequestThrowError(zabbixAPI,
                    new ZabbixPropagateHostGroupsParams(hostGroupsToPropagete))
        }
        return results;
    }


    calc_hostgroup_rights(usergroup: UserGroupInput): {
        errors: ApiError[],
        hostgroup_rights: ZabbixGroupRight[]
    } {
        let result: ZabbixGroupRight [] = [];
        let errors: ApiError[] = [];
        for (let hostgroup_right of usergroup.hostgroup_rights || []) {
            let success = false;
            let matchedName = "";
            for (let hostgroup of this.hostgroups) {
                if (hostgroup.uuid == hostgroup_right.uuid) {
                    result.push(
                        {
                            id: Number(hostgroup.groupid),
                            permission: hostgroup_right.permission,
                        }
                    )
                    success = true;
                    matchedName = hostgroup.name;
                    break;
                }

            }
            if (success && hostgroup_right.name && hostgroup_right.name != matchedName) {
                errors.push(
                    {
                        code: ApiErrorCode.OK,
                        message: `WARNING: Hostgroup found and permissions set, but target name=${matchedName} does not match`,
                        data: hostgroup_right,
                    }
                )
            }
            if (!success) {
                errors.push(
                    {
                        code: ApiErrorCode.ZABBIX_HOSTGROUP_NOT_FOUND,
                        message: `Hostgroup with UUID ${hostgroup_right.uuid} not found`,
                        data: hostgroup_right,
                    }
                )
            }
        }
        return {
            hostgroup_rights: result,
            errors: errors,
        };
    }

    calc_templategroup_rights(usergroup: UserGroupInput): {
        errors: ApiError[],
        templategroup_rights: ZabbixGroupRightInput[]
    } {
        let result: ZabbixGroupRight [] = [];
        let errors: ApiError[] = [];
        for (let templategroup_right of usergroup.templategroup_rights || []) {
            let success = false;
            let matchedName = "";
            for (let templategroup of this.templategroups) {
                if (templategroup.uuid == templategroup_right.uuid) {
                    result.push(
                        {
                            id: Number(templategroup.groupid),
                            permission: templategroup_right.permission,
                        }
                    )
                    success = true;
                    matchedName = templategroup.name
                    break;
                }
            }
            if (success && templategroup_right.name && templategroup_right.name != matchedName) {
                errors.push(
                    {
                        code: ApiErrorCode.OK,
                        message: `WARNING: Templategroup found and permissions set, but target name=${matchedName} does not match`,
                        data: templategroup_right,
                    }
                )
            }
            if (!success) {
                errors.push(
                    {
                        code: ApiErrorCode.ZABBIX_TEMPLATEGROUP_NOT_FOUND,
                        message: `Templategroup with UUID ${templategroup_right.uuid} not found`,
                        data: templategroup_right,
                    }
                )
            }
        }
        return {
            templategroup_rights: result,
            errors: errors,
        };
    }
}

export type ZabbixCreateUserGroupResponse = {
    usrgrpids: string[];
}

class ZabbixPropagateHostGroupsParams extends ParsedArgs {
    constructor(public groups: number[]) {
        super();
    }
}

export class ZabbixPropagateHostGroupsRequest extends ZabbixRequest<ZabbixCreateUserGroupResponse,
    ZabbixPropagateHostGroupsParams> {
    constructor(authToken?: string | null, cookie?: string | null) {
        super("hostgroup.propagate", authToken, cookie);
    }

    createZabbixParams(args?: ZabbixPropagateHostGroupsParams): ZabbixParams {
        return {
            groups: [...new Set(args?.groups || [])].map(value => {
                return {
                    groupid: value
                }
            }) || [],
            permissions: true
        }
    }
}
