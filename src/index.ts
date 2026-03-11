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
