# Project Guidelines

This document provides concise information and best practices for developers working on the Zabbix GraphQL API project.

### Environment
- **Operating System:** Windows with WSL + Ubuntu installed.
- **Commands:** Always execute Linux commands (e.g. use `ls` instead of `dir`).


## Tech Stack
- **Runtime**: Node.js (v24+)
- **Language**: TypeScript (ESM)
- **API**: GraphQL (Apollo Server 4)
- **Testing**: Jest
- **Deployment**: Docker

## Project Structure
- `src/api/`: GraphQL server configuration, schema loading, and root resolvers (see `createResolvers` in `resolvers.ts`).
- `src/datasources/`: Modular classes for interacting with various Zabbix API components (hosts, items, etc.).
- `src/execution/`: Business logic for complex, multi-step operations (importers, exporters, deleters).
- `src/model/`: Shared data models and enumerations.
- `src/test/`: Unit and integration tests.
- `schema/`: GraphQL Schema Definition Language (SDL) files.

## Common Scripts
- `npm run start`: Launches the development server with `tsx` and `nodemon` for hot-reloading.
- `npm run test`: Executes the Jest test suite.
- `npm run codegen`: Generates TypeScript types based on the GraphQL schema definitions.
- `npm run compile`: Compiles TypeScript source files into the `dist/` directory.
- `npm run prod`: Prepares the schema and runs the compiled production build.

## Best Practices & Standards
- **ESM & Imports**: The project uses ECMAScript Modules (ESM). Always use the `.js` extension when importing local files (e.g. `import { Config } from "../common_utils.js";`), even though the source files are `.ts`.
- **Configuration**: Always use the `Config` class to access environment variables. Avoid direct `process.env` calls.
- **Type Safety**: Leverage types generated via `npm run codegen` for resolvers and data handling to ensure consistency with the schema.
- **Import Optimization**: 
    - Always optimize imports before committing. 
    - Project setting `OPTIMIZE_IMPORTS_BEFORE_PROJECT_COMMIT` is enabled.
- **Modular Datasources**: When adding support for new Zabbix features, create a new datasource class in `src/datasources/` extending `ZabbixRESTDataSource`.
- **Schema Organization**: Place GraphQL SDL files in the `schema/` directory. Use descriptive comments in SDL as they are used for API documentation.
- **Testing**: Write reproduction tests for bugs and cover new features with both unit and integration tests in `src/test/`.
- **Grammar & Style**: Avoid using a comma after "e.g." or "i.e." (e.g. use "e.g. example" instead of "e.g., example").

### Git Standards
- **Commit Messages:** Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `style:`).
    - If a commit is complex and covers different aspects, the message **must** always contain a detailed list of what was changed within the optional "body" section, in addition to the short "description" in the header.
