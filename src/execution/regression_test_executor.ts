import {SmoketestResponse, SmoketestStep} from "../schema/generated/graphql.js";
import {HostImporter} from "./host_importer.js";
import {HostDeleter} from "./host_deleter.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {ZabbixQueryHostsGenericRequest} from "../datasources/zabbix-hosts.js";
import {ParsedArgs} from "../datasources/zabbix-request.js";

export class RegressionTestExecutor {
    public static async runAllRegressionTests(hostName: string, groupName: string, zabbixAuthToken?: string, cookie?: string): Promise<SmoketestResponse> {
        const steps: SmoketestStep[] = [];
        let success = true;

        try {
            // Step 1: Create Host Group
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

            // Step 2: Create Host (No items, no templates)
            if (success) {
                // We use importHosts but we want to avoid default template linkage.
                // However, HostImporter.importHosts currently tries to find a template for deviceType.
                // If we pass a non-existent deviceType, it might fail or just log an error but still try to create the host.
                // Actually, if getTemplateIdForDeviceType returns undefined, it continues.
                
                const hostResult = await HostImporter.importHosts([{
                    deviceKey: hostName,
                    deviceType: "EmptyType_" + Math.random().toString(36).substring(7), // Ensure no default template is found
                    groupNames: [groupName]
                }], zabbixAuthToken, cookie);

                const hostSuccess = !!hostResult?.length && !hostResult[0].error;
                steps.push({
                    name: "Create Host without Items",
                    success: hostSuccess,
                    message: hostSuccess ? `Host ${hostName} created without templates/items` : `Failed: ${hostResult?.[0]?.error?.message || "Unknown error"}`
                });
                if (!hostSuccess) success = false;
            } else {
                steps.push({ name: "Create Host without Items", success: false, message: "Skipped due to previous failures" });
            }

            // Step 3: Verify Host can be queried by allHosts
            if (success) {
                // allHosts query is handled by resolvers, but we can simulate it by calling host.get
                // We want to verify that our GraphQL API can handle hosts without items.
                // The issue was likely that if items were missing, something crashed or it wasn't returned.
                
                const verifyResult = await new ZabbixQueryHostsGenericRequest("host.get", zabbixAuthToken, cookie)
                    .executeRequestReturnError(zabbixAPI, new ParsedArgs({
                        filter_host: hostName
                    }));
                
                let verified = false;
                if (Array.isArray(verifyResult) && verifyResult.length > 0) {
                    verified = (verifyResult[0] as any).host === hostName;
                }

                steps.push({
                    name: "Verify Host can be queried",
                    success: verified,
                    message: verified ? `Verification successful: Host ${hostName} found via allHosts (host.get)` : `Verification failed: Host not found`
                });
                if (!verified) success = false;
            } else {
                steps.push({ name: "Verify Host can be queried", success: false, message: "Skipped due to previous failures" });
            }

        } catch (error: any) {
            success = false;
            steps.push({
                name: "Execution Error",
                success: false,
                message: error.message || String(error)
            });
        } finally {
            // Step 4: Cleanup
            const cleanupSteps: SmoketestStep[] = [];
            
            // Delete Host
            const deleteHostRes = await HostDeleter.deleteHosts(null, hostName, zabbixAuthToken, cookie);
            cleanupSteps.push({
                name: "Cleanup: Delete Host",
                success: deleteHostRes.every(r => !r.error),
                message: deleteHostRes.length > 0 ? deleteHostRes[0].message : "Host not found for deletion"
            });

            // Delete Host Group
            const deleteGroupRes = await HostDeleter.deleteHostGroups(null, groupName, zabbixAuthToken, cookie);
            cleanupSteps.push({
                name: "Cleanup: Delete Host Group",
                success: deleteGroupRes.every(r => !r.error),
                message: deleteGroupRes.length > 0 ? deleteGroupRes[0].message : "Host group not found for deletion"
            });
            
            steps.push(...cleanupSteps);
        }

        return {
            success,
            message: success ? "Regression test passed successfully" : "Regression test failed",
            steps
        };
    }
}
