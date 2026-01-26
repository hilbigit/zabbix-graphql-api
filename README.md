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
| `ZABBIX_EDGE_DEVICE_BASE_GROUP` | Base host group for devices | `Baustellen-Devices` |
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

## Usage Samples

The `docs` directory contains several sample GraphQL queries and mutations to help you get started:

*   **Hosts**:
    *   [Query All Hosts](docs/sample_all_hosts_query.graphql)
    *   [Import Hosts](docs/sample_import_hosts_mutation.graphql)
*   **Templates**:
    *   [Query Templates](docs/sample_templates_query.graphql)
    *   [Import Templates](docs/sample_import_templates_mutation.graphql)
    *   [Delete Templates](docs/sample_delete_templates_mutation.graphql)
*   **Template Groups**:
    *   [Import Template Groups](docs/sample_import_template_groups_mutation.graphql)
    *   [Delete Template Groups](docs/sample_delete_template_groups_mutation.graphql)
*   **User Rights**:
    *   [Export User Rights](docs/sample_export_user_rights_query.graphql)
    *   [Import User Rights](docs/sample_import_user_rights_mutation.graphql)

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
