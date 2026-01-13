import {ParsedArgs, ZabbixWithTagsParams} from "../datasources/zabbix-request.js";

test("Parse Zabbix Args", () => {
    let name_pattern = "Test"
    let input = {
        name_pattern: name_pattern,
        tag_deviceType: ["x1", "x2"]
    }
    let args = new ParsedArgs(input)
    expect(args, "name_pattern should be extracted").not.toContain(name_pattern)
    // @ts-ignore
    expect("Testwert", "name_pattern should be converted to regex").toMatch(args.name_pattern)
    expect((<ZabbixWithTagsParams>args.zabbix_params).tags).toContainEqual({
        "tag": "deviceType",
        "operator": 1,
        "value": "x1"
    })
    expect((<ZabbixWithTagsParams>args.zabbix_params).tags).toContainEqual({
        "tag": "deviceType",
        "operator": 1,
        "value": "x2"
    })
    expect((<ZabbixWithTagsParams>new ParsedArgs({tag_x: "x1"}).zabbix_params).tags).toContainEqual({
        "tag": "x",
        "operator": 1,
        "value": "x1"
    })
});
