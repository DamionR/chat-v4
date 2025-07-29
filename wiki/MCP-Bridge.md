# MCP Bridge Guide

Learn how to use Chat-V4's built-in MCP Bridge to connect local stdio MCP servers directly through your web interface.

## 🌉 What is the MCP Bridge?

The MCP Bridge is Chat-V4's revolutionary feature that allows you to connect local stdio MCP servers (like filesystem, git, database tools) directly through your web browser without running separate services.

**Key Benefits:**
- **No separate services** - Everything runs in one process
- **One-click local tool access** - Connect to your development environment instantly
- **Professional UI** - Manage servers through the web interface
- **Real-time communication** - Direct stdio communication with MCP servers
- **Zero configuration** - Works out of the box

## 🚀 Getting Started

### 1. Access MCP Bridge

1. Open Chat-V4 in your browser
2. Go to **Settings** (right sidebar)
3. Click the **MCP Bridge** tab
4. You'll see the bridge management interface

### 2. Your First Stdio Server

Let's connect the filesystem MCP server:

1. Click **"Add Preset"**
2. Find **"Filesystem"** in the list
3. Click **"Add"**
4. Configure the allowed directory path
5. Click the **Play button** to connect

🎉 **You now have filesystem access in your AI chats!**

## 📋 Available Preset Servers

Chat-V4 comes with presets for popular MCP servers:

### 🗂️ Filesystem
```
Purpose: File and directory operations
Command: npx @modelcontextprotocol/server-filesystem
Use Cases: Read files, write code, manage projects
Security: Restricted to specified directories
```

### 🌿 Git
```
Purpose: Version control operations
Command: npx @modelcontextprotocol/server-git
Use Cases: Commit history, branch management, diffs
Security: Read-only by default
```

### 🗄️ SQLite
```
Purpose: Local database operations
Command: npx @modelcontextprotocol/server-sqlite
Use Cases: Query data, generate reports, data analysis
Security: Configurable read/write permissions
```

### 🐘 PostgreSQL
```
Purpose: Production database access
Command: npx @modelcontextprotocol/server-postgres
Use Cases: Complex queries, data migration, monitoring
Security: Uses connection string authentication
```

### 🧠 Memory
```
Purpose: Persistent conversation memory
Command: npx @modelcontextprotocol/server-memory
Use Cases: Remember context across chats, user preferences
Security: Isolated per user session
```

### 🔍 Brave Search
```
Purpose: Real-time web search
Command: npx @modelcontextprotocol/server-brave-search
Use Cases: Research, fact-checking, current events
Security: API key required
```

### ☁️ Google Drive
```
Purpose: Cloud storage access
Command: npx @modelcontextprotocol/server-gdrive
Use Cases: Document collaboration, file sharing
Security: OAuth authentication required
```

### 🐙 GitHub
```
Purpose: Repository and issue management
Command: npx @modelcontextprotocol/server-github
Use Cases: Code review, issue tracking, project management
Security: Personal access token required
```

## 🛠️ Custom Server Configuration

### Adding Custom Servers

For tools not in the preset list:

1. Click **"Add Custom"**
2. Enter server details:

```
Server Name: My Custom Tool
Command: node
Arguments: /path/to/my-server.js --option value
Environment Variables: {"API_KEY": "your-key"}
```

3. Click through the setup wizard
4. Test the connection

### Command Examples

**Python MCP Server**
```bash
Command: python
Arguments: /path/to/server.py --port 8080
```

**Custom Node.js Server**
```bash
Command: node
Arguments: ./my-mcp-server.js --verbose
```

**Docker Container**
```bash
Command: docker
Arguments: run -i myorg/mcp-server
```

## 🔧 Server Management

### Connection Status

Monitor your servers in real-time:

- 🟢 **Connected** - Server running and responsive
- 🟡 **Connecting** - Starting up or initializing
- 🔴 **Disconnected** - Stopped or failed
- ⚠️ **Error** - Configuration or runtime issue

### Server Controls

**Start/Stop Servers**
- Click the **Play button** (▶️) to start
- Click the **Stop button** (⏹️) to disconnect
- Servers remember their state

**Edit Configuration**
- Modify environment variables
- Update command arguments
- Change allowed directories

**Delete Servers**
- Remove servers you no longer need
- Configuration is permanently deleted
- Running servers are stopped first

## 🔒 Security & Permissions

### Filesystem Security

**Directory Restrictions**
```bash
# Safe: Restrict to project directory
/Users/yourname/projects/my-app

# Unsafe: Don't allow system access
/
/System
/usr/bin
```

**File Permissions**
- MCP servers inherit your user permissions
- Can't access files you can't access
- Respect system file permissions

### Environment Variables

**Secure API Key Storage**
```json
{
  "API_KEY": "your-secret-key",
  "DATABASE_URL": "postgresql://user:pass@localhost:5432/db",
  "DEBUG": "false"
}
```

**Best Practices**
- Use environment variables for secrets
- Never hardcode credentials
- Rotate API keys regularly
- Monitor server logs for suspicious activity

### Network Security

**Local-Only Communication**
- Stdio servers run locally only
- No network exposure by default
- Bridge handles HTTP translation internally

## 🎯 Real-World Use Cases

### Web Development

**Setup:**
- Filesystem (for code editing)
- Git (for version control)
- PostgreSQL (for database)

**Workflow:**
```
Developer: "Add a new user registration endpoint"
AI: *reads existing code via filesystem*
AI: *creates new endpoint file*
AI: *updates database schema via PostgreSQL*
AI: *commits changes via Git*
```

### Data Analysis

**Setup:**
- SQLite (for local data)
- Memory (for analysis context)
- Brave Search (for research)

**Workflow:**
```
Analyst: "Analyze our sales data trends"
AI: *queries database via SQLite*
AI: *remembers analysis context via Memory*
AI: *researches market trends via Search*
AI: *generates comprehensive report*
```

### Content Creation

**Setup:**
- Google Drive (for documents)
- Memory (for consistency)
- Filesystem (for local files)

**Workflow:**
```
Writer: "Update our product documentation"
AI: *accesses current docs via Google Drive*
AI: *reads code examples via Filesystem*
AI: *maintains style consistency via Memory*
AI: *updates and saves documentation*
```

### DevOps & Monitoring

**Setup:**
- Git (for repository access)
- PostgreSQL (for monitoring data)
- Filesystem (for log files)

**Workflow:**
```
DevOps: "Check system health and recent deployments"
AI: *reviews recent commits via Git*
AI: *queries monitoring database*
AI: *analyzes log files via Filesystem*
AI: *provides health summary and recommendations*
```

## 🔄 Integration with Agents

### Agent-Specific Servers

Assign different MCP servers to different agents:

**Development Agent:**
- ✅ Filesystem
- ✅ Git
- ✅ PostgreSQL
- ❌ Google Drive

**Content Agent:**
- ✅ Google Drive
- ✅ Memory
- ✅ Brave Search
- ❌ PostgreSQL

### Server Combinations

**Full-Stack Development**
```yaml
Servers:
  - Filesystem (code access)
  - Git (version control)
  - PostgreSQL (database)
  - Memory (project context)
```

**Research & Writing**
```yaml
Servers:
  - Brave Search (research)
  - Google Drive (documents)
  - Memory (topic context)
  - Filesystem (local drafts)
```

## 📊 Monitoring & Debugging

### Bridge Status

Monitor the bridge health:
- **Active Connections** - Number of connected servers
- **Message Throughput** - Requests per minute
- **Error Rate** - Failed operations percentage
- **Response Times** - Average latency

### Debug Information

**Server Logs**
- Connection attempts
- Command execution
- Error messages
- Performance metrics

**Bridge Logs**
- HTTP request translation
- SSE event streaming
- Process lifecycle events
- Memory usage

### Common Issues

**Server Won't Start**
- Check command path and permissions
- Verify Node.js and npm are installed
- Review environment variable syntax
- Check for port conflicts

**Communication Errors**
- Monitor process stdout/stderr
- Verify JSON-RPC message format
- Check for protocol version mismatches
- Test with minimal requests

**Performance Issues**
- Monitor CPU and memory usage
- Check for blocking operations
- Optimize database queries
- Implement request caching

## 🚀 Advanced Features

### Multiple Server Instances

Run multiple instances of the same server type:
```
SQLite Production: /data/prod.db
SQLite Staging: /data/staging.db
SQLite Development: /data/dev.db
```

### Server Dependencies

Start servers in order:
1. Database servers first
2. File system access
3. External API integrations
4. Search and memory services

### Load Balancing

For high-throughput scenarios:
- Multiple instances of the same server
- Round-robin request distribution
- Health check monitoring
- Automatic failover

## 🎓 Best Practices

### Development Workflow

1. **Start with presets** - Use built-in configurations
2. **Test incrementally** - Add one server at a time
3. **Monitor performance** - Watch for bottlenecks
4. **Secure by default** - Restrict access appropriately

### Production Considerations

1. **Resource limits** - Monitor CPU and memory usage
2. **Error handling** - Implement graceful degradation
3. **Logging** - Maintain detailed operation logs
4. **Backup strategies** - Protect against data loss

### Team Collaboration

1. **Shared configurations** - Export/import server setups
2. **Documentation** - Document custom server purposes
3. **Access control** - Define team permission policies
4. **Version control** - Track configuration changes

## 🆘 Troubleshooting

### Bridge Won't Start

**Check Prerequisites:**
- Node.js installed (version 16+)
- npm/npx available in PATH
- Required MCP packages installed

**Verify Configuration:**
- Correct command syntax
- Valid environment variables
- Proper file permissions

### Servers Disconnect Frequently

**Common Causes:**
- Resource exhaustion
- Network timeouts
- Process crashes
- Memory leaks

**Solutions:**
- Monitor resource usage
- Implement reconnection logic
- Update server dependencies
- Optimize configurations

### Poor Performance

**Optimization Strategies:**
- Reduce concurrent connections
- Implement request caching
- Optimize database queries
- Use connection pooling

For comprehensive troubleshooting, see [Troubleshooting Guide](Troubleshooting).

## 🆘 Need Help?

- 🐛 [Report Bridge Issues](https://github.com/DamionR/chat-v4/issues)
- 💬 [Discuss Bridge Features](https://github.com/DamionR/chat-v4/discussions)
- 📖 [Back to Wiki Home](Home)
- 🔌 [Learn about MCP Servers](MCP-Servers)