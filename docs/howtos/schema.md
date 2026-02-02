## 📊 Schema and Schema Extension

### Main Schema Structure

The GraphQL schema is located in the `../../schema/` directory and consists of:

- `queries.graphql` - Query definitions (see detailed documentation in file comments)
- `mutations.graphql` - Mutation definitions (see detailed documentation in file comments)
- `devices.graphql` - Device-related types (see detailed documentation in file comments)
- `zabbix.graphql` - Zabbix-specific types (see detailed documentation in file comments)
- `device_value_commons.graphql` - Common value types (see detailed documentation in file comments)
- `api_commons.graphql` - Common API types and permission system (see detailed documentation in file comments)
- `samples/extensions/` - Sample device type extensions (not part of the core source)

For comprehensive understanding of each operation, read the detailed comments in the respective schema files.

### Zabbix to GraphQL Mapping

For a detailed mapping of Zabbix entities to GraphQL types, please refer to the [Zabbix to GraphQL Mapping](../../README.md#zabbix-to-graphql-mapping) section in the main README.

### Zabbix Entity Relationships

- **Host Groups**: Organize hosts and templates hierarchically; represented as `HostGroup` objects in GraphQL
- **Templates**: Contain items and other configuration that can be applied to hosts; linked via template groups
- **Items**: Individual metrics collected from hosts; automatically mapped to nested GraphQL fields based on their key names
- **Tags**: Metadata associated with hosts/templates; used for classification and filtering

### Location Type Usage

The `Location` type represents geographical information from Zabbix host inventory:

- **Fields**: Includes `name`, `location_lat`, `location_lon`, and other inventory attributes
- **Usage**: Available through the `locations` query and as part of host/device objects
- **Access**: Retrieved via the `getLocations` method in the Zabbix API datasource

### Dynamic Schema Extension

Extend the schema without code changes using environment variables:

```bash
# Extensions can be located anywhere; samples are provided in samples/extensions/
ADDITIONAL_SCHEMAS=./samples/extensions/display_devices.graphql,./samples/extensions/location_tracker_devices.graphql
ADDITIONAL_RESOLVERS=SinglePanelDevice,FourPanelDevice,DistanceTrackerDevice
```

This enables runtime schema extension for custom device types without modifying the core code.

### Sample Operations

For practical examples of schema usage, see the sample files in the `../queries/` directory:
- `../queries/sample_all_devices_query.graphql` - Example of querying all devices
- `../queries/sample_import_templates_mutation.graphql` - Example of importing templates
- `../queries/sample_import_host_groups_mutation.graphql` - Example of importing host groups
