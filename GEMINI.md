# Local Agent Instructions (MAS/ICM/RTK/MCP)

> **CRITICAL CONTEXT**: All instructions and state are in `docs/` and `agents/`. ALWAYS read `docs/mempalace.md` first.

## Core Mandates
1. **RTK Proxy**: ALWAYS prefix shell commands with `rtk` (e.g., `rtk npm run test`).
2. **Pipeline Workflow**: For complex, multi-stage tasks, use numbered folders in `pipelines/`.
3. **Skill Design**: New skills must follow the 60/30/10 rule (see global `TEMPLATE.md`).

## Context Routing
- Memory: `.agent/memory/` (Scratchpad)
- Roster: `agents/AGENTS.md` (Workers)
- Config: `mcp-configs/registry.md` (Tools)

<!-- Imported from: agents/AGENTS.md -->
