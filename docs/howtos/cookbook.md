# Zabbix GraphQL API Cookbook

This cookbook provides step-by-step "recipes" for common tasks. These instructions are designed to be easy for humans to follow and structured enough for AI agents (using the MCP server) to generate test cases.

## 🤖 AI-Based Test Generation

To generate a test case from a recipe:
- Start the `zabbix-graphql` MCP server.
- Provide the recipe to your AI agent.
- Ask the agent to "Implement a test case for this recipe using the Zabbix GraphQL API".
- The agent will use the MCP server to explore the schema and generate appropriate GraphQL operations.

---

## 🍳 Recipe: Extending Schema with a New Device Type

This recipe shows how to add support for a new specialized device type without modifying the core API code. We will use the `DistanceTrackerDevice` as an example.

### 📋 Prerequisites
- Zabbix Template Group `Templates/Roadwork/Devices` exists.
- Zabbix GraphQL API is running.

### 🛠️ Step 1: Define the Schema Extension
Create a new `.graphql` file in `schema/extensions/` (e.g. `distance_tracker.graphql`). 

> **Advice**: A new device type must always implement both the `Host` and `Device` interfaces to ensure compatibility with the API's core logic and resolvers.

```graphql
type DistanceTrackerDevice implements Host & Device {
  # Mandatory Host & Device fields
  hostid: ID!
  host: String!
  deviceType: String
  hostgroups: [HostGroup!]
  name: String
  tags: DeviceConfig
  
  # Specialized state for this device
  state: DistanceTrackerState
}

type DistanceTrackerState implements DeviceState {
  operational: OperationalDeviceData
  current: DistanceTrackerValues
}

type DistanceTrackerValues {
  timeFrom: Time
  timeUntil: Time
  count: Int
  # The distances are modelled using a type which is already defined in location_tracker_commons.graphql
  distances: [SensorDistanceValue!]
}
```

> **Reference**: This example is based on the already prepared sample: [location_tracker_devices.graphql](../../schema/extensions/location_tracker_devices.graphql).

### ⚙️ Step 2: Configure Environment Variables
Add the new schema and resolver to your `.env` file:
```env
ADDITIONAL_SCHEMAS=./schema/extensions/distance_tracker.graphql,./schema/extensions/location_tracker_commons.graphql
ADDITIONAL_RESOLVERS=DistanceTrackerDevice
```
Restart the API server.

### 🚀 Step 3: Execution/Action (Choose Method)

#### Method A: Manual Creation in Zabbix
If you prefer to configure Zabbix manually:
1.  **Create Template**: Create a template named `DISTANCE_TRACKER`.
2.  **Create Items**: Add items with keys that match the GraphQL fields (using hierarchical mapping):
    *   `state.current.timeFrom`
    *   `state.current.timeUntil`
    *   `state.current.count`
    *   `state.current.json_distances` (maps to `distances` array via `json_` prefix)
3.  **Add Tag**: Add a host tag to the template with name `deviceType` and value `DistanceTrackerDevice`.

#### Method B: Automated Import
Execute the `importTemplates` mutation to create the template and items automatically. 
> **Reference**: Use the [Sample: Distance Tracker Import](../../docs/queries/sample_import_distance_tracker_template.graphql) for a complete mutation and variables example.

### ✅ Step 4: Verify the Extension
Verify that the new type is available and correctly mapped by creating a test host and querying it.

#### 1. Create a Test Host
Use the `importHosts` mutation (or `createHost` if IDs are already known) to create a host and explicitly set its `deviceType` to `DistanceTrackerDevice`.

```graphql
mutation CreateTestDistanceTracker($host: String!, $groupNames: [String!]!) {
  importHosts(hosts: [{
    deviceKey: $host,
    deviceType: "DistanceTrackerDevice",
    groupNames: $groupNames
  }]) {
    hostid
    message
  }
}
```

#### 2. Query the Device
Query the newly created device. Use the `tag_deviceType: ["DistanceTrackerDevice"]` argument to ensure you only retrieve devices of this specific type and prevent showing all devices of any type.

```graphql
query VerifyNewDeviceType {
  # 1. Check if the type exists in the schema
  __type(name: "DistanceTrackerDevice") {
    name
    fields {
      name
    }
  }
  # 2. Query the specific device
  allDevices(tag_deviceType: ["DistanceTrackerDevice"]) {
    ... on DistanceTrackerDevice {
      name
      state {
        current {
          count
          distances {
            distance
          }
        }
      }
    }
  }
}
```

> **Reference**: See how items map to fields in the [Zabbix to GraphQL Mapping](../../README.md#zabbix-to-graphql-mapping).

### 🤖 AI/MCP
AI agents can use the generalized `verifySchemaExtension.graphql` operations to automate this step:
- **CreateVerificationHost**: Automatically imports a test host with the correct `deviceType`.
- **VerifySchemaExtension**: Queries the newly created device to verify it is correctly mapped to the new type.

---

## 🍳 Recipe: Provisioning a New Host

### 📋 Prerequisites
- A target Host Group exists in Zabbix.
- At least one Template exists in Zabbix.

### 🛠️ Step 1: Prepare the Host Object
Define the host name, groups, and templates to link.

### 🚀 Step 2: Execute `createHost` Mutation
For more details on the input fields, see the [Reference: createHost](../../schema/mutations.graphql).

### 🤖 AI/MCP
AI agents should prefer using the `importHosts` MCP tool for provisioning as it allows using names for host groups instead of IDs.

```graphql
mutation CreateNewHost($host: String!, $groups: [Int!]!, $templates: [Int!]!) {
  createHost(host: $host, hostgroupids: $groups, templateids: $templates) {
    hostids
    error {
      message
    }
  }
}
```

### ✅ Step 3: Verify Host Creation
Check if the host is correctly provisioned and linked to groups:
```graphql
query VerifyHost($host: String!) {
  allHosts(filter_host: $host) {
    hostid
    host
    hostgroups {
      name
    }
  }
}
```

---

## 🍳 Recipe: Managing User Permissions

### 🛠️ Step 1: Create Permission Template Group
Create a template group with the prefix `Permissions/` in Zabbix (e.g. `Permissions/Read-Only-Access`).

### ⚙️ Step 2: Assign to User Group
In Zabbix, give a User Group `Read` access to this template group.

### ✅ Step 3: Verify via API
Verify that the current user has the expected permissions:
```graphql
query CheckMyPermissions {
  hasPermissions(permissions: [
    { objectName: "Read-Only-Access", permission: READ }
  ])
}
```

---

## 🍳 Recipe: Bulk Import of Templates and Hosts

This recipe guides you through performing a mass import of multiple templates and hosts in a single operation.

### 🛠️ Step 1: Prepare Template Import
Use the `importTemplates` mutation. You can provide multiple template definitions in the `templates` array.

### ⚙️ Step 2: Prepare Host Import
Use the `importHosts` mutation. Link them to the newly imported templates using their names or IDs.

### 🚀 Step 3: Combined Operation (Optional)
You can execute both mutations in a single GraphQL request to ensure atomic-like provisioning of your infrastructure.

```graphql
mutation BulkProvisioning($templates: [CreateTemplate!]!, $hosts: [CreateHost!]!) {
  importTemplates(templates: $templates) {
    templateid
    host
    message
  }
  importHosts(hosts: $hosts) {
    hostid
    deviceKey
    message
  }
}
```

### ✅ Step 4: Verify Bulk Import
Verify that all entities were created and linked correctly:
```graphql
query VerifyBulkImport($pattern: String!) {
  allHosts(name_pattern: $pattern) {
    hostid
    host
    ... on ZabbixHost {
      parentTemplates {
        name
      }
    }
  }
}
```

For detailed examples of the input structures, refer to [Sample Import Templates](../../docs/queries/sample_import_templates_mutation.graphql) and [Sample Import Hosts](../../docs/queries/sample_import_hosts_mutation.graphql).

---

## 🍳 Recipe: Setting up GraphQL MCP for AI Agents

This recipe guides you through setting up the Model Context Protocol (MCP) server to enable AI agents like **Junie** or **Claude** to interact with your Zabbix data through the GraphQL API.

### 📋 Prerequisites
- **Zabbix GraphQL API**: Ensure the API is running (e.g. `npm run start`).
- **Docker**: Installed and running for the MCP server container.

### 🛠️ Step 1: Configure the MCP Server
Choose one of the following setups:

#### Setup A: JetBrains IDE (AI Chat & Junie)
Configure the IDE to use the GraphQL MCP server for both the built-in AI Chat and the **Junie agent**.
- **Prerequisite**: Generate the combined schema file (run this in your project root):
  ```bash
  cat schema/*.graphql > schema.graphql
  ```
- **Open Settings**: Navigate to `File` > `Settings` (Windows/Linux) or `IntelliJ IDEA` > `Settings` (macOS).
- **Navigate to MCP**: Go to `Tools` > `AI Assistant` > `MCP Servers`.
- **Add Server**: Click the **+** button and configure:
  - **Name**: `Zabbix GraphQL`
  - **Type**: `Command`
  - **Command**: `docker`
  - **Arguments**:
    ```text
    run -i --rm -v ${PROJECT_DIR}/mcp-config.yaml:/mcp-config.yaml -v ${PROJECT_DIR}/schema.graphql:/mcp-data/schema.graphql:ro -v ${PROJECT_DIR}/mcp/operations:/mcp/operations -e APOLLO_GRAPH_REF=local@main ghcr.io/apollographql/apollo-mcp-server:latest /mcp-config.yaml
    ```

#### Setup B: Claude Desktop
Connect Claude Desktop to the Zabbix GraphQL API by referring to the [Apollo GraphQL MCP Documentation](https://github.com/apollographql/apollo-mcp-server).
- **Prerequisite**: Generate the combined schema file (run this in your project root):
  ```bash
  cat schema/*.graphql > schema.graphql
  ```
- **Edit Configuration**: Open the Claude Desktop configuration file (e.g. `%APPDATA%\Claude\claude_desktop_config.json` on Windows).
- **Add to mcpServers**: Insert the following configuration in the `mcpServers` section:
  ```json
  {
    "mcpServers": {
      "zabbix-graphql": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-v", "C:/path/to/your/project/mcp-config.yaml:/mcp-config.yaml",
          "-v", "C:/path/to/your/project/schema.graphql:/mcp-data/schema.graphql:ro",
          "-v", "C:/path/to/your/project/mcp/operations:/mcp/operations",
          "-e", "APOLLO_GRAPH_REF=local@main",
          "ghcr.io/apollographql/apollo-mcp-server:latest",
          "/mcp-config.yaml"
        ]
      }
    }
  }
  ```
- **Restart Claude**: Fully restart the Claude Desktop application to apply the changes.

### 🚀 Step 2: Use an AI Agent
Provide the recipe to your AI agent and ask it to perform a task.
- **Example**: "Use MCP to list the configured Zabbix hosts".

### ✅ Step 3: Verify via Agent
Confirm that the agent can successfully interact with the API:
- Ask: "What is the current version of the Zabbix API?"
- The agent should use the `apiVersion` query and respond with the version number.

### 💡 Alternative: Using Pre-running MCP Server
If you already have the MCP server running locally (e.g. via `docker compose`), you can use a simpler configuration.
- **Sample Configuration**: See [.ai/mcp/mcp.json](../../.ai/mcp/mcp.json) for a sample that connects to a running MCP server via HTTP.
- **Usage**: Use this `url`-based configuration in your Claude Desktop or IDE settings instead of the `command`-based setup if you prefer to manage the MCP server lifecycle separately.

> **Reference**: For more details on the benefits of GraphQL for MCP, see the [MCP & Agent Integration Guide](./mcp.md).
