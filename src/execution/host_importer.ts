import {
    CreateHost,
    CreateHostGroup,
    CreateHostGroupResponse,
    ImportHostResponse,
    InputMaybe
} from "../schema/generated/graphql.js";
import {logger} from "../logging/logger.js";
import {ZabbixCreateHostRequest} from "../datasources/zabbix-hosts.js";
import {ZabbixQueryTemplatesRequest, TemplateHelper} from "../datasources/zabbix-templates.js";
import {isZabbixErrorResult, ParsedArgs, ZabbixErrorResult} from "../datasources/zabbix-request.js";
import {CreateHostGroupResult, GroupHelper, ZabbixCreateHostGroupRequest} from "../datasources/zabbix-hostgroups.js";
import {ZABBIX_EDGE_DEVICE_BASE_GROUP, zabbixAPI} from "../datasources/zabbix-api.js";

export class HostImporter {
    public static getHostGroupHierarchyNames(hostGroups: Array<CreateHostGroup>) {
        let nameToGroup = new Map<string, CreateHostGroup>()
        for (let group of hostGroups || []) {
            let levelNames = group.groupName.split("/")
            let leafName = ""
            for (let i = 0; i < levelNames.length; i++) {
                leafName += (leafName ? "/" + levelNames[i] : levelNames[i])
                if (!nameToGroup.has(leafName)) {
                    // Use original group object if it matches the name (to keep UUID), else create new
                    let original = hostGroups.find(g => g.groupName === leafName)
                    nameToGroup.set(leafName, original ? original : {groupName: leafName})
                }
            }
        }
        // Sort alphabetically to process parents before children
        return Array.from(nameToGroup.values()).sort((a, b) => a.groupName.localeCompare(b.groupName))
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

            let templateids = device.templateids ? [...device.templateids as number[]] : [];
            if (device.templateNames?.length) {
                const resolvedTemplateids = await TemplateHelper.findTemplateIdsByName(device.templateNames as string[], zabbixAPI, zabbixAuthToken, cookie);
                if (resolvedTemplateids) {
                    templateids.push(...resolvedTemplateids);
                } else {
                    result.push({
                        deviceKey: device.deviceKey,
                        message: `Unable to find templates: ${device.templateNames}`
                    });
                    continue;
                }
            }

            if (templateids.length === 0) {
                const defaultTemplateId = await HostImporter.getTemplateIdForDeviceType(device.deviceType, zabbixAuthToken, cookie);
                if (defaultTemplateId) {
                    templateids.push(defaultTemplateId);
                }
            }

            // Deduplicate
            groupids = Array.from(new Set(groupids));
            templateids = Array.from(new Set(templateids));

            let deviceImportResult = await new ZabbixCreateHostRequest(zabbixAuthToken, cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs(
                {
                    host: device.deviceKey,
                    name: device.name,
                    location: device.location,
                    templateids: templateids,
                    hostgroupids: groupids,
                    macros: device.macros,
                    tags: [{ tag: "deviceType", value: device.deviceType }]
                }
            ))

            if (isZabbixErrorResult(deviceImportResult)) {
                result.push({
                    deviceKey: device.deviceKey,
                    message: `Unable to import deviceKey=${device.deviceKey}: ${deviceImportResult.error.message}`,
                    error: deviceImportResult.error
                })
            } else {
                result.push({
                    deviceKey: device.deviceKey,
                    hostid: deviceImportResult.hostids![0]?.toString(),
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
            ), ["templateid"]);

        if (templates?.length) {
            result = Number(templates[0].templateid)
        } else {
            logger.error(`Unable to get template for deviceType=${deviceType}: ${result}`)
        }
        return result
    }

}

