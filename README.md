# Zabbix GraphQL API

A modern GraphQL interface for Zabbix, providing enhanced features and easier integration for automation and management.

## Purpose

The Zabbix GraphQL API acts as a wrapper and enhancer for the native Zabbix JSON-RPC API. It simplifies complex operations, provides a strongly-typed schema, and adds advanced logic for importing, querying, and managing Zabbix entities like hosts, templates, and user rights.

## 🚀 Features

- **GraphQL Interface**: Modern GraphQL API wrapping Zabbix functionality
  - *Reference*: `schema/queries.graphql`, `schema/mutations.graphql`, `src/api/start.ts`

- **Hierarchical Data Mapping**: Automatic mapping of Zabbix items/tags to nested GraphQL objects
  - *Reference*: `src/api/resolver_helpers.ts`, `schema/device_value_commons.graphql`, `docs/sample_all_devices_query.graphql`

- **Mass Operations**: Import/export capabilities for hosts, templates, and user rights
  - *Reference*: `schema/mutations.graphql` (importHosts, importTemplates, importUserRights, etc.), `docs/sample_import_*.graphql`

- **Dynamic Schema Extension**: Extend the schema without code changes using environment variables
  - *Reference*: `src/api/schema.ts`, `samples/extensions/` (sample extensions), `src/common_utils.ts` (ADDITIONAL_SCHEMAS, ADDITIONAL_RESOLVERS)

- **Permission System**: Role-based access control using Zabbix template groups
  - *Reference*: `schema/api_commons.graphql` (Permission enum, PermissionRequest), `src/api/resolvers.ts` (hasPermissions, userPermissions), `docs/sample_import_permissions_template_groups_mutation.graphql`

- **Type Safety**: Full TypeScript support with generated types
  - *Reference*: `codegen.ts`, `src/schema/generated/graphql.ts`, `tsconfig.json`, `package.json` (devDependencies for GraphQL Codegen)

- **AI Agent & MCP Enablement**: Native support for Model Context Protocol (MCP) and AI-driven automation. GraphQL's strongly-typed, introspectable nature provides a superior interface for AI agents compared to traditional REST APIs.
  - *Reference*: `docs/howtos/mcp.md`, `.ai/mcp/mcp.json` (Sample Config), `mcp-config.yaml`, `docker compose` (MCP service)

> **Planned features**: For an overview of achieved milestones and planned enhancements have a look at the  [**Roadmap**](./roadmap.md).

## How-To Guides

For detailed information on specific topics and practical step-by-step instructions, please refer to our guides:

- [**Cookbook**](./docs/howtos/cookbook.md): Practical, task-oriented recipes for quick start and AI test generation.
- [**Schema & Extension Overview**](./docs/howtos/schema.md): Detailed explanation of the schema structure and extension mechanism.
- [**Hierarchical Data Mapping**](./docs/howtos/hierarchical_data_mapping.md): How Zabbix items are mapped to nested GraphQL fields.
- [**Roles & Permissions**](./docs/howtos/permissions.md): Managing user rights through Zabbix template groups.
- [**Technical Maintenance Guide**](./docs/howtos/maintenance.md): Guide on code generation, testing, and Docker maintenance.
- [**Test Specification**](./docs/tests.md): Detailed list of test cases and coverage checklist.
- [**MCP & Agent Integration**](./docs/howtos/mcp.md): Connecting LLMs and autonomous agents via Model Context Protocol.

See the [How-To Overview](./docs/howtos/README.md) for a complete list of documentation.

## How to Install and Start

### 📋 Prerequisites
Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 24 (LTS) or higher recommended.
- **Docker**: Version 27 or higher and **Docker Compose** v2.29 or higher (use `docker compose` instead of `docker-compose`).
- **Zabbix**: A running Zabbix instance (**Zabbix 6.2+ mandatory**) with API access. See [Zabbix Version Compatibility](#-zabbix-version-compatibility) for details.
- **Zabbix Super Admin Token** (for full functionality / privilege escalation).
- **Zabbix User Access** (groups and roles depending on your use case).

### 🛠️ Installation
- Clone the repository:
  ```bash
  git clone <repository-url>
  cd zabbix-graphql-api
  ```

- Install dependencies:
  ```bash
  npm install
  ```
### Starting the API

#### Development Mode
Starts the server with `nodemon` and `tsx` for automatic reloading:
```bash
npm run start
```

#### Production Mode
Builds the project and runs the compiled code:
```bash
npm run prod
```

#### 🐳 Local Zabbix Environment
For development and testing, you can start a complete environment including Zabbix from scratch:

```bash
# Start with local Zabbix (latest 7.0)
docker compose --profile zabbix-local up -d

# Start with a specific Zabbix version (e.g. 6.4)
ZABBIX_VERSION=alpine-6.4-latest docker compose --profile zabbix-local up -d
```

> **Guide**: For detailed setup and configuration of the local environment, see [Local Development Environment](./docs/howtos/local_development.md).
> **Important**: On fresh Zabbix installations, you must manually create the base host group (e.g., `Roadwork`) before the API can import devices.

The API will be available at `http://localhost:4000/`.

## ⚙️ Configuration

### Environment Variables

The API is configured via environment variables. Create a `.env` file or set them in your environment:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ZABBIX_BASE_URL` | URL to your Zabbix server (include `/zabbix` path) | - | Yes |
| `ZABBIX_PRIVILEGE_ESCALATION_TOKEN` | Zabbix Super Admin API token used for privilege escalation (e.g. during import operations) | - | Yes |
| `ZABBIX_DEVELOPMENT_TOKEN` | Token used ONLY for local development and isolated testing to simulate a "real end user" | - | No |
| `ZABBIX_EDGE_DEVICE_BASE_GROUP` | Base group for edge devices | `Roadwork` | No |
| `ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX` | Prefix for permission template groups (used to identify permission-related template groups in Zabbix) | `Permissions` | No |
| `SCHEMA_PATH` | Path to schema files | `./schema/` | No |
| `ADDITIONAL_SCHEMAS` | Comma-separated list of additional schema files | - | No |
| `ADDITIONAL_RESOLVERS` | Comma-separated list of resolver types to generate | - | No |
| `LOG_LEVELS` | Comma-separated list of log levels to enable (e.g. `DEBUG,INFO,ERROR`) | - | No |
| `VERBOSITY` | Verbosity level for GraphQL logging (0=off, 1=parameters, 2=parameters+responses) | `0` | No |
| `MCP_LOG_LEVEL` | Log level for the MCP server | `info` | No |
| `MCP_LOG_PARAMETERS` | Whether to log parameters of MCP calls | `false` | No |
| `MCP_LOG_RESPONSES` | Whether to log responses of MCP calls | `false` | No |
| `HOST_TYPE_FILTER_DEFAULT` | Default filter for host types | - | No |
| `HOST_GROUP_FILTER_DEFAULT` | Default filter for host groups | - | No |

## 🔐 Authorization

The application operates with different authentication and authorization mechanisms depending on the scenario:

### 🛡️ Production Use

In production environments, the `ZABBIX_DEVELOPMENT_TOKEN` should **always be unset** to ensure proper security.

- **Zabbix Frontend Widgets**: When accessing the API from widgets embedded in the Zabbix frontend, no static token is needed. Authentication is automatically derived from the `zbx_session` cookie provided by the Zabbix web login, which is forwarded to the Zabbix API.
- **Other Production Tools**: For other purposes (e.g. accessing the API from external tools or scripts), a Zabbix session or auth token must be passed via the `zabbix-auth-token` HTTP header.

> **Recipe**: See [Managing User Permissions](./docs/howtos/cookbook.md#recipe-managing-user-permissions) for setup instructions.

### 🔑 Privilege Escalation

- **`ZABBIX_PRIVILEGE_ESCALATION_TOKEN`**: Certain operations, such as importing hosts, templates, or user rights, require Super Admin access to Zabbix for specific parts of the process. This token allows the API to perform these administrative tasks even when the initiating user does not have Super Admin rights themselves.

### 🧪 Local Development and Testing

- **`ZABBIX_DEVELOPMENT_TOKEN`**: This environment variable is intended **only** for local development and isolated testing. It allows developers to "simulate" a Zabbix access token representing a "real end user" without needing to provide the HTTP header in every request. 
  - **Warning**: This should be avoided in production as it undermines security by bypassing per-request authentication.

### 🗺️ Zabbix to GraphQL Mapping

The API maps Zabbix entities to GraphQL types as follows:

| Zabbix Entity | GraphQL Type | Description |
|---------------|--------------|-------------|
| Host | `Host` / `Device` | Represents a Zabbix host; `Device` is a specialized `Host` with a `deviceType` tag |
| Host Group | `HostGroup` | Represents a Zabbix host group |
| Template | `Template` | Represents a Zabbix template |
| Template Group | `HostGroup` | Represents a Zabbix template group |
| Item | Nested fields | Zabbix items become nested fields based on their key names (hierarchical mapping) |
| Tag | `Tag` | Represents a Zabbix tag associated with a host or template |
| Inventory | `Location` | Host inventory information maps to location data |

> **Detailed Guide**: For a deeper dive into how Zabbix items are transformed into GraphQL fields, see [Hierarchical Data Mapping](./docs/howtos/hierarchical_data_mapping.md).


## Running with Docker

### 📦 Using the Pre-built Image

You can run the API without building it locally by pulling the latest image from the Hilbig IT Forgejo infrastructure:

```bash
docker pull forgejo.tooling.hilbigit.com/zabbix/zabbix-graphql-api:latest
```

Start the container by passing the required environment variables:

```bash
docker run -d \
  --name zabbix-graphql-api \
  -p 4000:4000 \
  -e ZABBIX_BASE_URL=http://your-zabbix-instance/zabbix \
  -e ZABBIX_PRIVILEGE_ESCALATION_TOKEN=your-super-admin-token \
  forgejo.tooling.hilbigit.com/zabbix/zabbix-graphql-api:latest
```

### 🏗️ Building Locally

If you prefer to build the image yourself using the provided `Dockerfile`:

*   Build the image (ensure you provide an `API_VERSION`):
    ```bash
    docker build -t zabbix-graphql-api --build-arg API_VERSION=1.0.0 .
    ```

*   Run the container:
    ```bash
    docker run -d \
      --name zabbix-graphql-api \
      -p 4000:4000 \
      -e ZABBIX_BASE_URL=http://your-zabbix-instance/zabbix \
      -e ZABBIX_PRIVILEGE_ESCALATION_TOKEN=your-super-admin-token \
      zabbix-graphql-api
    ```

## Sample Application: Virtual Control Room (VCR)

The **Virtual Control Room (VCR)** is a professional cockpit and control center application designed for monitoring and managing large-scale deployments of IoT and Edge devices, such as traffic management systems, roadwork safety equipment, and environmental sensors.

### 🧩 How VCR uses the GraphQL API

- **Unified Cockpit**: VCR utilizes the API's **hierarchical mapping** to provide a unified view of diverse device types. It maps Zabbix items and tags directly to structured GraphQL objects (e.g. `operational` telemetry and `current` business state).
- **Dynamic Authorization**: The `hasPermissions` query is used to implement a **Dynamic UI**. Buttons, controls, and status indicators are shown or enabled only if the user has the required `READ` or `READ_WRITE` permissions for that specific object.
- **Mass Provisioning**: VCR leverages the **mass import** capabilities to provision thousands of devices and templates in a single operation, significantly reducing manual configuration effort in Zabbix.
- **Data Visualization**: It uses the `exportHostValueHistory` endpoint to power dashboards showing historical trends, such as traffic density, battery levels, or sensor readings over time.

For more detailed information about the VCR product, please refer to the technical presentation:
[VCR - Technical product information](docs/use-cases/VCR%20-%20Technical%20product%20information.pdf)

## Sample Environment File

Below is a complete example of a `.env` file showing all available configuration options:

```env
# Zabbix Connection
ZABBIX_BASE_URL=http://your-zabbix-instance/zabbix
ZABBIX_PRIVILEGE_ESCALATION_TOKEN=your-super-admin-token-here

# General Configuration
ZABBIX_EDGE_DEVICE_BASE_GROUP=Roadwork
API_VERSION=1.0.0
SCHEMA_PATH=./schema/
HOST_GROUP_FILTER_DEFAULT=Roadwork/Devices/*
HOST_TYPE_FILTER_DEFAULT=Roadwork/Devices

# Schema Extensions (No-Code)
ADDITIONAL_SCHEMAS=./samples/extensions/display_devices.graphql,./samples/extensions/location_tracker_devices.graphql,./samples/extensions/location_tracker_commons.graphql
ADDITIONAL_RESOLVERS=SinglePanelDevice,FourPanelDevice,DistanceTrackerDevice

# Logging
# LOG_LEVEL=debug
```

## Usage Samples

The `docs/queries` directory contains several sample GraphQL queries and mutations to help you get started.

> **Samples Reference**: See the [Sample Queries & Mutations Overview](./docs/queries/README.md) for a categorized list of examples.

## 🔄 API Version

The API version is automatically set during the Docker build process based on the Git tag or commit hash. This version information is embedded into the Docker image and becomes accessible through the `API_VERSION` environment variable at runtime.

### 🔧 Zabbix Version Compatibility

This API is officially supported and productively used with **Zabbix 7.0 (LTS)**, **7.4**, and newer. It maintains compatibility with **Zabbix 6.4** and **6.2**, with the following version-specific behaviors:

- **Zabbix 7.0+ (including 7.4)**:
    - Full feature support.
    - **History Push**: Uses the native `history.push` API for efficient data ingestion.
- **Zabbix 6.4**:
    - **History Push**: Not supported (requires Zabbix 7.0+). The `pushHistory` mutation returns a clear error.
    - **Group Propagation**: Fully supported via the `hostgroup.propagate` API.
    - **UUIDs**: Fully supported for both Host Groups and Template Groups.
- **Zabbix 6.2**:
    - **History Push**: Not supported.
    - **Authentication**: Fully supported. The API automatically falls back to using the `auth` field in JSON-RPC request bodies since Bearer token headers were only introduced in 6.4.

#### ⚠️ Dropped Support for Zabbix 6.0
Support for Zabbix 6.0 (LTS) has been discontinued due to the excessive complexity of maintaining backward compatibility with its legacy API structure. The high amount of differences between 6.0 and 6.2 would have required several intrusive fallbacks:
- **API Methods**: A translation layer to redirect `templategroup.*` calls to `hostgroup.*` methods, as these entities were not yet separated.
- **Permission Management**: Manual recursive expansion of group rights during import because `hostgroup.propagate` was unavailable.
- **Entity Matching**: Unreliable name-based fallback for host groups due to the lack of UUID support in the 6.0 API.
- **JSON-RPC**: Complexity in restoring the `auth` field in request bodies for versions lacking modern Bearer token header support.

By requiring **Zabbix 6.2+**, the API leverages native modern features, ensuring higher reliability and a more maintainable codebase.

## 🛠️ Technical Maintenance

For information on code generation, running tests, and managing the project's development lifecycle, please refer to the [Technical Maintenance Guide](./docs/howtos/maintenance.md).

## 🔗 External Resources

- **Zabbix API Documentation**: [https://www.zabbix.com/documentation/7.0/en/manual/api](https://www.zabbix.com/documentation/7.0/en/manual/api)
- **Apollo Server Documentation**: [https://www.apollographql.com/docs/apollo-server/](https://www.apollographql.com/docs/apollo-server/)
- **Model Context Protocol (MCP)**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
