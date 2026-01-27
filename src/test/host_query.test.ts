
import {createResolvers} from "../api/resolvers.js";
import {zabbixAPI, ZABBIX_EDGE_DEVICE_BASE_GROUP} from "../datasources/zabbix-api.js";
import {QueryAllHostsArgs, QueryAllDevicesArgs, QueryAllHostGroupsArgs} from "../schema/generated/graphql.js";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn(),
        baseURL: "http://mock-zabbix",
        getLocations: jest.fn()
    },
    ZABBIX_EDGE_DEVICE_BASE_GROUP: "Roadwork"
}));

describe("Host and HostGroup Resolvers", () => {
    let resolvers: any;

    beforeEach(() => {
        jest.clearAllMocks();
        resolvers = createResolvers();
    });

    test("allHosts query", async () => {
        const mockHosts = [{ hostid: "1", host: "Host 1" }];
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockHosts);

        const args: QueryAllHostsArgs = { name_pattern: "Test" };
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };

        const result = await resolvers.Query.allHosts(null, args, context);

        expect(result).toEqual(mockHosts);
        expect(zabbixAPI.post).toHaveBeenCalledWith("host.get.with_items", expect.objectContaining({
            body: expect.objectContaining({
                method: "host.get",
                params: expect.objectContaining({
                    search: { name: "Test" },
                    tags: expect.arrayContaining([{
                        tag: "hostType",
                        operator: 1,
                        value: ZABBIX_EDGE_DEVICE_BASE_GROUP
                    }])
                })
            })
        }));
    });

    test("allDevices query", async () => {
        const mockDevices = [{ hostid: "2", host: "Device 1" }];
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockDevices);

        const args: QueryAllDevicesArgs = { hostids: 2 };
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };

        const result = await resolvers.Query.allDevices(null, args, context);

        expect(result).toEqual(mockDevices);
        expect(zabbixAPI.post).toHaveBeenCalledWith("host.get.with_items", expect.objectContaining({
            body: expect.objectContaining({
                method: "host.get",
                params: expect.objectContaining({
                    hostids: 2
                })
            })
        }));
    });

    test("allHostGroups query", async () => {
        const mockGroups = [{ groupid: "10", name: ZABBIX_EDGE_DEVICE_BASE_GROUP + "/Group 1" }];
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockGroups);

        const args: QueryAllHostGroupsArgs = { search_name: "Group 1" };
        const context = { 
            zabbixAuthToken: "test-token"
        };

        const result = await resolvers.Query.allHostGroups(null, args, context);

        expect(result).toEqual(mockGroups);
        expect(zabbixAPI.post).toHaveBeenCalledWith("hostgroup.get", expect.objectContaining({
            body: expect.objectContaining({
                params: expect.objectContaining({
                    search: { name: ["Group 1"] }
                })
            })
        }));
    });

    test("locations query", async () => {
        const mockLocations = [{ name: "Loc 1", latitude: 1.0, longitude: 2.0 }];
        (zabbixAPI.getLocations as jest.Mock).mockResolvedValueOnce(mockLocations);

        const args = { name_pattern: "Loc" };
        const context = { 
            zabbixAuthToken: "test-token",
            dataSources: { zabbixAPI: zabbixAPI }
        };

        const result = await resolvers.Query.locations(null, args, context);

        expect(result).toEqual(mockLocations);
        expect(zabbixAPI.getLocations).toHaveBeenCalled();
    });
});
