# ⚡ Query Optimization

This document describes how the Zabbix GraphQL API optimizes queries to reduce data fetching from Zabbix, improving performance and reducing network load.

## 🚀 Overview

The optimization works by analyzing the requested GraphQL fields and only fetching the necessary data from the Zabbix API. This is achieved through:
- **Output Reduction**: Dynamically setting the `output` parameter in Zabbix requests.
- **Parameter Skipping**: Automatically removing optional Zabbix parameters (like `selectTags` or `selectItems`) if the corresponding GraphQL fields are not requested.

## 🏗️ Implementation Details

### 1. `ZabbixRequest` Enhancement
The base `ZabbixRequest` class handles the core optimization logic:
- `optimizeZabbixParams(params, output)`: This method modifies the Zabbix parameters. It filters the `output` array to match the requested fields and removes "skippable" parameters based on rules.
- `skippableZabbixParams`: A map that defines dependencies between Zabbix parameters and GraphQL fields.
    - *Example*: `this.skippableZabbixParams.set("selectTags", "tags")` means `selectTags` will be removed if `tags` is not in the requested output.

### 2. Parameter Mapping
The `GraphqlParamsToNeededZabbixOutput` class provides static methods to map GraphQL query arguments and the selection set (`GraphQLResolveInfo`) to a list of needed Zabbix fields.

### 3. Resolver Integration
Resolvers use the mapper to determine the required output and pass it to the datasource:
```typescript
const output = GraphqlParamsToNeededZabbixOutput.mapAllHosts(info);
return await new ZabbixQueryHostsRequestWithItemsAndInventory(...)
    .executeRequestThrowError(dataSources.zabbixAPI, new ParsedArgs(args), output);
```

### 4. Indirect Dependencies
Some GraphQL fields are not directly returned by Zabbix but are computed from other data. The optimization logic ensures these dependencies are handled:
- **`state`**: Requesting the `state` field on a `Device` requires Zabbix `items`. The mapper automatically adds `items` to the requested output if `state` is present.
- **`deviceType`**: Requesting `deviceType` requires Zabbix `tags` (or `inheritedTags`). This is needed because the `deviceType` is resolved from a Zabbix tag and will be empty otherwise. The optimization logic ensures that `selectTags` and `selectInheritedTags` are not skipped when `deviceType` is requested.

## 🛠️ Configuration
Optimization rules are defined in the constructor of specialized `ZabbixRequest` classes.

### 📋 Supported Optimizations
- **Hosts & Devices**:
    - `selectParentTemplates` skipped if `parentTemplates` not requested.
    - `selectTags` and `selectInheritedTags` skipped if `tags` (or `deviceType`) not requested.
    - `selectHostGroups` skipped if `hostgroups` not requested.
    - `selectItems` skipped if `items` (or `state`) not requested.
    - `selectInventory` skipped if `inventory` not requested.
- **Templates**:
    - `selectItems` skipped if `items` not requested.

## ✅ Verification
You can verify that optimization is working by:
1. Enabling `debug` log level (`LOG_LEVEL=debug`).
2. Observing the Zabbix request bodies in the logs.
3. Checking that the `output` array is minimized and `select*` parameters are omitted when not needed.
