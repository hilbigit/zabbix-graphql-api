import {TemplateDeleter} from "../execution/template_deleter.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";

// Mocking ZabbixAPI
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn()
    }
}));

describe("TemplateDeleter", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("deleteTemplates - success", async () => {
        const templateids = [1, 2];
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["1", "2"] });

        const result = await TemplateDeleter.deleteTemplates(templateids, null, "token");

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(1);
        expect(result[0].message).toContain("deleted successfully");
        expect(result[1].id).toBe(2);
        
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.delete", expect.objectContaining({
            body: expect.objectContaining({
                params: [1, 2]
            })
        }));
    });

    test("deleteTemplates - error", async () => {
        const templateids = [1];
        const zabbixError = {
            error: {
                code: -32602,
                message: "Invalid params.",
                data: "Template does not exist"
            }
        };
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(zabbixError);

        const result = await TemplateDeleter.deleteTemplates(templateids, null, "token");

        expect(result).toHaveLength(1);
        expect(result[0].error).toBeDefined();
        expect(result[0].message).toContain("Invalid params.");
        expect(result[0].message).toContain("Template does not exist");
    });

    test("deleteTemplates - by name_pattern", async () => {
        // Mock template.get
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([
            { templateid: "10", host: "PatternTemplate 1" },
            { templateid: "11", host: "PatternTemplate 2" }
        ]);
        // Mock template.delete
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["10", "11"] });

        const result = await TemplateDeleter.deleteTemplates(null, "PatternTemplate%", "token");

        expect(result).toHaveLength(2);
        expect(result.map(r => r.id)).toContain(10);
        expect(result.map(r => r.id)).toContain(11);
        
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.get", expect.objectContaining({
            body: expect.objectContaining({
                params: expect.objectContaining({
                    search: expect.objectContaining({ name: "PatternTemplate%" })
                })
            })
        }));
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.delete", expect.objectContaining({
            body: expect.objectContaining({
                params: expect.arrayContaining([10, 11])
            })
        }));
    });

    test("deleteTemplates - merged IDs and name_pattern", async () => {
        // Mock template.get
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([
            { templateid: "10", host: "PatternTemplate 1" },
            { templateid: "12", host: "PatternTemplate 3" }
        ]);
        // Mock template.delete
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["10", "11", "12"] });

        const result = await TemplateDeleter.deleteTemplates([11], "PatternTemplate%", "token");

        expect(result).toHaveLength(3);
        expect(result.map(r => r.id)).toContain(10);
        expect(result.map(r => r.id)).toContain(11);
        expect(result.map(r => r.id)).toContain(12);
        
        expect(zabbixAPI.post).toHaveBeenCalledWith("template.delete", expect.objectContaining({
            body: expect.objectContaining({
                params: expect.arrayContaining([10, 11, 12])
            })
        }));
    });

    test("deleteTemplateGroups - success", async () => {
        const groupids = [101];
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ groupids: ["101"] });

        const result = await TemplateDeleter.deleteTemplateGroups(groupids, null, "token");

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(101);
        expect(result[0].message).toContain("deleted successfully");
    });

    test("deleteTemplateGroups - error", async () => {
        const groupids = [101];
        const zabbixError = {
            error: {
                code: -32602,
                message: "Invalid params.",
                data: "Group is in use"
            }
        };
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(zabbixError);

        const result = await TemplateDeleter.deleteTemplateGroups(groupids, null, "token");

        expect(result).toHaveLength(1);
        expect(result[0].error).toBeDefined();
        expect(result[0].message).toContain("Group is in use");
    });

    test("deleteTemplateGroups - by name_pattern", async () => {
        // Mock templategroup.get
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([
            { groupid: "201", name: "PatternGroup 1" }
        ]);
        // Mock templategroup.delete
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ groupids: ["201"] });

        const result = await TemplateDeleter.deleteTemplateGroups(null, "PatternGroup%", "token");

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(201);
        
        expect(zabbixAPI.post).toHaveBeenCalledWith("templategroup.get", expect.objectContaining({
            body: expect.objectContaining({
                params: expect.objectContaining({
                    search: expect.objectContaining({ name: "PatternGroup%" })
                })
            })
        }));
        expect(zabbixAPI.post).toHaveBeenCalledWith("templategroup.delete", expect.objectContaining({
            body: expect.objectContaining({
                params: [201]
            })
        }));
    });
});
