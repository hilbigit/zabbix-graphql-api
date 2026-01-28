import {createResolvers} from "../api/resolvers.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn(),
        baseURL: "http://mock-zabbix"
    }
}));

// Mocking Config
jest.mock("../common_utils.js", () => ({
    Config: {
        ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX: "CustomPerms"
    }
}));

describe("User Rights and Permissions Resolvers", () => {
    let resolvers: any;

    beforeEach(() => {
        jest.clearAllMocks();
        resolvers = createResolvers();
    });

    test("exportUserRights query", async () => {
        // Mocks for exportUserRights
        (zabbixAPI.post as jest.Mock).mockImplementation((path: string) => {
            if (path === "templategroup.get") return Promise.resolve([]);
            if (path === "hostgroup.get") return Promise.resolve([]);
            if (path === "usergroup.get.withuuids") return Promise.resolve([{ usrgrpid: "1", name: "UserGroup1", hostgroup_rights: [], templategroup_rights: [] }]);
            if (path === "module.get") return Promise.resolve([{ moduleid: "10", id: "mod1" }]);
            if (path === "role.get") return Promise.resolve([{ roleid: "2", name: "UserRole1" }]);
            return Promise.resolve([]);
        });

        const args = { name_pattern: "User" };
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Query.exportUserRights(null, args, context);

        expect(result.userGroups).toBeDefined();
        expect(result.userRoles).toBeDefined();
        expect(zabbixAPI.post).toHaveBeenCalledWith("usergroup.get.withuuids", expect.anything());
        expect(zabbixAPI.post).toHaveBeenCalledWith("module.get", expect.anything());
        expect(zabbixAPI.post).toHaveBeenCalledWith("role.get", expect.anything());
    });

    test("userPermissions query", async () => {
        // Mock for userPermissions
        (zabbixAPI.post as jest.Mock).mockImplementation((path: string) => {
            if (path === "usergroup.get.permissions") return Promise.resolve([
                {
                    usrgrpid: "1",
                    name: "Group 1",
                    templategroup_rights: [{ id: "1001", permission: "3" }]
                }
            ]);
            if (path === "templategroup.get.permissions") return Promise.resolve([
                { groupid: "1001", name: "CustomPerms/Hostgroup/1001" }
            ]);
            return Promise.resolve([]);
        });

        const args = { objectNames: ["Hostgroup/1001"] };
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Query.userPermissions(null, args, context);

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);
        expect(result[0].objectName).toBe("Hostgroup/1001");
        expect(result[0].permission).toBe("3"); // Zabbix value "3" (READ_WRITE)
    });

    test("hasPermissions query", async () => {
        // Mock for hasPermissions
        (zabbixAPI.post as jest.Mock).mockImplementation((path: string) => {
            if (path === "usergroup.get.permissions") return Promise.resolve([
                {
                    usrgrpid: "1",
                    templategroup_rights: [{ id: "1002", permission: "3" }]
                }
            ]);
            if (path === "templategroup.get.permissions") return Promise.resolve([
                { groupid: "1002", name: "CustomPerms/Hostgroup/1002" }
            ]);
            return Promise.resolve([]);
        });

        const args = { permissions: [{ objectName: "Hostgroup/1002", permission: "READ" }] };
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Query.hasPermissions(null, args, context);

        expect(result).toBe(true);
    });

    test("importUserRights mutation", async () => {
        // Mocks for importUserRights
        (zabbixAPI.post as jest.Mock).mockImplementation((path: string) => {
            if (path === "module.get") return Promise.resolve([{ moduleid: "10", id: "mod1" }]);
            if (path === "role.get") return Promise.resolve([{ roleid: "2", name: "NewRole" }]);
            if (path === "role.update") return Promise.resolve({ roleids: ["2"] });
            if (path === "templategroup.get") return Promise.resolve([{ groupid: "101", name: "Group1", uuid: "uuid1" }]);
            if (path === "hostgroup.get") return Promise.resolve([{ groupid: "201", name: "HostGroup1", uuid: "uuid2" }]);
            if (path === "usergroup.get") return Promise.resolve([{ usrgrpid: "1", name: "NewGroup" }]);
            if (path === "usergroup.update") return Promise.resolve({ usrgrpids: ["1"] });
            if (path === "hostgroup.propagate") return Promise.resolve(true);
            return Promise.resolve([]);
        });

        const args = {
            input: {
                userRoles: [{ name: "NewRole", type: 1 }],
                userGroups: [{ name: "NewGroup" }]
            },
            dryRun: false
        };
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Mutation.importUserRights(null, args, context);

        expect(result.userRoles).toHaveLength(1);
        expect(result.userGroups).toHaveLength(1);
    });
});
