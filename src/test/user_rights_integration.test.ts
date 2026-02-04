import {ApolloServer} from '@apollo/server';
import {schema_loader} from '../api/schema.js';
import {readFileSync} from 'fs';
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

describe("User Rights Integration Tests", () => {
    let server: ApolloServer;

    beforeAll(async () => {
        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });
    });

    test("Import user rights using sample", async () => {
        const sampleFile = readFileSync(join(process.cwd(), 'docs', 'queries', 'sample_import_user_rights_mutation.graphql'), 'utf-8').replace(/\r\n/g, '\n');
        const mutationMatch = sampleFile.match(/```graphql\n([\s\S]*?)\n```/);
        const variablesMatch = sampleFile.match(/```json\n([\s\S]*?)\n```/);
        
        const mutation = mutationMatch![1];
        const variables = JSON.parse(variablesMatch![1]);

        // Mocks for importUserRights
        (zabbixAPI.post as jest.Mock)
            .mockResolvedValueOnce([{ groupid: "101", name: "Group1", uuid: "uuid1" }]) // templategroup.get for roles (in prepare)
            .mockResolvedValueOnce([{ groupid: "201", name: "ConstructionSite/Test", uuid: "uuid2" }]) // hostgroup.get for roles (in prepare)
            .mockResolvedValueOnce([{ moduleid: "10", id: "mod1" }]) // module.get for roles
            .mockResolvedValueOnce([{ roleid: "2", name: "Test Role" }]) // role.get
            .mockResolvedValueOnce({ roleids: ["2"] }) // role.update
            .mockResolvedValueOnce([{ groupid: "101", name: "Group1", uuid: "uuid1" }]) // templategroup.get for groups (in prepare)
            .mockResolvedValueOnce([{ groupid: "201", name: "ConstructionSite/Test", uuid: "uuid2" }]) // hostgroup.get for groups (in prepare)
            .mockResolvedValueOnce([{ usrgrpid: "1", name: "Test Group" }]) // usergroup.get
            .mockResolvedValueOnce({ usrgrpids: ["1"] }) // usergroup.update
            .mockResolvedValueOnce({ usrgrpids: [] }); // hostgroup.propagate

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
        expect(result.data.importUserRights.userRoles).toHaveLength(1);
    });
});
