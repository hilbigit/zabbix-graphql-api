import {schema_loader} from "../api/schema.js";
import {readdirSync, readFileSync} from "node:fs";
import {parse, validate} from "graphql";
import path from "node:path";

describe("MCP Operations Validation", () => {
    let schema: any;

    beforeAll(async () => {
        schema = await schema_loader();
    });

    const operationsDir = "./mcp/operations";
    const files = readdirSync(operationsDir).filter(f => f.endsWith(".graphql"));

    test.each(files)("Operation file %s should be valid against schema", (file) => {
        const filePath = path.join(operationsDir, file);
        const content = readFileSync(filePath, "utf-8");
        const document = parse(content);
        const errors = validate(schema, document);
        
        if (errors.length > 0) {
            console.error(`Validation errors in ${file}:`, errors.map(e => e.message));
        }
        
        expect(errors).toHaveLength(0);
    });
});
