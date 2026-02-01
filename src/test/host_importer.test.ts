import {HostImporter} from "../execution/host_importer.js";
import {ZABBIX_EDGE_DEVICE_BASE_GROUP, zabbixAPI} from "../datasources/zabbix-api.js";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn(),
        requestByPath: jest.fn()
    },
    ZABBIX_EDGE_DEVICE_BASE_GROUP: "Roadwork"
}));

// Mock ZabbixRequestWithPermissions to skip permission checks
jest.mock("../datasources/zabbix-permissions.js", () => ({
    ZabbixRequestWithPermissions: class {
        constructor(public path: string) {}
        async prepare() {
            return undefined;
        }
        async executeRequestReturnError(api: any, args: any) {
            // @ts-ignore
            return api.post(this.path, { body: { method: this.path, params: args?.zabbix_params } });
        }
        async executeRequestThrowError(api: any, args: any) {
            return this.executeRequestReturnError(api, args);
        }
    },
    ZabbixPermissionsHelper: {
        hasUserPermissions: jest.fn().mockResolvedValue(true)
    }
}));

describe("HostImporter", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("importHostGroups - create new hierarchy", async () => {
        const hostGroups = [{ groupName: "Parent/Child" }];
        
        // Parent lookup (from importHostGroups loop)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]); // findHostGroupIdsByName (Parent)
        // Parent creation
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ groupids: ["101"] }); // hostgroup.create (Parent)

        // Parent/Child lookup
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]); // findHostGroupIdsByName (Parent/Child)
        // Parent/Child creation
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ groupids: ["102"] }); // hostgroup.create (Parent/Child)

        const result = await HostImporter.importHostGroups(hostGroups, "token");

        expect(result).toHaveLength(2);
        expect(result!.find(r => r.groupName === "Parent")?.groupid).toBe(101);
        expect(result!.find(r => r.groupName === "Parent/Child")?.groupid).toBe(102);
    });

    test("importHosts - basic host", async () => {
        const hosts = [{
            deviceKey: "Device1",
            deviceType: "Type1",
            groupNames: ["Group1"]
        }];

        // Mocking group lookup for Base group and Group1
        // findHostGroupIdsByName for [Base, Group1]
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: ZABBIX_EDGE_DEVICE_BASE_GROUP }]); // Base
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "202", name: ZABBIX_EDGE_DEVICE_BASE_GROUP + "/Group1" }]); // Group1
        
        // Mocking template lookup for deviceType
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "301" }]);

        // Mocking host.create via post (called by ZabbixCreateHostRequest)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ hostids: ["401"] });

        const result = await HostImporter.importHosts(hosts, "token");

        expect(result).toHaveLength(1);
        expect(result![0].hostid).toBe("401");
    });

    test("importHosts - with macros", async () => {
        const hosts = [{
            deviceKey: "DeviceMacro",
            deviceType: "Type1",
            groupNames: ["Group1"],
            macros: [
                { macro: "{$LAT}", value: "52.52" },
                { macro: "{$LON}", value: "13.41" }
            ]
        }];

        // Mocking group lookup
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: ZABBIX_EDGE_DEVICE_BASE_GROUP }]);
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "202", name: ZABBIX_EDGE_DEVICE_BASE_GROUP + "/Group1" }]);
        
        // Mocking template lookup
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "301" }]);

        // Mocking host.create
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ hostids: ["402"] });

        const result = await HostImporter.importHosts(hosts, "token");

        expect(result).toHaveLength(1);
        expect(result![0].hostid).toBe("402");

        // Verify that host.create was called with macros
        const hostCreateCall = (zabbixAPI.post as jest.Mock).mock.calls.find(call => call[1].body.method === "host.create");
        expect(hostCreateCall[1].body.params.macros).toEqual([
            { macro: "{$LAT}", value: "52.52" },
            { macro: "{$LON}", value: "13.41" }
        ]);
    });
});
