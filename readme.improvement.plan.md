# Documentation Improvement Plan

This plan outlines the steps to refactor and improve the Zabbix GraphQL API documentation, combining a technical reference with a practical "Cookbook" for quick start and AI-based test generation.

## Priority 1: Reference Documentation (Advanced Users)

### 1.1 Enhance README.md
- **Feature-to-Code Mapping**: Add "Reference" links to each feature in the features list (from public origin).
- **Comprehensive Config Reference**: Update environment variables table with detailed descriptions, defaults, and requirements.
- **Auth Separation**: Explain `ZABBIX_PRIVILEGE_ESCALATION_TOKEN` vs `ZABBIX_DEVELOPMENT_TOKEN`.
- **Entity Mapping Table**: Include the Zabbix-to-GraphQL entity mapping table.
- **API Versioning**: Document how the version is determined and Zabbix version compatibility (7.4 focus).

### 1.2 Update Detailed Guides
- Ensure `docs/howtos/schema.md`, `permissions.md`, etc., are up-to-date with the latest implementation details.

## Priority 2: Cookbook & AI-Ready Instructions

### 2.1 Create the Cookbook (`docs/howtos/cookbook.md`)
- **Step-by-Step Recipes**: Create practical, task-oriented guides.
- **Recipe: Schema Extension**: Move the "Distance Tracker" example into the cookbook.
- **Recipe: Basic Monitoring**: Step-by-step to monitor a new host.
- **Recipe: Bulk Import**: Guide for mass importing templates and hosts.

### 2.2 AI/MCP Integration for Test Generation
- **MCP Server Documentation**: Explicitly document how to start and use the `zabbix-graphql` MCP server.
- **Test Generation Instructions**: Provide specific instructions on how an AI can use the Cookbook recipes to generate test cases.
- **Metadata for AI**: Use structured headers and clear prerequisites in recipes to make them "AI-parsable".

## Priority 3: Technical Maintenance (from Public Origin)

### 3.1 Code Generation Section
- Explain the GraphQL Codegen setup and how to regenerate types.
- Document the `codegen.ts` configuration.
- Add instructions for updating generated types after schema changes.

## Priority 4: Improve Examples

### 4.1 Complete Examples
- Add more complete examples for each major operation.
- Include error handling examples.
- Add examples for common use cases beyond the distance tracker.

### 4.2 Testing Examples
- Add information about how to run tests.
- Include examples of unit and integration tests.
- Explain the test structure and how to add new tests.

## Priority 5: Documentation Links

### 5.1 Cross-Reference Improvements
- Add links to relevant sections in schema files.
- Include references to specific resolver implementations.
- Link to related documentation files in the docs directory.

### 5.2 External Resources
- Link to official Zabbix API documentation.
- Include references to Apollo Server documentation.

## Implementation Order
1. **Foundation**: Update `README.md` with missing reference information from public origin.
2. **Cookbook Alpha**: Create `docs/howtos/cookbook.md` with the first set of recipes.
3. **AI Bridge**: Document MCP server usage and test generation workflow.
4. **Maintenance**: Add Codegen and Testing sections.
5. **Cross-Linking**: Optimize all links and cross-references.
6. **Optimize**: Run import optimization across the project.

## Success Metrics
- All environment variables documented.
- Clear distinction between Reference and Cookbook.
- Functional MCP-based test generation using cookbook instructions.
- Accurate representation of features and compatibility.
