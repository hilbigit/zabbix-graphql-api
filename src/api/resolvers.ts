import {
    Device,
    DeviceCommunicationType,
    DeviceStatus,
    Host,
    MutationCreateHostArgs,
    MutationDeleteTemplateGroupsArgs,
    MutationDeleteTemplatesArgs,
    MutationImportHostGroupsArgs,
    MutationImportHostsArgs,
    MutationImportTemplateGroupsArgs,
    MutationImportTemplatesArgs,
    MutationImportUserRightsArgs,
    MutationPushHistoryArgs,
    Permission,
    QueryAllDevicesArgs,
    QueryAllHostGroupsArgs,
    QueryAllHostsArgs,
    QueryExportHostValueHistoryArgs,
    QueryExportUserRightsArgs,
    QueryHasPermissionsArgs,
    QueryTemplatesArgs,
    QueryUserPermissionsArgs,
    Resolvers,
    StorageItemType,
} from "../schema/generated/graphql.js";

import { DateTimeResolver, JSONObjectResolver, TimeResolver } from "graphql-scalars";
import {HostImporter} from "../execution/host_importer.js";
import {HostDeleter} from "../execution/host_deleter.js";
import {SmoketestExecutor} from "../execution/smoketest_executor.js";
import {RegressionTestExecutor} from "../execution/regression_test_executor.js";
import {TemplateImporter} from "../execution/template_importer.js";
import {TemplateDeleter} from "../execution/template_deleter.js";
import {HostValueExporter} from "../execution/host_exporter.js";
import {logger} from "../logging/logger.js";
import {ParsedArgs, ZabbixRequest} from "../datasources/zabbix-request.js";
import {ZabbixHistoryGetParams, ZabbixHistoryPushParams, ZabbixHistoryPushRequest, ZabbixQueryHistoryRequest} from "../datasources/zabbix-history.js";
import {
    ZabbixCreateHostRequest,
    ZabbixQueryDevices,
    ZabbixQueryDevicesArgs,
    ZabbixQueryHostsRequestWithItemsAndInventory,
} from "../datasources/zabbix-hosts.js";
import {ZabbixQueryHostgroupsParams, ZabbixQueryHostgroupsRequest} from "../datasources/zabbix-hostgroups.js";
import {
    ZabbixExportUserGroupArgs,
    ZabbixExportUserGroupsRequest,
    ZabbixImportUserGroupsParams,
    ZabbixImportUserGroupsRequest
} from "../datasources/zabbix-usergroups.js";
import {
    ZabbixImportUserRolesParams,
    ZabbixImportUserRolesRequest,
    ZabbixQueryUserRolesRequest
} from "../datasources/zabbix-userroles.js";
import {
    TemplateHelper,
    ZabbixQueryTemplateGroupRequest,
    ZabbixQueryTemplatesRequest
} from "../datasources/zabbix-templates.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {GraphQLInterfaceType, GraphQLList} from "graphql/type/index.js";
import {isDevice} from "./resolver_helpers.js";
import {ZabbixPermissionsHelper} from "../datasources/zabbix-permissions.js";
import {Config} from "../common_utils.js";
import {GraphqlParamsToNeededZabbixOutput} from "../datasources/graphql-params-to-zabbix-output.js";


export function createResolvers(): Resolvers {
    // @ts-ignore
    // @ts-ignore
    return {
        DateTime: DateTimeResolver,
        Time: TimeResolver,
        JSONObject: JSONObjectResolver,
        Query: {
            userPermissions: async (_parent: any, objectNamesFilter: QueryUserPermissionsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return ZabbixPermissionsHelper.getUserPermissions(zabbixAPI, zabbixAuthToken, cookie, objectNamesFilter.objectNames)
            },
            hasPermissions: async (_parent: any, args: QueryHasPermissionsArgs, {zabbixAuthToken, cookie}: any) => {
                return ZabbixPermissionsHelper.hasUserPermissions(zabbixAPI, args, zabbixAuthToken, cookie)
            },
            locations: (_parent: any, args: Object, {dataSources, zabbixAuthToken}: any) => {
                return dataSources.zabbixAPI.getLocations(new ParsedArgs(args), zabbixAuthToken);
            },
            apiVersion: () => {
                return Config.API_VERSION ?? "unknown"
            },
            zabbixVersion: async () => {
                return await new ZabbixRequest<string>("apiinfo.version").executeRequestThrowError(
                    zabbixAPI)
            },
            login: async (_parent, args) => {
                return await new ZabbixRequest<any>("user.login").executeRequestThrowError(
                    zabbixAPI, new ParsedArgs(args))
            },
            logout: async (_parent, _args, {zabbixAuthToken, cookie}: any) => {
                return await new ZabbixRequest<any>("user.logout", zabbixAuthToken, cookie).executeRequestThrowError(zabbixAPI);
            },

            allHosts: async (_parent: any, args: QueryAllHostsArgs, {
                zabbixAuthToken,
                cookie, dataSources
            }: any, info: any) => {
                if (Config.HOST_TYPE_FILTER_DEFAULT) {
                    args.tag_hostType ??= [Config.HOST_TYPE_FILTER_DEFAULT];
                }
                const output = GraphqlParamsToNeededZabbixOutput.mapAllHosts(info);
                return await new ZabbixQueryHostsRequestWithItemsAndInventory(zabbixAuthToken, cookie)
                    .executeRequestThrowError(
                        dataSources?.zabbixAPI || zabbixAPI, new ParsedArgs(args), output
                    )
            },
            allDevices: async (_parent: any, args: QueryAllDevicesArgs, {
                zabbixAuthToken,
                cookie, dataSources
            }: any, info: any) => {
                if (Config.HOST_TYPE_FILTER_DEFAULT) {
                    args.tag_hostType ??= [Config.HOST_TYPE_FILTER_DEFAULT];
                }
                const output = GraphqlParamsToNeededZabbixOutput.mapAllDevices(info);
                return await new ZabbixQueryDevices(zabbixAuthToken, cookie)
                    .executeRequestThrowError(
                        dataSources?.zabbixAPI || zabbixAPI, new ZabbixQueryDevicesArgs(args), output
                    )
            },
            allHostGroups: async (_parent: any, args: QueryAllHostGroupsArgs, {
                zabbixAuthToken,
                cookie, dataSources
            }: any, info: any) => {
                if (!args.search_name && Config.HOST_GROUP_FILTER_DEFAULT) {
                    args.search_name = Config.HOST_GROUP_FILTER_DEFAULT
                }
                const output = GraphqlParamsToNeededZabbixOutput.mapAllHostGroups(info);
                return await new ZabbixQueryHostgroupsRequest(zabbixAuthToken, cookie).executeRequestThrowError(
                    dataSources?.zabbixAPI || zabbixAPI, new ZabbixQueryHostgroupsParams(args), output
                )
            },

            exportHostValueHistory: (_parent: any, args: QueryExportHostValueHistoryArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return HostValueExporter.exportHistory(args, zabbixAuthToken, cookie)
            },

            exportUserRights: async (_, args: QueryExportUserRightsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                let groups = await new ZabbixExportUserGroupsRequest(zabbixAuthToken, cookie)
                    .executeRequestThrowError(zabbixAPI, new ZabbixExportUserGroupArgs(args.name_pattern, args.exclude_hostgroups_pattern));
                let roles = await new ZabbixQueryUserRolesRequest(zabbixAuthToken, cookie)
                    .executeRequestThrowError(zabbixAPI, new ParsedArgs(args.name_pattern ? {name_pattern: args.name_pattern} : undefined));
                return {
                    userGroups: groups,
                    userRoles: roles
                }
            },

            templates: async (_parent: any, args: QueryTemplatesArgs, {
                zabbixAuthToken,
                cookie, dataSources
            }: any, info: any) => {
                let params: any = {}
                if (args.hostids) {
                    params.templateids = args.hostids
                }
                if (args.name_pattern) {
                    params.search = {
                        name: args.name_pattern
                    }
                }
                const output = GraphqlParamsToNeededZabbixOutput.mapTemplates(info);
                return await new ZabbixQueryTemplatesRequest(zabbixAuthToken, cookie)
                    .executeRequestThrowError(dataSources?.zabbixAPI || zabbixAPI, new ParsedArgs(params), output);
            },

            allTemplateGroups: async (_parent: any, args: any, {
                zabbixAuthToken,
                cookie
            }: any) => {
                let params: any = {}
                if (args.name_pattern) {
                    params.search = {
                        name: args.name_pattern
                    }
                }
                return await new ZabbixQueryTemplateGroupRequest(zabbixAuthToken, cookie)
                    .executeRequestThrowError(zabbixAPI, new ParsedArgs(params));
            }
        },
        Mutation: {

            createHost: async (_parent: any, args: MutationCreateHostArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                if (args.templateNames?.length) {
                    const templateidsByName = await TemplateHelper.findTemplateIdsByName(args.templateNames as string[], zabbixAPI, zabbixAuthToken, cookie);
                    if (!templateidsByName) {
                        return {
                            error: {
                                message: `Unable to find templates: ${args.templateNames}`
                            }
                        }
                    }
                    args.templateids = (args.templateids || []).concat(templateidsByName);
                }
                return await new ZabbixCreateHostRequest(zabbixAuthToken, cookie).executeRequestThrowError(
                    zabbixAPI,
                    new ParsedArgs(args)
                )
            },
            importHostGroups: async (_parent: any, args: MutationImportHostGroupsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return HostImporter.importHostGroups(args.hostGroups, zabbixAuthToken, cookie)
            },
            importHosts: async (_parent: any, args: MutationImportHostsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return HostImporter.importHosts(args.hosts, zabbixAuthToken, cookie)
            },
            importUserRights: async (_, args: MutationImportUserRightsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                let userRoleImportArgs = structuredClone(args);
                let userGroupImportArgs = structuredClone(args);
                let userRolesImport = userRoleImportArgs.input.userRoles ?
                    await new ZabbixImportUserRolesRequest(zabbixAuthToken, cookie)
                        .executeRequestThrowError(zabbixAPI,
                            new ZabbixImportUserRolesParams(userRoleImportArgs.input.userRoles, userRoleImportArgs.dryRun)) : null;
                let userGroupsImport = userGroupImportArgs.input.userGroups ?
                    await new ZabbixImportUserGroupsRequest(zabbixAuthToken, cookie)
                        .executeRequestThrowError(zabbixAPI,
                            new ZabbixImportUserGroupsParams(userGroupImportArgs.input.userGroups, userGroupImportArgs.dryRun)) : null;
                return {
                    userRoles: userRolesImport,
                    userGroups: userGroupsImport
                }
            },
            importTemplateGroups: async (_parent: any, args: MutationImportTemplateGroupsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return TemplateImporter.importTemplateGroups(args.templateGroups, zabbixAuthToken, cookie)
            },
            importTemplates: async (_parent: any, args: MutationImportTemplatesArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return TemplateImporter.importTemplates(args.templates, zabbixAuthToken, cookie)
            },
            pushHistory: async (_parent: any, args: MutationPushHistoryArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                const result = await new ZabbixHistoryPushRequest(zabbixAuthToken, cookie)
                    .executeRequestThrowError(zabbixAPI, new ZabbixHistoryPushParams(args.values, args.itemid?.toString(), args.key ?? undefined, args.host ?? undefined));

                return {
                    message: result.response === "success" ? "History pushed successfully" : "Some errors occurred",
                    data: result.data.map(d => ({
                        itemid: d.itemid,
                        error: Array.isArray(d.error) ? {message: d.error.join(", ")} : d.error
                    }))
                }
            },
            deleteTemplates: async (_parent: any, args: MutationDeleteTemplatesArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return TemplateDeleter.deleteTemplates(args.templateids, args.name_pattern, zabbixAuthToken, cookie)
            },
            deleteTemplateGroups: async (_parent: any, args: MutationDeleteTemplateGroupsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return TemplateDeleter.deleteTemplateGroups(args.groupids, args.name_pattern, zabbixAuthToken, cookie)
            },
            deleteHosts: async (_parent: any, args: any, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return HostDeleter.deleteHosts(args.hostids, args.name_pattern, zabbixAuthToken, cookie)
            },
            deleteHostGroups: async (_parent: any, args: any, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return HostDeleter.deleteHostGroups(args.groupids, args.name_pattern, zabbixAuthToken, cookie)
            },
            runSmoketest: async (_parent: any, args: any, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return SmoketestExecutor.runSmoketest(args.hostName, args.templateName, args.groupName, zabbixAuthToken, cookie)
            },
            runAllRegressionTests: async (_parent: any, _args: any, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return RegressionTestExecutor.runAllRegressionTests(zabbixAuthToken, cookie)
            }
        },

        Host: {
            // @ts-ignore
            __resolveType: function (host: Host, _context, info ): string {

                if (!isDevice(host)) {
                    logger.info(`checking host ${host.name} for deviceType - no device type found, returning as ZabbixHost`);

                    return "ZabbixHost";
                }
                const deviceType = host.deviceType!;
                logger.info(`checking host ${host.name} for deviceType - found ${deviceType}`);
                let interfaceType: GraphQLInterfaceType = (info.returnType instanceof GraphQLList ?
                    info.returnType.ofType : info.returnType) as GraphQLInterfaceType
                if (info.schema.getImplementations(interfaceType).objects.some((impl: { name: string; }) => impl.name === deviceType)) {
                    return deviceType;
                }
                return "GenericDevice"
            }
        },
        Device: {
            // @ts-ignore
            __resolveType: function (host: Device, _context, info ): string {
                const deviceType = host.deviceType!;
                logger.info(`checking host ${host.name} for deviceType - found ${deviceType}`);
                let interfaceType: GraphQLInterfaceType = (info.returnType instanceof GraphQLList ?
                    info.returnType.ofType : info.returnType) as GraphQLInterfaceType
                if (info.schema.getImplementations(interfaceType).objects.some((impl: { name: string; }) => impl.name === deviceType)) {
                    return deviceType;
                }
                return "GenericDevice"
            }
        },

        Inventory: {
            /*
                Always map inventory.location,... fields to location object
             */
            // @ts-ignore
            location: (parent: { location: string; location_lon: string; location_lat: string; }) => {
                return {
                    name: parent.location,
                    longitude: parent.location_lon,
                    latitude: parent.location_lat,
                }
            }
        },

        UserRoleRules: {
            ui_default_access: (parent: any) => {
                return parent["ui.default_access"]
            },
            modules_default_access: (parent: any) => {
                return parent["modules.default_access"]
            },
            actions_default_access: (parent: any) => {
                return parent["actions.default_access"]
            },
            api_access: (parent: any) => {
                return parent["api.access"]
            },
            api_mode: (parent: any) => {
                return parent["api.mode"]
            },
        },

        // Enum Value Mappings
        Permission: {
            READ: Permission.Read,
            READ_WRITE: Permission.ReadWrite,
            DENY: Permission.Deny
        },

        ZabbixItem: {
            type_int: (parent: any) => parent.type,
            status_int: (parent: any) => parent.status,
            master_item: (parent: any, _args: any, _context: any, info: any) => {
                if (!parent.master_itemid || parent.master_itemid === "0" || parent.master_itemid === 0) {
                    return null;
                }
                // This is a bit hacky but works if the siblings are in the parent's items array
                // and Apollo has already resolved them.
                // However, 'parent' here is just the item data.
                // To do this properly we'd need to fetch the master item if it's not present.
                // For now, let's just return null if we can't find it easily, or just rely on the agent.
                return null;
            }
        },
        DeviceCommunicationType: {
            ZABBIX_AGENT: DeviceCommunicationType.ZABBIX_AGENT,
            ZABBIX_AGENT_ACTIVE: DeviceCommunicationType.ZABBIX_AGENT_ACTIVE,
            ZABBIX_TRAP: DeviceCommunicationType.ZABBIX_TRAP,
            SIMPLE_CHECK: DeviceCommunicationType.SIMPLE_CHECK,
            ZABBIX_INTERNAL_ITEM: DeviceCommunicationType.ZABBIX_INTERNAL_ITEM,
            DEPENDANT_ITEM: DeviceCommunicationType.DEPENDANT_ITEM,
            HTTP_AGENT: DeviceCommunicationType.HTTP_AGENT,
            SIMULATOR_CALCULATED: DeviceCommunicationType.SIMULATOR_CALCULATED,
            SNMP_AGENT: DeviceCommunicationType.SNMP_AGENT,
            SNMP_TRAP: DeviceCommunicationType.SNMP_TRAP,
            IPMI_AGENT: DeviceCommunicationType.IPMI_AGENT,
            JMX_AGENT: DeviceCommunicationType.JMX_AGENT,
            SIMULATOR_JAVASCRIPT: DeviceCommunicationType.SIMULATOR_JAVASCRIPT,
            DATABASE_MONITOR: DeviceCommunicationType.DATABASE_MONITOR,
        },
        DeviceStatus: {
            ENABLED: DeviceStatus.ENABLED,
            DISABLED: DeviceStatus.DISABLED
        },

        StorageItemType: {
            TEXT: StorageItemType.Text,
            FLOAT: StorageItemType.Float,
            INT: StorageItemType.Int,
        }
    }
}

