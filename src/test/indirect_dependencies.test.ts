import {createResolvers} from "../api/resolvers.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {QueryAllDevicesArgs} from "../schema/generated/graphql.js";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn(),
        baseURL: "http://mock-zabbix",
    }
}));

// Mocking Config
jest.mock("../common_utils.js", () => ({
    Config: {
        HOST_TYPE_FILTER_DEFAULT: null,
        HOST_GROUP_FILTER_DEFAULT: null
    }
}));

describe("Indirect Dependencies Optimization", () => {
    let resolvers: any;

    beforeEach(() => {
        jest.clearAllMocks();
        resolvers = createResolvers();
    });

    test("allDevices optimization - state implies items", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args: QueryAllDevicesArgs = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'hostid' } },
                        { kind: 'Field', name: { value: 'state' } }
                    ]
                }
            }]
        };

        await resolvers.Query.allDevices(null, args, context, info);

        const callParams = (zabbixAPI.post as jest.Mock).mock.calls[0][1].body.params;
        expect(callParams.output).toContain("items");
        expect(callParams.selectItems).toBeDefined();
    });

    test("allHosts optimization - inventory implies selectInventory", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'inventory' } }
                    ]
                }
            }]
        };

        await resolvers.Query.allHosts(null, args, context, info);

        const callParams = (zabbixAPI.post as jest.Mock).mock.calls[0][1].body.params;
        // Zabbix inventory data is requested via selectInventory, and it maps to GraphQL 'inventory' field
        expect(callParams.selectInventory).toBeDefined();
    });

    test("allHosts optimization - state fragment implies items", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { 
                            kind: 'InlineFragment', 
                            typeCondition: { kind: 'NamedType', name: { value: 'Device' } },
                            selectionSet: {
                                selections: [
                                    { kind: 'Field', name: { value: 'state' } }
                                ]
                            }
                        }
                    ]
                }
            }]
        };

        await resolvers.Query.allHosts(null, args, context, info);

        const callParams = (zabbixAPI.post as jest.Mock).mock.calls[0][1].body.params;
        expect(callParams.output).toContain("items");
        expect(callParams.selectItems).toBeDefined();
    });
});
