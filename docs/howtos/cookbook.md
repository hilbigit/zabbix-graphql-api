# Zabbix GraphQL API Cookbook

This cookbook provides step-by-step "recipes" for common tasks. These instructions are designed to be easy for humans to follow and structured enough for AI agents (using the MCP server) to generate test cases.

## 🤖 AI-Based Test Generation

To generate a test case from a recipe:
1. Start the `zabbix-graphql` MCP server.
2. Provide the recipe to your AI agent.
3. Ask the agent to "Implement a test case for this recipe using the Zabbix GraphQL API".
4. The agent will use the MCP server to explore the schema and generate appropriate GraphQL operations.

---

## 🍳 Recipe: Extending Schema with a New Device Type

This recipe shows how to add support for a new specialized device type without modifying the core API code.

### Prerequisites
- Zabbix Template Group `Templates/Roadwork/Devices` exists.
- Zabbix GraphQL API is running.

### Step 1: Define the Schema Extension
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

### Step 2: Configure Environment Variables
Add the new schema and resolver to your `.env` file:
```env
ADDITIONAL_SCHEMAS=./schema/extensions/distance_tracker.graphql
ADDITIONAL_RESOLVERS=DistanceTrackerDevice
```
Restart the API server.

### Step 3: Import the Template
Execute the `importTemplates` mutation to create the template in Zabbix. Use Zabbix item keys that match your GraphQL fields (e.g. `distance.current` for `distance`).

---

## 🍳 Recipe: Provisioning a New Host

### Prerequisites
- A target Host Group exists in Zabbix.
- At least one Template exists in Zabbix.

### Step 1: Prepare the Host Object
Define the host name, groups, and templates to link.

### Step 2: Execute `createHost` Mutation
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

### Step 1: Create Permission Template Group
Create a template group with the prefix `Permissions/` in Zabbix (e.g. `Permissions/Read-Only-Access`).

### Step 2: Assign to User Group
In Zabbix, give a User Group `Read` access to this template group.

### Step 3: Verify via API
```graphql
query CheckMyPermissions {
  hasPermissions(permissions: [
    { objectName: "Read-Only-Access", permission: READ }
  ])
}
```
