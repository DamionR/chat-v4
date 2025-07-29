import { MCPServer } from '../types'

interface StdioMCPServer {
  id: string
  name: string
  command: string
  args: string[]
  env?: Record<string, string>
  enabled: boolean
}

interface MCPMessage {
  jsonrpc: string
  id?: string | number
  method?: string
  params?: any
  result?: any
  error?: any
}

interface BridgedServer {
  id: string
  server: StdioMCPServer
  process?: any // Worker or child process
  messageId: number
  pendingRequests: Map<string | number, (response: MCPMessage) => void>
  connected: boolean
  capabilities?: any
}

export class MCPBridge {
  private bridgedServers = new Map<string, BridgedServer>()
  private sseConnections = new Map<string, Array<(data: string) => void>>()
  private baseURL = (import.meta as any).env?.DEV ? 'http://localhost:5173' : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')

  constructor() {
    // Initialize bridge
  }

  /**
   * Add a stdio MCP server to be bridged
   */
  async addStdioServer(server: StdioMCPServer): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/api/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: server.id,
          name: server.name,
          command: server.command,
          args: server.args,
          env: server.env || {}
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to add server: ${response.status}`)
      }

      const result = await response.json()
      
      const bridged: BridgedServer = {
        id: server.id,
        server,
        messageId: 1,
        pendingRequests: new Map(),
        connected: result.server?.connected || false,
        capabilities: result.server?.capabilities
      }

      this.bridgedServers.set(server.id, bridged)
    } catch (error) {
      console.error(`Failed to add stdio server ${server.name}:`, error)
      throw error
    }
  }

  /**
   * Remove a bridged server
   */
  async removeStdioServer(serverId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/api/mcp/${serverId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        console.error(`Failed to remove server: ${response.status}`)
      }
    } catch (error) {
      console.error('Error removing server:', error)
    }

    // Clear local state
    this.sseConnections.delete(serverId)
    this.bridgedServers.delete(serverId)
  }

  /**
   * Get all bridged servers
   */
  async getBridgedServers(): Promise<Array<{ id: string; name: string; connected: boolean; capabilities?: any }>> {
    try {
      const response = await fetch(`${this.baseURL}/api/mcp`)
      if (!response.ok) {
        console.error(`Failed to get servers: ${response.status}`)
        return []
      }
      
      const result = await response.json()
      return result.servers || []
    } catch (error) {
      console.error('Error getting servers:', error)
      return []
    }
  }

  /**
   * Convert stdio server to HTTP-compatible MCP server config
   */
  getHTTPServerConfig(serverId: string): MCPServer | null {
    const bridged = this.bridgedServers.get(serverId)
    if (!bridged || !bridged.connected) return null

    return {
      id: bridged.server.id,
      name: `${bridged.server.name} (Bridged)`,
      url: `${this.baseURL}/api/mcp/${serverId}`,
      enabled: bridged.server.enabled
    }
  }

  /**
   * Handle HTTP request to bridged server
   */
  async handleHTTPRequest(serverId: string, request: MCPMessage): Promise<MCPMessage> {
    try {
      const response = await fetch(`${this.baseURL}/api/mcp/${serverId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Failed to send message to ${serverId}:`, error)
      throw error
    }
  }

  /**
   * Create SSE connection for a bridged server
   */
  createSSEConnection(serverId: string, callback: (data: string) => void): () => void {
    const eventSource = new EventSource(`${this.baseURL}/api/mcp/${serverId}/events`)
    
    eventSource.onmessage = (event) => {
      callback(event.data)
    }
    
    eventSource.onerror = (error) => {
      console.error(`SSE connection error for ${serverId}:`, error)
    }

    // Return cleanup function
    return () => {
      eventSource.close()
    }
  }


  /**
   * List available stdio MCP servers (predefined common ones)
   */
  getAvailableStdioServers(): Array<Omit<StdioMCPServer, 'id' | 'enabled'>> {
    return [
      {
        name: 'Filesystem',
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem', '/path/to/allowed/directory'],
        env: {}
      },
      {
        name: 'Git',
        command: 'npx',
        args: ['@modelcontextprotocol/server-git', '--repository', '.'],
        env: {}
      },
      {
        name: 'SQLite',
        command: 'npx',
        args: ['@modelcontextprotocol/server-sqlite', '--db-path', './data.db'],
        env: {}
      },
      {
        name: 'PostgreSQL',
        command: 'npx',
        args: ['@modelcontextprotocol/server-postgres'],
        env: {
          POSTGRES_CONNECTION_STRING: 'postgresql://user:pass@localhost:5432/db'
        }
      },
      {
        name: 'Memory',
        command: 'npx',
        args: ['@modelcontextprotocol/server-memory'],
        env: {}
      },
      {
        name: 'Brave Search',
        command: 'npx',
        args: ['@modelcontextprotocol/server-brave-search'],
        env: {
          BRAVE_API_KEY: 'your-brave-api-key'
        }
      },
      {
        name: 'Google Drive',
        command: 'npx',
        args: ['@modelcontextprotocol/server-gdrive'],
        env: {}
      },
      {
        name: 'GitHub',
        command: 'npx',
        args: ['@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: 'your-github-token'
        }
      }
    ]
  }
}

// Global bridge instance
export const mcpBridge = new MCPBridge()