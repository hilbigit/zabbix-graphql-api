import {ApolloServer} from '@apollo/server';
import {schema_loader} from '../api/schema.js';
import {readFileSync} from 'fs';
import {join} from 'path';
import {zabbixAPI} from '../datasources/zabbix-api.js';

// Mocking ZabbixAPI.post
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        post: jest.fn(),
        getVersion: jest.fn().mockResolvedValue("7.0.0"),
        executeRequest: jest.fn(),
        baseURL: 'http://localhost/zabbix',
        requestByPath: jest.fn()
    }
}));

describe("storeGroupValue Integration Tests", () => {
    let server: ApolloServer;

    beforeAll(async () => {
        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });
    });

    test("Store group value using sample mutation", async () => {
        const queryFile = readFileSync(join(process.cwd(), 'docs', 'queries', 'sample_store_group_value_mutation.graphql'), 'utf-8');
        
        const variables = {
            locator: {
                groupName: "Infrastructure/Configurations",
                valueType: "GlobalSettings",
                key: "api.config.json",
            },
            value: {
                maintenanceMode: false,
                logLevel: "DEBUG"
            }
        };

        // Mock Zabbix API sequence for storeGroupValue
        (zabbixAPI.post as jest.Mock)
            .mockResolvedValueOnce([{ groupid: "777", name: "Infrastructure/Configurations" }]) // group.get (GroupHelper)
            .mockResolvedValueOnce([]) // host.get (ZabbixQueryHostsMetaRequest)
            .mockResolvedValueOnce({ hostids: ["7777"] }) // host.create (ZabbixCreateHostRequest)
            .mockResolvedValueOnce([]) // item.get (ZabbixQueryItemRequest - check if exists)
            .mockResolvedValueOnce({ itemids: ["9999"] }) // item.create.storeiteminhistory
            .mockResolvedValueOnce([{ hostid: "7777" }]) // host.get (ZabbixForceCacheReloadRequest - find some host)
            .mockResolvedValueOnce([]) // script.get (force cache reload)
            .mockResolvedValueOnce({ scriptids: ["42"] }) // script.create
            .mockResolvedValueOnce({ response: "success", value: "OK" }) // script.execute
            .mockResolvedValueOnce({ response: "success", data: [{ itemid: "9999" }] }); // history.push.jsonobject

        const response = await server.executeOperation({
            query: queryFile,
            variables: variables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token', dataSources: { zabbixAPI: zabbixAPI } }
        });

        expect(zabbixAPI.post).toHaveBeenCalledWith(
            "host.create",
            expect.objectContaining({
                body: expect.objectContaining({
                    params: expect.objectContaining({
                        groups: expect.arrayContaining([
                            expect.objectContaining({ groupid: 777 })
                        ])
                    })
                })
            })
        );

        expect(response.body.kind).toBe('single');
        // @ts-ignore
        const result = response.body.singleResult;
        expect(result.errors).toBeUndefined();
        expect(result.data.storeGroupValue).toBeDefined();
        expect(result.data.storeGroupValue.itemid).toBe("9999");
        expect(result.data.storeGroupValue.error).toBeNull();
    });

    test("Retrieve group value using getGroupValue query", async () => {
        const query = `
            query GetValue($locator: GroupValueLocator!) {
                getGroupValue(locator: $locator)
            }
        `;
        
        const variables = {
            locator: {
                groupName: "Infrastructure/Configurations",
                valueType: "GlobalSettings",
                key: "api.config.json"
            }
        };

        (zabbixAPI.post as jest.Mock)
            .mockResolvedValueOnce([{ groupid: "777", name: "Infrastructure/Configurations" }]) // group.get
            .mockResolvedValueOnce([{ hostid: "7777" }]) // host.get
            .mockResolvedValueOnce([{ itemid: "9999" }]) // item.get
            .mockResolvedValueOnce([{ value: JSON.stringify({ maintenanceMode: false }) }]); // history.get

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
        expect(result.data.getGroupValue).toEqual({ maintenanceMode: false });
    });
});
