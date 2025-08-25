import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from 'express';
import { z } from 'zod';

const OW_API_BASE = "https://api.openweathermap.org";
const OW_API_KEY = process.env.OW_API_KEY;
const PORT = 3000;

async function makeOWRequest<T>(url: string): Promise<T | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making Open Weather request:", error);
        return null;
    }
}

function getServer() {
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
            const url = `${OW_API_BASE}/data/2.5/weather?q=${city}&appid=${OW_API_KEY}`;
            const response = await makeOWRequest(url);
            return (response) ?
                { content: [{ type: "text", text: JSON.stringify(response) }] } :
                { content: [{ type: "text", text: "Failed to retrieve weather data, please try after sometime!" }] };
        }
    );

    return server;
}


const app = express();
app.use(express.json());

app.post('/mcp', async (req: Request, res: Response) => {
    try {
        const server = getServer();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });

        res.on('close', () => {
            console.log('Request closed');
            transport.close();
            server.close();
        });

        await server.connect(transport);

        await transport.handleRequest(req, res, req.body);

    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error',
                },
                id: null,
            });
        }
    }
});


app.listen(PORT, (error: any) => {
    if (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
    console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});