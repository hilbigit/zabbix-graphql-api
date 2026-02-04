import {ApolloServer} from '@apollo/server';
import {schema_loader} from '../api/schema.js';
import {zabbixAPI} from '../datasources/zabbix-api.js';

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        post: jest.fn(),
        getVersion: jest.fn().mockResolvedValue("7.0.0"),
    }
}));

describe("History Push Integration Tests", () => {
    let server: ApolloServer;

    beforeAll(async () => {
        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Mutation pushHistory - success with itemid", async () => {
        const mutation = `
            mutation PushHistory($itemid: Int, $values: [HistoryPushInput!]!) {
                pushHistory(itemid: $itemid, values: $values) {
                    message
                    data {
                        itemid
                    }
                }
            }
        `;

        const variables = {
            itemid: 1,
            values: [
                { timestamp: "2024-01-01T10:00:00Z", value: { foo: "bar" } }
            ]
        };

        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({
            response: "success",
            data: [{ itemid: "1" }]
        });

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
        expect(result.data.pushHistory.data[0].itemid).toBe("1");

        expect(zabbixAPI.post).toHaveBeenCalledWith("history.push", expect.objectContaining({
            body: expect.objectContaining({
                method: "history.push",
                params: expect.arrayContaining([
                    expect.objectContaining({
                        itemid: "1",
                        value: JSON.stringify({ foo: "bar" })
                    })
                ])
            })
        }));
    });

    test("Mutation pushHistory - success with key and host", async () => {
        const mutation = `
            mutation PushHistory($key: String, $host: String, $values: [HistoryPushInput!]!) {
                pushHistory(key: $key, host: $host, values: $values) {
                    message
                    data {
                        itemid
                    }
                }
            }
        `;

        const variables = {
            key: "item.key",
            host: "host.name",
            values: [
                { timestamp: "2024-01-01T10:00:00Z", value: { message: "plain value" } }
            ]
        };

        // Mock history.push
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({
            response: "success",
            data: [{ itemid: "1" }]
        });

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
        expect(result.data.pushHistory.data[0].itemid).toBe("1");

        expect(zabbixAPI.post).toHaveBeenCalledWith("history.push", expect.objectContaining({
            body: expect.objectContaining({
                method: "history.push",
                params: expect.arrayContaining([
                    expect.objectContaining({
                        host: "host.name",
                        key: "item.key"
                    })
                ])
            })
        }));
    });
});
