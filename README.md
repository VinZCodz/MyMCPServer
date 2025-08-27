# MyMCPServer
Model Context Protocol Server, using TS express.

Using Open Weather API as a data provider for my LLM to consume it via MCP's StreamableHTTPServer.
Have wrapped an API tool using the MCP server, which is a stateless streamable HTTP listener on port 3000, using jsonrpc.

This is not an stdio server, which posts the tool outputs onto a console stdio.
This MCP server can be hosted in real time on a container with a forward post open, so LLM MCP clients can consume streamable data back from the tool.

Thus augmenting the LLM knowledge by providing more real-world/time context using the tooling capabilities via MCP. 

To Test standalone:
1. use npx @modelcontextprotocol/inspector to run the inspector locally, which acts as client to this server.
2. Up this StreamableHTTPServer MCP, using launch.json and enable the forwarding 3000 port to public.
