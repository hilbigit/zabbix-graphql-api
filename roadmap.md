# 🗺️ Roadmap

This document outlines the achieved milestones and planned enhancements for the Zabbix GraphQL API project.

## ✅ Achieved Milestones
- **🎯 VCR Product Integration**:
  - Developed a specialized **GraphQL API** as part of the VCR Product. This enables the use of **Zabbix** as a robust base for monitoring and controlling **IoT devices**.
  - *First use case*: Control of mobile traffic jam warning installations on **German Autobahns**.

- **🔓 Open Source Extraction & AI Integration**:
  - Extracted the core functionality of the API to publish it as an **Open Source** project.
  - Enhanced it with **Model Context Protocol (MCP)** and **AI agent** integration to enable workflow and agent-supported use cases within the VCR or other applications.

## 📅 Planned Enhancements
- **📦 CI/CD & Package Publishing**:
  - Build and publish the API as an **npm package** as part of the `.forgejo` workflow to simplify distribution and updates.

- **🧱 Flexible Usage by publishing to [npmjs.com](https://www.npmjs.com/)**:
  - Transform the package into a versatile tool that can be used either **standalone** or as a **core library**, allowing other projects to include and extend it easily.

- **🧩 Extension Project**: `zabbix-graphql-api-problems`
  - Create the first official extension, `zabbix-graphql-api-problems`
  - Add support for **problem and trigger-related** queries. This will leverage **MCP + AI agents** to automatically react to Zabbix problems within external workflows.
