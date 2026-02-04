import {SmoketestResponse, SmoketestStep} from "../schema/generated/graphql.js";
import {HostImporter} from "./host_importer.js";
import {HostDeleter} from "./host_deleter.js";
import {TemplateImporter} from "./template_importer.js";
import {TemplateDeleter} from "./template_deleter.js";
import {logger} from "../logging/logger.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {
    ZabbixQueryDevices,
    ZabbixQueryDevicesArgs,
    ZabbixQueryHostsGenericRequest,
    ZabbixQueryHostsGenericRequestWithItems
} from "../datasources/zabbix-hosts.js";
import {ZabbixQueryTemplatesRequest} from "../datasources/zabbix-templates.js";
import {isZabbixErrorResult, ParsedArgs, ZabbixRequest} from "../datasources/zabbix-request.js";
import {ZabbixHistoryPushParams, ZabbixHistoryPushRequest} from "../datasources/zabbix-history.js";

export class RegressionTestExecutor {
    public static async runAllRegressionTests(zabbixAuthToken?: string, cookie?: string): Promise<SmoketestResponse> {
        const steps: SmoketestStep[] = [];
        let success = true;

        const hostName = "REG_HOST_" + Math.random().toString(36).substring(7);
        const groupName = "REG_GROUP_" + Math.random().toString(36).substring(7);

        const regTemplateName = "REG_TEMP_" + Math.random().toString(36).substring(7);
        const httpTempName = "REG_HTTP_" + Math.random().toString(36).substring(7);
        const macroTemplateName = "REG_MACRO_TEMP_" + Math.random().toString(36).substring(7);
        const macroHostName = "REG_MACRO_HOST_" + Math.random().toString(36).substring(7);
        const metaTempName = "REG_META_TEMP_" + Math.random().toString(36).substring(7);
        const metaHostName = "REG_META_HOST_" + Math.random().toString(36).substring(7);
        const depTempName = "REG_DEP_TEMP_" + Math.random().toString(36).substring(7);
        const stateTempName = "REG_STATE_TEMP_" + Math.random().toString(36).substring(7);
        const stateHostName = "REG_STATE_HOST_" + Math.random().toString(36).substring(7);
        const devHostNameWithTag = "REG_DEV_WITH_TAG_" + Math.random().toString(36).substring(7);
        const devHostNameWithoutTag = "REG_DEV_WITHOUT_TAG_" + Math.random().toString(36).substring(7);
        const pushHostName = "REG_PUSH_HOST_" + Math.random().toString(36).substring(7);

        try {
            // Regression 1: Locations query argument order
            // This verifies the fix where getLocations was called with (authToken, args) instead of (args, authToken)
            try {
                const locations = await zabbixAPI.getLocations(new ParsedArgs({ name_pattern: "NonExistent_" + Math.random() }), zabbixAuthToken, cookie);
                steps.push({
                    name: "REG-LOC: Locations query argument order",
                    success: true,
                    message: "Locations query executed without session error"
                });
            } catch (error: any) {
                steps.push({
                    name: "REG-LOC: Locations query argument order",
                    success: false,
                    message: `Failed: ${error.message}`
                });
                success = false;
            }

            // Regression 2: Template lookup by technical name
            // Verifies that importHosts can link templates using their technical name (host)
            const regGroupName = "Templates/Roadwork/Devices";
            const hostGroupName = "Roadwork/Devices";
            
            // Assure template group exists
            await TemplateImporter.importTemplateGroups([{
                groupName: regGroupName
            }], zabbixAuthToken, cookie);
            
            const tempResult = await TemplateImporter.importTemplates([{
                host: regTemplateName,
                name: "Regression Test Template " + regTemplateName,
                groupNames: [regGroupName]
            }], zabbixAuthToken, cookie);

            const tempSuccess = !!tempResult?.length && !tempResult[0].error;
            steps.push({
                name: "REG-TEMP: Template technical name lookup",
                success: tempSuccess,
                message: tempSuccess ? `Template ${regTemplateName} created and searchable by technical name` : `Failed to create template`
            });
            if (!tempSuccess) success = false;

            // Regression 3: HTTP Agent URL support
            // Verifies that templates with HTTP Agent items (including URL) can be imported
            const httpTempResult = await TemplateImporter.importTemplates([{
                host: httpTempName,
                name: "Regression HTTP Template " + httpTempName,
                groupNames: [regGroupName],
                items: [{
                    name: "HTTP Master",
                    type: 19, // HTTP Agent
                    key: "http.master",
                    value_type: 4,
                    url: "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m",
                    delay: "1m",
                    history: "0"
                }]
            }], zabbixAuthToken, cookie);

            const httpSuccess = !!httpTempResult?.length && !httpTempResult[0].error;
            steps.push({
                name: "REG-HTTP: HTTP Agent URL support",
                success: httpSuccess,
                message: httpSuccess ? `Template ${httpTempName} with HTTP Agent item created successfully` : `Failed: ${httpTempResult?.[0]?.message}`
            });
            if (!httpSuccess) success = false;

            // Regression 4: User Macro assignment for host and template creation
            const macroTempResult = await TemplateImporter.importTemplates([{
                host: macroTemplateName,
                name: "Regression Macro Template " + macroTemplateName,
                groupNames: [regGroupName],
                macros: [
                    { macro: "{$TEMP_MACRO}", value: "temp_value" }
                ]
            }], zabbixAuthToken, cookie);

            const macroTempImportSuccess = !!macroTempResult?.length && !macroTempResult[0].error;
            let macroHostImportSuccess = false;
            let macroVerifySuccess = false;

            if (macroTempImportSuccess) {
                const macroHostResult = await HostImporter.importHosts([{
                    deviceKey: macroHostName,
                    deviceType: "RegressionHost",
                    groupNames: [hostGroupName],
                    templateNames: [macroTemplateName],
                    macros: [
                        { macro: "{$HOST_MACRO}", value: "host_value" }
                    ]
                }], zabbixAuthToken, cookie);
                macroHostImportSuccess = !!macroHostResult?.length && !!macroHostResult[0].hostid;

                if (macroHostImportSuccess) {
                    // Verify macros on host
                    const verifyHostResult = await new ZabbixQueryHostsGenericRequest("host.get", zabbixAuthToken, cookie)
                        .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                            filter_host: macroHostName,
                            selectMacros: "extend"
                        }));

                    // Verify macros on template
                    const verifyTempResult = await new ZabbixQueryTemplatesRequest(zabbixAuthToken, cookie)
                        .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                            filter_host: macroTemplateName,
                            selectMacros: "extend"
                        }));

                    const hasHostMacro = Array.isArray(verifyHostResult) && verifyHostResult.length > 0 &&
                        (verifyHostResult[0] as any).macros?.some((m: any) => m.macro === "{$HOST_MACRO}" && m.value === "host_value");

                    const hasTempMacro = Array.isArray(verifyTempResult) && verifyTempResult.length > 0 &&
                        (verifyTempResult[0] as any).macros?.some((m: any) => m.macro === "{$TEMP_MACRO}" && m.value === "temp_value");

                    macroVerifySuccess = !!(hasHostMacro && hasTempMacro);
                }
            }

            const macroOverallSuccess = macroTempImportSuccess && macroHostImportSuccess && macroVerifySuccess;
            steps.push({
                name: "REG-MACRO: User Macro assignment",
                success: macroOverallSuccess,
                message: macroOverallSuccess
                    ? "Macros successfully assigned to template and host"
                    : `Failed: TempImport=${macroTempImportSuccess}, HostImport=${macroHostImportSuccess}, Verify=${macroVerifySuccess}`
            });
            if (!macroOverallSuccess) success = false;

            // Regression 5: Host retrieval and visibility (allHosts output fields fix)
            if (success) {
                const hostResult = await HostImporter.importHosts([{
                    deviceKey: hostName,
                    deviceType: "RegressionHost",
                    groupNames: [hostGroupName],
                    templateNames: [regTemplateName]
                }], zabbixAuthToken, cookie);

                const hostImportSuccess = !!hostResult?.length && !!hostResult[0].hostid;
                if (hostImportSuccess) {
                    const hostid = hostResult[0].hostid;
                    logger.info(`REG-HOST: Host ${hostName} imported with ID ${hostid}. Verifying visibility...`);
                    
                    // Verify visibility via allHosts (simulated)
                    const verifyResult = await new ZabbixQueryHostsGenericRequest("host.get", zabbixAuthToken, cookie)
                        .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                            filter_host: hostName
                        }));
                    
                    const verified = Array.isArray(verifyResult) && verifyResult.length > 0 && (verifyResult[0] as any).host === hostName;
                    
                    let fieldsVerified = false;
                    if (verified) {
                        const host = verifyResult[0] as any;
                        const hasGroups = Array.isArray(host.hostgroups) && host.hostgroups.length > 0;
                        const hasTemplates = Array.isArray(host.parentTemplates) && host.parentTemplates.length > 0;
                        fieldsVerified = hasGroups && hasTemplates;
                        
                        if (!fieldsVerified) {
                            logger.error(`REG-HOST: Fields verification failed. Groups: ${hasGroups}, Templates: ${hasTemplates}. Host data: ${JSON.stringify(host)}`);
                        }
                    }

                    if (!verified) {
                        logger.error(`REG-HOST: Verification failed. Zabbix result: ${JSON.stringify(verifyResult)}`);
                    }
                    steps.push({
                        name: "REG-HOST: Host retrieval and visibility (incl. groups and templates)",
                        success: verified && fieldsVerified,
                        message: verified 
                            ? (fieldsVerified ? `Host ${hostName} retrieved successfully with groups and templates` : `Host ${hostName} retrieved but missing groups or templates`)
                            : "Host not found after import (output fields issue?)"
                    });
                    if (!verified || !fieldsVerified) success = false;
                } else {
                    steps.push({
                        name: "REG-HOST: Host retrieval and visibility",
                        success: false,
                        message: `Host import failed: ${hostResult?.[0]?.message || hostResult?.[0]?.error?.message || "Unknown error"}`
                    });
                    success = false;
                }
            }

            // Regression 6: Item Metadata (preprocessing, units, description, error)
            const metaTempResult = await TemplateImporter.importTemplates([{
                host: metaTempName,
                name: "Regression Meta Template " + metaTempName,
                groupNames: [regGroupName],
                items: [{
                    name: "Meta Item",
                    type: 2, // Zabbix trapper
                    key: "meta.item",
                    value_type: 0, // Float
                    units: "TEST_UNIT",
                    description: "Test Description",
                    history: "1d",
                    preprocessing: [
                        {
                            type: 12, // JSONPath
                            params: ["$.value"]
                        }
                    ]
                }]
            }], zabbixAuthToken, cookie);

            const metaTempSuccess = !!metaTempResult?.length && !metaTempResult[0].error;
            let metaHostSuccess = false;
            let metaVerifySuccess = false;

            if (metaTempSuccess) {
                const metaHostResult = await HostImporter.importHosts([{
                    deviceKey: metaHostName,
                    deviceType: "RegressionHost",
                    groupNames: [hostGroupName],
                    templateNames: [metaTempName]
                }], zabbixAuthToken, cookie);
                metaHostSuccess = !!metaHostResult?.length && !!metaHostResult[0].hostid;

                if (metaHostSuccess) {
                    // Verify item metadata
                    const verifyResult = await new ZabbixQueryHostsGenericRequestWithItems("host.get", zabbixAuthToken, cookie)
                        .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                            filter_host: metaHostName
                        }));

                    if (Array.isArray(verifyResult) && verifyResult.length > 0) {
                        const host = verifyResult[0] as any;
                        const item = host.items?.find((i: any) => i.key_ === "meta.item");
                        
                        if (item) {
                            const hasUnits = item.units === "TEST_UNIT";
                            const hasDesc = item.description === "Test Description";
                            // Zabbix might return type as string or number depending on version/API, but usually it's string in JSON result if not cast
                            const hasPreproc = Array.isArray(item.preprocessing) && item.preprocessing.length > 0 && 
                                               String(item.preprocessing[0].type) === "12";
                            const hasErrorField = item.hasOwnProperty("error");

                            metaVerifySuccess = hasUnits && hasDesc && hasPreproc && hasErrorField;
                            
                            if (!metaVerifySuccess) {
                                logger.error(`REG-META: Verification failed. Units: ${hasUnits}, Desc: ${hasDesc}, Preproc: ${hasPreproc}, ErrorField: ${hasErrorField}. Item: ${JSON.stringify(item)}`);
                            }
                        }
                    }
                }
            }

            const metaOverallSuccess = metaTempSuccess && metaHostSuccess && metaVerifySuccess;
            steps.push({
                name: "REG-ITEM-META: Item metadata (preprocessing, units, description, error)",
                success: metaOverallSuccess,
                message: metaOverallSuccess
                    ? "Item metadata successfully retrieved including preprocessing and units"
                    : `Failed: TempImport=${metaTempSuccess}, HostImport=${metaHostSuccess}, Verify=${metaVerifySuccess}`
            });
            if (!metaOverallSuccess) success = false;
            
            // Regression 7: Query Optimization and Skippable Parameters
            let optSuccess = false;
            try {
                const optRequest = new ZabbixQueryHostsGenericRequestWithItems("host.get", zabbixAuthToken, cookie);
                
                // 1. Test optimization logic: items NOT requested
                const testParams1 = optRequest.createZabbixParams(new ParsedArgs({}), ["hostid", "name"]);
                const hasSelectItems1 = "selectItems" in testParams1;
                const hasOutput1 = Array.isArray(testParams1.output) && testParams1.output.includes("hostid") && testParams1.output.includes("name");
                
                // 2. Test skippable params: items requested, tags NOT requested
                const testParams2 = optRequest.createZabbixParams(new ParsedArgs({}), ["hostid", "items"]);
                const hasSelectItems2 = "selectItems" in testParams2;
                const hasSelectTags2 = "selectTags" in testParams2;
                
                optSuccess = !hasSelectItems1 && hasOutput1 && hasSelectItems2 && !hasSelectTags2;
                
                // 3. Test indirect dependencies: state implies items
                const testParams3 = optRequest.createZabbixParams(new ParsedArgs({}), ["hostid", "state"]);
                const hasSelectItems3 = "selectItems" in testParams3;
                
                optSuccess = optSuccess && hasSelectItems3;
                
                // 4. Test indirect dependencies: deviceType implies tags
                const testParams4 = optRequest.createZabbixParams(new ParsedArgs({}), ["hostid", "deviceType"]);
                const hasSelectTags4 = "selectTags" in testParams4;
                
                optSuccess = optSuccess && hasSelectTags4;

                if (!optSuccess) {
                    logger.error(`REG-OPT: Optimization verification failed. hasSelectItems1: ${hasSelectItems1}, hasOutput1: ${hasOutput1}, hasSelectItems2: ${hasSelectItems2}, hasSelectTags2: ${hasSelectTags2}, hasSelectItems3: ${hasSelectItems3}, hasSelectTags4: ${hasSelectTags4}`);
                }
            } catch (error) {
                logger.error(`REG-OPT: Error during optimization test: ${error}`);
            }

            steps.push({
                name: "REG-OPT: Query Optimization and Skippable Parameters",
                success: optSuccess,
                message: optSuccess 
                    ? "Optimization logic correctly filters output fields and skippable parameters" 
                    : "Optimization logic failed to correctly filter parameters"
            });
            if (!optSuccess) success = false;

            // Regression 8: Empty result handling with filters
            let emptySuccess = false;
            try {
                const emptyResult = await new ZabbixQueryHostsGenericRequest("host.get", zabbixAuthToken, cookie)
                    .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                        filter_host: "NonExistentHost_" + Math.random()
                    }));
                
                emptySuccess = Array.isArray(emptyResult) && emptyResult.length === 0;
            } catch (error: any) {
                logger.error(`REG-EMPTY: Error during empty result test: ${error}`);
            }

            steps.push({
                name: "REG-EMPTY: Empty result handling",
                success: emptySuccess,
                message: emptySuccess ? "Correctly returned empty array for non-existent host" : "Failed to return empty array for non-existent host"
            });
            if (!emptySuccess) success = false;

            // Regression 9: Dependent Items in Templates
            const depTempResult = await TemplateImporter.importTemplates([{
                host: depTempName,
                name: "Regression Dependent Template " + depTempName,
                groupNames: [regGroupName],
                items: [
                    {
                        name: "Master Item",
                        type: 2, // Trapper
                        key: "master.item",
                        value_type: 4, // Text
                        history: "1d"
                    },
                    {
                        name: "Dependent Item",
                        type: 18, // Dependent
                        key: "dependent.item",
                        value_type: 4,
                        master_item: { key: "master.item" },
                        history: "1d"
                    }
                ]
            }], zabbixAuthToken, cookie);
            
            const depSuccess = !!depTempResult?.length && !depTempResult[0].error;
            steps.push({
                name: "REG-DEP: Dependent Items support",
                success: depSuccess,
                message: depSuccess ? "Template with master and dependent items imported successfully" : `Failed: ${depTempResult?.[0]?.message}`
            });
            if (!depSuccess) success = false;

            // Regression 10: State sub-properties retrieval (Optimization indirect dependency)
            const stateTempResult = await TemplateImporter.importTemplates([{
                host: stateTempName,
                name: "Regression State Template " + stateTempName,
                groupNames: [regGroupName],
                tags: [{ tag: "deviceType", value: "GenericDevice" }],
                items: [{
                    name: "Temperature",
                    type: 2, // Trapper
                    key: "operational.temperature",
                    value_type: 0, // Float
                    history: "1d"
                }]
            }], zabbixAuthToken, cookie);

            const stateTempSuccess = !!stateTempResult?.length && !stateTempResult[0].error;
            let stateHostSuccess = false;
            let stateVerifySuccess = false;

            if (stateTempSuccess) {
                const stateHostResult = await HostImporter.importHosts([{
                    deviceKey: stateHostName,
                    deviceType: "GenericDevice",
                    groupNames: [hostGroupName],
                    templateNames: [stateTempName]
                }], zabbixAuthToken, cookie);
                stateHostSuccess = !!stateHostResult?.length && !!stateHostResult[0].hostid;

                if (stateHostSuccess) {
                    // Query using ZabbixQueryDevices which handles state -> items mapping
                    const devicesResult = await new ZabbixQueryDevices(zabbixAuthToken, cookie)
                        .executeRequestReturnError(zabbixAPI, new ZabbixQueryDevicesArgs({
                            filter_host: stateHostName
                        }), ["hostid", "state.operational.temperature"]);

                    if (Array.isArray(devicesResult) && devicesResult.length > 0) {
                        const device = devicesResult[0] as any;
                        // Check if items were fetched (indirect dependency)
                        const hasItems = Array.isArray(device.items) && device.items.some((i: any) => i.key_ === "operational.temperature");
                        stateVerifySuccess = hasItems;

                        if (!hasItems) {
                            logger.error(`REG-STATE: Items missing in device result despite requesting state. Device: ${JSON.stringify(device)}`);
                        }
                    } else {
                        logger.error(`REG-STATE: Device not found after import. Result: ${JSON.stringify(devicesResult)}`);
                    }
                }
            }

            const stateOverallSuccess = stateTempSuccess && stateHostSuccess && stateVerifySuccess;
            steps.push({
                name: "REG-STATE: State sub-properties retrieval (indirect dependency)",
                success: stateOverallSuccess,
                message: stateOverallSuccess
                    ? "State sub-properties correctly trigger item fetching and are available"
                    : `Failed: TempImport=${stateTempSuccess}, HostImport=${stateHostSuccess}, Verify=${stateVerifySuccess}`
            });
            if (!stateOverallSuccess) success = false;

            // Regression 11: Negative Optimization - items not requested (allDevices)
            let optNegSuccess = false;
            try {
                const optRequest = new ZabbixQueryDevices(zabbixAuthToken, cookie);
                
                // Test optimization logic: items/state NOT requested
                const testParams = optRequest.createZabbixParams(new ZabbixQueryDevicesArgs({}), ["hostid", "name"]);
                const hasSelectItems = "selectItems" in testParams;
                const hasOutputItems = Array.isArray(testParams.output) && testParams.output.includes("items");
                
                optNegSuccess = !hasSelectItems && !hasOutputItems;
                
                if (!optNegSuccess) {
                    logger.error(`REG-OPT-NEG: Negative optimization verification failed. hasSelectItems: ${hasSelectItems}, hasOutputItems: ${hasOutputItems}`);
                }
            } catch (error) {
                logger.error(`REG-OPT-NEG: Error during negative optimization test: ${error}`);
            }

            steps.push({
                name: "REG-OPT-NEG: Negative Optimization - items not requested (allDevices)",
                success: optNegSuccess,
                message: optNegSuccess 
                    ? "Optimization correctly omits items when neither items nor state are requested" 
                    : "Optimization failed to omit items when not requested"
            });
            if (!optNegSuccess) success = false;

            // Regression 12: allDevices deviceType filter
            // Verifies that allDevices only returns hosts with a deviceType tag
            // Get groupid for hostGroupName
            const groupQuery: any = await new ZabbixRequest("hostgroup.get", zabbixAuthToken, cookie)
                .executeRequestReturnError(zabbixAPI, new ParsedArgs({ filter_name: hostGroupName }));
            const regGroupId = Array.isArray(groupQuery) && groupQuery[0]?.groupid;

            if (regGroupId) {
                await HostImporter.importHosts([{
                    deviceKey: devHostNameWithTag,
                    deviceType: "RegressionDevice",
                    groupNames: [hostGroupName]
                }], zabbixAuthToken, cookie);

                await new ZabbixRequest("host.create", zabbixAuthToken, cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({
                    host: devHostNameWithoutTag,
                    name: devHostNameWithoutTag,
                    groups: [{ groupid: regGroupId }]
                }));

                const allDevicesResult: any = await new ZabbixQueryDevices(zabbixAuthToken, cookie)
                    .executeRequestReturnError(zabbixAPI, new ZabbixQueryDevicesArgs({
                        filter_host: [devHostNameWithTag, devHostNameWithoutTag]
                    }), ["name", "host", "hostid", "deviceType"]);

                if (isZabbixErrorResult(allDevicesResult)) {
                    steps.push({
                        name: "REG-DEV-FILTER: allDevices deviceType filter",
                        success: false,
                        message: `Zabbix error: ${allDevicesResult.error.message}`
                    });
                } else {
                    const hasHostWithTag = allDevicesResult.some((d: any) => d.host === devHostNameWithTag);
                    const hasHostWithoutTag = allDevicesResult.some((d: any) => d.host === devHostNameWithoutTag);
                    const devTypeNotNull = allDevicesResult.length > 0 && allDevicesResult.every((d: any) => d.deviceType !== null && d.deviceType !== undefined && d.deviceType !== "");

                    const devFilterSuccess = hasHostWithTag && !hasHostWithoutTag && devTypeNotNull;
                    steps.push({
                        name: "REG-DEV-FILTER: allDevices deviceType filter",
                        success: devFilterSuccess,
                        message: devFilterSuccess 
                            ? `allDevices correctly filtered out hosts without deviceType tag`
                            : `Failed: withTag=${hasHostWithTag}, withoutTag=${hasHostWithoutTag}, typeNotNull=${devTypeNotNull}, result=${JSON.stringify(allDevicesResult)}`
                    });
                    if (!devFilterSuccess) success = false;
                }
            }

            // Regression 13: pushHistory mutation
            let pushSuccess = false;
            const version = await zabbixAPI.getVersion();
            
            if (version < "7.0.0") {
                logger.info(`REG-PUSH: Skipping pushHistory test as it is not supported on Zabbix version ${version}`);
                pushSuccess = true; // Mark as success for old versions to allow overall test success
            } else {
                const pushItemKey = "trap.json";
                
                // Create host
                const pushHostResult = await HostImporter.importHosts([{
                    deviceKey: pushHostName,
                    deviceType: "RegressionHost",
                    groupNames: [hostGroupName],
                    templateNames: []
                }], zabbixAuthToken, cookie);

                if (pushHostResult?.length && pushHostResult[0].hostid) {
                    const pushHostId = pushHostResult[0].hostid;
                    
                    // Add trapper item to host
                    const pushItemResult = await new ZabbixRequest("item.create", zabbixAuthToken, cookie).executeRequestReturnError(zabbixAPI, new ParsedArgs({
                        name: "Trapper JSON Item",
                        key_: pushItemKey,
                        hostid: pushHostId,
                        type: 2, // Zabbix trapper
                        value_type: 4, // Text
                        history: "1d"
                    }));

                    if (!isZabbixErrorResult(pushItemResult)) {
                        // Push data
                        const pushRequest = new ZabbixHistoryPushRequest(zabbixAuthToken, cookie);
                        const pushParams = new ZabbixHistoryPushParams(
                            [{ timestamp: new Date().toISOString(), value: { hello: "world" } }],
                            undefined, pushItemKey, pushHostName
                        );
                        
                        const pushDataResult = await pushRequest.executeRequestReturnError(zabbixAPI, pushParams);
                        pushSuccess = !isZabbixErrorResult(pushDataResult) && pushDataResult.response === "success";
                    }
                    
                    // Cleanup push host
                    await HostDeleter.deleteHosts([Number(pushHostId)], null, zabbixAuthToken, cookie);
                }
            }

            steps.push({
                name: "REG-PUSH: pushHistory mutation",
                success: pushSuccess,
                message: version < "7.0.0" 
                    ? `Skipped (not supported on ${version})`
                    : (pushSuccess ? "Successfully pushed history data to trapper item" : "Failed to push history data")
            });
            if (!pushSuccess) success = false;

            // Step 1: Create Host Group (Legacy test kept for compatibility)
            const groupResult = await HostImporter.importHostGroups([{
                groupName: groupName
            }], zabbixAuthToken, cookie);

            const groupSuccess = !!groupResult?.length && !groupResult[0].error;
            steps.push({
                name: "Create Host Group",
                success: groupSuccess,
                message: groupSuccess ? `Host group ${groupName} created` : `Failed: ${groupResult?.[0]?.error?.message || "Unknown error"}`
            });
            if (!groupSuccess) success = false;

            // Cleanup
            await HostDeleter.deleteHosts(null, hostName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, macroHostName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, metaHostName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, devHostNameWithTag, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, devHostNameWithoutTag, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, pushHostName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, regTemplateName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, httpTempName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, macroTemplateName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, metaTempName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, depTempName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, stateTempName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, stateHostName, zabbixAuthToken, cookie);
            // We don't delete the group here as it might be shared or used by other tests in this run

        } catch (error: any) {
            success = false;
            steps.push({
                name: "Execution Error",
                success: false,
                message: error.message || String(error)
            });
        } finally {
            // Cleanup
            await HostDeleter.deleteHosts(null, hostName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, macroHostName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, metaHostName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, devHostNameWithTag, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, devHostNameWithoutTag, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, pushHostName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, regTemplateName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, httpTempName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, macroTemplateName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, metaTempName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, depTempName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, stateTempName, zabbixAuthToken, cookie);
            await HostDeleter.deleteHosts(null, stateHostName, zabbixAuthToken, cookie);
            // We don't delete the group here as it might be shared or used by other tests in this run
        }

        return {
            success,
            message: success ? "Regression tests passed successfully" : "Regression tests failed",
            steps
        };
    }
}
