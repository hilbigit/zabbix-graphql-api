# Test Specification

This document outlines the test cases and coverage for the Zabbix GraphQL API.

## 📂 Test Categories

- **Unit Tests**: Verify individual functions, classes, or logic in isolation. All external dependencies (Zabbix API, Config) are mocked to ensure the test is fast and deterministic. These tests are executed on each build.
  - *Reference*: `src/test/host_importer.test.ts`, `src/test/template_query.test.ts`
- **Integration Tests**: Test the interaction between multiple internal components. Typically, these tests use a mock Apollo Server to execute actual GraphQL operations against the resolvers and data sources, with the Zabbix API mocked at the network layer. These tests are executed on each build.
  - *Reference*: `src/test/host_integration.test.ts`, `src/test/user_rights_integration.test.ts`
- **End-to-End (E2E) Tests**: Validate complete, multi-step business workflows from start to finish (e.g., a full import-verify-cleanup cycle). These tests are executed against a real, running Zabbix instance to ensure the entire system achieves the desired business outcome. These tests are triggered after startup or on demand via GraphQL/MCP endpoints.
  - *Reference*: `mcp/operations/runSmoketest.graphql` (executed via MCP)

## 🧪 Test Case Definitions

### Host Management
- **TC-HOST-01**: Query all hosts using sample query.
- **TC-HOST-02**: Import hosts using sample mutation.
- **TC-HOST-03**: Import host groups and create new hierarchy.
- **TC-HOST-04**: Import basic host.
- **TC-HOST-05**: Query all hosts with name pattern.
- **TC-HOST-06**: Query all devices by host ID.
- **TC-HOST-07**: Query all host groups with search pattern.
- **TC-HOST-08**: Query host groups using default search pattern.
- **TC-HOST-09**: Query locations.

### Template Management
- **TC-TEMP-01**: Import templates using sample query and variables.
- **TC-TEMP-02**: Import and export templates comparison.
- **TC-TEMP-03**: Import and export template groups comparison.
- **TC-TEMP-04**: Query all templates.
- **TC-TEMP-05**: Filter templates by host IDs.
- **TC-TEMP-06**: Filter templates by name pattern.
- **TC-TEMP-07**: Filter templates by name pattern with wildcard.
- **TC-TEMP-08**: Import template groups (new group).
- **TC-TEMP-09**: Import template groups (existing group).
- **TC-TEMP-10**: Import basic template.
- **TC-TEMP-11**: Import templates with items, linked templates, and dependent items.
- **TC-TEMP-12**: Import templates query validation.
- **TC-TEMP-13**: Import templates error handling (data field inclusion).
- **TC-TEMP-14**: Delete templates successfully.
- **TC-TEMP-15**: Delete templates error handling.
- **TC-TEMP-16**: Delete templates by name pattern.
- **TC-TEMP-17**: Delete templates with merged IDs and name pattern.
- **TC-TEMP-18**: Delete template groups successfully.
- **TC-TEMP-19**: Delete template groups error handling.
- **TC-TEMP-20**: Delete template groups by name pattern.

### User Rights and Permissions
- **TC-AUTH-01**: Export user rights.
- **TC-AUTH-02**: Query user permissions.
- **TC-AUTH-03**: Check if user has permissions.
- **TC-AUTH-04**: Import user rights.
- **TC-AUTH-05**: Import user rights using sample mutation.

### System and Configuration
- **TC-CONF-01**: Schema loader uses Config variables.
- **TC-CONF-02**: Zabbix API constants derived from Config.
- **TC-CONF-03**: Logger levels initialized from Config.
- **TC-CONF-04**: API version query.
- **TC-CONF-05**: Login query.
- **TC-CONF-06**: Logout query.
- **TC-CONF-07**: Parse Zabbix arguments.

### Documentation and MCP
- **TC-DOCS-01**: Validate all Zabbix documentation sample queries.
- **TC-MCP-01**: Validate all MCP operation files against the schema.

### End-to-End (E2E) Tests
- **TC-E2E-01**: Run a complete smoketest using MCP (creates template, group, and host, verifies, and cleans up).
- **TC-E2E-02**: Run all regression tests to verify critical system behavior and prevent known issues.

#### Currently Contained Regression Tests
The `runAllRegressionTests` mutation (TC-E2E-02) executes the following checks:
- **Host without items**: Verifies that hosts created without any items or linked templates can be successfully queried by the system. This ensures that the hierarchical mapping and resolvers handle empty item lists gracefully.
- **Locations query argument order**: Verifies that the `locations` query correctly handles its parameters and successfully contacts the Zabbix API without session errors (verifying the fix for argument order in the resolver).
- **Template technical name lookup**: Verifies that templates can be correctly identified by their technical name (`host` field) when linking them to hosts during import.
- **HTTP Agent URL support**: Verifies that templates containing HTTP Agent items with a configured URL can be imported successfully (verifying the addition of the `url` field to `CreateTemplateItem`).
- **Host retrieval and visibility**: Verifies that newly imported hosts are immediately visible and retrievable via the `allHosts` query, including correctly delivered assigned templates and assigned host groups (verifying the fix for `output` fields in the host query data source).

## ✅ Test Coverage Checklist

| ID | Test Case | Category | Technology | Code Link |
|:---|:---|:---|:---|:---|
| TC-HOST-01 | Query allHosts using sample | Integration | Jest | [src/test/host_integration.test.ts](../src/test/host_integration.test.ts) |
| TC-HOST-02 | Import hosts using sample | Integration | Jest | [src/test/host_integration.test.ts](../src/test/host_integration.test.ts) |
| TC-HOST-03 | importHostGroups - create new hierarchy | Unit | Jest | [src/test/host_importer.test.ts](../src/test/host_importer.test.ts) |
| TC-HOST-04 | importHosts - basic host | Unit | Jest | [src/test/host_importer.test.ts](../src/test/host_importer.test.ts) |
| TC-HOST-05 | allHosts query | Unit | Jest | [src/test/host_query.test.ts](../src/test/host_query.test.ts) |
| TC-HOST-06 | allDevices query | Unit | Jest | [src/test/host_query.test.ts](../src/test/host_query.test.ts) |
| TC-HOST-07 | allHostGroups query | Unit | Jest | [src/test/host_query.test.ts](../src/test/host_query.test.ts) |
| TC-HOST-08 | allHostGroups query - default pattern | Unit | Jest | [src/test/host_query.test.ts](../src/test/host_query.test.ts) |
| TC-HOST-09 | locations query | Unit | Jest | [src/test/host_query.test.ts](../src/test/host_query.test.ts) |
| TC-TEMP-01 | Import templates using sample | Integration | Jest | [src/test/template_integration.test.ts](../src/test/template_integration.test.ts) |
| TC-TEMP-02 | Import and Export templates comparison | Integration | Jest | [src/test/template_integration.test.ts](../src/test/template_integration.test.ts) |
| TC-TEMP-03 | Import and Export template groups comparison | Integration | Jest | [src/test/template_integration.test.ts](../src/test/template_integration.test.ts) |
| TC-TEMP-04 | templates query - returns all | Unit | Jest | [src/test/template_query.test.ts](../src/test/template_query.test.ts) |
| TC-TEMP-05 | templates query - filters by hostids | Unit | Jest | [src/test/template_query.test.ts](../src/test/template_query.test.ts) |
| TC-TEMP-06 | templates query - filters by name_pattern | Unit | Jest | [src/test/template_query.test.ts](../src/test/template_query.test.ts) |
| TC-TEMP-07 | templates query - name_pattern wildcard | Unit | Jest | [src/test/template_query.test.ts](../src/test/template_query.test.ts) |
| TC-TEMP-08 | importTemplateGroups - create new | Unit | Jest | [src/test/template_importer.test.ts](../src/test/template_importer.test.ts) |
| TC-TEMP-09 | importTemplateGroups - group exists | Unit | Jest | [src/test/template_importer.test.ts](../src/test/template_importer.test.ts) |
| TC-TEMP-10 | importTemplates - basic template | Unit | Jest | [src/test/template_importer.test.ts](../src/test/template_importer.test.ts) |
| TC-TEMP-11 | importTemplates - complex template | Unit | Jest | [src/test/template_importer.test.ts](../src/test/template_importer.test.ts) |
| TC-TEMP-12 | importTemplates - template query | Unit | Jest | [src/test/template_importer.test.ts](../src/test/template_importer.test.ts) |
| TC-TEMP-13 | importTemplates - error data field | Unit | Jest | [src/test/template_importer.test.ts](../src/test/template_importer.test.ts) |
| TC-TEMP-14 | deleteTemplates - success | Unit | Jest | [src/test/template_deleter.test.ts](../src/test/template_deleter.test.ts) |
| TC-TEMP-15 | deleteTemplates - error | Unit | Jest | [src/test/template_deleter.test.ts](../src/test/template_deleter.test.ts) |
| TC-TEMP-16 | deleteTemplates - by name_pattern | Unit | Jest | [src/test/template_deleter.test.ts](../src/test/template_deleter.test.ts) |
| TC-TEMP-17 | deleteTemplates - merged IDs | Unit | Jest | [src/test/template_deleter.test.ts](../src/test/template_deleter.test.ts) |
| TC-TEMP-18 | deleteTemplateGroups - success | Unit | Jest | [src/test/template_deleter.test.ts](../src/test/template_deleter.test.ts) |
| TC-TEMP-19 | deleteTemplateGroups - error | Unit | Jest | [src/test/template_deleter.test.ts](../src/test/template_deleter.test.ts) |
| TC-TEMP-20 | deleteTemplateGroups - by name_pattern | Unit | Jest | [src/test/template_deleter.test.ts](../src/test/template_deleter.test.ts) |
| TC-AUTH-01 | exportUserRights query | Unit | Jest | [src/test/user_rights.test.ts](../src/test/user_rights.test.ts) |
| TC-AUTH-02 | userPermissions query | Unit | Jest | [src/test/user_rights.test.ts](../src/test/user_rights.test.ts) |
| TC-AUTH-03 | hasPermissions query | Unit | Jest | [src/test/user_rights.test.ts](../src/test/user_rights.test.ts) |
| TC-AUTH-04 | importUserRights mutation | Unit | Jest | [src/test/user_rights.test.ts](../src/test/user_rights.test.ts) |
| TC-AUTH-05 | Import user rights using sample | Integration | Jest | [src/test/user_rights_integration.test.ts](../src/test/user_rights_integration.test.ts) |
| TC-CONF-01 | schema_loader uses Config variables | Unit | Jest | [src/test/schema_config.test.ts](../src/test/schema_config.test.ts) |
| TC-CONF-02 | constants are derived from Config | Unit | Jest | [src/test/zabbix_api_config.test.ts](../src/test/zabbix_api_config.test.ts) |
| TC-CONF-03 | logger levels initialized from Config | Unit | Jest | [src/test/logger_config.test.ts](../src/test/logger_config.test.ts) |
| TC-CONF-04 | apiVersion query | Unit | Jest | [src/test/misc_resolvers.test.ts](../src/test/misc_resolvers.test.ts) |
| TC-CONF-05 | login query | Unit | Jest | [src/test/misc_resolvers.test.ts](../src/test/misc_resolvers.test.ts) |
| TC-CONF-06 | logout query | Unit | Jest | [src/test/misc_resolvers.test.ts](../src/test/misc_resolvers.test.ts) |
| TC-CONF-07 | Parse Zabbix Args | Unit | Jest | [src/test/zabbix_api_args_parser.test.ts](../src/test/zabbix_api_args_parser.test.ts) |
| TC-DOCS-01 | Zabbix Docs Samples Integration | Integration | Jest | [src/test/zabbix_docs_samples.test.ts](../src/test/zabbix_docs_samples.test.ts) |
| TC-MCP-01 | MCP Operations Validation | Integration | Jest | [src/test/mcp_operations_validation.test.ts](../src/test/mcp_operations_validation.test.ts) |
| TC-E2E-01 | Run complete smoketest | E2E | GraphQL / MCP | [mcp/operations/runSmoketest.graphql](../mcp/operations/runSmoketest.graphql) |
| TC-E2E-02 | Run all regression tests | E2E | GraphQL / MCP | [mcp/operations/runAllRegressionTests.graphql](../mcp/operations/runAllRegressionTests.graphql) |

## 📝 Test Case Obligations

As per project guidelines, every new feature or bug fix must be accompanied by a described test case in this specification.

- **Feature**: A new feature must have a corresponding test case (TC) defined before implementation.
- **Bug Fix**: A bug fix must include a reproduction test case that fails without the fix and passes with it. Additionally, a permanent regression test must be added to the automated suite (e.g., `RegressionTestExecutor`) to prevent the issue from re-occurring.
- **Documentation**: The `docs/tests.md` file must be updated to reflect any changes in test coverage.
- **Categorization**: Tests must be categorized as Unit, Integration, or End-to-End (E2E).
