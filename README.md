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
*   **Sample Application (VCR)**: Designed to power the **Virtual Control Room**, a professional cockpit for managing thousands of IoT/Edge devices.

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

## Extending the Schema

The Zabbix GraphQL API is designed to be highly extensible. You can add your own GraphQL schema snippets and have resolvers dynamically created for them.

### Dynamic Resolvers with `createHierarchicalValueFieldResolver`

The function `createHierarchicalValueFieldResolver` (found in `src/api/resolver_helpers.ts`) allows for the automatic creation of resolvers that map Zabbix items or tags to a hierarchical GraphQL structure. It uses field names and Zabbix item keys (dot-separated) to automatically resolve nested objects.

### Zabbix Preconditions for Hierarchical Mapping

In order for the dynamic resolvers to correctly map Zabbix data to your GraphQL schema, the following preconditions must be met in your Zabbix templates:

*   **Key Naming**: Zabbix item keys (or tags) must match the GraphQL field names.
*   **Dot Separation**: Use a dot (`.`) as a separator to represent nested object structures. For example, a Zabbix item with the key `state.current.values.temperature` will be automatically mapped to the `temperature` field within the nested structure: `state` -> `current` -> `values` -> `temperature`.
*   **Type Hinting**: You can guide the type conversion by prepending a type hint and an underscore to the last token of the key:
    *   `json_`: Parses the value as a JSON object (useful for complex types).
    *   `str_`: Forces the value to be treated as a string.
    *   `bool_`: Forces the value to be treated as a boolean.
    *   `float_`: Forces the value to be treated as a number.

For a complete example of a Zabbix template designed for schema extension, see the [Distance Tracker Import Sample](docs/sample_import_distance_tracker_template.graphql).

### No-Code Extension via Environment Variables

You can extend the schema and add resolvers without writing any TypeScript code by using the following environment variables:

*   **`ADDITIONAL_SCHEMAS`**: A comma-separated list of paths to additional `.graphql` files.
*   **`ADDITIONAL_RESOLVERS`**: A comma-separated list of GraphQL Type names for which dynamic hierarchical resolvers should be created.

#### Example

Suppose you have custom device definitions in `schema/extensions/`. You can load them and enable dynamic resolution by setting:

```bash
ADDITIONAL_SCHEMAS=./schema/extensions/display_devices.graphql,./schema/extensions/location_tracker_devices.graphql,./schema/extensions/location_tracker_commons.graphql
ADDITIONAL_RESOLVERS=SinglePanelDevice,FourPanelDevice,DistanceTrackerDevice
```

The API will:
1. Load all provided schema files.
2. For each type listed in `ADDITIONAL_RESOLVERS`, it will automatically create a resolver that maps Zabbix items (e.g., an item with key `state.current.values.temperature`) to the corresponding GraphQL fields.

## User Permissions & `hasPermission`

The Zabbix GraphQL API provides a sophisticated way to manage and check application-level permissions using Zabbix's built-in user group and template group mechanisms.

### Modeling Permissions with Template Groups

Permissions can be modeled as **empty template groups** (groups with no templates or hosts attached) organized in a hierarchical structure. By convention, these groups start with a configurable prefix (default: `Permissions/`).

#### Example Hierarchy:
*   `Permissions/ConstructionSite`: General access to construction site data.
*   `Permissions/Automatism`: Access to automation features.
*   `Permissions/Automatism/Status`: Permission to view automation status.

### Zabbix Preconditions

1.  **Template Groups**: Create template groups for each permission you want to manage (e.g., `Permissions/App1/FeatureA`).
2.  **User Groups**: In Zabbix, assign these template groups to Zabbix User Groups with specific permission levels (`READ`, `READ_WRITE`, or `DENY`).
3.  **Authentication**: The GraphQL API will check the permissions of the authenticated user (via token or session cookie) against these Zabbix assignments.

### Using `hasPermission` and `userPermissions`

The API provides two main queries for permission checking:

*   **`userPermissions`**: Returns a list of all permissions assigned to the current user.
*   **`hasPermissions`**: Checks if the user has a specific set of required permissions (e.g., "Does the user have `READ_WRITE` access to `Automatism/Status`?").

This allows for fine-grained access control in your frontend or external applications, using Zabbix as the central authorization authority.

For a complete example of how to import these permission groups, see the [Permissions Template Groups Import Sample](docs/sample_import_permissions_template_groups_mutation.graphql).

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

# Schema Extensions (No-Code)
ADDITIONAL_SCHEMAS=./schema/extensions/display_devices.graphql,./schema/extensions/location_tracker_devices.graphql,./schema/extensions/location_tracker_commons.graphql
ADDITIONAL_RESOLVERS=SinglePanelDevice,FourPanelDevice,DistanceTrackerDevice

# Logging
# LOG_LEVEL=debug
```

## Usage Samples

The `docs` directory contains several sample GraphQL queries and mutations to help you get started:

*   **Hosts**:
    *   [Query All Hosts](docs/sample_all_hosts_query.graphql)
    *   [Import Hosts](docs/sample_import_hosts_mutation.graphql)
*   **Templates**:
    *   [Query Templates](docs/sample_templates_query.graphql)
    *   [Import Templates](docs/sample_import_templates_mutation.graphql)
    *   [Import Distance Tracker Template](docs/sample_import_distance_tracker_template.graphql) (Schema Extension Example)
    *   [Delete Templates](docs/sample_delete_templates_mutation.graphql)
*   **Template Groups**:
    *   [Import Host Template Groups](docs/sample_import_host_template_groups_mutation.graphql)
    *   [Import Permissions Template Groups](docs/sample_import_permissions_template_groups_mutation.graphql)
    *   [Delete Template Groups](docs/sample_delete_template_groups_mutation.graphql)
*   **User Rights**:
    *   [Export User Rights](docs/sample_export_user_rights_query.graphql)
    *   [Import User Rights](docs/sample_import_user_rights_mutation.graphql)

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
