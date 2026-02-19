import {zabbixAPI} from "../datasources/zabbix-api.js";
import {GroupHelper} from "../datasources/zabbix-hostgroups.js";
import {
  ZabbixStoreObjectInItemHistoryRequest,
  ZabbixStoreValueInItemParams,
  ZabbixGetGroupValueRequest,
  ZabbixGroupValueLocatorParams
} from "../datasources/zabbix-store-in-item-history.js";
import {isZabbixErrorResult} from "../datasources/zabbix-request.js";
import {ZabbixQueryHostsMetaRequest, ZabbixCreateHostRequest} from "../datasources/zabbix-hosts.js";
import {ZabbixQueryHistoryRequest} from "../datasources/zabbix-history.js";

// Mock Zabbix API
jest.mock("../datasources/zabbix-api.js", () => ({
  zabbixAPI: {
    post: jest.fn(),
    getVersion: jest.fn().mockResolvedValue("7.4.0"),
    requestByPath: jest.fn(),
  }
}));

// Spy helpers from other modules
const spyFindGroupIds = jest.spyOn(GroupHelper, "findHostGroupIdsByName");
const spyHostsMeta = jest.spyOn(ZabbixQueryHostsMetaRequest.prototype, "executeRequestReturnError");
const spyCreateHost = jest.spyOn(ZabbixCreateHostRequest.prototype, "executeRequestThrowError");
const spyQueryHistory = jest.spyOn(ZabbixQueryHistoryRequest.prototype, "executeRequestReturnError");


describe("storeGroupValue - unit validation & preparation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    spyFindGroupIds.mockReset();
    spyHostsMeta.mockReset();
    spyCreateHost.mockReset();
  });

  test("fails when neither host nor itemid given and valueType is missing", async () => {
    const req = new ZabbixStoreObjectInItemHistoryRequest("token");
    const params = new ZabbixStoreValueInItemParams({
      locator: {
        key: "cfg.key",
        // no host, no itemid, no valueType, no group info
      },
      value: { a: 1 }
    } as any);

    await expect(req.executeRequestReturnError(zabbixAPI as any, params))
      .rejects.toThrow(/valueType in request is mandatory/i);
  });

  test("fails when groupid and groupName missing if host not provided (with valueType)", async () => {
    const req = new ZabbixStoreObjectInItemHistoryRequest("token");
    const params = new ZabbixStoreValueInItemParams({
      locator: {
        key: "cfg.key",
        valueType: "GlobalSettings"
      },
      value: { a: 1 },
    } as any);

    await expect(req.executeRequestReturnError(zabbixAPI as any, params))
      .rejects.toThrow(/groupName must be present/i);
  });

  test("fails when groupName provided but not found", async () => {
    spyFindGroupIds.mockResolvedValueOnce([]);

    const req = new ZabbixStoreObjectInItemHistoryRequest("token");
    const params = new ZabbixStoreValueInItemParams({
      locator: {
        key: "cfg.key",
        valueType: "GlobalSettings",
        groupName: "Infrastructure/Configurations"
      },
      value: { a: 1 },
    } as any);

    await expect(req.executeRequestReturnError(zabbixAPI as any, params))
      .rejects.toThrow(/Unable to find group=/);
  });

  test("creates a new host if none with valueType tag exists in group", async () => {
    // Group lookup resolves to id 777
    spyFindGroupIds.mockResolvedValue([777]);
    // No host found with tag valueType, but for script reload we need one host
    spyHostsMeta
      .mockResolvedValueOnce([] as any) // first call: check for storage host
      .mockResolvedValueOnce([{ hostid: "1" }] as any); // second call: ZabbixForceCacheReloadRequest.prepare
    // Host gets created
    spyCreateHost.mockResolvedValue({ hostids: [7777] } as any);

    // item.get (not found), then item.create for new item, then script calls for cache reload, then history.push.jsonobject
    (zabbixAPI.post as jest.Mock)
      .mockResolvedValueOnce([]) // item.get
      .mockResolvedValueOnce({ itemids: ["9999"], hostids: ["7777"] }) // item.create.storeiteminhistory
      .mockResolvedValueOnce([]) // script.get
      .mockResolvedValueOnce({ scriptids: ["42"] }) // script.create
      .mockResolvedValueOnce({ response: "success", value: "OK" }) // script.execute
      .mockResolvedValueOnce({ response: "success", data: [{ itemid: "9999" }] }); // history.push.jsonobject

    const req = new ZabbixStoreObjectInItemHistoryRequest("token");
    const params = new ZabbixStoreValueInItemParams({
      locator: {
        key: "api.config.json",
        valueType: "GlobalSettings",
        groupName: "Infrastructure/Configurations"
      },
      value: { maintenanceMode: false },
    } as any);

    const res = await req.executeRequestReturnError(zabbixAPI as any, params);
    expect(isZabbixErrorResult(res)).toBe(false);
    // ensure underlying calls performed
    expect(spyFindGroupIds).toHaveBeenCalledWith(["Infrastructure/Configurations"], expect.anything(), expect.anything(), undefined);
    expect(spyCreateHost).toHaveBeenCalled();
    const calls = (zabbixAPI.post as jest.Mock).mock.calls;
    // index 0 is item.get (to check if already exists)
    expect(calls[0][0]).toBe("item.get");
    expect(calls[1][0]).toBe("item.create.storeiteminhistory");
    expect(calls.pop()?.[0]).toBe("history.push.jsonobject");
  });

  test("uses different item lookups for different keys in same group/valueType", async () => {
    // Group lookup resolves to id 777
    spyFindGroupIds.mockResolvedValue([777]);
    // One host found with tag valueType
    spyHostsMeta.mockResolvedValue([{ hostid: "7777" }] as any);

    (zabbixAPI.post as jest.Mock).mockImplementation((method, options) => {
      const params = options.body.params;
      if (method === "item.get") return Promise.resolve([]);
      if (method === "item.create.storeiteminhistory") {
        return Promise.resolve({ itemids: [params.key_ === "key1" ? "1111" : "2222"] });
      }
      if (method === "script.get") return Promise.resolve([{ scriptid: "42" }]);
      if (method === "script.execute") return Promise.resolve({ response: "success", value: "OK" });
      if (method === "history.push.jsonobject") {
        return Promise.resolve({ response: "success", data: [{ itemid: params.itemid }] });
      }
      return Promise.resolve([]);
    });

    const req1 = new ZabbixStoreObjectInItemHistoryRequest("token");
    const params1 = new ZabbixStoreValueInItemParams({
      locator: {
        key: "key1",
        valueType: "TypeA",
        groupName: "GroupName"
      },
      value: { v: 1 },
    } as any);
    await req1.executeRequestReturnError(zabbixAPI as any, params1);
    expect(req1.itemid).toBe(1111);

    const req2 = new ZabbixStoreObjectInItemHistoryRequest("token");
    const params2 = new ZabbixStoreValueInItemParams({
      locator: {
        key: "key2",
        valueType: "TypeA",
        groupName: "GroupName"
      },
      value: { v: 2 },
    } as any);
    await req2.executeRequestReturnError(zabbixAPI as any, params2);
    expect(req2.itemid).toBe(2222);

    expect(req1.itemid).not.toBe(req2.itemid);
    
    // Verify item.get calls had correct keys
    const itemGetCalls = (zabbixAPI.post as jest.Mock).mock.calls.filter(c => c[0] === "item.get");
    expect(itemGetCalls[0][1].body.params.filter.key_).toBe("key1");
    expect(itemGetCalls[1][1].body.params.filter.key_).toBe("key2");
  });
});
describe("getGroupValue - unit validation & execution", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    spyFindGroupIds.mockReset();
    spyHostsMeta.mockReset();
  });

  test("retrieves last value correctly", async () => {
    spyFindGroupIds.mockResolvedValue([777]);
    spyHostsMeta.mockResolvedValue([{ hostid: "7777" }] as any);
    spyQueryHistory.mockResolvedValue([{ value: JSON.stringify({ status: "OK" }) }] as any);
    
    (zabbixAPI.post as jest.Mock).mockImplementation((method, options) => {
      if (method === "item.get") return Promise.resolve([{ itemid: "9999" }]);
      return Promise.resolve([]);
    });

    const req = new ZabbixGetGroupValueRequest("token");
    const params = new ZabbixGroupValueLocatorParams({
      locator: {
        key: "api.status",
        valueType: "Monitor",
        groupName: "Services"
      }
    } as any);

    const res = await req.executeRequestReturnError(zabbixAPI as any, params);
    expect(res).toEqual({ status: "OK" });
    
    expect(spyQueryHistory).toHaveBeenCalled();
  });

  test("returns null if item not found", async () => {
    spyFindGroupIds.mockResolvedValue([777]);
    spyHostsMeta.mockResolvedValue([{ hostid: "7777" }] as any);
    (zabbixAPI.post as jest.Mock).mockResolvedValue([]); // item.get returns empty

    const req = new ZabbixGetGroupValueRequest("token");
    const res = await req.executeRequestReturnError(zabbixAPI as any, new ZabbixGroupValueLocatorParams({
      locator: { key: "missing", valueType: "T", groupName: "G" }
    } as any));
    
    expect(res).toBeNull();
  });
});
