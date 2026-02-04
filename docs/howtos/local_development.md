# 💻 Local Development Environment

This guide provides detailed instructions on how to set up a fully isolated local development environment for the Zabbix GraphQL API using Docker Compose.

## 🚀 Overview
The project includes a Docker Compose profile that launches a complete Zabbix stack alongside the GraphQL API and MCP server. This allows you to develop and test features against different Zabbix versions without needing an external Zabbix installation.

### Included Services
- **`zabbix-graphql-api`**: The main GraphQL server.
- **`apollo-mcp-server`**: The Model Context Protocol server for AI integration.
- **`postgres-server`**: PostgreSQL 16 database for Zabbix.
- **`zabbix-server`**: Zabbix Server (PostgreSQL version).
- **`zabbix-web`**: Zabbix Web interface (Nginx/PostgreSQL).

## 🛠️ Step-by-Step Setup

### 1. Start the Environment
Use the `zabbix-local` profile to start all services. You can optionally specify the Zabbix version using the `ZABBIX_VERSION` environment variable.

```bash
# Start the latest 7.0 (default)
docker compose --profile zabbix-local up -d

# Start with a specific Zabbix version (e.g. 6.4)
ZABBIX_VERSION=alpine-6.4-latest docker compose --profile zabbix-local up -d
```

### 2. Configure Zabbix
Once the containers are running, you need to perform a minimal setup in the Zabbix UI:

1. Open `http://localhost:8080` in your browser.
2. Log in with the default credentials:
   - **User**: `Admin`
   - **Password**: `zabbix`
3. Navigate to **Administration** > **Users** > **API tokens**.
4. Create a new token for the `Admin` user (or a dedicated service user) and copy it.
5. **Create Base Host Group**: The API requires a base host group to exist for importing devices.
   - Navigate to **Configuration** > **Host groups** (or **Data collection** > **Host groups** in Zabbix 7.0).
   - Create a host group named `Roadwork` (or the value of `ZABBIX_EDGE_DEVICE_BASE_GROUP` in your `.env`).
   - **Note**: If your base group is nested (e.g., `Roadwork/Devices`), ensure the full path exists. Zabbix does not automatically create parent groups when creating child groups via the API.

### 3. Connect the API
To connect the GraphQL API to your local Zabbix instance, update your `.env` file with the following values (referenced in `samples/zabbix-local.env`):

```env
# Internal Docker network URL
ZABBIX_BASE_URL=http://zabbix-web:8080/

# The token you created in Step 2
ZABBIX_PRIVILEGE_ESCALATION_TOKEN=your-newly-created-token
```

### 4. Restart the API
Apply the configuration by restarting the API container:

```bash
docker compose restart zabbix-graphql-api
```

## ✅ Verification
You can verify the setup by running a simple query against the local API:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "{ apiVersion zabbixVersion }"}' \
  http://localhost:4001/
```

The `zabbixVersion` should match the version you specified in `ZABBIX_VERSION`.

## 💡 Advanced Usage

### Data Persistence
Zabbix data is stored in a named Docker volume called `zbx_db_data`. This ensures that your configuration, templates, and hosts are preserved even if you stop or remove the containers.

To perform a clean reset of the environment:
```bash
docker compose --profile zabbix-local down -v
```

### Testing Multiple Versions
The local environment is perfect for testing the API's version-specific logic (e.g. `history.push` vs `zabbix_sender`). Simply change the `ZABBIX_VERSION` variable and restart the stack.

Supported tags can be found on the [Zabbix Docker Hub](https://hub.docker.com/u/zabbix).

---
**Related Guide**: [Technical Maintenance](./maintenance.md)
**Related Reference**: [Zabbix Version Compatibility](../../README.md#-zabbix-version-compatibility)
