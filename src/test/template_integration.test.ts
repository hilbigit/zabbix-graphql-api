import { ApolloServer } from '@apollo/server';
import { schema_loader } from '../api/schema.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { zabbixAPI } from '../datasources/zabbix-api.js';

// Mocking ZabbixAPI.post
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        post: jest.fn(),
        executeRequest: jest.fn(),
        baseURL: 'http://localhost/zabbix'
    }
}));

describe("Template Integration Tests", () => {
    let server: ApolloServer;

    beforeAll(async () => {
        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });
    });

    test("Import templates using sample query and variables", async () => {
        const sampleFile = readFileSync(join(process.cwd(), 'docs', 'sample_import_templates_mutation.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        
        // Extract mutation and variables from the doc file
        const mutationMatch = sampleFile.match(/```graphql\n([\s\S]*?)\n```/);
        const variablesMatch = sampleFile.match(/```json\n([\s\S]*?)\n```/);
        
        const mutation = mutationMatch![1];
        const variables = JSON.parse(variablesMatch![1]);

        // Mock Zabbix API calls
        // 1. Group lookup
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: "Templates/Roadwork/Devices" }]);
        // 2. Linked template lookup
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "401", host: "ROADWORK_DEVICE" }]);
        // 3. Template creation
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["501"] });
        // 4. Item creation (location)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ itemids: ["601"] });
        // 5. Item creation (MQTT_LOCATION)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ itemids: ["602"] });

        const response = await server.executeOperation({
            query: mutation,
            variables: variables,
        }, {
            contextValue: {
                zabbixAuthToken: 'test-token'
            }
        });

        expect(response.body.kind).toBe('single');
        // @ts-ignore
        const result = response.body.singleResult;
        expect(result.errors).toBeUndefined();
        expect(result.data.importTemplates).toHaveLength(1);
        expect(result.data.importTemplates[0].host).toBe("BT_DEVICE_TRACKER");
        expect(result.data.importTemplates[0].templateid).toBe("501");
    });

    test("Import and Export templates comparison", async () => {
        // 1. Import
        const importSample = readFileSync(join(process.cwd(), 'docs', 'sample_import_templates_mutation.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        const importMutation = importSample.match(/```graphql\n([\s\S]*?)\n```/)![1];
        const importVariables = JSON.parse(importSample.match(/```json\n([\s\S]*?)\n```/)![1]);

        // Mock for import
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: "Templates/Roadwork/Devices" }]);
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "401", host: "ROADWORK_DEVICE" }]);
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["501"] });
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ itemids: ["601"] });
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ itemids: ["602"] });

        await server.executeOperation({
            query: importMutation,
            variables: importVariables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token' }
        });

        // 2. Export (Query)
        const querySample = readFileSync(join(process.cwd(), 'docs', 'sample_templates_query.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        const query = querySample.match(/```graphql\n([\s\S]*?)\n```/)![1];
        const queryVariables = JSON.parse(querySample.match(/```json\n([\s\S]*?)\n```/)![1]);

        // Mock for query
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "501", host: "BT_DEVICE_TRACKER", name: "BT_DEVICE_TRACKER" }]);

        const queryResponse = await server.executeOperation({
            query: query,
            variables: queryVariables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token' }
        });

        expect(queryResponse.body.kind).toBe('single');
        // @ts-ignore
        const queryResult = queryResponse.body.singleResult;
        expect(queryResult.errors).toBeUndefined();
        expect(queryResult.data.templates).toHaveLength(1);
        expect(queryResult.data.templates[0].name).toBe(importVariables.templates[0].name);
        expect(queryResult.data.templates[0].templateid).toBe("501");

        // 3. Delete
        const deleteMutation = `
            mutation DeleteTemplates($templateids: [Int!], $name_pattern: String) {
                deleteTemplates(templateids: $templateids, name_pattern: $name_pattern) {
                    id
                    message
                }
            }
        `;
        // Mock for query (to find ID for name_pattern deletion)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "501", host: "BT_DEVICE_TRACKER" }]);
        // Mock for delete
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["501"] });

        const deleteResponse = await server.executeOperation({
            query: deleteMutation,
            variables: { name_pattern: "BT_DEVICE_TRACKER" },
        }, {
            contextValue: { zabbixAuthToken: 'test-token' }
        });

        expect(deleteResponse.body.kind).toBe('single');
        // @ts-ignore
        const deleteResult = deleteResponse.body.singleResult;
        expect(deleteResult.errors).toBeUndefined();
        expect(deleteResult.data.deleteTemplates).toHaveLength(1);
        expect(deleteResult.data.deleteTemplates[0].message).toContain("deleted successfully");
    });

    test("Import and Export template groups comparison", async () => {
        // 1. Import
        const importSample = readFileSync(join(process.cwd(), 'docs', 'sample_import_template_groups_mutation.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        const importMutation = importSample.match(/```graphql\n([\s\S]*?)\n```/)![1];
        const importVariables = JSON.parse(importSample.match(/```json\n([\s\S]*?)\n```/)![1]);

        // Mock for import (8 groups in sample)
        for (const group of importVariables.templateGroups) {
            // Mock lookup (not found)
            (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);
            // Mock creation
            const mockGroupId = Math.floor(Math.random() * 1000).toString();
            (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ groupids: [mockGroupId] });
        }

        const importResponse = await server.executeOperation({
            query: importMutation,
            variables: importVariables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token' }
        });

        expect(importResponse.body.kind).toBe('single');
        // @ts-ignore
        const importResult = importResponse.body.singleResult;
        expect(importResult.errors).toBeUndefined();
        expect(importResult.data.importTemplateGroups).toHaveLength(importVariables.templateGroups.length);

        // 2. Export (Query)
        const querySample = readFileSync(join(process.cwd(), 'docs', 'sample_all_template_groups_query.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        const query = querySample.match(/```graphql\n([\s\S]*?)\n```/)![1];
        const queryVariables = JSON.parse(querySample.match(/```json\n([\s\S]*?)\n```/)![1]);

        // Mock for query
        const mockGroupsResponse = importVariables.templateGroups.map((g: any, index: number) => ({
            groupid: (index + 1000).toString(),
            name: g.groupName
        }));
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockGroupsResponse);

        const queryResponse = await server.executeOperation({
            query: query,
            variables: queryVariables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token' }
        });

        expect(queryResponse.body.kind).toBe('single');
        // @ts-ignore
        const queryResult = queryResponse.body.singleResult;
        expect(queryResult.errors).toBeUndefined();
        expect(queryResult.data.allTemplateGroups).toHaveLength(importVariables.templateGroups.length);
        
        // Verify names match
        const importedNames = importVariables.templateGroups.map((g: any) => g.groupName).sort();
        const exportedNames = queryResult.data.allTemplateGroups.map((g: any) => g.name).sort();
        expect(exportedNames).toEqual(importedNames);

        // 3. Delete Template Groups
        const groupidsToDelete = queryResult.data.allTemplateGroups.map((g: any) => parseInt(g.groupid));
        // Mock for query (for name_pattern)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(queryResult.data.allTemplateGroups.map((g: any) => ({ groupid: g.groupid, name: g.name })));
        // Mock for delete
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ groupids: groupidsToDelete.map((id: number) => id.toString()) });

        const deleteMutation = `
            mutation DeleteTemplateGroups($groupids: [Int!], $name_pattern: String) {
                deleteTemplateGroups(groupids: $groupids, name_pattern: $name_pattern) {
                    id
                    message
                    error {
                        message
                    }
                }
            }
        `;

        const deleteResponse = await server.executeOperation({
            query: deleteMutation,
            variables: { name_pattern: "Templates/Roadwork/%" },
        }, {
            contextValue: { zabbixAuthToken: 'test-token' }
        });

        expect(deleteResponse.body.kind).toBe('single');
        // @ts-ignore
        const deleteResult = deleteResponse.body.singleResult;
        expect(deleteResult.errors).toBeUndefined();
        expect(deleteResult.data.deleteTemplateGroups).toHaveLength(groupidsToDelete.length);
        expect(deleteResult.data.deleteTemplateGroups[0].message).toContain("deleted successfully");
    });
});
