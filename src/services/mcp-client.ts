import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { MCPServer } from '../types';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, SSEClientTransport> = new Map();

  async connectToServer(server: MCPServer): Promise<Client> {
    try {
      let transport: SSEClientTransport;
      let client: Client;

      if (server.url.startsWith('http')) {
        // HTTP/SSE transport
        transport = new SSEClientTransport(new URL(server.url), {
          requestInit: {
            headers: server.token ? { 'Authorization': `Bearer ${server.token}` } : undefined
          }
        });
      } else {
        // Non-HTTP URLs are not supported in browser environment
        throw new Error('Only HTTP/HTTPS MCP servers are supported in the browser environment');
      }

      client = new Client({
        name: `ai-chat-client-${server.name}`,
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      });

      await client.connect(transport);
      
      this.clients.set(server.id, client);
      this.transports.set(server.id, transport);

      console.log(`Connected to MCP server: ${server.name}`);
      return client;
    } catch (error) {
      console.error(`Failed to connect to MCP server ${server.name}:`, error);
      throw error;
    }
  }

  async disconnectFromServer(serverId: string): Promise<void> {
    const client = this.clients.get(serverId);
    const transport = this.transports.get(serverId);

    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error(`Error closing MCP client ${serverId}:`, error);
      }
    }

    if (transport) {
      try {
        await transport.close();
      } catch (error) {
        console.error(`Error closing MCP transport ${serverId}:`, error);
      }
    }

    this.clients.delete(serverId);
    this.transports.delete(serverId);
  }

  async disconnectAll(): Promise<void> {
    const serverIds = Array.from(this.clients.keys());
    await Promise.all(serverIds.map(id => this.disconnectFromServer(id)));
  }

  getClient(serverId: string): Client | undefined {
    return this.clients.get(serverId);
  }

  async getAvailableTools(serverId: string): Promise<MCPTool[]> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`No client found for server ${serverId}`);
    }

    try {
      const response = await client.listTools();
      return response.tools.map(tool => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema
      }));
    } catch (error) {
      console.error(`Failed to list tools for server ${serverId}:`, error);
      return [];
    }
  }

  async getAvailableResources(serverId: string): Promise<MCPResource[]> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`No client found for server ${serverId}`);
    }

    try {
      const response = await client.listResources();
      return response.resources.map(resource => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType
      }));
    } catch (error) {
      console.error(`Failed to list resources for server ${serverId}:`, error);
      return [];
    }
  }

  async callTool(serverId: string, toolName: string, args: Record<string, any>): Promise<any> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`No client found for server ${serverId}`);
    }

    try {
      const response = await client.callTool({
        name: toolName,
        arguments: args
      });

      return response.content;
    } catch (error) {
      console.error(`Failed to call tool ${toolName} on server ${serverId}:`, error);
      throw error;
    }
  }

  async readResource(serverId: string, uri: string): Promise<any> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`No client found for server ${serverId}`);
    }

    try {
      const response = await client.readResource({ uri });
      return response.contents;
    } catch (error) {
      console.error(`Failed to read resource ${uri} from server ${serverId}:`, error);
      throw error;
    }
  }

  async getPromptTemplates(serverId: string): Promise<any[]> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`No client found for server ${serverId}`);
    }

    try {
      const response = await client.listPrompts();
      return response.prompts;
    } catch (error) {
      console.error(`Failed to list prompts for server ${serverId}:`, error);
      return [];
    }
  }

  async getPrompt(serverId: string, name: string, args?: Record<string, any>): Promise<any> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`No client found for server ${serverId}`);
    }

    try {
      const response = await client.getPrompt({
        name,
        arguments: args
      });

      return response.messages;
    } catch (error) {
      console.error(`Failed to get prompt ${name} from server ${serverId}:`, error);
      throw error;
    }
  }

  // Get all available tools from all connected servers
  async getAllAvailableTools(): Promise<{ serverId: string; serverName: string; tools: MCPTool[] }[]> {
    const results = [];
    
    for (const [serverId] of this.clients) {
      try {
        const tools = await this.getAvailableTools(serverId);
        results.push({
          serverId,
          serverName: serverId, // You might want to store server names separately
          tools
        });
      } catch (error) {
        console.error(`Failed to get tools for server ${serverId}:`, error);
      }
    }

    return results;
  }

  // Execute a tool call across multiple servers (useful for agent workflows)
  async executeToolWorkflow(workflow: { serverId: string; toolName: string; args: Record<string, any> }[]): Promise<any[]> {
    const results = [];

    for (const step of workflow) {
      try {
        const result = await this.callTool(step.serverId, step.toolName, step.args);
        results.push({
          serverId: step.serverId,
          toolName: step.toolName,
          result,
          success: true
        });
      } catch (error) {
        results.push({
          serverId: step.serverId,
          toolName: step.toolName,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
        
        // Decide whether to continue or stop on error
        // For now, we'll continue but you might want to make this configurable
        console.error(`Tool workflow step failed:`, error);
      }
    }

    return results;
  }

  // Health check for all connected servers
  async healthCheck(): Promise<{ serverId: string; healthy: boolean; error?: string }[]> {
    const results = [];

    for (const [serverId, client] of this.clients) {
      try {
        // Try to list tools as a basic health check
        await client.listTools();
        results.push({ serverId, healthy: true });
      } catch (error) {
        results.push({
          serverId,
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Get connection status
  getConnectionStatus(): { serverId: string; connected: boolean }[] {
    return Array.from(this.clients.keys()).map(serverId => ({
      serverId,
      connected: this.clients.has(serverId)
    }));
  }
}