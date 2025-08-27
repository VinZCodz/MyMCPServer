import express, { Request, Response } from 'express';
import { getServer, getTransport } from "./server.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});

app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET MCP request');

  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

app.post('/mcp', async (req: Request, res: Response) => {
  try {
    const server = getServer();
    const transport = getTransport();

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

//TODO:
// 2. Test end points ysing inyegrated postman, eq
// 3. Implmement LLM client.
// 4. Try renaming repo and app.
// 5. Decrease dev container image size. rm .devcontain fol n chk once.