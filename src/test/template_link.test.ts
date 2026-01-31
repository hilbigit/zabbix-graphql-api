import {ApolloServer} from '@apollo/server';
import {schema_loader} from '../api/schema.js';
import {zabbixAPI} from '../datasources/zabbix-api.js';

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        post: jest.fn(),
        executeRequest: jest.fn(),
        baseURL: 'http://localhost/zabbix',
        requestByPath: jest.fn()
    },
    ZABBIX_EDGE_DEVICE_BASE_GROUP: "Roadwork"
}));

describe("Template Linking Tests", () => {
    let server: ApolloServer;

    beforeAll(async () => {
        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });
    });

    test("createHost with templateNames", async () => {
        const mutation = `
            mutation CreateHost($host: String!, $hostgroupids: [Int!]!, $templateNames: [String!]!) {
                createHost(host: $host, hostgroupids: $hostgroupids, templateNames: $templateNames) {
                    hostids
                }
            }
        `;
        const variables = {
            host: "TestHost",
            hostgroupids: [1],
            templateNames: ["Test Template"]
        };

        (zabbixAPI.post as jest.Mock)
            .mockResolvedValueOnce([{ templateid: "101", name: "Test Template" }]) // Template lookup
            .mockResolvedValueOnce({ hostids: ["201"] }); // Host creation

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
        expect(result.data.createHost.hostids).toContain(201);
    });

    test("importHosts with templateids and templateNames", async () => {
        const mutation = `
            mutation ImportHosts($hosts: [CreateHost!]!) {
                importHosts(hosts: $hosts) {
                    hostid
                }
            }
        `;
        const variables = {
            hosts: [{
                deviceKey: "TestDevice",
                deviceType: "TestType",
                groupNames: ["TestGroup"],
                templateids: [101],
                templateNames: ["Another Template"]
            }]
        };

        (zabbixAPI.post as jest.Mock)
            .mockResolvedValueOnce([{ groupid: "501", name: "Roadwork" }]) // Base group lookup
            .mockResolvedValueOnce([{ groupid: "502", name: "Roadwork/TestGroup" }]) // Specific group lookup
            .mockResolvedValueOnce([{ templateid: "102", name: "Another Template" }]) // Template lookup
            .mockResolvedValueOnce({ hostids: ["202"] }); // Host creation

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
        expect(result.data.importHosts[0].hostid).toBe("202");
    });
});
