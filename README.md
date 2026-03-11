# skill-mcp-template

A template for building **OpenClaw Skills + MCP Servers** with external API integration.

```
┌─────────────────────────────────────────────┐
│  SKILL.md (Interaction Layer)               │
│  • User intent matching (triggers)          │
│  • Agent instructions for tool calls        │
│  • Output formatting templates              │
├─────────────────────────────────────────────┤
│  MCP Server - index.ts (Tool Layer)         │
│  • Register tools + zod schema validation   │
│  • stdio transport (universal MCP compat)   │
├─────────────────────────────────────────────┤
│  Client - client.ts (Data Layer)            │
│  • HTTP calls to external APIs              │
│  • Type definitions, error handling         │
│  • Pure business logic, no MCP dependency   │
└─────────────────────────────────────────────┘
         ↕ HTTP (fetch)
   [ External API / Data Source ]
```

## Quick Start

```bash
# 1. Clone (or "Use this template" on GitHub)
git clone https://github.com/YOUR_USERNAME/skill-mcp-template.git
cd skill-mcp-template

# 2. Install & build
./install.sh

# 3. Test
mcporter call 'weather.get_weather(city:"Beijing")'
```

## Built-in Demo: Weather

This template ships with a working weather demo using [Open-Meteo API](https://open-meteo.com/) (free, no API key needed).

| Tool | Parameters | Description |
|------|-----------|-------------|
| `get_weather` | `city: string` | Current weather (temperature, humidity, wind, conditions) |
| `get_forecast` | `city: string`, `days?: number` | N-day forecast (default 3, max 16) |
| `search_cities` | `keyword: string` | Search cities by name |

## Customize in 3 Steps

### Step 1: Replace `src/client.ts`

Swap the weather API calls with your own data source:

```typescript
// Your API client
const API_URL = process.env.MY_API_URL || "https://api.example.com";

export async function getMyData(param: string): Promise<MyType> {
  const resp = await fetch(`${API_URL}/endpoint?q=${param}`);
  return resp.json();
}
```

### Step 2: Replace tools in `src/index.ts`

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

### Step 3: Replace `skill/SKILL.md`

Write your own OpenClaw Skill with trigger patterns and output format.

## Compatibility

| Client | How to use |
|--------|-----------|
| **OpenClaw** (via mcporter) | `./install.sh` handles everything |
| **Claude Code** | Add to `.claude/mcp.json` |
| **Cursor / Windsurf** | Add to MCP config |
| **Any MCP client** | stdio transport, universal |

### Claude Code config example

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

## Project Structure

```
skill-mcp-template/
├── src/
│   ├── client.ts          # Data layer: API client (demo: Open-Meteo weather)
│   └── index.ts           # Tool layer: MCP server (demo: weather tools)
├── skill/
│   └── SKILL.md           # Interaction layer: OpenClaw Skill (demo: weather assistant)
├── config/
│   └── mcporter.json      # mcporter config template
├── install.sh             # One-click install script
├── .env.example           # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
