## 🤖 Model Context Protocol (MCP) Integration

The Zabbix GraphQL API supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling Large Language Models (LLMs) to interact directly with your Zabbix data through a standardized interface.

### Overview

By leveraging GraphQL, the API provides a strongly-typed and introspectable interface that is ideal for MCP. This allows LLMs to:
- Discover available queries and mutations.
- Understand the data structures (hosts, items, templates, etc.).
- Execute operations to retrieve or modify Zabbix data based on natural language prompts.

### Running Apollo MCP Server with Docker Compose

You can start both the Zabbix GraphQL API and the Apollo MCP Server using Docker Compose. This setup uses a local `mcp-config.yaml` and a generated `schema.graphql`.

1.  **Prerequisites**: Ensure you have a `.env` file with the required Zabbix connection details.
2.  **Generate Schema**: Generate the combined schema file required by the MCP server:
    ```bash
    cat schema/*.graphql > schema.graphql
    ```
3.  **Prepare Operations**: Create the operations directory if it doesn't exist:
    ```bash
    mkdir -p mcp/operations
    ```
4.  **Start Services**:
    ```bash
    docker-compose up -d
    ```

This will:
- Start the `zabbix-graphql-api` on `http://localhost:4001/graphql` (internal port 4000).
- Start the `apollo-mcp-server` on `http://localhost:3000/mcp` (mapped from internal port 8000), configured to connect to the local API via `mcp-config.yaml`.

### Using with Claude Desktop

To use this integration with Claude Desktop, add the following configuration to your Claude Desktop config file (typically `appflowy.json` or similar depending on OS, but usually `claude_desktop_config.json`):

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
        "-v", "/path/to/your/project/schema.graphql:/schema.graphql",
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

### Benefits of GraphQL-enabled MCP

- **Self-Documenting**: The GraphQL schema provides all necessary metadata for the LLM to understand how to use the tools.
- **Efficient**: LLMs can request exactly the data they need, reducing token usage and improving response speed.
- **Secure**: Uses the same authentication and permission model as the rest of the API.
