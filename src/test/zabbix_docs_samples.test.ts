import {ApolloServer} from '@apollo/server';
import {schema_loader} from '../api/schema.js';
import {readdirSync, readFileSync} from 'fs';
import {join} from 'path';
import {zabbixAPI} from '../datasources/zabbix-api.js';

// Mocking ZabbixAPI.post
jest.mock("../datasources/zabbix-api.js", () => ({
    zabbixAPI: {
        post: jest.fn(),
        getVersion: jest.fn().mockResolvedValue("7.0.0"),
        executeRequest: jest.fn(),
        baseURL: 'http://localhost/zabbix',
        getLocations: jest.fn(),
        requestByPath: jest.fn()
    }
}));

describe("Zabbix Docs Samples Integration Tests", () => {
    let server: ApolloServer;

    beforeAll(async () => {
        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });
    });

    const samplesDir = join(process.cwd(), 'docs', 'queries', 'from_zabbix_docs');
    const files = readdirSync(samplesDir).filter(f => f.endsWith('.graphql'));

    test.each(files)("Sample %s should execute successfully", async (file) => {
        const filePath = join(samplesDir, file);
        const content = readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
        
        const queryMatch = content.match(/```graphql\n([\s\S]*?)\n```/);
        const variablesMatch = content.match(/```json\n([\s\S]*?)\n```/);
        
        if (!queryMatch) {
            throw new Error(`No graphql block found in ${file}`);
        }
        
        const query = queryMatch[1];
        const variables = variablesMatch ? JSON.parse(variablesMatch[1]) : {};

        // Setup a generic mock response based on the operation
        (zabbixAPI.post as jest.Mock).mockImplementation((method: string) => {
            if (method.includes('login')) return Promise.resolve("test-token");
            if (method.includes('logout')) return Promise.resolve(true);
            if (method.includes('get')) return Promise.resolve([]);
            if (method.includes('create')) {
                if (method.includes('host')) return Promise.resolve({hostids: ["10001"]});
                if (method.includes('group')) return Promise.resolve({groupids: ["50"]});
                if (method.includes('template')) return Promise.resolve({templateids: ["20001"]});
                return Promise.resolve({ids: ["1"]});
            }
            if (method.includes('delete')) return Promise.resolve({ids: ["1"]});
            if (method.includes('version')) return Promise.resolve("7.4.0");
            return Promise.resolve({});
        });

        // Some operations use requestByPath or other methods
        (zabbixAPI.requestByPath as jest.Mock).mockResolvedValue({ hostids: ["10001"], groupid: "50", templateid: "20001" });

        const response = await server.executeOperation({
            query: query,
            variables: variables,
        }, {
            contextValue: { zabbixAuthToken: 'test-token', dataSources: { zabbixAPI: zabbixAPI } }
        });

        if (response.body.kind === 'single') {
            const result = response.body.singleResult;
            if (result.errors) {
                console.error(`Errors in ${file}:`, JSON.stringify(result.errors, null, 2));
            }
            expect(result.errors).toBeUndefined();
        } else {
            throw new Error(`Unexpected response kind: ${response.body.kind}`);
        }
    });
});
