# MCP Servers Guide

Learn how to connect and configure Model Context Protocol (MCP) servers to extend your AI agents' capabilities.

## 🔌 What are MCP Servers?

MCP (Model Context Protocol) servers provide AI agents with access to external tools, data sources, and services. They act as bridges between your AI and the outside world.

**Key Benefits:**
- **Extend AI capabilities** beyond text generation
- **Access real-time data** from APIs and databases
- **Perform actions** like file operations, web searches
- **Connect to your tools** and existing workflows

## 🌐 HTTP MCP Servers

HTTP MCP servers are web-based services that your AI can communicate with directly.

### Adding HTTP MCP Servers

1. Go to **Settings → MCP Servers**
2. Click **"Add Server"**
3. Fill in the details:

```
Server Name: My API Server
Server URL: https://api.example.com/mcp
OAuth Token: Bearer your-token-here (optional)
```

4. Click **"Add Server"**
5. Toggle **"Enabled"** to activate

### Popular HTTP MCP Servers

#### Brave Search MCP
```
Name: Brave Search
URL: https://mcp.brave.com/search
Description: Real-time web search capabilities
```

#### Weather API MCP
```
Name: Weather Service
URL: https://weather-mcp.example.com
Description: Current weather and forecast data
```

#### News API MCP
```
Name: News Service
URL: https://news-mcp.example.com
Description: Latest news and article search
```

## 🖥️ Stdio MCP Servers (Local Tools)

Stdio MCP servers run locally and provide access to your development environment and local tools.

### Using the MCP Bridge

Chat-V4 includes a built-in MCP bridge that converts local stdio servers to HTTP endpoints.

1. Go to **Settings → MCP Bridge**
2. Choose from preset servers or add custom ones
3. Configure and connect your local tools

### Preset Stdio Servers

#### Filesystem Access
```
Name: Filesystem
Command: npx @modelcontextprotocol/server-filesystem
Args: /path/to/allowed/directory
Description: Read, write, and manage files
```

#### Git Integration
```
Name: Git
Command: npx @modelcontextprotocol/server-git
Args: --repository .
Description: Git operations and repository management
```

#### SQLite Database
```
Name: SQLite
Command: npx @modelcontextprotocol/server-sqlite
Args: --db-path ./database.db
Description: Query and modify SQLite databases
```

#### PostgreSQL Database
```
Name: PostgreSQL
Command: npx @modelcontextprotocol/server-postgres
Environment:
  POSTGRES_CONNECTION_STRING: postgresql://user:pass@localhost:5432/db
Description: PostgreSQL database operations
```

#### Memory Storage
```
Name: Memory
Command: npx @modelcontextprotocol/server-memory
Description: Persistent memory for conversations
```

#### Google Drive
```
Name: Google Drive
Command: npx @modelcontextprotocol/server-gdrive
Description: Access Google Drive files and folders
```

#### GitHub Integration
```
Name: GitHub
Command: npx @modelcontextprotocol/server-github
Environment:
  GITHUB_PERSONAL_ACCESS_TOKEN: your-github-token
Description: GitHub repository and issue management
```

### Custom Stdio Servers

Create your own MCP server:

```
Name: My Custom Tool
Command: node
Args: /path/to/my-mcp-server.js --option value
Environment:
  API_KEY: your-api-key
  DEBUG: true
Description: Custom functionality for my workflow
```

## 🔧 Server Configuration

### Connection Settings

**Server Name**
- Choose a descriptive, unique name
- Use for identification in agent assignments

**Server URL** (HTTP servers)
- Must be a valid HTTP/HTTPS URL
- Include full path to MCP endpoint

**OAuth Token** (HTTP servers)
- Bearer tokens for authentication
- API keys or session tokens
- Optional for public endpoints

**Environment Variables** (Stdio servers)
- API keys and configuration
- Database connection strings
- Debug flags and options

### Server Status

Monitor your MCP servers:
- 🟢 **Connected** - Server is active and responding
- 🟡 **Connecting** - Attempting to establish connection
- 🔴 **Disconnected** - Server is offline or unreachable
- ⚠️ **Error** - Configuration or authentication issue

## 🛠️ Server Management

### Enable/Disable Servers

Toggle servers on/off without removing configuration:
1. Find the server in the list
2. Click the **toggle switch**
3. Server will connect/disconnect automatically

### Editing Servers

1. Click the **edit icon** next to a server
2. Modify settings as needed
3. Save changes
4. Server will reconnect with new settings

### Removing Servers

1. Click the **delete icon** next to a server
2. Confirm deletion
3. Server configuration is permanently removed

### Testing Connections

Verify server connectivity:
1. Check the **status indicator**
2. Review the **connection logs**
3. Test with a simple agent request

## 🤖 Agent Integration

### Assigning MCP Servers to Agents

When creating or editing agents:

1. Go to **Settings → Agents**
2. Create or edit an agent
3. In the **MCP Servers** section:
   - ✅ Select servers this agent can use
   - ❌ Uncheck servers to restrict access

### Server-Agent Combinations

**Development Agent**
- ✅ Filesystem (for code files)
- ✅ Git (for version control)
- ✅ Database (for data access)
- ❌ Weather (not relevant)

**Research Agent**
- ✅ Web Search (for information)
- ✅ Memory (for context)
- ✅ Google Drive (for documents)
- ❌ Git (not needed)

**Customer Support Agent**
- ✅ Memory (for customer history)
- ✅ Database (for order lookup)
- ❌ Filesystem (security risk)
- ❌ Git (not relevant)

## 📡 MCP Tools and Capabilities

### Common Tool Types

**Information Retrieval**
- Web search
- Database queries
- File reading
- API data fetching

**Content Creation**
- File writing
- Document generation
- Image processing
- Template rendering

**Data Manipulation**
- Database updates
- File operations
- Data transformation
- Calculations

**External Actions**
- Email sending
- API calls
- Workflow triggers
- Notification dispatch

### Tool Discovery

When connecting MCP servers, agents automatically discover:
- **Available tools** - Functions the server provides
- **Tool schemas** - Parameters and expected inputs
- **Capabilities** - What each tool can accomplish
- **Limitations** - Usage restrictions and rate limits

## 🔒 Security Considerations

### Access Control

**Principle of Least Privilege**
- Only give agents access to necessary servers
- Regularly audit agent permissions
- Remove unused server connections

**Environment Variables**
- Store sensitive data in environment variables
- Never hardcode API keys or passwords
- Use strong, unique credentials

### Network Security

**HTTPS Only**
- Always use HTTPS for HTTP MCP servers
- Verify SSL certificates
- Avoid self-signed certificates in production

**Token Management**
- Rotate API tokens regularly
- Use scoped tokens with minimal permissions
- Monitor token usage for anomalies

### Local Security

**Filesystem Access**
- Restrict filesystem server to specific directories
- Avoid giving access to system directories
- Monitor file operation logs

**Database Access**
- Use read-only connections when possible
- Implement proper SQL injection protection
- Audit database queries and modifications

## 📊 Monitoring and Debugging

### Connection Logs

Monitor MCP server activity:
- Connection attempts and status
- Tool usage and performance
- Error messages and debugging info
- Rate limiting and quota usage

### Performance Metrics

Track MCP server performance:
- Response times
- Success/failure rates
- Tool usage frequency
- Error patterns

### Debugging Common Issues

**Connection Failures**
- Verify server URL and credentials
- Check network connectivity
- Review firewall settings
- Test from command line

**Authentication Errors**
- Validate API keys and tokens
- Check token expiration
- Verify scope permissions
- Test with minimal requests

**Tool Execution Errors**
- Review tool parameters
- Check input validation
- Verify required permissions
- Test tools individually

## 🚀 Advanced Usage

### Custom MCP Server Development

Create your own MCP server:

```typescript
// example-mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0'
});

// Add tools
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'my_tool',
    description: 'Does something useful',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string' }
      }
    }
  }]
}));

// Start server
server.connect();
```

### Server Orchestration

Coordinate multiple MCP servers:
- Use different servers for different data sources
- Implement fallback mechanisms
- Load balance across server instances
- Cache frequently used data

### Integration Patterns

**ETL Workflows**
- Extract data with one server
- Transform with another
- Load results to final destination

**Microservices Architecture**
- Each MCP server handles specific domain
- Compose capabilities across servers
- Independent scaling and updates

## 🆘 Troubleshooting

### Common MCP Server Issues

**Server Won't Connect**
- Check URL format and accessibility
- Verify authentication credentials
- Review server logs for errors
- Test with curl or Postman

**Tools Not Working**
- Verify tool parameters match schema
- Check agent has server access
- Review tool execution logs
- Test tools with minimal inputs

**Performance Issues**
- Monitor response times
- Check for rate limiting
- Optimize query parameters
- Consider caching strategies

For detailed troubleshooting, see [Troubleshooting Guide](Troubleshooting).

## 🆘 Need Help?

- 🐛 [Report MCP Issues](https://github.com/DamionR/chat-v4/issues)
- 💬 [Discuss MCP Servers](https://github.com/DamionR/chat-v4/discussions)
- 📖 [Back to Wiki Home](Home)
- 🌉 [Learn about MCP Bridge](MCP-Bridge)