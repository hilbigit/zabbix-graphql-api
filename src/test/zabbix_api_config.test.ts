// Import after mocking Config
import {ZABBIX_EDGE_DEVICE_BASE_GROUP, zabbixAPI, zabbixSuperAuthToken} from "../datasources/zabbix-api.js";

// Mocking Config
jest.mock("../common_utils.js", () => ({
    Config: {
        ZABBIX_EDGE_DEVICE_BASE_GROUP: "CustomEdgeGroup",
        ZABBIX_AUTH_TOKEN: "super-secret-token",
        ZABBIX_BASE_URL: "http://custom-zabbix"
    }
}));

describe("Zabbix API Config Mocking", () => {
    test("constants are derived from Config", () => {
        expect(ZABBIX_EDGE_DEVICE_BASE_GROUP).toBe("CustomEdgeGroup");
        expect(zabbixSuperAuthToken).toBe("super-secret-token");
        expect(zabbixAPI.baseURL).toBe("http://custom-zabbix");
    });
});
