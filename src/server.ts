import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {makeOWRequest} from "./helper";
import { z } from 'zod';

export function getServer() {
    const server = new McpServer({
        name: "Real time weather data provider from Open Weather API. Access current weather data for any location on Earth!",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });

    server.tool(
        "getWeatherData",
        "Tool to get weather data for a given City name, like (e.g. Bangalore) or comma seprated city name, Two-letter country code (e.g. Bangalore,IN)",
        {
            city: z.string().describe("City name like (e.g. Bangalore) or comma seprated city name, Two-letter country code (e.g. Bangalore,IN)"),
        },
        async ({ city }) => {
            const response = await makeOWRequest(city);
            return (response) ?
                { content: [{ type: "text", text: JSON.stringify(response) }] } :
                { content: [{ type: "text", text: "Failed to retrieve weather data, please try after sometime!" }] };
        }
    );

    return server;
}

export function getTransport() {
    return new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });
}