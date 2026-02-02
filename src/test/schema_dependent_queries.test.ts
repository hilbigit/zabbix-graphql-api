import {ApolloServer} from '@apollo/server';
import {schema_loader} from '../api/schema.js';
import {readFileSync} from 'fs';
import {join} from 'path';
import {zabbixAPI} from '../datasources/zabbix-api.js';
import {Config} from "../common_utils.js";

describe("Schema-dependent Queries Integration Tests", () => {
    let server: ApolloServer;
    let postSpy: jest.SpyInstance;

    let originalSchemas: any;
    let originalResolvers: any;
    let originalApiVersion: any;

    beforeAll(async () => {
        originalSchemas = Config.ADDITIONAL_SCHEMAS;
        originalResolvers = Config.ADDITIONAL_RESOLVERS;
        originalApiVersion = Config.API_VERSION;

        // We need to bypass the static readonly nature of Config for this test.
        Object.defineProperty(Config, 'ADDITIONAL_SCHEMAS', {
            value: "./samples/extensions/location_tracker_devices.graphql,./samples/extensions/location_tracker_commons.graphql,./samples/extensions/display_devices.graphql",
            configurable: true
        });
        Object.defineProperty(Config, 'ADDITIONAL_RESOLVERS', {
            value: "DistanceTrackerDevice,SinglePanelDevice",
            configurable: true
        });
        Object.defineProperty(Config, 'API_VERSION', {
            value: "1.2.3",
            configurable: true
        });

        const schema = await schema_loader();
        server = new ApolloServer({
            schema,
        });

        postSpy = jest.spyOn(zabbixAPI, 'post');
    });

    afterAll(() => {
        postSpy.mockRestore();
        Object.defineProperty(Config, 'ADDITIONAL_SCHEMAS', { value: originalSchemas });
        Object.defineProperty(Config, 'ADDITIONAL_RESOLVERS', { value: originalResolvers });
        Object.defineProperty(Config, 'API_VERSION', { value: originalApiVersion });
    });

    test("TC-SCHEMA-01: DistanceTrackerDevice Comprehensive Query", async () => {
        const filePath = join(process.cwd(), 'docs', 'queries', 'sample_distance_tracker_test_query.graphql');
        const content = readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
        
        const queryMatch = content.match(/```graphql\n([\s\S]*?)\n```/);
        if (!queryMatch) {
            throw new Error(`No graphql block found in sample query file`);
        }
        const query = queryMatch[1];

        // Setup mock responses for Zabbix API
        postSpy.mockImplementation((method: string) => {
            if (method === 'apiinfo.version') return Promise.resolve("7.4.0");
            if (method.startsWith('hostgroup.get')) {
                return Promise.resolve([
                    { groupid: "1", name: "Roadwork/Devices/Tracker" }
                ]);
            }
            if (method.startsWith('host.get')) {
                return Promise.resolve([
                    {
                        hostid: "10001",
                        host: "TRACKER_01",
                        name: "Distance Tracker 01",
                        deviceType: "DistanceTrackerDevice", // Manually mapped because we mock post()
                        tags: [
                            { tag: "deviceType", value: "DistanceTrackerDevice" }
                        ],
                        items: [
                            { itemid: "1", name: "Count", key_: "state.current.count", lastvalue: "5", lastclock: 1704103200, value_type: "3" },
                            { itemid: "2", name: "Time From", key_: "state.current.timeFrom", lastvalue: "2024-01-01T10:00:00Z", lastclock: 1704103200, value_type: "4" },
                            { itemid: "3", name: "Time Until", key_: "state.current.timeUntil", lastvalue: "2024-01-01T11:00:00Z", lastclock: 1704103200, value_type: "4" }
                        ],
                        inheritedTags: []
                    },
                    {
                        hostid: "10003",
                        host: "TRACKER_02",
                        name: "Distance Tracker 02",
                        deviceType: "DistanceTrackerDevice",
                        tags: [
                            { tag: "deviceType", value: "DistanceTrackerDevice" }
                        ],
                        items: [
                            { itemid: "10", name: "Count", key_: "state.current.count", lastvalue: "10", lastclock: 1704103200, value_type: "3" },
                            { itemid: "11", name: "Time From", key_: "state.current.timeFrom", lastvalue: "09:58:09", lastclock: 1704103200, value_type: "4" }
                        ],
                        inheritedTags: []
                    },
                    {
                        hostid: "10004",
                        host: "TRACKER_03",
                        name: "Distance Tracker 03",
                        deviceType: "DistanceTrackerDevice",
                        tags: [
                            { tag: "deviceType", value: "DistanceTrackerDevice" }
                        ],
                        items: [
                            { itemid: "20", name: "Count", key_: "state.current.count", lastvalue: "0", lastclock: 1704103200, value_type: "3" },
                            { itemid: "21", name: "Time From", key_: "state.current.timeFrom", lastvalue: "", lastclock: 1704103200, value_type: "4" }
                        ],
                        inheritedTags: []
                    },
                    {
                        hostid: "10002",
                        host: "DISPLAY_01",
                        name: "LED Display 01",
                        deviceType: "SinglePanelDevice", // Manually mapped because we mock post()
                        tags: [
                            { tag: "deviceType", value: "SinglePanelDevice" }
                        ],
                        items: [
                            { itemid: "4", name: "Content", key_: "state.current.values.1.contentText", lastvalue: "Roadwork Ahead", lastclock: 1704103200, value_type: "4" }
                        ],
                        inheritedTags: []
                    }
                ]);
            }
            return Promise.resolve([]);
        });

        const response = await server.executeOperation({
            query: query,
        }, {
            contextValue: { zabbixAuthToken: 'test-token', dataSources: { zabbixAPI: zabbixAPI } }
        });

        if (response.body.kind === 'single') {
            const result = response.body.singleResult;
            if (result.errors) {
                console.error(`Errors in query:`, JSON.stringify(result.errors, null, 2));
            }
            expect(result.errors).toBeUndefined();
            
            const data = result.data as any;
            expect(data.apiVersion).toBe("1.2.3");
            expect(data.zabbixVersion).toBe("7.4.0");
            expect(data.allHostGroups).toHaveLength(1);
            expect(data.allDevices).toBeDefined();
            
            // Verify DistanceTrackerDevice resolution
            const tracker = data.allDevices.find((d: any) => d.host === "TRACKER_01");
            expect(tracker.deviceType).toBe("DistanceTrackerDevice");
            expect(tracker.state.current.count).toBe(5);
            expect(tracker.state.current.timeFrom).toBe("2024-01-01T10:00:00Z");

            const tracker02 = data.allDevices.find((d: any) => d.host === "TRACKER_02");
            expect(tracker02.state.current.count).toBe(10);
            expect(tracker02.state.current.timeFrom).toBe("09:58:09");

            const tracker03 = data.allDevices.find((d: any) => d.host === "TRACKER_03");
            expect(tracker03.state.current.timeFrom).toBe("");
            
            // Verify allHosts with fragments
            const trackerInHosts = data.allHosts.find((h: any) => h.host === "TRACKER_01");
            expect(trackerInHosts.state.current.count).toBe(5);
            
            const displayInHosts = data.allHosts.find((h: any) => h.host === "DISPLAY_01");
            expect(displayInHosts.deviceType).toBe("SinglePanelDevice");
        } else {
            throw new Error(`Unexpected response kind: ${response.body.kind}`);
        }
    });
});
