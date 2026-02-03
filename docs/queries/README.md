# Sample Queries & Mutations

This directory contains practical examples of GraphQL operations for the Zabbix GraphQL API. You can use these as templates for your own automation or integration tasks.

## 📁 Available Samples

### 🖥️ Hosts
- [Query All Hosts](./sample_all_hosts_query.graphql): Retrieve basic host information and inventory.
- [Import Hosts](./sample_import_hosts_mutation.graphql): Create or update multiple hosts with tags and group assignments.
- [Query All Devices](./sample_all_devices_query.graphql): Query specialized devices using the `allDevices` query.
- [Tracked Device Query](./sample_tracked_device_query.graphql): Query simulated or tracked devices.
- [Push GeoJSON History](./sample_push_geojson_history.graphql): Push multiple GeoJSON data points to a tracked device.
- [Distance Tracker Test Query](./sample_distance_tracker_test_query.graphql): Comprehensive query for testing specialized `DistanceTrackerDevice` types.

### 📄 Templates
- [Query Templates](./sample_templates_query.graphql): List available templates and their items.
- [Import Templates](./sample_import_templates_mutation.graphql): Create or update complex templates with item definitions and preprocessing.
- [Import Distance Tracker Template](./sample_import_distance_tracker_template.graphql): Example of importing a template for a schema extension.
- [Import Simulated BT Template](./sample_import_simulated_bt_template.graphql): Example of importing a template for a simulated device.
- [Delete Templates](./sample_delete_templates_mutation.graphql): Remove templates by ID or name pattern.

### 📂 Template Groups
- [Import Host Template Groups](./sample_import_host_template_groups_mutation.graphql): Create groups specifically for host templates.
- [Import Permissions Template Groups](./sample_import_permissions_template_groups_mutation.graphql): Create groups for the permission system.
- [Delete Template Groups](./sample_delete_template_groups_mutation.graphql): Remove template groups by ID or name pattern.

### 🔐 User Rights
- [Export User Rights](./sample_export_user_rights_query.graphql): Export existing user roles and groups for auditing or migration.
- [Import User Rights](./sample_import_user_rights_mutation.graphql): Provision user roles and group permissions at scale.

## 🍳 Related Recipes
For step-by-step guides on how to use these operations in common scenarios, see the [Cookbook](../howtos/cookbook.md).
