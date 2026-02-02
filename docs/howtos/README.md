# How-To Guides

This directory contains detailed guides on how to use and extend the Zabbix GraphQL API.

## Available Guides

### 🍳 [Cookbook](./cookbook.md)
Practical, step-by-step recipes for common tasks, designed for both humans and AI-based test generation.

### ⚡ [Query Optimization](./query_optimization.md)
Learn how the API optimizes Zabbix requests by reducing output fields and skipping unnecessary parameters based on the GraphQL query.

### 📊 [Schema and Schema Extension](./schema.md)
Learn about the GraphQL schema structure, how Zabbix entities map to GraphQL types, and how to use the dynamic schema extension system.

### 🗂️ [Hierarchical Data Mapping](./hierarchical_data_mapping.md)
Understand how the API automatically maps flat Zabbix item keys into nested GraphQL objects using hierarchical resolvers and type hinting.

### 🔐 [Roles and Permissions Extension](./permissions.md)
Discover how the permission system works, how to define permission levels using Zabbix template groups, and how to query user permissions.

### 🛠️ [Technical Maintenance](./maintenance.md)
Guide on code generation (GraphQL Codegen), running Jest tests, and local Docker builds.

### 🧪 [Test Specification](../tests.md)
Detailed list of test cases, categories (Unit, Integration, E2E), and coverage checklist.

### 🤖 [MCP & Agent Integration](./mcp.md)
Discover how to integrate with the Model Context Protocol (MCP) to enable LLMs and autonomous agents to interact with Zabbix efficiently.

---

## 🔍 Additional Resources
- **[Sample Queries](../queries/README.md)**: Categorized list of practical GraphQL operation examples.
- **[Main README](../../README.md)**: Technical reference, configuration, and environment setup.
