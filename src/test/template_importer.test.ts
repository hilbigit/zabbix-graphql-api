import {TemplateImporter} from "../execution/template_importer.js";
import {zabbixAPI} from "../datasources/zabbix-api.js";

// Mocking ZabbixAPI.executeRequest
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        executeRequest: jest.fn(),
        post: jest.fn()
    }
}));

describe("TemplateImporter", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("importTemplateGroups - create new group", async () => {
        const templateGroups = [{ groupName: "New Group", uuid: "uuid1" }];
        
        // Mocking group.get to return empty (group doesn't exist)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([]);
        // Mocking group.create
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ groupids: ["101"] });

        const result = await TemplateImporter.importTemplateGroups(templateGroups, "token");

        expect(result).toHaveLength(1);
        expect(result![0].groupid).toBe(101);
        expect(result![0].groupName).toBe("New Group");
    });

    test("importTemplateGroups - group already exists", async () => {
        const templateGroups = [{ groupName: "Existing Group" }];
        
        // Mocking group.get to return existing group
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "102", name: "Existing Group" }]);

        const result = await TemplateImporter.importTemplateGroups(templateGroups, "token");

        expect(result).toHaveLength(1);
        expect(result![0].groupid).toBe(102);
        expect(result![0].message).toContain("already exists");
    });

    test("importTemplates - basic template", async () => {
        const templates = [{
            host: "Test Template",
            groupNames: ["Group1"]
        }];

        // Mocking group.get for Group1
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: "Group1" }]);
        // Mocking template.create
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["301"] });

        const result = await TemplateImporter.importTemplates(templates, "token");

        expect(result).toHaveLength(1);
        expect(result![0].templateid).toBe("301");
        expect(result![0].host).toBe("Test Template");
    });

    test("importTemplates - with items, linked templates and dependent items", async () => {
        const templates = [{
            host: "Complex Template",
            groupNames: ["Group1"],
            templates: [{ name: "Linked Template" }],
            items: [
                {
                    name: "Dependent Item",
                    key: "dependent.key",
                    type: 18,
                    value_type: 3,
                    master_item: { key: "master.key" }
                },
                {
                    name: "Master Item",
                    key: "master.key",
                    type: 0,
                    value_type: 3,
                }
            ]
        }];

        // Mocking group.get
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: "Group1" }]);
        // Mocking template.get for linked template
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "401", host: "Linked Template" }]);
        // Mocking template.create
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["501"] });
        
        // Mocking item.create for Master Item (first pass will pick Master Item because Dependent Item is missing its master)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ itemids: ["601"] });
        // Mocking item.create for Dependent Item (second pass)
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ itemids: ["602"] });

        const result = await TemplateImporter.importTemplates(templates, "token");

        expect(result).toHaveLength(1);
        expect(result![0].templateid).toBe("501");
        
        // Check template.create params
        const templateCreateCall = (zabbixAPI.post as jest.Mock).mock.calls.find(call => call[1].body.method === "template.create");
        expect(templateCreateCall[1].body.params.templates).toContainEqual({ templateid: "401" });

        // Check item.create calls
        const itemCreateCalls = (zabbixAPI.post as jest.Mock).mock.calls.filter(call => call[1].body.method === "item.create");
        expect(itemCreateCalls).toHaveLength(2);

        const masterCall = itemCreateCalls.find(c => c[1].body.params.name === "Master Item");
        const dependentCall = itemCreateCalls.find(c => c[1].body.params.name === "Dependent Item");

        expect(masterCall[1].body.params.key_).toBe("master.key");
        expect(dependentCall[1].body.params.key_).toBe("dependent.key");
        expect(dependentCall[1].body.params.master_itemid).toBe("601");
    });

    test("importTemplates - template query", async () => {
        // This tests the template.get functionality used during import
        const templates = [{
            host: "Template A",
            groupNames: ["Group1"],
            templates: [{ name: "Template B" }]
        }];

        // Mock Group
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "1", name: "Group1" }]);
        // Mock Template B lookup
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ templateid: "2", host: "Template B" }]);
        // Mock Template A creation
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["3"] });

        await TemplateImporter.importTemplates(templates, "token");

        // Verify that template.get was called for Template B
        const templateQueryCall = (zabbixAPI.post as jest.Mock).mock.calls.find(call => call[1].body.method === "template.get");
        expect(templateQueryCall).toBeDefined();
        expect(templateQueryCall[1].body.params.filter.host).toContain("Template B");
    });

    test("importTemplates - error message includes data field", async () => {
        const templates = [{
            host: "Error Template",
            groupNames: ["Group1"]
        }];

        // Mocking group.get
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: "Group1" }]);
        
        // Mocking template.create with an error including data
        const zabbixError = {
            error: {
                code: -32602,
                message: "Invalid params.",
                data: "Invalid parameter \"/1\": the parameter \"key_\" is missing."
            }
        };
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce(zabbixError);

        const result = await TemplateImporter.importTemplates(templates, "token");

        expect(result).toHaveLength(1);
        expect(result![0].message).toContain("Invalid params.");
        expect(result![0].message).toContain("the parameter \"key_\" is missing.");
    });

    test("importTemplates - with macros", async () => {
        const templates = [{
            host: "TemplateWithMacros",
            groupNames: ["Group1"],
            macros: [
                { macro: "{$LAT}", value: "52.52" },
                { macro: "{$LON}", value: "13.41" }
            ]
        }];

        // Mocking group.get
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce([{ groupid: "201", name: "Group1" }]);
        // Mocking template.create
        (zabbixAPI.post as jest.Mock).mockResolvedValueOnce({ templateids: ["302"] });

        const result = await TemplateImporter.importTemplates(templates, "token");

        expect(result).toHaveLength(1);
        expect(result![0].templateid).toBe("302");

        // Verify that template.create was called with macros
        const templateCreateCall = (zabbixAPI.post as jest.Mock).mock.calls.find(call => call[1].body.method === "template.create");
        expect(templateCreateCall[1].body.params.macros).toEqual([
            { macro: "{$LAT}", value: "52.52" },
            { macro: "{$LON}", value: "13.41" }
        ]);
    });
});
