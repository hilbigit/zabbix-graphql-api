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

This recipe shows how to add support for a new specialized device type without modifying the core API code.

### 📋 Prerequisites
- Zabbix Template Group `Templates/Roadwork/Devices` exists.
- Zabbix GraphQL API is running.

### 🛠️ Step 1: Define the Schema Extension
Create a new `.graphql` file in `schema/extensions/` (e.g. `distance_tracker.graphql`):
```graphql
type DistanceTrackerDevice {
  id: String
  name: String
  location: Location
  distance: Float
  batteryLevel: Float
  lastSeen: DateTime
}
```

### ⚙️ Step 2: Configure Environment Variables
Add the new schema and resolver to your `.env` file:
```env
ADDITIONAL_SCHEMAS=./schema/extensions/distance_tracker.graphql
ADDITIONAL_RESOLVERS=DistanceTrackerDevice
```
Restart the API server.

### 🚀 Step 3: Import the Template
Execute the `importTemplates` mutation to create the template in Zabbix. Use Zabbix item keys that match your GraphQL fields (e.g. `distance.current` for `distance`).

> **Reference**: See how items map to fields in the [Zabbix to GraphQL Mapping](../../README.md#zabbix-to-graphql-mapping).

---

## 🍳 Recipe: Provisioning a New Host

### 📋 Prerequisites
- A target Host Group exists in Zabbix.
- At least one Template exists in Zabbix.

### 🛠️ Step 1: Prepare the Host Object
Define the host name, groups, and templates to link.

### 🚀 Step 2: Execute `createHost` Mutation
For more details on the input fields, see the [Reference: createHost](../../schema/mutations.graphql).

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

---

## 🍳 Recipe: Managing User Permissions

### 🛠️ Step 1: Create Permission Template Group
Create a template group with the prefix `Permissions/` in Zabbix (e.g. `Permissions/Read-Only-Access`).

### ⚙️ Step 2: Assign to User Group
In Zabbix, give a User Group `Read` access to this template group.

### 🚀 Step 3: Verify via API
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

For detailed examples of the input structures, refer to [Sample Import Templates](../../docs/queries/sample_import_templates_mutation.graphql) and [Sample Import Hosts](../../docs/queries/sample_import_hosts_mutation.graphql).

---

## 🍳 Recipe: Setting up GraphQL MCP for AI Agents

This recipe guides you through setting up the Model Context Protocol (MCP) server to enable AI agents like **Junie** or **Claude** to interact with your Zabbix data through the GraphQL API.

### 📋 Prerequisites
- **Zabbix GraphQL API**: Ensure the API is running (e.g. `npm run start`).
- **Docker**: Installed and running for the MCP server container.

### 🛠️ Setup A: JetBrains IDE (AI Chat & Junie)
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
- **Verify**: Ask the AI Chat or Junie: "Use MCP to list the configured Zabbix hosts".

### 🛠️ Setup B: Claude Desktop
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

### 💡 Alternative: Using Pre-running MCP Server
If you already have the MCP server running locally (e.g. via `docker-compose.yml`), you can use a simpler configuration.
- **Sample Configuration**: See [.ai/mcp/mcp.json](../../.ai/mcp/mcp.json) for a sample that connects to a running MCP server via HTTP.
- **Usage**: Use this `url`-based configuration in your Claude Desktop or IDE settings instead of the `command`-based setup if you prefer to manage the MCP server lifecycle separately.

> **Reference**: For more details on the benefits of GraphQL for MCP, see the [MCP & Agent Integration Guide](./mcp.md).
