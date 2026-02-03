import {ZabbixHistoryPushParams, ZabbixHistoryPushRequest} from "../datasources/zabbix-history.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {GraphQLError} from "graphql";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        post: jest.fn(),
    }
}));

describe("ZabbixHistoryPushRequest", () => {
    let request: ZabbixHistoryPushRequest;

    beforeEach(() => {
        jest.clearAllMocks();
        request = new ZabbixHistoryPushRequest("token");
    });

    test("createZabbixParams - transformation", () => {
        const values = [
            { timestamp: "2024-01-01T10:00:00Z", value: { key: "value" } },
            { timestamp: "2024-01-01T10:00:01.500Z", value: "simple value" }
        ];
        const params = new ZabbixHistoryPushParams(values, "1", "item.key", "host.name");
        const zabbixParams = request.createZabbixParams(params);

        expect(zabbixParams).toHaveLength(2);
        expect(zabbixParams[0]).toEqual({
            itemid: "1",
            value: JSON.stringify({ key: "value" }),
            clock: 1704103200,
            ns: 0
        });
        expect(zabbixParams[1]).toEqual({
            itemid: "1",
            value: "simple value",
            clock: 1704103201,
            ns: 500000000
        });
    });

    test("createZabbixParams - transformation without itemid", () => {
        const values = [
            { timestamp: "2024-01-01T10:00:00Z", value: { key: "value" } }
        ];
        const params = new ZabbixHistoryPushParams(values, undefined, "item.key", "host.name");
        const zabbixParams = request.createZabbixParams(params);

        expect(zabbixParams).toHaveLength(1);
        expect(zabbixParams[0]).toEqual({
            host: "host.name",
            key: "item.key",
            value: JSON.stringify({ key: "value" }),
            clock: 1704103200,
            ns: 0
        });
    });

    test("prepare - throw error if item missing", async () => {
        const values = [{ timestamp: "2024-01-01T10:00:00Z", value: "val" }];
        const params = new ZabbixHistoryPushParams(values, undefined, undefined, "host.name");

        await expect(request.prepare(zabbixAPI, params)).rejects.toThrow("if itemid is empty both key and host must be filled");
    });
});
