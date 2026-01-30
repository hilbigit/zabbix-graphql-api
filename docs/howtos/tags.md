## 🏷️ Zabbix Tags Usage

Zabbix tags are used for:

- Device classification (`deviceType` tag)
- Host categorization (`hostType` tag)
- Custom metadata storage
- Permission assignment through template groups

### The `hostType` Tag

The `hostType` tag is used to categorize hosts and templates. This allows the API to provide default filters for specific application domains or device categories.

To classify a host or a template, add a tag in Zabbix:
*   **Tag Name**: `hostType`
*   **Tag Value**: A string representing the category (e.g. `Roadwork/Devices`, `SmartCity/Sensors`).

This tag can be defined directly on the host or on a template (where linked hosts will inherit it).

### Default Filtering with `HOST_TYPE_FILTER_DEFAULT`

By configuring the `HOST_TYPE_FILTER_DEFAULT` environment variable, you can set a global default for the `allHosts` and `allDevices` queries. 

*   If `HOST_TYPE_FILTER_DEFAULT=Roadwork/Devices` is set, `allHosts` will only return hosts with that tag value.
*   This default can be overridden in the GraphQL query by passing the `tag_hostType` argument.

### Search Filtering with `HOST_GROUP_FILTER_DEFAULT`

The `HOST_GROUP_FILTER_DEFAULT` variable provides a default search pattern for the `allHostGroups` query, useful for restricting the visible host group hierarchy.

*   **Overriding**: Providing the `search_name` argument in the `allHostGroups` query overrides this default.
*   **Wildcards**: The `search_name` parameter supports the `*` wildcard. For example, `Roadwork/Devices/*` finds all subgroups within that path.

For more information, see the comments in `../../schema/devices.graphql` and `../../schema/zabbix.graphql`.

See `../queries/sample_all_hosts_query.graphql` and `../queries/sample_all_devices_query.graphql` for examples.
