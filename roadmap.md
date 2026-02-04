# 🗺️ Roadmap

This document outlines the achieved milestones and planned enhancements for the Zabbix GraphQL API project.

## ✅ Achieved Milestones
- **🎯 VCR Product Integration**: Developed a specialized **GraphQL API** as part of the VCR Product to enable the use of **Zabbix** as a robust base for monitoring and controlling **IoT devices**.
  - *First use case*: Control of mobile traffic jam warning installations on **German Autobahns**.

- **⚡ Query Optimization**: Optimized GraphQL API queries to reduce the amount of data fetched from Zabbix depending on the fields really requested.
  - *Implementation*: Added dynamic output selection and field pruning in `ZabbixRequest`.

- **🔓 Open Source Extraction & AI Integration**: Extracted the core functionality of the API to publish it as an **Open Source** project.
  - *AI Integration*: Enhanced with **Model Context Protocol (MCP)** and **AI agent** integration to enable workflow and agent-supported use cases.

- **🐳 Local Development Environment**: Integrated a complete Zabbix stack into the Docker Compose configuration using profiles.
  - *Feature*: Support for multiple Zabbix versions (6.2, 6.4, 7.0+) for development and testing.
  - *Implementation*: Added `zabbix-local` profile and `ZABBIX_VERSION` dynamic image tagging.

- **🔧 Multi-Version Compatibility**: Verified and enhanced support for Zabbix 6.2, 6.4, and 7.0 LTS.
  - *Feature*: Native support for separate template groups and automated permission propagation.
  - *Verification*: Full regression and smoketest suites passed across all mentioned versions. Support for Zabbix 6.0 was deprecated due to excessive API differences and required fallbacks.

## 📅 Planned Enhancements
- **🏗️ Trade Fair Logistics Use Case**: Extend the API to support trade fair logistics use cases by analyzing requirements from business stakeholders.
  - *Analysis*: Analysis of "Trade Fair Logistics" and derived [requirements document](docs/use-cases/trade-fair-logistics-requirements.md).
  - *Simulation*: 
    - Create mocked "real world sensor devices" relevant for the use case.
    - Create a sample device collecting relevant information from public APIs, e.g. weather conditions or traffic conditions at a given location.
    - Simulate the traffic conditions on the route by using the simulated sensor devices.
  - *Configuration*: Analyze a real-world transport and configure Zabbix by placing sensor devices at the right places of the route.

- **📦 CI/CD & Package Publishing**: Build and publish the API as an **npm package** as part of the `.forgejo` workflow to simplify distribution and updates.

- **🧱 Flexible Usage**: Transform the package into a versatile tool that can be used either **standalone** or as a **core library** (published to [npmjs.com](https://www.npmjs.com/)).

- **🧩 Extension Project**: Add support for **problem and trigger-related** queries through the `zabbix-graphql-api-problems` extension.
  - *AI Integration*: Leverage **MCP + AI agents** to automatically react to Zabbix problems within external workflows.
