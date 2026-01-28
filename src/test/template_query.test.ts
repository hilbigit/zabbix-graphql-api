import {createResolvers} from "../api/resolvers.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";
import {QueryTemplatesArgs} from "../schema/generated/graphql.js";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn(),
        baseURL: "http://mock-zabbix"
    },
    ZABBIX_EDGE_DEVICE_BASE_GROUP: "Roadwork"
}));

describe("Template Resolver", () => {
    let resolvers: any;

    beforeEach(() => {
        jest.clearAllMocks();
        resolvers = createResolvers();
    });

    test("templates query - returns all templates", async () => {
        const mockTemplates = [
            { templateid: "1", name: "Template 1", uuid: "uuid1" },
            { templateid: "2", name: "Template 2", uuid: "uuid2" }
        ];

        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockTemplates);

        const args: QueryTemplatesArgs = {};
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Query.templates(null, args, context);

        expect(result).toEqual(mockTemplates);
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.get", expect.objectContaining({
            body: expect.objectContaining({
                method: "template.get",
                params: {}
            })
        }));
    });

    test("templates query - filters by hostids", async () => {
        const mockTemplates = [{ templateid: "1", name: "Template 1" }];

        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockTemplates);

        const args: QueryTemplatesArgs = { hostids: [1] };
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Query.templates(null, args, context);

        expect(result).toEqual(mockTemplates);
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.get", expect.objectContaining({
            body: expect.objectContaining({
                method: "template.get",
                params: expect.objectContaining({
                    templateids: [1]
                })
            })
        }));
    });

    test("templates query - filters by name_pattern", async () => {
        const mockTemplates = [{ templateid: "1", name: "Template 1" }];

        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockTemplates);

        const args: QueryTemplatesArgs = { name_pattern: "Template" };
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Query.templates(null, args, context);

        expect(result).toEqual(mockTemplates);
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.get", expect.objectContaining({
            body: expect.objectContaining({
                method: "template.get",
                params: expect.objectContaining({
                    search: {
                        name: "Template"
                    }
                })
            })
        }));
    });

    test("templates query - filters by name_pattern with % wildcard", async () => {
        const mockTemplates = [{ templateid: "1", name: "Template 1" }];

        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(mockTemplates);

        const args: QueryTemplatesArgs = { name_pattern: "Temp%1" };
        const context = { zabbixAuthToken: "test-token" };

        const result = await resolvers.Query.templates(null, args, context);

        expect(result).toEqual(mockTemplates);
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.get", expect.objectContaining({
            body: expect.objectContaining({
                method: "template.get",
                params: expect.objectContaining({
                    search: {
                        name: "Temp%1"
                    }
                })
            })
        }));
    });
});
