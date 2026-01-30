# Documentation Improvement Plan

This plan outlines the steps to refactor and improve the Zabbix GraphQL API documentation, combining a technical reference with a practical "Cookbook" for quick start and AI-based test generation.

## Priority 1: Reference Documentation (Advanced Users)

### 1.1 Enhance README.md
- [x] **Feature-to-Code Mapping**: Add "Reference" links to each feature in the features list (from public origin).
- [x] **Comprehensive Config Reference**: Update environment variables table with detailed descriptions, defaults, and requirements.
- [x] **Auth Separation**: Explain `ZABBIX_PRIVILEGE_ESCALATION_TOKEN` vs `ZABBIX_DEVELOPMENT_TOKEN`.
- [x] **Entity Mapping Table**: Include the Zabbix-to-GraphQL entity mapping table.
- [x] **API Versioning**: Document how the version is determined and Zabbix version compatibility (7.4 focus).

### 1.2 Update Detailed Guides
- [x] Ensure `docs/howtos/schema.md`, `permissions.md`, etc., are up-to-date with the latest implementation details.

## Priority 2: Cookbook & AI-Ready Instructions

### 2.1 Create the Cookbook (`docs/howtos/cookbook.md`)
- [x] **Step-by-Step Recipes**: Create practical, task-oriented guides.
- [x] **Recipe: Schema Extension**: Move the "Distance Tracker" example into the cookbook.
- [x] **Recipe: Basic Monitoring**: Step-by-step to monitor a new host.
- [x] **Recipe: Bulk Import**: Guide for mass importing templates and hosts.

### 2.2 AI/MCP Integration for Test Generation
- [x] **MCP Server Documentation**: Explicitly document how to start and use the `zabbix-graphql` MCP server.
- [x] **Test Generation Instructions**: Provide specific instructions on how an AI can use the Cookbook recipes to generate test cases.
- [x] **Metadata for AI**: Use structured headers and clear prerequisites in recipes to make them "AI-parsable".

## Priority 3: Technical Maintenance (from Public Origin)

### 3.1 Code Generation Section
- [x] Explain the GraphQL Codegen setup and how to regenerate types.
- [x] Document the `codegen.ts` configuration.
- [x] Add instructions for updating generated types after schema changes.

## Priority 4: Improve Examples

### 4.1 Complete Examples
- [x] Add more complete examples for each major operation.
- [x] Include error handling examples.
- [x] Add examples for common use cases beyond the distance tracker.

### 4.2 Testing Examples
- [x] Add information about how to run tests.
- [x] Include examples of unit and integration tests.
- [x] Explain the test structure and how to add new tests.

## Priority 5: Documentation Links

### 5.1 Cross-Reference Improvements
- [x] Add links to relevant sections in schema files.
- [x] Include references to specific resolver implementations.
- [x] Link to related documentation files in the docs directory.

### 5.2 External Resources
- [x] Link to official Zabbix API documentation.
- [x] Include references to Apollo Server documentation.

## Priority 6: Refine Structure & DRY (New)

### 6.1 Separate Cookbook from Reference
- [x] Move instructional "how-to" steps from README.md to `cookbook.md` or specific how-tos where they distract from reference info.
- [x] Ensure `README.md` focuses on "What" (specification/reference) and `cookbook.md` focuses on "How" (recipes).

### 6.2 Eliminate Redundancy (DRY)
- [x] Identify and remove duplicate information between `README.md` and `docs/howtos/` (e.g., Zabbix to GraphQL Mapping).
- [x] Centralize core definitions to a single source of truth and use links elsewhere.

### 6.3 Enhance Cross-References
- [x] Add explicit "See also" or "Related Recipes" links in reference sections.
- [x] Link from recipes back to technical reference material for deep-dives.

## Implementation Order
1. [x] **Foundation**: Update `README.md` with missing reference information from public origin.
2. [x] **Cookbook Alpha**: Create `docs/howtos/cookbook.md` with the first set of recipes.
3. [x] **AI Bridge**: Document MCP server usage and test generation workflow.
4. [x] **Maintenance**: Add Codegen and Testing sections.
5. [x] **Cross-Linking**: Optimize all links and cross-references.
6. [x] **Optimize**: Run import optimization across the project.
7. [x] **Refine & DRY**: Execute Priority 6 tasks to further clean up and structure documentation.

## Success Metrics
- All environment variables documented.
- Clear distinction between Reference and Cookbook.
- Functional MCP-based test generation using cookbook instructions.
- Accurate representation of features and compatibility.
- Zero redundant tables or instructional blocks across the doc set.
