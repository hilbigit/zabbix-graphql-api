## 🔐 Roles and Permissions Extension

The API implements a permission system using Zabbix template groups:

### Permission Template Groups

- Template groups with prefix `Permissions/` (configurable via `ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX`) are used for permissions
- Users gain permissions by being assigned to user groups that have access to these permission template groups

### Available Permissions

The system supports three permission levels defined in `../../schema/api_commons.graphql`:

- `DENY`: Explicitly denies access (supersedes other permissions)
- `READ`: Allows viewing/reading access
- `READ_WRITE`: Allows both reading and writing (implies READ permission)

### Permission Object Names

Permission object names map to Zabbix template group paths: `Permissions/{objectName}`

### GraphQL Permission Queries

```graphql
# Check if current user has specific permissions
query HasPermissions {
  hasPermissions(permissions: [
    { objectName: "hosts", permission: READ },
    { objectName: "templates", permission: READ_WRITE }
  ])
}

# Get all user permissions
query GetUserPermissions {
  userPermissions(objectNames: ["hosts", "templates"])
}
```

### Setting Up Permissions

1. Create template groups with the prefix `Permissions/` (e.g. `Permissions/hosts`, `Permissions/templates`)
2. Assign these template groups to user groups in Zabbix with appropriate permission levels
3. Users in those user groups will inherit the permissions

### Detailed Permission Usage Examples

For comprehensive examples of permission usage patterns, see `../../schema/api_commons.graphql` which contains detailed documentation in the `PermissionRequest` input type comments, including real-world examples of how to model permissions for buttons, status controls, and application features.

See also `../queries/sample_import_permissions_template_groups_mutation.graphql` for examples of importing permission template groups.
