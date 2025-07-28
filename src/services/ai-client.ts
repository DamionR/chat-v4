import OpenAI from 'openai';
import type { Provider, Message, MCPServer, CustomTool } from '../types';
import { MODEL_CONFIGS } from '../types';
import { MCPClientManager } from './mcp-client';

export interface AIClientConfig {
  provider: Provider;
  model: string;
  authToken: string;
  baseURL?: string;
  organizationId?: string;
}

export interface ChatCompletionRequest {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  mcpServers?: MCPServer[];
  customTools?: CustomTool[];
}

export interface ChatCompletionResponse {
  content: string;
  toolCalls?: any[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIClient {
  private config: AIClientConfig;
  private mcpManager: MCPClientManager;
  private openai: OpenAI;

  constructor(config: AIClientConfig) {
    this.config = config;
    this.mcpManager = new MCPClientManager();
    
    const providerConfig = MODEL_CONFIGS[config.provider];
    
    this.openai = new OpenAI({
      apiKey: config.authToken,
      baseURL: config.baseURL || providerConfig.baseURL,
      dangerouslyAllowBrowser: true
    });
  }

  async connect(): Promise<void> {
    if (!this.config.authToken) {
      throw new Error('Auth token is required');
    }

    try {
      await this.sendChatCompletion({
        messages: [{ 
          id: 'test', 
          role: 'user', 
          content: 'Testing. Just say hi and hello world and nothing else.', 
          timestamp: new Date() 
        }],
        maxTokens: 50
      });
    } catch (error) {
      throw new Error(`Failed to connect to ${this.config.provider}: ${error}`);
    }
  }

  async sendChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const { messages, temperature = 0.7, maxTokens = 2048, mcpServers = [], customTools = [] } = request;

    // Connect to MCP servers if not already connected
    for (const server of mcpServers) {
      if (server.enabled && !this.mcpManager.getClient(server.id)) {
        try {
          await this.mcpManager.connectToServer(server);
        } catch (error) {
          console.warn(`Failed to connect to MCP server ${server.name}:`, error);
        }
      }
    }

    // Get available tools from MCP servers
    const mcpTools = await this.getMCPTools(mcpServers);
    const allTools = [...this.formatCustomTools(customTools), ...mcpTools];

    // Format messages for the API
    const apiMessages = this.formatMessagesForAPI(messages);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: apiMessages as any,
        temperature,
        max_tokens: maxTokens,
        tools: allTools.length > 0 ? allTools : undefined,
        tool_choice: allTools.length > 0 ? 'auto' : undefined
      });

      const choice = completion.choices[0];
      let content = choice.message.content || '';
      const toolCalls = choice.message.tool_calls;

      // Handle tool calls
      if (toolCalls && toolCalls.length > 0) {
        const toolResults = await this.executeToolCalls(toolCalls);
        content += '\n\n' + toolResults.map(result => 
          `**${result.toolName}**: ${result.success ? result.result : `Error: ${result.error}`}`
        ).join('\n\n');
      }

      return {
        content,
        toolCalls,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  }

  private formatMessagesForAPI(messages: Message[]): any[] {
    return messages
      .filter(msg => msg.role !== 'system' || msg.content.trim() !== '')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }

  private formatCustomTools(tools: CustomTool[]): any[] {
    return tools
      .filter(tool => tool.enabled)
      .map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
  }

  private async getMCPTools(servers: MCPServer[]): Promise<any[]> {
    const allTools = [];

    for (const server of servers) {
      if (!server.enabled) continue;

      try {
        const tools = await this.mcpManager.getAvailableTools(server.id);
        
        for (const tool of tools) {
          allTools.push({
            type: 'function',
            function: {
              name: `${server.name}_${tool.name}`,
              description: tool.description,
              parameters: tool.inputSchema,
              _mcpServerId: server.id,
              _originalName: tool.name
            }
          });
        }
      } catch (error) {
        console.warn(`Failed to get tools from MCP server ${server.name}:`, error);
      }
    }

    return allTools;
  }

  private async executeToolCalls(toolCalls: any[]): Promise<Array<{
    toolName: string;
    result?: string;
    error?: string;
    success: boolean;
  }>> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        const toolName = toolCall.function.name;
        let args = {};
        
        if (toolCall.function.arguments) {
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch (error) {
            console.error('Failed to parse tool arguments:', error);
            args = {};
          }
        }

        let result;

        if (toolName.includes('_') && toolCall.function._mcpServerId) {
          const serverId = toolCall.function._mcpServerId;
          const originalName = toolCall.function._originalName;
          result = await this.mcpManager.callTool(serverId, originalName, args);
        } else {
          result = await this.executeCustomTool(toolName, args);
        }

        results.push({
          toolName,
          result: typeof result === 'string' ? result : JSON.stringify(result),
          success: true
        });
      } catch (error) {
        results.push({
          toolName: toolCall.function.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    return results;
  }

  private async executeCustomTool(toolName: string, args: Record<string, any>): Promise<any> {
    console.log(`Executing custom tool: ${toolName} with args:`, args);
    
    switch (toolName) {
      case 'get_weather':
        return `Weather information for ${args.location}: Sunny, 72°F`;
      case 'calculate':
        return `Calculation result: ${args.expression} = ${eval(args.expression)}`;
      case 'search_web':
        return `Web search results for "${args.query}": [Mock search results]`;
      default:
        return `Custom tool ${toolName} executed with arguments: ${JSON.stringify(args)}`;
    }
  }

  async disconnect(): Promise<void> {
    await this.mcpManager.disconnectAll();
  }

  async getHealthStatus(): Promise<{
    aiProvider: { connected: boolean; error?: string };
    mcpServers: { serverId: string; healthy: boolean; error?: string }[];
  }> {
    let aiProviderStatus = { connected: false, error: undefined as string | undefined };
    
    try {
      await this.sendChatCompletion({
        messages: [{ 
          id: 'health-check', 
          role: 'user', 
          content: 'ping', 
          timestamp: new Date() 
        }],
        maxTokens: 1
      });
      aiProviderStatus.connected = true;
    } catch (error) {
      aiProviderStatus.error = error instanceof Error ? error.message : 'Unknown error';
    }

    const mcpStatus = await this.mcpManager.healthCheck();

    return {
      aiProvider: aiProviderStatus,
      mcpServers: mcpStatus
    };
  }
}