import {ApolloServer} from '@apollo/server';
import {schema_loader} from '../api/schema.js';
import {readFileSync} from 'fs';
import {join} from 'path';
import {ZABBIX_EDGE_DEVICE_BASE_GROUP, zabbixAPI} from '../datasources/zabbix-api.js';

// Mocking ZabbixAPI.post
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        post: jest.fn(),
        executeRequest: jest.fn(),
        baseURL: 'http://localhost/zabbix',
        getLocations: jest.fn(),
        requestByPath: jest.fn()
    },
    ZABBIX_EDGE_DEVICE_BASE_GROUP: "Roadwork"
}));

describe("Host Integration Tests", () => {
    let server: ApolloServer;

    beforeAll(async () => {
        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });
    });

    test("Query allHosts using sample", async () => {
        const sampleFile = readFileSync(join(process.cwd(), 'docs', 'queries', 'sample_all_hosts_query.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        const mutationMatch = sampleFile.match(/```graphql\n([\s\S]*?)\n```/);
        const variablesMatch = sampleFile.match(/```json\n([\s\S]*?)\n```/);
        
        const query = mutationMatch![1];
        const variables = JSON.parse(variablesMatch![1]);

        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ hostid: "1", host: "BT_DEVICE_1", name: "BT_DEVICE_1" }]);

        const response = await server.executeOperation({
            query: query,
            variables: variables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token', dataSources: { zabbixAPI: zabbixAPI } }
        });

        expect(response.body.kind).toBe('single');
        // @ts-ignore
        const result = response.body.singleResult;
        expect(result.errors).toBeUndefined();
        expect(result.data.allHosts).toHaveLength(1);
    });

    test("Import hosts using sample", async () => {
        const sampleFile = readFileSync(join(process.cwd(), 'docs', 'queries', 'sample_import_hosts_mutation.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        const mutationMatch = sampleFile.match(/```graphql\n([\s\S]*?)\n```/);
        const variablesMatch = sampleFile.match(/```json\n([\s\S]*?)\n```/);
        
        const mutation = mutationMatch![1];
        const variables = JSON.parse(variablesMatch![1]);

        // Mocking for importHosts
        (zabbixAPI.post as jest.Mock)
            .mockResolvedValueOnce([{ groupid: "201", name: ZABBIX_EDGE_DEVICE_BASE_GROUP }]) // Base group
            .mockResolvedValueOnce([{ groupid: "202", name: ZABBIX_EDGE_DEVICE_BASE_GROUP + "/ConstructionSite/Test" }]) // Specific group
            .mockResolvedValueOnce([{ templateid: "301" }]) // Template lookup
            .mockResolvedValueOnce({ hostids: ["401"] }); // Host creation

        const response = await server.executeOperation({
            query: mutation,
            variables: variables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token', dataSources: { zabbixAPI: zabbixAPI } }
        });

        expect(response.body.kind).toBe('single');
        // @ts-ignore
        const result = response.body.singleResult;
        expect(result.errors).toBeUndefined();
        expect(result.data.importHosts).toHaveLength(1);
        expect(result.data.importHosts[0].hostid).toBe("401");
    });
});
