import {createResolvers} from "../api/resolvers.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn()
    }
}));

// Mocking Config
jest.mock("../common_utils.js", () => ({
    Config: {
        API_VERSION: "1.2.3"
    }
}));

describe("Miscellaneous Resolvers", () => {
    let resolvers: any;

    beforeEach(() => {
        jest.clearAllMocks();
        resolvers = createResolvers();
    });

    test("apiVersion query", async () => {
        const result = await resolvers.Query.apiVersion();
        expect(result).toBe("1.2.3");
    });

    test("login query", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce("mock-token");
        const result = await resolvers.Query.login(null, { username: "admin", password: "password" });
        expect(result).toBe("mock-token");
        expect(zabbixAPI.post).toHaveBeenCalledWith("user.login", expect.objectContaining({
            body: expect.objectContaining({
                params: { username: "admin", password: "password" }
            })
        }));
    });

    test("logout query", async () => {
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(true);
        const result = await resolvers.Query.logout(null, null, { zabbixAuthToken: "token" });
        expect(result).toBe(true);
        expect(zabbixAPI.post).toHaveBeenCalledWith("user.logout", expect.anything());
    });
});
