import {
    DeviceCommunicationType,
    DeviceStatus,
    MutationCreateHostArgs,
    MutationImportHostsArgs,
    MutationImportHostGroupsArgs,
    MutationImportUserRightsArgs,
    Permission,
    QueryAllHostsArgs,
    QueryAllHostGroupsArgs,
    QueryExportDeviceValueHistoryArgs,
    QueryExportUserRightsArgs,
    QueryHasPermissionsArgs,
    QueryUserPermissionsArgs,
    Resolvers,
    StorageItemType, Host,
} from "../generated/graphql.js";

import {HostImporter} from "../execution/host_importer";
import {HostValueExporter} from "../execution/host_exporter";
import {logger} from "../logging/logger.js";
import {ParsedArgs, ZabbixPermissionsHelper, ZabbixRequest} from "../datasources/zabbix-request.js";
import {ZabbixCreateHostRequest, ZabbixQueryHostsRequestWithItemsAndInventory,} from "../datasources/zabbix-hosts.js";
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
import {ZABBIX_EDGE_DEVICE_BASE_GROUP, zabbixAPI} from "../datasources/zabbix-api";
import {GraphQLInterfaceType, GraphQLList} from "graphql/type";


export function createResolvers(): Resolvers {
    // @ts-ignore
    // @ts-ignore
    return {
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
                return dataSources.zabbixAPI.getLocations(zabbixAuthToken, new ParsedArgs(args));
            },
            apiVersion: () => {
                return process.env.API_VERSION ?? "unknown"
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
                return await new ZabbixRequest<any>("user.logout", undefined, cookie).executeRequestThrowError(zabbixAPI);
            },

            allHosts: async (_parent: any, args: QueryAllHostsArgs, {
                zabbixAuthToken,
                cookie, dataSources
            }: any) => {
                args.tag_hostType ??= [ZABBIX_EDGE_DEVICE_BASE_GROUP];
                return await new ZabbixQueryHostsRequestWithItemsAndInventory(zabbixAuthToken, cookie)
                    .executeRequestThrowError(
                        dataSources.zabbixAPI, new ParsedArgs(args)
                    )
            },

            allHostGroups: async (_parent: any, args: QueryAllHostGroupsArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                if (!args.search_name) {
                    args.search_name = ZABBIX_EDGE_DEVICE_BASE_GROUP + "/*"
                }
                return await new ZabbixQueryHostgroupsRequest(zabbixAuthToken, cookie).executeRequestThrowError(
                    zabbixAPI, new ZabbixQueryHostgroupsParams(args)
                )
            },

            exportDeviceValueHistory: (_parent: any, args: QueryExportDeviceValueHistoryArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
                return HostValueExporter.exportDeviceData(args, zabbixAuthToken, cookie)
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
            }
        },
        Mutation: {

            createHost: async (_parent: any, args: MutationCreateHostArgs, {
                zabbixAuthToken,
                cookie
            }: any) => {
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
                return HostImporter.importHosts(args.devices, zabbixAuthToken, cookie)
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
            }
        },

        Host: {
            // @ts-ignore
            __resolveType: function (host: Host, _context, info ): string {

                const deviceType = host.deviceType ?? "";

                if (deviceType) {
                    logger.info(`checking host ${host.name} for deviceType - found ${deviceType}`);
                    let interfaceType: GraphQLInterfaceType = (info.returnType instanceof GraphQLList ?
                        info.returnType.ofType : info.returnType) as GraphQLInterfaceType
                    if (info.schema.getImplementations(interfaceType).objects.some((impl: { name: string; }) => impl.name === deviceType)) {
                        return deviceType;
                    }
                    return "GenericDevice"
                }

                logger.info(`checking host ${host.name} for deviceType - no device type found, returning as ZabbixHost`);
                return "ZabbixHost"; // Return "generic" device host as a default if no templates are assigned
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

        SensorValueType: {
            NUMERIC: 0,
            CHARACTER: 1,
            LOG: 2,
            NUMERIC_UNSIGNED: 3,
            TEXT: 4
        },
        StorageItemType: {
            TEXT: StorageItemType.Text,
            FLOAT: StorageItemType.Float,
            INT: StorageItemType.Int,
        }
    }
}

