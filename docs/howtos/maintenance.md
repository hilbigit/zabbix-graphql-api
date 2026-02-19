# Technical Maintenance Guide

This guide covers the technical aspects of maintaining and developing the Zabbix GraphQL API.

## 🛠️ Development & Maintenance Tasks

### Code Generation

The project uses [GraphQL Codegen](https://the-guild.dev/graphql/codegen) to generate TypeScript types from the GraphQL schema. This ensures type safety and consistency between the schema and the implementation.

- **Configuration**: `codegen.ts`
- **Generated Output**: `src/schema/generated/graphql.ts`

#### How to Regenerate Types
Whenever you modify any `.graphql` files in the `schema/` directory, you must regenerate the TypeScript types.

For a one-off update (e.g. in a script or before commit):
```bash
npx graphql-codegen --config codegen.ts
```

If you are a developer and want to watch for schema changes continuously:
```bash
npm run codegen
```

### Testing

We use [Jest](https://jestjs.io/) for unit and integration testing.

- **Test Directory**: `src/test/`
- **Execution**:
  ```bash
  npm run test
  ```

#### Local Development Setup
For running integration tests against a real Zabbix instance, it is recommended to use the [Local Development Environment](./local_development.md). This setup allows you to test the API against specific Zabbix versions (e.g. 6.4, 7.0) in an isolated way.

#### Adding New Tests
- **Location**: Place new test files in `src/test/` with the `.test.ts` extension.
- **Coverage**: Ensure you cover both successful operations and error scenarios.
- **Test Specification**: Every new test must be documented in the [Test Specification](../testcases/tests.md).
- **Best Practice**: If you find a bug, first create a reproduction test in `src/test/` to verify the fix.

## 🔄 Updating Dependencies

To keep the project secure and up-to-date:

1. Check for updates: `npm outdated`
2. Update packages: `npm update`
3. Verify with tests: `npm run test`

## 🐳 Docker Image Maintenance

The `Dockerfile` uses a multi-stage build to keep the production image small and secure.

- **Base Image**: Node 24 (LTS)
- **Build Argument**: `API_VERSION` (used to embed the version into the image)

To build a fresh image locally:
```bash
docker build -t zabbix-graphql-api --build-arg API_VERSION=$(git describe --tags --always) .
```

---
**Related Reference**: [Project Configuration Reference](../../README.md#configuration)
**Related Cookbook**: [Extending the Schema](./cookbook.md#recipe-extending-schema-with-a-new-device-type)
