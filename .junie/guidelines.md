# Project Guidelines

This document provides concise information and best practices for developers working on the Zabbix GraphQL API project.

## Roadmap
The [Roadmap](../roadmap.md) is to be considered as outlook giving constraints on architectural and design decisions for current work on the project.

### Environment
- **Operating System**: Windows with WSL + Ubuntu installed.
- **Commands**: Always execute Linux commands (e.g. use `ls` instead of `dir`) and use `docker compose` (without hyphen) instead of `docker-compose`.


## Tech Stack
- **Runtime**: Node.js (v24+)
- **Language**: TypeScript (ESM)
- **API**: GraphQL (Apollo Server 4)
- **Testing**: Jest
- **Deployment**: Docker (v27+) and Docker Compose (v2.29+)

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
- `npm run codegen`: Starts GraphQL Codegen in watch mode (for continuous development).
- `npx graphql-codegen --config codegen.ts`: Generates TypeScript types once (use this for one-off updates).
- `npm run compile`: Compiles TypeScript source files into the `dist/` directory.
- `npm run prod`: Prepares the schema and runs the compiled production build.

## Best Practices & Standards
- **ESM & Imports**: The project uses ECMAScript Modules (ESM). Always use the `.js` extension when importing local files (e.g. `import { Config } from "../common_utils.js";`), even though the source files are `.ts`.
- **Configuration**: Always use the `Config` class to access environment variables. Avoid direct `process.env` calls.
- **Type Safety**: Leverage types generated via `npx graphql-codegen --config codegen.ts` (or `npm run codegen` for watch mode) for resolvers and data handling to ensure consistency with the schema.
- **Import Optimization**: 
    - Always optimize imports before committing. 
    - Project setting `OPTIMIZE_IMPORTS_BEFORE_PROJECT_COMMIT` is enabled.
- **Modular Datasources**: When adding support for new Zabbix features, create a new datasource class in `src/datasources/` extending `ZabbixRESTDataSource`.
- **Schema Organization**: Place GraphQL SDL files in the `schema/` directory. Use descriptive comments in SDL as they are used for API documentation.
- **Testing**: Write reproduction tests for bugs and cover new features with both unit and integration tests in `src/test/`.
- **Grammar & Style**: Avoid using a comma after "e.g." or "i.e." (e.g. use "e.g. example" instead of "e.g., example").

## Verification & Deployment
- **Pre-commit Verification**: Always add a verification stage to your plan before committing.
    - *Action*: Run the `Smoketest` tool using MCP to ensure basic functionality is intact.
    - *Action*: Monitor the API logs for errors after each service restart.
- **Environment Restart**: Always include a step to rebuild and restart the API and MCP server as a final check.
    - *Command*: `docker compose up -d --build`
    - *Requirement*: Ask the user if everything looks okay before executing the restart, and offer the option to skip this step.

### Documentation Style
- **Bullet Points**: Use bullet points instead of enumerations for lists to maintain consistency across all documentation.
- **Visual Style**: Use icons in headers and bold subjects for primary list items (e.g. `- **Feature**: Description`) to match the `README.md` style.
    - *Note*: Standardize colon placement (outside bold tags) for primary list items.
- **Sub-points**: Use indented bullet points for detailed descriptions or additional context.
    - *Format*: Use the `- *Subject*: Description` format for specific references or categorized sub-items (e.g. `- *Reference*: ...`).
    - *Format*: Use plain text for general descriptions that follow a primary list item.
- **Formatting**: Avoid extra blank lines between headers and list items.

## Documentation Templates

### Cookbook & Recipes
Follow this template for all cookbook entries to ensure consistency and AI-parsability.

#### Recipe Template
```markdown
## 🍳 Recipe: [Action-Oriented Title]

[Brief description of what this recipe achieves.]

### 📋 Prerequisites
- [Constraint 1]
- [Constraint 2]

### 🛠️ Step 1: [Preparation/Definition]
[Instructions for preparing data or environment.]

### ⚙️ Step 2: [Configuration/Settings]
[Instructions for configuring settings or environment variables.]

### 🚀 Step 3: [Execution/Action]
[The main GraphQL operation or command to execute.]

### ✅ Step 4: [Verification]
[How to verify that the operation was successful using a query or agent check.]
```

#### Standard Icons for Steps
- 🍳 **Recipe**: Main header icon.
- 📋 **Prerequisites**: Necessary conditions before starting.
- 🛠️ **Preparation**: Initial setup, data definition, or file creation.
- ⚙️ **Configuration**: Changes to settings, `.env`, or Zabbix UI.
- 🚀 **Execution**: The primary action or mutation.
- ✅ **Verification**: Result checking and outcome validation.
- 💡 **Tip/Alternative**: Helpful hints or alternative methods.
- 🤖 **AI/MCP**: Agent-specific instructions.

### Git Standards
- **Commit Messages:** Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `style:`).
    - If a commit is complex and covers different aspects, the message **must** always contain a detailed list of what was changed within the optional "body" section, in addition to the short "description" in the header.
- **Review & Approval**: Never commit changes automatically. Always present the proposed changes and the updated plan to the user for review. Allow the user to provide feedback or add tasks to the plan before proceeding with a commit.
