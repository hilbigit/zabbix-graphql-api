import {SmoketestResponse, SmoketestStep} from "../schema/generated/graphql.js";
import {TemplateImporter} from "./template_importer.js";
import {HostImporter} from "./host_importer.js";
import {HostDeleter} from "./host_deleter.js";
import {TemplateDeleter} from "./template_deleter.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {ZabbixQueryHostsGenericRequest} from "../datasources/zabbix-hosts.js";
import {ParsedArgs} from "../datasources/zabbix-request.js";

export class SmoketestExecutor {
    public static async runSmoketest(hostName: string, templateName: string, groupName: string, zabbixAuthToken?: string, cookie?: string): Promise<SmoketestResponse> {
        const steps: SmoketestStep[] = [];
        let success = true;

        try {
            // Step 0: Create Template Group
            const templateGroupResult = await TemplateImporter.importTemplateGroups([{
                groupName: groupName
            }], zabbixAuthToken, cookie);
            const templateGroupSuccess = !!templateGroupResult?.length && !templateGroupResult[0].error;
            steps.push({
                name: "Create Template Group",
                success: templateGroupSuccess,
                message: templateGroupSuccess ? `Template group ${groupName} created` : `Failed: ${templateGroupResult?.[0]?.error?.message || "Unknown error"}`
            });
            if (!templateGroupSuccess) success = false;

            // Step 1: Create Template
            if (success) {
                const templateResult = await TemplateImporter.importTemplates([{
                    host: templateName,
                    name: templateName,
                    groupNames: [groupName]
                }], zabbixAuthToken, cookie);
                
                const templateSuccess = !!templateResult?.length && !templateResult[0].error;
                steps.push({
                    name: "Create Template",
                    success: templateSuccess,
                    message: templateSuccess ? `Template ${templateName} created` : `Failed: ${templateResult?.[0]?.error?.message || "Unknown error"}`
                });
                if (!templateSuccess) success = false;
            } else {
                steps.push({ name: "Create Template", success: false, message: "Skipped due to previous failures" });
            }

            // Step 2: Create Host Group
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

            // Step 3: Create Host and Link to Template
            if (success) {
                const hostResult = await HostImporter.importHosts([{
                    deviceKey: hostName,
                    deviceType: "ZabbixHost",
                    groupNames: [groupName],
                    templateNames: [templateName]
                }], zabbixAuthToken, cookie);

                const hostSuccess = !!hostResult?.length && !hostResult[0].error && !!hostResult[0].hostid;
                steps.push({
                    name: "Create and Link Host",
                    success: hostSuccess,
                    message: hostSuccess ? `Host ${hostName} created and linked to ${templateName}` : `Failed: ${hostResult?.[0]?.error?.message || hostResult?.[0]?.message || "Unknown error"}`
                });
                if (!hostSuccess) success = false;
            } else {
                steps.push({ name: "Create and Link Host", success: false, message: "Skipped due to previous failures" });
            }

            // Step 4: Verify Host Linkage
            if (success) {
                const verifyResult = await new ZabbixQueryHostsGenericRequest("host.get", zabbixAuthToken, cookie)
                    .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                        filter_host: hostName,
                        selectParentTemplates: ["name"]
                    }));
                
                let verified = false;
                if (Array.isArray(verifyResult) && verifyResult.length > 0) {
                    const host = verifyResult[0] as any;
                    const linkedTemplates = host.parentTemplates || [];
                    verified = linkedTemplates.some((t: any) => t.name === templateName);
                }

                steps.push({
                    name: "Verify Host Linkage",
                    success: verified,
                    message: verified ? `Verification successful: Host ${hostName} is linked to ${templateName}` : `Verification failed: Host or linkage not found`
                });
                if (!verified) success = false;
            } else {
                steps.push({ name: "Verify Host Linkage", success: false, message: "Skipped due to previous failures" });
            }

        } catch (error: any) {
            success = false;
            steps.push({
                name: "Execution Error",
                success: false,
                message: error.message || String(error)
            });
        } finally {
            // Step 5: Cleanup
            const cleanupSteps: SmoketestStep[] = [];
            
            // Delete Host
            const deleteHostRes = await HostDeleter.deleteHosts(null, hostName, zabbixAuthToken, cookie);
            cleanupSteps.push({
                name: "Cleanup: Delete Host",
                success: deleteHostRes.every(r => !r.error),
                message: deleteHostRes.length > 0 ? deleteHostRes[0].message : "Host not found for deletion"
            });

            // Delete Template
            const deleteTemplateRes = await TemplateDeleter.deleteTemplates(null, templateName, zabbixAuthToken, cookie);
            cleanupSteps.push({
                name: "Cleanup: Delete Template",
                success: deleteTemplateRes.every(r => !r.error),
                message: deleteTemplateRes.length > 0 ? deleteTemplateRes[0].message : "Template not found for deletion"
            });

            // Delete Host Group
            const deleteGroupRes = await HostDeleter.deleteHostGroups(null, groupName, zabbixAuthToken, cookie);
            cleanupSteps.push({
                name: "Cleanup: Delete Host Group",
                success: deleteGroupRes.every(r => !r.error),
                message: deleteGroupRes.length > 0 ? deleteGroupRes[0].message : "Host group not found for deletion"
            });
            
            // We also need to delete the template group if it's different or just try to delete it
            // In our setup, TemplateImporter creates it if it doesn't exist.
            const deleteTemplateGroupRes = await TemplateDeleter.deleteTemplateGroups(null, groupName, zabbixAuthToken, cookie);
             cleanupSteps.push({
                name: "Cleanup: Delete Template Group",
                success: deleteTemplateGroupRes.every(r => !r.error),
                message: deleteTemplateGroupRes.length > 0 ? deleteTemplateGroupRes[0].message : "Template group not found for deletion"
            });

            steps.push(...cleanupSteps);
        }

        return {
            success,
            message: success ? "Smoketest passed successfully" : "Smoketest failed",
            steps
        };
    }
}
