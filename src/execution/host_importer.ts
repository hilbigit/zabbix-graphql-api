import {
    CreateHost,
    CreateHostGroup,
    CreateHostGroupResponse,
    ImportHostResponse,
    InputMaybe
} from "../schema/generated/graphql.js";
import {logger} from "../logging/logger.js";
import {ZabbixQueryTemplatesRequest} from "../datasources/zabbix-templates.js";
import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult} from "../datasources/zabbix-request.js";
import {CreateHostGroupResult, GroupHelper, ZabbixCreateHostGroupRequest} from "../datasources/zabbix-hostgroups.js";
import {ZABBIX_EDGE_DEVICE_BASE_GROUP, zabbixAPI} from "../datasources/zabbix-api.js";

export class HostImporter {
    public static getHostGroupHierarchyNames(hostGroups: Array<CreateHostGroup>) {
        let resultSet: Set<CreateHostGroup> = new Set<CreateHostGroup>(hostGroups)
        for (let group of hostGroups || []) {
            let levelNames = group.groupName.split("/", hostGroups?.length - 1)
            let leafName = ""
            for (let level of levelNames) {
                leafName += (leafName ? "/" + level : level)
                resultSet.add({groupName: leafName})
            }
        }
        return resultSet
    }

    public static async importHostGroups(hostGroups: InputMaybe<Array<CreateHostGroup>> | undefined, zabbixAuthToken?: string, cookie?: string) {

        if (!hostGroups) {
            return null
        }
        let result: CreateHostGroupResponse[] = []
        for (let group of HostImporter.getHostGroupHierarchyNames(hostGroups)) {
            let createGroupResult: CreateHostGroupResult | ZabbixErrorResult | undefined = undefined;
            let groups = await GroupHelper.findHostGroupIdsByName([group.groupName], zabbixAPI, zabbixAuthToken, cookie)
            let groupid = 0
            let message: string | undefined = undefined
            if (groups?.length) {
                groupid = groups[0]
                message = `Group ${group.groupName} already exists with groupid=${groupid} - skipping`
                logger.debug(message)
            } else {
                createGroupResult = await new ZabbixCreateHostGroupRequest(zabbixAuthToken, cookie)
                    .executeRequestReturnError(zabbixAPI,
                        new ParsedArgs({
                            name: GroupHelper.groupFullName(group.groupName),
                            uuid: group.uuid
                        }))
                if (isZabbixErrorResult(createGroupResult)) {
                    result.push(
                        {
                            groupName: group.groupName,
                            message: `Unable to create groupName=${group.groupName}: ${JSON.stringify(createGroupResult)}`,
                            error: createGroupResult!.error
                        }
                    )
                    continue
                } else {
                    if (createGroupResult?.groupids?.length) {
                        groupid = Number(createGroupResult.groupids[0])
                    }
                }
            }

            if (groupid) {
                result.push(
                    {
                        groupName: group.groupName,
                        groupid: groupid,
                        message: message
                    }
                )
            } else {
                result.push(
                    {
                        groupName: group.groupName,
                        message: `Unable to create groupName=${group.groupName}: ${JSON.stringify(createGroupResult)}`,
                        error: {
                            message: "Unknown error - no groupid returned",
                        }
                    }
                )
            }
        }
        return result
    }

    static async importHosts(hosts: InputMaybe<Array<CreateHost>> | undefined, zabbixAuthToken?: string, cookie?: string) {
        if (!hosts) {
            return null
        }
        let result: ImportHostResponse[] = []
        for (let device of hosts) {
            let groupids = device.groupids
            if (!groupids) {
                groupids = await GroupHelper.findHostGroupIdsByName([ZABBIX_EDGE_DEVICE_BASE_GROUP, ...device.groupNames], zabbixAPI, zabbixAuthToken, cookie)
                if (!groupids?.length) {
                    result.push(
                        {
                            deviceKey: device.deviceKey,
                            message: `Unable to find groupNames=${device.groupNames}`
                        }
                    )
                    break
                }
            }
            let deviceImportResult: {
                hostids?: string[];
                error?: any;
            } = await zabbixAPI.requestByPath("host.create", new ParsedArgs(
                {
                    host: device.deviceKey,
                    name: device.name,
                    location: device.location,
                    templateids: [
                        await HostImporter.getTemplateIdForDeviceType(
                            device.deviceType, zabbixAuthToken, cookie)],
                    hostgroupids: groupids
                }
            ), zabbixAuthToken, cookie)
            if (deviceImportResult?.hostids?.length) {
                result.push({
                    deviceKey: device.deviceKey,
                    hostid: deviceImportResult.hostids[0],
                })
            } else {
                result.push({
                    deviceKey: device.deviceKey,
                    message: `Unable to import deviceKey=${device.deviceKey}: ${deviceImportResult.error.message}`,
                    error: deviceImportResult.error
                })

            }

        }
        return result
    }

    private static async getTemplateIdForDeviceType(deviceType: String, zabbixAuthToken?: string, cookie?: string): Promise<number | undefined> {
        let result: number | undefined

        let templates = await new ZabbixQueryTemplatesRequest(zabbixAuthToken, cookie)
            .executeRequestThrowError(zabbixAPI, new ParsedArgs(
                {
                    tag_deviceType: deviceType
                }
            ));

        if (templates?.length) {
            result = Number(templates[0].templateid)
        } else {
            logger.error(`Unable to get template for deviceType=${deviceType}: ${result}`)
        }
        return result
    }

}

