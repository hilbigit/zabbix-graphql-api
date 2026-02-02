# 🏗️ Trade Fair Logistics Requirements

This document outlines the requirements for extending the Zabbix GraphQL API to support trade fair logistics, derived from the analysis of the "KI-gestützte Orchestrierung in der Messelogistik" (AI-supported orchestration in trade fair logistics) pilot at Koelnmesse.

## 📋 Project Context
The goal is to use the **Virtual Control Room (VCR)** as an orchestration platform to improve punctuality, throughput, and exception handling in trade fair logistics.

## 🛠️ Key Use Cases

- **Slot Risk Scoring & Proactive Rescheduling**:
  - *Description*: Proactive detection of missed delivery slots using ETAs and historical data.
  - *AI Function*: Calculates slot-miss risk and suggests next best actions (e.g. shift slot, alternative gate).
  - *Zabbix Role*: Monitoring ETA vs. Slot time, triggering alerts on high risk.

- **Exception Copilot for Dispatch & Gate**:
  - *Description*: Standardized workflows (Playbooks) for managing arrival deviations (e.g. no slot, wrong gate, missing documents).
  - *AI Function*: Classifies exceptions and provides communication templates.
  - *Zabbix Role*: Capturing exception events as triggers and managing the resolution state.

- **Multilingual Driver Assistant**:
  - *Description*: Step-by-step instructions for drivers on-site to reduce misunderstandings and wrong turns.
  - *Zabbix Role*: Providing real-time status updates (e.g. "Gate 4 is ready for you") to external communication interfaces.

- **Handling Readiness (Stapler/Personal/Rampe)**:
  - *Description*: Coordinating truck arrivals with the availability of handling resources like forklifts and ramps.
  - *Zabbix Role*: Monitoring the status and capacity of logistics assets and personnel.

- **VCR Setup Copilot**:
  - *Description*: Template-based configuration to scale the VCR for different venues (e.g. Koelnmesse, Düsseldorf) and varying event rules.
  - *Zabbix Role*: Management of venue-specific and event-specific host groups and templates.

## ⚙️ Technical Requirements for the API

- **Dynamic Device Modeling**:
  - Support for complex **Delivery** entities as Zabbix hosts.
  - Inclusion of dynamic attributes such as Slot-ID, ETA, and Gate assignments.

- **Hierarchical Data Mapping**:
  - Mapping nested logistics data (e.g. cargo details, handling status) to hierarchical Zabbix item structures.
  - Use of tags for classification and filtering of logistics tasks.

- **Real-time Telemetry Integration**:
  - High-frequency ingestion of GPS and sensor data (e.g. temperature, shock) from mobile tracking devices.
  - Support for Zabbix trapper items to receive external push updates.

- **AI-Integration Hooks**:
  - Enable external AI systems to push "Risk Scores" and "Next Best Actions" into Zabbix.
  - Use of Zabbix triggers to orchestrate AI-driven suggestions.

- **Workflow Orchestration**:
  - Ability to trigger external actions (e.g. sending notifications to drivers, creating tickets) based on Zabbix triggers.
  - Integration with the Model Context Protocol (MCP) to allow AI agents to manage logistics exceptions.

- **Multi-Venue Templates**:
  - Provision of reusable template structures for different exhibition centers and recurring events.
  - Support for bulk import/export of venue-specific configurations.

## ✅ KPIs for Success Measurement

- **Slot Hit Rate**: Percentage of vehicles arriving within their booked time window.
- **P22-Quote**: Frequency of vehicles needing to be redirected to waiting areas (P22).
- **Gate Waiting Time**: Average time from arrival at the venue to successful check-in.
- **Throughput**: Number of vehicles processed per gate/hour.
- **Average Handle Time (AHT)**: Mean time to resolve a logistics exception/ticket.
- **First Contact Resolution**: Rate of exceptions resolved without further escalation.

## 🔗 References
- **Analysis Document**: [docs/KI für Event- und Messelogistik.pdf](../KI%20f%C3%BCr%20Event-%20und%20Messelogistik.pdf)
- **Roadmap**: [roadmap.md](../../roadmap.md)
