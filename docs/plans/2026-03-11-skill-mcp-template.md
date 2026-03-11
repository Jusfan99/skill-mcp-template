# skill-mcp-template 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建一个 GitHub Template 仓库，让开发者能快速构建 OpenClaw / Claude Code / Cursor 可用的 Skill + MCP Server + API 集成方案。

**Architecture:** 三层解耦架构 — SKILL.md（交互层）→ MCP Server index.ts（工具层）→ client.ts（数据层）。内置 Open-Meteo 天气 API demo，用户替换三个文件即可构建自己的服务。

**Tech Stack:** TypeScript, @modelcontextprotocol/sdk, zod, Node.js fetch, Open-Meteo API

---

## 前置准备

```bash
# 创建项目目录（与 hot-radar-mcp 同级）
mkdir ~/skill-mcp-template && cd ~/skill-mcp-template
git init
```

---

### Task 1: 初始化项目骨架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

**Step 1: 创建 package.json**

```json
{
  "name": "skill-mcp-template",
  "version": "0.1.0",
  "description": "Template for building OpenClaw Skills + MCP Servers. Clone → customize → deploy.",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch"
  },
  "keywords": ["mcp", "openclaw", "skill", "template"],
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

**Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: 创建 .gitignore**

```
node_modules/
dist/
.env
```

**Step 4: 安装依赖**

Run: `pnpm install` (或 `npm install`)
Expected: 依赖安装成功，生成 node_modules/ 和 lockfile

**Step 5: Commit**

```bash
git add package.json tsconfig.json .gitignore pnpm-lock.yaml
git commit -m "chore: init project skeleton with MCP SDK + zod"
```

---

### Task 2: 实现数据层 (client.ts)

**Files:**
- Create: `src/client.ts`

**参考 API（已验证可用）：**
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=Beijing&count=5`
- Current weather: `https://api.open-meteo.com/v1/forecast?latitude=39.9075&longitude=116.3972&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
- Forecast: `https://api.open-meteo.com/v1/forecast?latitude=39.9075&longitude=116.3972&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=3`

**Step 1: 创建 src/client.ts**

```typescript
// TODO: Replace this file with your own API client
// This demo uses Open-Meteo weather API (free, no API key needed)
// See: https://open-meteo.com/en/docs

// TODO: Change to your API's base URL
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";
const WEATHER_URL = "https://api.open-meteo.com/v1";

// --- Type Definitions ---
// TODO: Replace with your own response types

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // province/state
}

export interface CurrentWeather {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

export interface DayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
}

export interface Forecast {
  city: string;
  country: string;
  days: DayForecast[];
}

// --- Helper ---

async function fetchJSON<T>(url: string, timeoutMs = 5000): Promise<T> {
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }
  return resp.json() as Promise<T>;
}

// WMO Weather Code → description
// https://open-meteo.com/en/docs#weathervariables
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function weatherDescription(code: number): string {
  return WEATHER_CODES[code] ?? `Unknown (code ${code})`;
}

// --- API Functions ---
// TODO: Replace these functions with your own API calls

export async function searchCities(keyword: string): Promise<City[]> {
  interface GeoResponse {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country: string;
      admin1?: string;
    }>;
  }

  const url = `${GEOCODING_URL}/search?name=${encodeURIComponent(keyword)}&count=5&language=en`;
  const data = await fetchJSON<GeoResponse>(url);

  return (data.results ?? []).map((r) => ({
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export async function getWeather(city: string): Promise<CurrentWeather> {
  const cities = await searchCities(city);
  if (cities.length === 0) {
    throw new Error(`City not found: ${city}`);
  }
  const { name, latitude, longitude, country } = cities[0];

  interface WeatherResponse {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      weather_code: number;
    };
  }

  const url =
    `${WEATHER_URL}/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&timezone=auto`;
  const data = await fetchJSON<WeatherResponse>(url);

  return {
    city: name,
    country,
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    description: weatherDescription(data.current.weather_code),
  };
}

export async function getForecast(
  city: string,
  days: number = 3
): Promise<Forecast> {
  const cities = await searchCities(city);
  if (cities.length === 0) {
    throw new Error(`City not found: ${city}`);
  }
  const { name, latitude, longitude, country } = cities[0];

  interface ForecastResponse {
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      weather_code: number[];
    };
  }

  const url =
    `${WEATHER_URL}/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=auto&forecast_days=${days}`;
  const data = await fetchJSON<ForecastResponse>(url);

  return {
    city: name,
    country,
    days: data.daily.time.map((date, i) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[i],
      minTemp: data.daily.temperature_2m_min[i],
      description: weatherDescription(data.daily.weather_code[i]),
    })),
  };
}
```

**Step 2: 验证编译**

Run: `pnpm build`
Expected: 编译成功，生成 `dist/client.js` 和 `dist/client.d.ts`

**Step 3: Commit**

```bash
git add src/client.ts
git commit -m "feat: add weather API client (Open-Meteo demo)"
```

---

### Task 3: 实现 MCP Server (index.ts)

**Files:**
- Create: `src/index.ts`

**Step 1: 创建 src/index.ts**

```typescript
// TODO: Replace tool definitions with your own MCP tools
// This demo registers 3 weather-related tools
// See: https://modelcontextprotocol.io/docs/concepts/tools

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchCities, getWeather, getForecast } from "./client.js";

// TODO: Change server name and version
const server = new McpServer({
  name: "weather",       // TODO: your server name
  version: "0.1.0",
});

// --- Tool 1: search_cities ---
// TODO: Replace with your own tool

server.tool(
  "search_cities",
  "Search for cities by name. Returns matching cities with coordinates.",
  {
    keyword: z.string().describe("City name to search for"),
  },
  async ({ keyword }) => {
    const cities = await searchCities(keyword);
    return {
      content: [{ type: "text", text: JSON.stringify(cities, null, 2) }],
    };
  }
);

// --- Tool 2: get_weather ---
// TODO: Replace with your own tool

server.tool(
  "get_weather",
  "Get current weather for a city. Returns temperature, humidity, wind speed, and conditions.",
  {
    city: z.string().describe("City name (e.g. 'Beijing', 'Tokyo', 'New York')"),
  },
  async ({ city }) => {
    const weather = await getWeather(city);
    return {
      content: [{ type: "text", text: JSON.stringify(weather, null, 2) }],
    };
  }
);

// --- Tool 3: get_forecast ---
// TODO: Replace with your own tool

server.tool(
  "get_forecast",
  "Get weather forecast for a city. Returns daily max/min temperature and conditions.",
  {
    city: z.string().describe("City name"),
    days: z
      .number()
      .min(1)
      .max(16)
      .default(3)
      .describe("Number of forecast days (1-16, default 3)"),
  },
  async ({ city, days }) => {
    const forecast = await getForecast(city, days);
    return {
      content: [{ type: "text", text: JSON.stringify(forecast, null, 2) }],
    };
  }
);

// --- Start Server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Server error:", err);
  process.exit(1);
});
```

**Step 2: 验证编译**

Run: `pnpm build`
Expected: 编译成功，生成 `dist/index.js`

**Step 3: 本地冒烟测试**

Run: `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}' | node dist/index.js`
Expected: 返回包含 `"result"` 的 JSON（不报错即可）

**Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: add MCP server with weather tools"
```

---

### Task 4: 创建 OpenClaw Skill 定义

**Files:**
- Create: `skill/SKILL.md`

**Step 1: 创建 skill/SKILL.md**

```markdown
---
name: weather-assistant
description: 天气助手。查询全球城市实时天气、未来天气预报，支持城市搜索。
metadata: {"openclaw":{"emoji":"🌤️","requires":{"bins":["mcporter"]}}}
---

# 天气助手 (Weather Assistant)

你是一个天气助手，帮助用户查询全球城市的天气信息。通过 mcporter 调用 weather MCP server 获取数据。

## 重要：数据获取方式

**必须通过 mcporter 命令获取数据，不要使用 web_fetch 抓取网页。**

通过 bash 执行 mcporter 命令调用 MCP tools。如果 mcporter 不在 PATH 中，先设置 PATH：

` ``bash
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/opt/homebrew/opt/node@22/bin:$PATH"
` ``

### 可用 Tools

` ``bash
# 查指定城市当前天气
mcporter call 'weather.get_weather(city:"Beijing")'

# 查未来 N 天天气预报
mcporter call 'weather.get_forecast(city:"Beijing", days:3)'

# 搜索城市
mcporter call 'weather.search_cities(keyword:"shanghai")'
` ``

## 用户交互模式

### 1. 查天气

当用户说「天气」「北京天气」「今天热吗」等，调用 `weather.get_weather(city:"城市名")`，输出：

` ``
🌤️ 北京天气

🌡️ 温度：15.2°C
💧 湿度：42%
💨 风速：8.3 km/h
☁️ 天气：Partly cloudy

---
💡 你可以：
• 说「未来三天」查看天气预报
• 说「上海天气」查其他城市
` ``

### 2. 天气预报

当用户说「明天天气」「未来三天」「这周天气」等，调用 `weather.get_forecast(city:"城市名", days:N)`，输出：

` ``
📅 北京未来 3 天天气预报

| 日期 | 最高温 | 最低温 | 天气 |
|------|--------|--------|------|
| 3/11 | 18°C | 6°C | ☀️ Clear sky |
| 3/12 | 15°C | 4°C | ⛅ Partly cloudy |
| 3/13 | 12°C | 3°C | 🌧️ Slight rain |

---
💡 你可以说「未来 7 天」查看更长预报
` ``

### 3. 城市搜索

当用户提到的城市名有歧义时，先调用 `weather.search_cities(keyword:"城市名")` 确认城市，再查天气。

## 输出原则

1. **使用中文输出**
2. **温度单位用 °C**
3. **简洁直接**，不需要寒暄
4. **每次输出末尾带下一步提示**
```

> **Note:** SKILL.md 中的 ` `` 在实际文件中应为三个反引号。上面为避免 markdown 嵌套问题做了转义。

**Step 2: Commit**

```bash
git add skill/SKILL.md
git commit -m "feat: add OpenClaw weather assistant skill"
```

---

### Task 5: 创建配置文件

**Files:**
- Create: `config/mcporter.json`
- Create: `.env.example`

**Step 1: 创建 config/mcporter.json**

```json
{
  "name": "weather",
  "command": "node",
  "args": ["dist/index.js"],
  "description": "Weather MCP Server (Open-Meteo demo)",
  "env": {}
}
```

**Step 2: 创建 .env.example**

```bash
# TODO: Add your API keys here
# This demo uses Open-Meteo which requires no API key.
# Example:
# MY_API_KEY=your_api_key_here
# MY_API_URL=https://api.example.com
```

**Step 3: Commit**

```bash
git add config/mcporter.json .env.example
git commit -m "feat: add mcporter config and env template"
```

---

### Task 6: 创建安装脚本

**Files:**
- Create: `install.sh`

**Step 1: 创建 install.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- Step 1: Install dependencies ---
info "Installing dependencies..."
if command -v pnpm &>/dev/null; then
  pnpm install
elif command -v npm &>/dev/null; then
  npm install
else
  error "Neither pnpm nor npm found. Please install Node.js first."
fi

# --- Step 2: Build ---
info "Building TypeScript..."
npx tsc
info "Build complete: dist/"

# --- Step 3: Read config ---
SERVER_NAME=$(node -e "console.log(require('./config/mcporter.json').name)")
info "Server name: $SERVER_NAME"

# --- Step 4: Register MCP Server with mcporter (optional) ---
if command -v mcporter &>/dev/null; then
  info "Registering MCP server with mcporter..."
  mcporter add "$SERVER_NAME" --command "node" --args "$SCRIPT_DIR/dist/index.js"
  info "MCP server registered: $SERVER_NAME"
else
  warn "mcporter not found. Skipping MCP registration."
  warn "To use with Claude Code, add to your MCP config manually:"
  echo ""
  echo "  {\"mcpServers\":{\"$SERVER_NAME\":{\"command\":\"node\",\"args\":[\"$SCRIPT_DIR/dist/index.js\"]}}}"
  echo ""
fi

# --- Step 5: Install Skill (optional) ---
SKILL_DIR="$HOME/.openclaw/skills/$SERVER_NAME"
SKILL_FILE="$SCRIPT_DIR/skill/SKILL.md"

if [ -f "$SKILL_FILE" ]; then
  info "Installing OpenClaw skill to $SKILL_DIR..."
  mkdir -p "$SKILL_DIR"
  cp "$SKILL_FILE" "$SKILL_DIR/SKILL.md"
  info "Skill installed: $SKILL_DIR/SKILL.md"
else
  warn "No skill/SKILL.md found. Skipping skill installation."
fi

# --- Done ---
echo ""
info "✅ Setup complete!"
echo ""
echo "  Test with:  echo '{\"method\":\"tools/list\"}' | node dist/index.js"
echo ""
if command -v mcporter &>/dev/null; then
  echo "  mcporter:   mcporter call '$SERVER_NAME.get_weather(city:\"Beijing\")'"
fi
echo ""
```

**Step 2: 设置可执行权限**

Run: `chmod +x install.sh`

**Step 3: Commit**

```bash
git add install.sh
git commit -m "feat: add one-click install script"
```

---

### Task 7: 创建 README.md

**Files:**
- Create: `README.md`

**Step 1: 创建 README.md**

````markdown
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
````

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with architecture diagram and quickstart"
```

---

### Task 8: 端到端测试

**Step 1: 全量构建**

Run: `pnpm build`
Expected: 编译成功，无错误

**Step 2: 测试 MCP 初始化**

Run: `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}' | node dist/index.js`
Expected: 返回 `{"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"weather","version":"0.1.0"}}}`

**Step 3: 测试 get_weather (通过 mcporter 或直接 JSON-RPC)**

如果有 mcporter:
Run: `mcporter call 'weather.get_weather(city:"Beijing")'`
Expected: 返回 JSON，包含 temperature, humidity, windSpeed, description

如果没有 mcporter（直接 JSON-RPC）:
```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_weather","arguments":{"city":"Beijing"}}}' | node dist/index.js
```
Expected: 返回天气数据

**Step 4: 测试 install.sh**

Run: `bash install.sh`
Expected: 安装依赖、编译、注册 MCP server、安装 Skill，全程无报错

**Step 5: 最终 Commit**

```bash
git add -A
git commit -m "chore: ready for release"
```

---

### Task 9: GitHub Template 配置

**Step 1: 创建 GitHub 仓库**

Run: `gh repo create skill-mcp-template --public --source=. --push`

**Step 2: 设置为 Template**

Run: `gh api -X PATCH repos/{owner}/skill-mcp-template -f is_template=true`

**Step 3: 验证**

打开 GitHub 页面，确认出现 "Use this template" 按钮。

---

## 任务总览

| Task | 内容 | 预估文件数 |
|------|------|-----------|
| 1 | 项目骨架（package.json, tsconfig, gitignore） | 3 |
| 2 | 数据层 client.ts（Open-Meteo API） | 1 |
| 3 | MCP Server index.ts（3 个 tools） | 1 |
| 4 | OpenClaw Skill SKILL.md | 1 |
| 5 | 配置文件（mcporter.json, .env.example） | 2 |
| 6 | 安装脚本 install.sh | 1 |
| 7 | README.md | 1 |
| 8 | 端到端测试 | 0 |
| 9 | GitHub Template 配置 | 0 |
