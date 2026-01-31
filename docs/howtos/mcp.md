## 🤖 Model Context Protocol (MCP) Integration

The Zabbix GraphQL API supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling Large Language Models (LLMs) to interact directly with your Zabbix data through a standardized interface.

### Overview

By leveraging GraphQL, the API provides a strongly-typed and introspectable interface that is ideal for MCP. This allows LLMs to:
- Discover available queries and mutations.
- Understand the data structures (hosts, items, templates, etc.).
- Execute operations to retrieve or modify Zabbix data based on natural language prompts.

### Running Apollo MCP Server with Docker Compose

You can start both the Zabbix GraphQL API and the Apollo MCP Server using Docker Compose. This setup uses a local `mcp-config.yaml` and a generated `schema.graphql`.

- **Prerequisites**: Ensure you have a `.env` file with the required Zabbix connection details.
- **Prepare Operations**: Create the operations directory if it doesn't exist:
  ```bash
  mkdir -p mcp/operations
  ```
- **Start Services**:
  ```bash
  docker compose up -d
  ```

This will:
- Start the `zabbix-graphql-api` on `http://localhost:4001/graphql` (internal port 4000).
- Start the `apollo-mcp-server` on `http://localhost:3000/mcp` (mapped from internal port 8000), configured to connect to the local API via `mcp-config.yaml`.

### Using with Claude Desktop

To use this integration with Claude Desktop, add the following configuration to your Claude Desktop config file (typically `claude_desktop_config.json`).

- **Prerequisite**: Generate the combined schema file in your project root:
  ```bash
  cat schema/*.graphql > schema.graphql
  ```

- **Configuration**:
```json
{
  "mcpServers": {
    "zabbix-graphql": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v", "/path/to/your/project/mcp-config.yaml:/mcp-config.yaml",
        "-v", "/path/to/your/project/schema.graphql:/mcp-data/schema.graphql:ro",
        "-v", "/path/to/your/project/mcp/operations:/mcp/operations",
        "-e", "APOLLO_GRAPH_REF=local@main",
        "ghcr.io/apollographql/apollo-mcp-server:latest",
        "/mcp-config.yaml"
      ]
    }
  }
}
```

**Note**: Ensure the `zabbix-graphql-api` is running and accessible. If running locally, you might need to use `host.docker.internal:4001/graphql` in your `mcp-config.yaml` to allow the containerized MCP server to reach your host.

#### 💡 Sample Configuration (Alternative)
If you prefer to run the MCP server manually or via Docker Compose (as described above), you can use a HTTP-based configuration instead of the `command` execution. See [.ai/mcp/mcp.json](../../.ai/mcp/mcp.json) for a sample configuration that connects to the server running on `localhost:3000`.

### Benefits of GraphQL-enabled MCP over REST

Integrating via GraphQL offers significant advantages for AI agents and MCP compared to the traditional Zabbix JSON-RPC (REST-like) API:

- **Introspection & Discovery**: Unlike REST, GraphQL is natively introspectable. An AI agent can query the schema itself to discover all available types, fields, and operations. This allows agents to "learn" the API capabilities without manual documentation parsing.
- **Strong Typing**: The schema provides explicit types for every field. AI agents can use this to validate their own generated queries and understand the exact data format expected or returned, reducing errors in agent-driven actions.
- **Precision (Over-fetching/Under-fetching)**: In REST, endpoints often return fixed data structures, leading to token waste (over-fetching) or requiring multiple round-trips (under-fetching). With GraphQL, the agent requests exactly the fields it needs, which is crucial for staying within LLM context window limits and reducing latency.
- **Single Endpoint**: AI agents only need to know one endpoint. They don't have to manage a complex tree of URL paths and HTTP methods; they simply send their intent as a GraphQL operation.
- **Complex Relationships**: Agents can navigate complex Zabbix relationships (e.g. Host -> Items -> History) in a single request, which is much more intuitive for LLMs than orchestrating multiple REST calls.
- **Self-Documenting**: Descriptive comments in the SDL are automatically exposed to the agent, providing immediate context for what each field represents.

### AI-Based Test Generation via Cookbook

The MCP server can be used in conjunction with the [**Cookbook**](./cookbook.md) to automate the generation of test cases. By providing a cookbook "recipe" to an LLM with access to the `zabbix-graphql` MCP server, the LLM can:

- Analyze the step-by-step instructions in the recipe.
- Use the MCP server's tools to inspect the current Zabbix state and schema.
- Generate and execute the necessary GraphQL operations to fulfill the recipe's task.
- Verify the outcome and suggest assertions for a formal test script.

Example prompt for an LLM:
> "Using the `zabbix-graphql` MCP server, follow the 'Provisioning a New Host' recipe from the cookbook. Create a host named 'Test-Host-01' in the 'Linux servers' group and link the 'ICMP Ping' template."
