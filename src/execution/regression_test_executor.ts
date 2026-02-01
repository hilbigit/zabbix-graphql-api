import {SmoketestResponse, SmoketestStep} from "../schema/generated/graphql.js";
import {HostImporter} from "./host_importer.js";
import {HostDeleter} from "./host_deleter.js";
import {TemplateImporter} from "./template_importer.js";
import {TemplateDeleter} from "./template_deleter.js";
import {logger} from "../logging/logger.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {ZabbixQueryHostsGenericRequest} from "../datasources/zabbix-hosts.js";
import {ZabbixQueryTemplatesRequest} from "../datasources/zabbix-templates.js";
import {ParsedArgs} from "../datasources/zabbix-request.js";

export class RegressionTestExecutor {
    public static async runAllRegressionTests(hostName: string, groupName: string, zabbixAuthToken?: string, cookie?: string): Promise<SmoketestResponse> {
        const steps: SmoketestStep[] = [];
        let success = true;

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
            const regTemplateName = "REG_TEMP_" + Math.random().toString(36).substring(7);
            const regGroupName = "Templates/Roadwork/Devices";
            const hostGroupName = "Roadwork/Devices";
            
            const tempResult = await TemplateImporter.importTemplates([{
                host: regTemplateName,
                name: "Regression Test Template",
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
            const httpTempName = "REG_HTTP_" + Math.random().toString(36).substring(7);
            const httpTempResult = await TemplateImporter.importTemplates([{
                host: httpTempName,
                name: "Regression HTTP Template",
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
            const macroTemplateName = "REG_MACRO_TEMP_" + Math.random().toString(36).substring(7);
            const macroHostName = "REG_MACRO_HOST_" + Math.random().toString(36).substring(7);

            const macroTempResult = await TemplateImporter.importTemplates([{
                host: macroTemplateName,
                name: "Regression Macro Template",
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
            await TemplateDeleter.deleteTemplates(null, regTemplateName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, httpTempName, zabbixAuthToken, cookie);
            await TemplateDeleter.deleteTemplates(null, macroTemplateName, zabbixAuthToken, cookie);
            // We don't delete the group here as it might be shared or used by other tests in this run

        } catch (error: any) {
            success = false;
            steps.push({
                name: "Execution Error",
                success: false,
                message: error.message || String(error)
            });
        }

        return {
            success,
            message: success ? "Regression tests passed successfully" : "Regression tests failed",
            steps
        };
    }
}
