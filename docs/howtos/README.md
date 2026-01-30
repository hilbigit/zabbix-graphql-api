# How-To Guides

This directory contains detailed guides on how to use and extend the Zabbix GraphQL API.

## Available Guides

### 🍳 [Cookbook](./cookbook.md)
Practical, step-by-step recipes for common tasks, designed for both humans and AI-based test generation.

### 📊 [Schema and Schema Extension](./schema.md)
Learn about the GraphQL schema structure, how Zabbix entities map to GraphQL types, and how to use the dynamic schema extension system.

### 🗂️ [Hierarchical Data Mapping](./hierarchical_data_mapping.md)
Understand how the API automatically maps flat Zabbix item keys into nested GraphQL objects using hierarchical resolvers and type hinting.

### 🔐 [Roles and Permissions Extension](./permissions.md)
Discover how the permission system works, how to define permission levels using Zabbix template groups, and how to query user permissions.

### 🏷️ [Zabbix Tags Usage](./tags.md)
Learn how Zabbix tags are used for device classification, host categorization, and as metadata within the GraphQL API.

### 🤖 [MCP & Agent Integration](./mcp.md)
Discover how to integrate the Zabbix GraphQL API with the Model Context Protocol (MCP) to enable LLMs and autonomous agents to interact with your Zabbix data efficiently.

---

For practical examples of GraphQL operations, check the [Sample Queries](../queries/) directory.
