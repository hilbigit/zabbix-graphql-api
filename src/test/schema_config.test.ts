import {schema_loader} from "../api/schema.js";
import * as fs from "fs";
import * as nodeFs from "node:fs";

// Mocking Config
jest.mock("../common_utils.js", () => ({
    Config: {
        SCHEMA_PATH: "./test_schema/",
        ADDITIONAL_SCHEMAS: "./test_schema/extra.graphql",
        ADDITIONAL_RESOLVERS: "ExtraDevice"
    }
}));

// Mocking resolvers to avoid schema validation errors
jest.mock("../api/resolvers.js", () => ({
    createResolvers: jest.fn().mockReturnValue({
        Query: {
            test: () => "ok"
        }
    })
}));

// Mocking fs
jest.mock("fs", () => ({
    readFileSync: jest.fn().mockReturnValue("type Query { test: String } type Device { id: ID tags: [String] } type GenericDevice { id: ID tags: [String] } type DeviceConfig { id: ID } type ExtraDevice { id: ID tags: [String] }")
}));

jest.mock("node:fs", () => ({
    readdirSync: jest.fn().mockReturnValue(["base.graphql"])
}));

describe("Schema Config Mocking", () => {
    test("schema_loader uses Config variables", async () => {
        const schema = await schema_loader();
        
        expect(nodeFs.readdirSync).toHaveBeenCalledWith("./test_schema/");
        expect(fs.readFileSync).toHaveBeenCalledWith("./test_schema/base.graphql", expect.anything());
        expect(fs.readFileSync).toHaveBeenCalledWith("./test_schema/extra.graphql", expect.anything());
        expect(schema).toBeDefined();
    });
});
