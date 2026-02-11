import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult, ZabbixRequest, ZabbixResult} from "./zabbix-request.js";
import {ZabbixAPI} from "./zabbix-api.js";
import {InputMaybe, Permission, QueryHasPermissionsArgs, UserPermission} from "../schema/generated/graphql.js";
import {ApiErrorCode, PermissionNumber} from "../model/model_enum_values.js";
import {Config} from "../common_utils.js";


/**
 * Base class for Zabbix requests that require specific user permissions.
 */
export class ZabbixRequestWithPermissions<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs> extends ZabbixRequest<T, A> {

    /**
     * @param path - The Zabbix API method path.
     * @param authToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     * @param permissionsNeeded - The permissions required to execute this request.
     */
    constructor(public path: string, public authToken?: string | null, public cookie?: string | null,
        protected permissionsNeeded?: QueryHasPermissionsArgs) {
        super(path, authToken, cookie);
    }
    /**
     * Prepares the request by checking user permissions.
     * @param zabbixAPI - The Zabbix API instance.
     * @param _args - The parsed arguments for the request.
     * @returns A promise that resolves to the result or an error if permissions are missing.
     */
    async prepare(zabbixAPI: ZabbixAPI, _args?: A): Promise<T | ZabbixErrorResult | undefined> {
        // If prepare returns something else than undefined, the execution will be skipped and the
        // result returned
        this.prepResult = await this.assureUserPermissions(zabbixAPI);
        return this.prepResult;
    }
    /**
     * Ensures that the user has the required permissions.
     * @param zabbixAPI - The Zabbix API instance.
     * @returns A promise that resolves to undefined if permissions are granted, or an error otherwise.
     */
    async assureUserPermissions(zabbixAPI: ZabbixAPI) {
        if (this.authToken && this.authToken === Config.ZABBIX_PRIVILEGE_ESCALATION_TOKEN) {
            // Bypass permission check for the privilege escalation token as it is assumed to have required rights
            return undefined;
        }
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

    async executeRequestReturnError(zabbixAPI: ZabbixAPI, args?: ParsedArgs, output?: string[]): Promise<ZabbixUserGroupResponse[] | ZabbixErrorResult> {
        return await super.executeRequestReturnError(zabbixAPI, args, output);
    }

    async createZabbixParams(args?: ParsedArgs) {
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
    public static ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX = Config.ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX

    /**
     * Retrieves permissions for the current user.
     * @param zabbixAPI - The Zabbix API instance.
     * @param zabbixAuthToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     * @param objectNames - Optional filter for object names.
     * @returns A promise that resolves to an array of user permissions.
     */
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
        const templateIdsToLoad = new Set(userGroupPermissions.flatMap(usergroup => (usergroup.templategroup_rights || []).map(templateGroupRight => templateGroupRight.id)));

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
        // First, we have to find the minimum permission for each template group as this is always superseeding the higher permission if it is set within a user group
        let minPermissionsInUserGroup: Map<string, PermissionNumber> = new Map();

        let objectNamesFilter = this.createMatcherFromWildcardArray(objectNames);

        (usergroup.templategroup_rights || []).forEach(templateGroupPermission => {
            const objectName = this.permissionObjectNameCache.get(templateGroupPermission.id);
            if (objectName && (objectNamesFilter == undefined || objectNamesFilter.test(objectName))) {
                const permissionValue = Number(templateGroupPermission.permission) as PermissionNumber;
                const minPermissionWithinThisGroup = minPermissionsInUserGroup.get(objectName);
                if (minPermissionWithinThisGroup == undefined || minPermissionWithinThisGroup > permissionValue) {
                    minPermissionsInUserGroup.set(objectName, permissionValue);
                }
            }
        })

        // Then we have to find the highest permission compared to the permissions resulting from other user groups, as on a
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
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    /**
     * Checks if the user has the required permissions.
     * @param zabbixAPI - The Zabbix API instance.
     * @param args - The permissions to check.
     * @param zabbixAuthToken - Optional Zabbix authentication token.
     * @param cookie - Optional session cookie.
     * @returns A promise that resolves to true if the user has all required permissions, false otherwise.
     */
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
