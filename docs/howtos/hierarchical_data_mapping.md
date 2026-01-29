## 🗂️ Hierarchical Data Mapping

The API automatically maps Zabbix items to nested GraphQL objects using the `createHierarchicalValueFieldResolver` function.

### How it Works

Zabbix item keys are used to define the structure in GraphQL. A dot (`.`) acts as a separator to represent nested object structures.

**Example:**
Zabbix item key `state.current.values.temperature` is automatically mapped to:
```json
{
  "state": {
    "current": {
      "values": {
        "temperature": 25.5
      }
    }
  }
}
```

### Type Hinting

You can guide the type conversion by prepending a type hint and an underscore to the last token of the Zabbix item key:

*   `json_`: Parses the value as a JSON object (useful for complex types).
*   `str_`: Forces the value to be treated as a string.
*   `bool_`: Forces the value to be treated as a boolean.
*   `float_`: Forces the value to be treated as a number.

### Preconditions

1.  **Key Naming**: Zabbix item keys (or tags) must match the GraphQL field names.
2.  **Dot Separation**: Use dots to represent the desired hierarchy.

The `createHierarchicalValueFieldResolver` function (found in `../../src/api/resolver_helpers.ts`) dynamically creates these resolvers, eliminating the need for manual resolver definitions for each hierarchical field.

For more information, see the comments in `../../schema/device_value_commons.graphql` and `../../src/api/resolver_helpers.ts`.

See `../queries/sample_all_devices_query.graphql` for examples of hierarchical data in query results.
