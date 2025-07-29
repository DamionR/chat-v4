import { Agent as MastraAgent } from '@mastra/core/agent';
import type { Agent, Message, MCPServer, CustomTool } from '../types';
import { AIClient } from './ai-client';
import { MCPClientManager } from './mcp-client';

export class AgentService {
  private mastraAgents: Map<string, MastraAgent> = new Map();
  private mcpManager: MCPClientManager;
  private aiClient: AIClient | null = null;

  constructor() {
    this.mcpManager = new MCPClientManager();
  }

  setAIClient(client: AIClient): void {
    this.aiClient = client;
  }

  async createAgent(agent: Agent, mcpServers: MCPServer[] = [], customTools: CustomTool[] = []): Promise<void> {
    try {
      // Connect to enabled MCP servers that are selected for this agent
      const enabledMcpServers = mcpServers.filter(server => 
        server.enabled && 
        agent.capabilities.mcpServers &&
        agent.selectedMCPServers.includes(server.id)
      );

      for (const server of enabledMcpServers) {
        try {
          await this.mcpManager.connectToServer(server);
        } catch (error) {
          console.warn(`Failed to connect to MCP server ${server.name} for agent ${agent.name}:`, error);
        }
      }

      // Get available tools from MCP servers
      const mcpTools = await this.getMCPToolsForAgent(agent, enabledMcpServers);

      // Filter custom tools based on agent capabilities
      const enabledCustomTools = customTools.filter(tool => 
        tool.enabled && agent.capabilities.functionCalling
      );

      // Create Mastra agent configuration with proper typing
      const agentConfig = {
        name: agent.name,
        instructions: agent.instructions,
        model: () => {
          // Return a mock model that will be overridden by our custom generate method
          return {
            generateText: async () => ({ text: '' }),
            doGenerate: async () => ({ finishReason: 'stop', response: { messages: [] } })
          } as any;
        },
        tools: {
          ...this.formatCustomToolsForMastra(enabledCustomTools).reduce((acc, tool) => {
            acc[tool.name] = tool;
            return acc;
          }, {} as Record<string, any>),
          ...mcpTools.reduce((acc, tool) => {
            acc[tool.name] = tool;
            return acc;
          }, {} as Record<string, any>)
        }
      };

      // Create the Mastra agent
      const mastraAgent = new MastraAgent(agentConfig);

      // Override the agent's generate method to use our AI client
      (mastraAgent as any).generate = async (params: { messages: any[] }) => {
        if (!this.aiClient) {
          throw new Error('AI client not configured');
        }

        // Convert Mastra messages to our format
        const formattedMessages: Message[] = params.messages.map((msg, index) => ({
          id: `agent-msg-${Date.now()}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }));

        // Add agent system message if not present
        if (formattedMessages.length === 0 || formattedMessages[0].role !== 'system') {
          formattedMessages.unshift({
            id: `agent-system-${Date.now()}`,
            role: 'system',
            content: agent.instructions,
            timestamp: new Date()
          });
        }

        const response = await this.aiClient.sendChatCompletion({
          messages: formattedMessages,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          mcpServers: enabledMcpServers,
          customTools: enabledCustomTools
        });

        return {
          text: response.content,
          toolCalls: response.toolCalls,
          usage: response.usage
        };
      };

      this.mastraAgents.set(agent.id, mastraAgent);
      console.log(`Created Mastra agent: ${agent.name}`);
    } catch (error) {
      console.error(`Failed to create agent ${agent.name}:`, error);
      throw error;
    }
  }

  async updateAgent(agent: Agent, mcpServers: MCPServer[] = [], customTools: CustomTool[] = []): Promise<void> {
    // Remove existing agent
    await this.removeAgent(agent.id);
    
    // Create updated agent
    await this.createAgent(agent, mcpServers, customTools);
  }

  async removeAgent(agentId: string): Promise<void> {
    const agent = this.mastraAgents.get(agentId);
    if (agent) {
      // Clean up any resources
      this.mastraAgents.delete(agentId);
      console.log(`Removed agent: ${agentId}`);
    }
  }

  async executeAgent(agentId: string, userMessage: string, conversationHistory: Message[] = []): Promise<{
    response: string;
    toolCalls?: any[];
    usage?: any;
  }> {
    const agent = this.mastraAgents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    try {
      // Convert conversation history to Mastra format
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        })),
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        }
      ];

      // Execute the agent
      const result = await (agent as any).generate({ messages });

      return {
        response: result.text || result.content,
        toolCalls: result.toolCalls,
        usage: result.usage
      };
    } catch (error) {
      console.error(`Failed to execute agent ${agentId}:`, error);
      throw error;
    }
  }

  async streamAgent(
    agentId: string, 
    userMessage: string, 
    conversationHistory: Message[] = [],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const agent = this.mastraAgents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    try {
      // Convert conversation history to Mastra format
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        })),
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        }
      ];

      // Execute the agent with streaming
      const result = await (agent as any).generate({ messages });
      
      // Since we don't have streaming setup yet, just return the full response
      if (result.text || result.content) {
        onChunk(result.text || result.content);
      }
    } catch (error) {
      console.error(`Failed to stream agent ${agentId}:`, error);
      throw error;
    }
  }

  private async getMCPToolsForAgent(agent: Agent, mcpServers: MCPServer[]): Promise<any[]> {
    if (!agent.capabilities.mcpServers) {
      return [];
    }

    const tools = [];

    for (const server of mcpServers) {
      try {
        const serverTools = await this.mcpManager.getAvailableTools(server.id);
        
        for (const tool of serverTools) {
          tools.push({
            name: `${server.name}_${tool.name}`,
            description: tool.description,
            parameters: tool.inputSchema,
            execute: async (args: Record<string, any>) => {
              return await this.mcpManager.callTool(server.id, tool.name, args);
            }
          });
        }
      } catch (error) {
        console.warn(`Failed to get tools from MCP server ${server.name}:`, error);
      }
    }

    return tools;
  }

  private formatCustomToolsForMastra(customTools: CustomTool[]): any[] {
    return customTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      execute: async (args: Record<string, any>) => {
        // Execute custom tool logic
        return await this.executeCustomTool(tool, args);
      }
    }));
  }

  private async executeCustomTool(tool: CustomTool, args: Record<string, any>): Promise<any> {
    // Implement custom tool execution logic
    console.log(`Executing custom tool: ${tool.name} with args:`, args);
    
    // You can implement specific tool handlers here based on the tool name
    switch (tool.name.toLowerCase()) {
      case 'calculator':
      case 'calculate':
        return this.executeCalculator(args);
      
      case 'weather':
      case 'get_weather':
        return this.executeWeatherTool(args);
      
      case 'search':
      case 'web_search':
        return this.executeWebSearch(args);
      
      case 'file_reader':
      case 'read_file':
        return this.executeFileReader(args);
      
      default:
        // Generic tool execution
        return {
          tool: tool.name,
          result: `Executed ${tool.name} with parameters: ${JSON.stringify(args)}`,
          timestamp: new Date().toISOString()
        };
    }
  }

  private async executeCalculator(args: Record<string, any>): Promise<any> {
    try {
      const expression = args.expression || args.query || '';
      if (!expression) {
        throw new Error('No expression provided');
      }

      // Simple math evaluation (in production, use a proper math library)
      const result = Function(`"use strict"; return (${expression})`)();
      
      return {
        expression,
        result,
        type: 'calculation'
      };
    } catch (error) {
      return {
        error: `Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'calculation'
      };
    }
  }

  private async executeWeatherTool(args: Record<string, any>): Promise<any> {
    const location = args.location || args.city || 'Unknown';
    
    // Mock weather data (in production, integrate with a real weather API)
    const mockWeatherData = {
      location,
      temperature: Math.floor(Math.random() * 30) + 60, // 60-90°F
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      timestamp: new Date().toISOString()
    };

    return {
      weather: mockWeatherData,
      type: 'weather'
    };
  }

  private async executeWebSearch(args: Record<string, any>): Promise<any> {
    const query = args.query || args.search || '';
    
    if (!query) {
      throw new Error('No search query provided');
    }

    // Mock search results (in production, integrate with a real search API)
    const mockResults = [
      {
        title: `${query} - Search Result 1`,
        url: `https://example.com/result1?q=${encodeURIComponent(query)}`,
        snippet: `This is a mock search result for the query: ${query}. In a real implementation, this would be actual search results.`
      },
      {
        title: `${query} - Search Result 2`,
        url: `https://example.com/result2?q=${encodeURIComponent(query)}`,
        snippet: `Another mock search result about ${query}. Real search integration would provide actual web content.`
      }
    ];

    return {
      query,
      results: mockResults,
      count: mockResults.length,
      type: 'search'
    };
  }

  private async executeFileReader(args: Record<string, any>): Promise<any> {
    const filePath = args.path || args.file || args.filename || '';
    
    if (!filePath) {
      throw new Error('No file path provided');
    }

    // Mock file reading (in production, implement actual file reading)
    return {
      path: filePath,
      content: `Mock file content for ${filePath}. In a real implementation, this would read actual file contents.`,
      size: Math.floor(Math.random() * 10000),
      type: 'file_read',
      timestamp: new Date().toISOString()
    };
  }

  // Agent management methods
  getAgent(agentId: string): MastraAgent | undefined {
    return this.mastraAgents.get(agentId);
  }

  getAllAgents(): { id: string; agent: MastraAgent }[] {
    return Array.from(this.mastraAgents.entries()).map(([id, agent]) => ({ id, agent }));
  }

  async getAgentCapabilities(agentId: string): Promise<{
    tools: string[];
    mcpServers: string[];
    memoryType: string;
  }> {
    const agent = this.mastraAgents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    // Extract capabilities from the agent
    const capabilities = {
      tools: (agent as any).tools ? Object.keys((agent as any).tools) : [],
      mcpServers: [], // You might want to track this separately
      memoryType: 'in-memory' // Default for now
    };

    return capabilities;
  }

  async cleanup(): Promise<void> {
    // Clean up all agents and connections
    this.mastraAgents.clear();
    await this.mcpManager.disconnectAll();
  }
}