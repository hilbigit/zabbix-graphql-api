# Zabbix GraphQL API

A modern GraphQL interface for Zabbix, providing enhanced features and easier integration for automation and management.

## Purpose

The Zabbix GraphQL API acts as a wrapper and enhancer for the native Zabbix JSON-RPC API. It simplifies complex operations, provides a strongly-typed schema, and adds advanced logic for importing, querying, and managing Zabbix entities like hosts, templates, and user rights.

## Key Features & Enhancements

Compared to the original Zabbix API, this GraphQL API provides several key enhancements:

*   **Mass Import/Export**: Robust support for importing and exporting templates, template groups, hosts, and host groups in bulk.
*   **Hierarchical Host Groups**: Automatically handles the creation and resolution of nested host group hierarchies (e.g., `Parent/Child/Leaf`).
*   **Template Management**:
    *   Full support for template items, including complex preprocessing steps and tags.
    *   **Dependent Item Support**: Intelligent deferred creation logic to handle item dependencies within a template.
    *   Linked template resolution by name.
*   **Advanced Deletion**: Ability to delete templates and template groups not only by ID but also by **name patterns** (supporting Zabbix wildcards like `%`).
*   **User Rights & Permissions**:
    *   Integrated management of user roles and user groups.
    *   Support for importing/exporting user rights with UUID-based matching for cross-instance consistency.
    *   On-the-fly permission checks (`hasPermissions`, `userPermissions`).
*   **Improved Error Reporting**: Detailed error data from Zabbix is appended to GraphQL error messages, making debugging significantly easier.
*   **Strongly Typed Schema**: Leverages GraphQL's type system for clear API documentation and client-side code generation.
*   **Dynamic Schema Extensibility**: Easily extend the API with custom schema snippets and dynamic resolvers for specialized device types without modifying the core code.
*   **CI/CD Integration**: Includes a ready-to-use Forgejo/Gitea/GitHub Actions workflow for automated building, testing, and deployment.
*   **MCP Integration**: Native support for the **Model Context Protocol (MCP)**, enabled by GraphQL's introspectable schema, allowing LLMs to seamlessly interact with Zabbix data.
*   **Sample Application (VCR)**: Designed to power the **Virtual Control Room**, a professional cockpit for managing thousands of IoT/Edge devices.

## How-To Guides

For detailed information on specific topics, please refer to our how-to guides:

*   [**Schema & Extension Overview**](./docs/howtos/schema.md): Detailed explanation of the schema structure and extension mechanism.
*   [**Hierarchical Data Mapping**](./docs/howtos/hierarchical_data_mapping.md): How Zabbix items are mapped to nested GraphQL fields.
*   [**Roles & Permissions**](./docs/howtos/permissions.md): Managing user rights through Zabbix template groups.
*   [**Zabbix Tags Usage**](./docs/howtos/tags.md): Using tags for classification and metadata.
*   [**MCP Integration**](./docs/howtos/mcp.md): Connecting LLMs to Zabbix via Model Context Protocol.

See the [How-To Overview](./docs/howtos/README.md) for a complete list of documentation.

## How to Install and Start

### Prerequisites

*   **Node.js**: Version 18 or higher recommended.
*   **Zabbix**: A running Zabbix instance (compatible with Zabbix 6.0+).

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd zabbix-graphql-api
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

The API is configured via environment variables. Create a `.env` file or set them in your environment:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `ZABBIX_BASE_URL` | URL to your Zabbix API (e.g., `http://zabbix.example.com/zabbix`) | |
| `ZABBIX_AUTH_TOKEN` | Zabbix Super Admin API token for administrative tasks | |
| `ZABBIX_EDGE_DEVICE_BASE_GROUP` | Base host group for devices | `Roadwork` |
| `ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX` | Prefix for template groups used as permissions | `Permissions` |
| `SCHEMA_PATH` | Path to the directory containing `.graphql` schema files | `./schema/` |
| `HOST_GROUP_FILTER_DEFAULT` | Default search pattern for `allHostGroups` query | |
| `HOST_TYPE_FILTER_DEFAULT` | Default value for `tag_hostType` filter in `allHosts` and `allDevices` queries | |

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

The API will be available at `http://localhost:4000/`.

## Running with Docker

### Using the Pre-built Image

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
  -e ZABBIX_AUTH_TOKEN=your-super-admin-token \
  forgejo.tooling.hilbigit.com/zabbix/zabbix-graphql-api:latest
```

### Building Locally

If you prefer to build the image yourself using the provided `Dockerfile`:

1.  Build the image (ensure you provide an `API_VERSION`):
    ```bash
    docker build -t zabbix-graphql-api --build-arg API_VERSION=1.0.0 .
    ```

2.  Run the container:
    ```bash
    docker run -d \
      --name zabbix-graphql-api \
      -p 4000:4000 \
      -e ZABBIX_BASE_URL=http://your-zabbix-instance/zabbix \
      -e ZABBIX_AUTH_TOKEN=your-super-admin-token \
      zabbix-graphql-api
    ```

## Sample Application: Virtual Control Room (VCR)

The **Virtual Control Room (VCR)** is a professional cockpit and control center application designed for monitoring and managing large-scale deployments of IoT and Edge devices, such as traffic management systems, roadwork safety equipment, and environmental sensors.

### How VCR uses the GraphQL API:

*   **Unified Cockpit**: VCR utilizes the API's **hierarchical mapping** to provide a unified view of diverse device types. It maps Zabbix items and tags directly to structured GraphQL objects (e.g., `operational` telemetry and `current` business state).
*   **Dynamic Authorization**: The `hasPermissions` query is used to implement a **Dynamic UI**. Buttons, controls, and status indicators are shown or enabled only if the user has the required `READ` or `READ_WRITE` permissions for that specific object.
*   **Mass Provisioning**: VCR leverages the **mass import** capabilities to provision thousands of devices and templates in a single operation, significantly reducing manual configuration effort in Zabbix.
*   **Data Visualization**: It uses the `exportHostValueHistory` endpoint to power dashboards showing historical trends, such as traffic density, battery levels, or sensor readings over time.

For more detailed information about the VCR product, please refer to the technical presentation:
[VCR - Technical product information](docs/VCR%20-%20Technical%20product%20information.pdf)

## Sample Environment File

Below is a complete example of a `.env` file showing all available configuration options:

```env
# Zabbix Connection
ZABBIX_BASE_URL=http://your-zabbix-instance/zabbix
ZABBIX_AUTH_TOKEN=your-super-admin-token-here

# General Configuration
ZABBIX_EDGE_DEVICE_BASE_GROUP=Roadwork
API_VERSION=1.0.0
SCHEMA_PATH=./schema/
HOST_GROUP_FILTER_DEFAULT=Roadwork/Devices/*
HOST_TYPE_FILTER_DEFAULT=Roadwork/Devices

# Schema Extensions (No-Code)
ADDITIONAL_SCHEMAS=./schema/extensions/display_devices.graphql,./schema/extensions/location_tracker_devices.graphql,./schema/extensions/location_tracker_commons.graphql
ADDITIONAL_RESOLVERS=SinglePanelDevice,FourPanelDevice,DistanceTrackerDevice

# Logging
# LOG_LEVEL=debug
```

## Usage Samples

The `docs/queries` directory contains several sample GraphQL queries and mutations to help you get started:

*   **Hosts**:
    *   [Query All Hosts](docs/queries/sample_all_hosts_query.graphql)
    *   [Import Hosts](docs/queries/sample_import_hosts_mutation.graphql)
*   **Templates**:
    *   [Query Templates](docs/queries/sample_templates_query.graphql)
    *   [Import Templates](docs/queries/sample_import_templates_mutation.graphql)
    *   [Import Distance Tracker Template](docs/queries/sample_import_distance_tracker_template.graphql) (Schema Extension Example)
    *   [Delete Templates](docs/queries/sample_delete_templates_mutation.graphql)
*   **Template Groups**:
    *   [Import Host Template Groups](docs/queries/sample_import_host_template_groups_mutation.graphql)
    *   [Import Permissions Template Groups](docs/queries/sample_import_permissions_template_groups_mutation.graphql)
    *   [Delete Template Groups](docs/queries/sample_delete_template_groups_mutation.graphql)
*   **User Rights**:
    *   [Export User Rights](docs/queries/sample_export_user_rights_query.graphql)
    *   [Import User Rights](docs/queries/sample_import_user_rights_mutation.graphql)

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
