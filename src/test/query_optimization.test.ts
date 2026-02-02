import {createResolvers} from "../api/resolvers.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {QueryAllHostsArgs, QueryTemplatesArgs} from "../schema/generated/graphql.js";

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

describe("Query Optimization", () => {
    let resolvers: any;

    beforeEach(() => {
        jest.clearAllMocks();
        resolvers = createResolvers();
    });

    test("allHosts optimization - reduce output and skip selectTags/selectItems", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args: QueryAllHostsArgs = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'hostid' } },
                        { kind: 'Field', name: { value: 'name' } }
                    ]
                }
            }]
        };

        await resolvers.Query.allHosts(null, args, context, info);

        expect(zabbixAPI.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.objectContaining({
                params: expect.objectContaining({
                    output: ["hostid", "name"]
                })
            })
        }));

        const callParams = (zabbixAPI.post as jest.Mock).mock.calls[0][1].body.params;
        expect(callParams.selectTags).toBeUndefined();
        expect(callParams.selectItems).toBeUndefined();
        expect(callParams.selectParentTemplates).toBeUndefined();

        // Verify no follow-up item.get call
        const itemGetCall = (zabbixAPI.post as jest.Mock).mock.calls.find(call => call[1].body.method === "item.get");
        expect(itemGetCall).toBeUndefined();
    });

    test("allHosts optimization - keep selectTags when requested", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args: QueryAllHostsArgs = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'hostid' } },
                        { kind: 'Field', name: { value: 'tags' } }
                    ]
                }
            }]
        };

        await resolvers.Query.allHosts(null, args, context, info);

        expect(zabbixAPI.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.objectContaining({
                params: expect.objectContaining({
                    output: ["hostid"],
                    selectTags: expect.any(Array)
                })
            })
        }));
    });

    test("templates optimization - reduce output and skip selectItems", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args: QueryTemplatesArgs = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'name' } }
                    ]
                }
            }]
        };

        await resolvers.Query.templates(null, args, context, info);

        expect(zabbixAPI.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.objectContaining({
                params: expect.objectContaining({
                    output: ["name"]
                })
            })
        }));

        const callParams = (zabbixAPI.post as jest.Mock).mock.calls[0][1].body.params;
        expect(callParams.selectItems).toBeUndefined();
    });

    test("allHosts optimization - indirect dependency via nested state field", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args: QueryAllHostsArgs = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'state' }, selectionSet: {
                            selections: [
                                { kind: 'Field', name: { value: 'operational' }, selectionSet: {
                                    selections: [
                                        { kind: 'Field', name: { value: 'temperature' } }
                                    ]
                                } }
                            ]
                        } }
                    ]
                }
            }]
        };

        await resolvers.Query.allHosts(null, args, context, info);

        const callParams = (zabbixAPI.post as jest.Mock).mock.calls[0][1].body.params;
        expect(callParams.selectItems).toBeDefined();
        expect(Array.isArray(callParams.output)).toBe(true);
        expect(callParams.output).toContain("items");
    });

    test("allHosts optimization - keep selectTags when deviceType requested", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args: QueryAllHostsArgs = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'hostid' } },
                        { kind: 'Field', name: { value: 'deviceType' } }
                    ]
                }
            }]
        };

        await resolvers.Query.allHosts(null, args, context, info);

        expect(zabbixAPI.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.objectContaining({
                params: expect.objectContaining({
                    output: ["hostid"],
                    selectTags: expect.any(Array)
                })
            })
        }));
    });

    test("allDevices optimization - skip items when not requested", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);

        const args: any = {};
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };
        const info = {
            fieldNodes: [{
                selectionSet: {
                    selections: [
                        { kind: 'Field', name: { value: 'hostid' } },
                        { kind: 'Field', name: { value: 'name' } }
                    ]
                }
            }]
        };

        await resolvers.Query.allDevices(null, args, context, info);

        const callParams = (zabbixAPI.post as jest.Mock).mock.calls[0][1].body.params;
        expect(callParams.selectItems).toBeUndefined();
        expect(callParams.output).not.toContain("items");
    });
});
