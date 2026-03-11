<h1 align="center">🧩 skill-mcp-template</h1>

<p align="center">
  <strong>Build your own Skill + MCP Server in minutes.<br>
  Clone → Replace 3 files → Deploy.</strong>
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick_Start-3_min-blue?style=for-the-badge" alt="Quick Start"></a>
  <a href="#-built-in-demo-weather"><img src="https://img.shields.io/badge/Demo-Weather_API-green?style=for-the-badge" alt="Demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MCP-SDK_1.x-purple?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDdWMTdMMTIgMjJMMjAgMTdWN0wxMiAyWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+" alt="MCP SDK">
  <img src="https://img.shields.io/badge/zod-Validation-orange?logo=zod&logoColor=white" alt="Zod">
  <img src="https://img.shields.io/badge/stdio-Transport-blueviolet" alt="stdio">
</p>

<p align="center">A GitHub template for building <strong>OpenClaw / Claude Code / Cursor</strong> compatible Skill + MCP Server + API integrations.</p>

---

## 🤔 Why This Template?

Building an MCP Server from scratch means wiring up transport, schema validation, error handling, and client integration — all before writing your first tool. This template gives you a **production-ready starting point** with clean separation of concerns.

<table>
<tr>
<td width="33%">

### 🎯 3-Layer Architecture
Interaction (SKILL.md) → Tool (MCP Server) → Data (API Client). Each layer is independently replaceable.

</td>
<td width="33%">

### ⚡ Zero Config
One `./install.sh` handles dependencies, build, MCP registration, and skill installation.

</td>
<td width="33%">

### 🔌 Universal Compatibility
Works with OpenClaw, Claude Code, Cursor, Windsurf, and any MCP-compatible client via stdio.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  SKILL.md (Interaction Layer)               │
│  • User intent → tool call mapping          │
│  • Output formatting templates              │
│  • Natural language trigger patterns         │
├─────────────────────────────────────────────┤
│  MCP Server - index.ts (Tool Layer)         │
│  • Tool registration + zod schema           │
│  • stdio transport (universal MCP compat)   │
├─────────────────────────────────────────────┤
│  Client - client.ts (Data Layer)            │
│  • HTTP calls to external APIs              │
│  • Type definitions + error handling        │
│  • Pure logic, zero MCP dependency          │
└─────────────────────────────────────────────┘
              ↕ HTTP (fetch)
        [ External API / Data Source ]
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** or **npm**

### Step 1: Create from Template

Click **"Use this template"** on GitHub, or:

```bash
git clone https://github.com/Jusfan99/skill-mcp-template.git my-mcp-server
cd my-mcp-server
```

### Step 2: Install & Build

```bash
./install.sh
```

### Step 3: Verify

```bash
# Test MCP server initialization
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}' | node dist/index.js

# Or with mcporter
mcporter call 'weather.get_weather(city:"Beijing")'
```

---

## 🌤️ Built-in Demo: Weather

This template ships with a fully working weather demo using [Open-Meteo API](https://open-meteo.com/) (free, no API key needed).

| Tool | Parameters | Description |
|------|-----------|-------------|
| `get_weather` | `city: string` | Current weather — temperature, humidity, wind, conditions |
| `get_forecast` | `city: string`, `days?: number` | N-day forecast (default 3, max 16) |
| `search_cities` | `keyword: string` | Search cities by name with coordinates |

<details>
<summary><strong>Example Output</strong></summary>

```json
{
  "city": "Beijing",
  "country": "China",
  "temperature": 15.2,
  "humidity": 42,
  "windSpeed": 8.3,
  "description": "Partly cloudy"
}
```

</details>

---

## ✨ Customize in 3 Steps

Replace 3 files to build your own service. That's it.

### Step 1: Replace `src/client.ts` — Data Layer

Swap the weather API calls with your own data source:

```typescript
const API_URL = process.env.MY_API_URL || "https://api.example.com";

export async function getMyData(param: string): Promise<MyType> {
  const resp = await fetch(`${API_URL}/endpoint?q=${param}`);
  return resp.json();
}
```

### Step 2: Replace tools in `src/index.ts` — Tool Layer

Register your own MCP tools with zod parameter validation:

```typescript
server.tool(
  "my_tool",
  "Description of what this tool does",
  { param: z.string().describe("Parameter description") },
  async ({ param }) => {
    const data = await getMyData(param);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  }
);
```

### Step 3: Replace `skill/SKILL.md` — Interaction Layer

Write your own OpenClaw Skill with trigger patterns and output format.

---

## 🔌 Compatibility

<table>
<tr>
<th align="center">Client</th>
<th align="center">Setup</th>
</tr>
<tr>
<td align="center"><strong>OpenClaw</strong> (via mcporter)</td>
<td><code>./install.sh</code> handles everything</td>
</tr>
<tr>
<td align="center"><strong>Claude Code</strong></td>
<td>Add to <code>.claude/mcp.json</code></td>
</tr>
<tr>
<td align="center"><strong>Cursor / Windsurf</strong></td>
<td>Add to MCP config</td>
</tr>
<tr>
<td align="center"><strong>Any MCP Client</strong></td>
<td>stdio transport, universal</td>
</tr>
</table>

<details>
<summary><strong>Claude Code config example</strong></summary>

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/skill-mcp-template/dist/index.js"]
    }
  }
}
```

</details>

---

## 📂 Project Structure

```
skill-mcp-template/
├── src/
│   ├── client.ts              # 📊 Data layer: API client (replace me)
│   └── index.ts               # 🔧 Tool layer: MCP server (replace me)
├── skill/
│   └── SKILL.md               # 💬 Interaction layer: Skill definition (replace me)
├── config/
│   └── mcporter.json          # ⚙️ mcporter registration config
├── install.sh                 # 🚀 One-click install script
├── .env.example               # 🔑 Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📖 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

**skill-mcp-template** — *From API to Agent-ready in minutes.*

<sub>3 files to replace | stdio transport | Universal MCP compatibility</sub>

</div>
