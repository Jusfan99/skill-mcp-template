<h1 align="center">🧩 skill-mcp-template</h1>

<p align="center">
  <strong>几分钟构建你自己的 Skill + MCP Server。<br>
  克隆 → 替换 3 个文件 → 部署。</strong>
</p>

<p align="center">
  <a href="#-快速开始"><img src="https://img.shields.io/badge/快速开始-3_分钟-blue?style=for-the-badge" alt="快速开始"></a>
  <a href="#%EF%B8%8F-内置-demo天气查询"><img src="https://img.shields.io/badge/Demo-天气_API-green?style=for-the-badge" alt="Demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MCP-SDK_1.x-purple?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDdWMTdMMTIgMjJMMjAgMTdWN0wxMiAyWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+" alt="MCP SDK">
  <img src="https://img.shields.io/badge/zod-Validation-orange?logo=zod&logoColor=white" alt="Zod">
  <img src="https://img.shields.io/badge/stdio-Transport-blueviolet" alt="stdio">
</p>

<p align="center">一个 GitHub 模板，用于快速构建兼容 <strong>OpenClaw / Claude Code / Cursor</strong> 的 Skill + MCP Server + API 集成方案。</p>

<p align="center"><a href="README.md">English</a> | <strong>中文</strong></p>

---

## 🤔 为什么用这个模板？

从零构建 MCP Server 意味着你得先搞定传输协议、Schema 校验、错误处理和客户端集成——这些都是写第一个 tool 之前的事。这个模板给你一个**开箱即用的起点**，关注点清晰分离。

<table>
<tr>
<td width="33%">

### 🎯 三层解耦架构
交互层 (SKILL.md) → 工具层 (MCP Server) → 数据层 (API Client)。每层独立可替换。

</td>
<td width="33%">

### ⚡ 零配置
一个 `./install.sh` 搞定依赖安装、编译构建、MCP 注册和 Skill 安装。

</td>
<td width="33%">

### 🔌 全平台兼容
支持 OpenClaw、Claude Code、Cursor、Windsurf 以及任何兼容 MCP 协议的客户端（stdio 传输）。

</td>
</tr>
</table>

---

## 🏗️ 架构

```
┌─────────────────────────────────────────────┐
│  SKILL.md（交互层）                          │
│  • 用户意图 → tool 调用映射                   │
│  • 输出格式化模板                             │
│  • 自然语言触发模式                           │
├─────────────────────────────────────────────┤
│  MCP Server - index.ts（工具层）              │
│  • Tool 注册 + zod Schema 校验               │
│  • stdio 传输（通用 MCP 兼容）                │
├─────────────────────────────────────────────┤
│  Client - client.ts（数据层）                 │
│  • HTTP 调用外部 API                         │
│  • 类型定义 + 错误处理                        │
│  • 纯业务逻辑，零 MCP 依赖                    │
└─────────────────────────────────────────────┘
              ↕ HTTP (fetch)
        [ 外部 API / 数据源 ]
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **pnpm** 或 **npm**

### 第一步：从模板创建

点击 GitHub 上的 **"Use this template"** 按钮，或者：

```bash
git clone https://github.com/Jusfan99/skill-mcp-template.git my-mcp-server
cd my-mcp-server
```

### 第二步：安装 & 构建

```bash
./install.sh
```

### 第三步：验证

```bash
# 测试 MCP Server 初始化
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}' | node dist/index.js

# 或使用 mcporter
mcporter call 'weather.get_weather(city:"Beijing")'
```

---

## 🌤️ 内置 Demo：天气查询

模板内置了一个完整可用的天气查询 Demo，使用 [Open-Meteo API](https://open-meteo.com/)（免费，无需 API Key）。

| Tool | 参数 | 说明 |
|------|------|------|
| `get_weather` | `city: string` | 实时天气 — 温度、湿度、风速、天气状况 |
| `get_forecast` | `city: string`, `days?: number` | N 天天气预报（默认 3 天，最多 16 天） |
| `search_cities` | `keyword: string` | 按名称搜索城市，返回坐标 |

<details>
<summary><strong>示例输出</strong></summary>

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

## ✨ 三步定制你的服务

替换 3 个文件，构建你自己的服务。就这么简单。

### 第一步：替换 `src/client.ts` — 数据层

把天气 API 换成你自己的数据源：

```typescript
const API_URL = process.env.MY_API_URL || "https://api.example.com";

export async function getMyData(param: string): Promise<MyType> {
  const resp = await fetch(`${API_URL}/endpoint?q=${param}`);
  return resp.json();
}
```

### 第二步：替换 `src/index.ts` 中的 tools — 工具层

用 zod 参数校验注册你自己的 MCP tools：

```typescript
server.tool(
  "my_tool",
  "这个 tool 做什么的描述",
  { param: z.string().describe("参数说明") },
  async ({ param }) => {
    const data = await getMyData(param);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  }
);
```

### 第三步：替换 `skill/SKILL.md` — 交互层

编写你自己的 OpenClaw Skill，定义触发模式和输出格式。

---

## 🔌 兼容性

<table>
<tr>
<th align="center">客户端</th>
<th align="center">接入方式</th>
</tr>
<tr>
<td align="center"><strong>OpenClaw</strong>（via mcporter）</td>
<td><code>./install.sh</code> 一键搞定</td>
</tr>
<tr>
<td align="center"><strong>Claude Code</strong></td>
<td>添加到 <code>.claude/mcp.json</code></td>
</tr>
<tr>
<td align="center"><strong>Cursor / Windsurf</strong></td>
<td>添加到 MCP 配置文件</td>
</tr>
<tr>
<td align="center"><strong>任意 MCP 客户端</strong></td>
<td>stdio 传输，通用兼容</td>
</tr>
</table>

<details>
<summary><strong>Claude Code 配置示例</strong></summary>

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

## 📂 项目结构

```
skill-mcp-template/
├── src/
│   ├── client.ts              # 📊 数据层：API 客户端（替换我）
│   └── index.ts               # 🔧 工具层：MCP Server（替换我）
├── skill/
│   └── SKILL.md               # 💬 交互层：Skill 定义（替换我）
├── config/
│   └── mcporter.json          # ⚙️ mcporter 注册配置
├── install.sh                 # 🚀 一键安装脚本
├── .env.example               # 🔑 环境变量模板
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📖 许可证

MIT License — 自由使用、修改和分发。

---

<div align="center">

**skill-mcp-template** — *从 API 到 Agent 就绪，只需几分钟。*

<sub>替换 3 个文件 | stdio 传输 | 全平台 MCP 兼容</sub>

</div>
