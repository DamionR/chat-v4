import type { Provider, Message, MCPServer, CustomTool } from '../types';
import { MCPClientManager } from './mcp-client';

export interface AIClientConfig {
  provider: Provider;
  model: string;
  authToken: string;
  baseURL?: string;
  // Optional organization ID for OpenAI
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

  constructor(config: AIClientConfig) {
    this.config = config;
    this.mcpManager = new MCPClientManager();
  }

  async connect(): Promise<void> {
    // Validate configuration
    if (!this.config.authToken) {
      throw new Error('Auth token is required');
    }

    // Test connection with a simple request
    try {
      await this.sendChatCompletion({
        messages: [{ 
          id: 'test', 
          role: 'user', 
          content: 'Hello', 
          timestamp: new Date() 
        }],
        maxTokens: 5
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

    // Make API request based on provider
    switch (this.config.provider) {
      case 'openai':
        return this.sendOpenAIRequest(apiMessages, temperature, maxTokens, allTools);
      case 'anthropic':
        return this.sendAnthropicRequest(apiMessages, temperature, maxTokens, allTools);
      case 'google':
        return this.sendGoogleRequest(apiMessages, temperature, maxTokens, allTools);
      case 'xai':
        return this.sendXAIRequest(apiMessages, temperature, maxTokens, allTools);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async sendOpenAIRequest(
    messages: any[], 
    temperature: number, 
    maxTokens: number, 
    tools: any[]
  ): Promise<ChatCompletionResponse> {
    // Use standard OpenAI API endpoint or custom baseURL
    const baseURL = this.config.baseURL || 'https://api.openai.com';
    const url = `${baseURL}/v1/chat/completions`;

    const requestBody: any = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    if (tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.authToken}`
    };

    // Add organization header if provided
    if (this.config.organizationId) {
      headers['OpenAI-Organization'] = this.config.organizationId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
      throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    let content = choice.message.content || '';
    let toolCalls = choice.message.tool_calls;

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
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    };
  }

  private async sendAnthropicRequest(
    messages: any[], 
    temperature: number, 
    maxTokens: number, 
    tools: any[]
  ): Promise<ChatCompletionResponse> {
    // Use standard Anthropic API endpoint or custom baseURL
    const baseURL = this.config.baseURL || 'https://api.anthropic.com';
    const url = `${baseURL}/v1/messages`;

    // Convert messages format for Anthropic API
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const requestBody: any = {
      model: this.config.model,
      messages: conversationMessages,
      temperature,
      max_tokens: maxTokens
    };

    if (systemMessage) {
      requestBody.system = systemMessage.content;
    }

    if (tools.length > 0) {
      requestBody.tools = tools;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.config.authToken,
      'anthropic-version': '2023-06-01'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
      throw new Error(error.error?.message || error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    let content = '';
    let toolCalls = [];

    // Handle Anthropic response format
    if (data.content && Array.isArray(data.content)) {
      for (const item of data.content) {
        if (item.type === 'text') {
          content += item.text;
        } else if (item.type === 'tool_use') {
          toolCalls.push({
            id: item.id,
            type: 'function',
            function: {
              name: item.name,
              arguments: JSON.stringify(item.input)
            }
          });
        }
      }
    }

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
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    };
  }

  private async sendGoogleRequest(
    messages: any[], 
    temperature: number, 
    maxTokens: number, 
    tools: any[]
  ): Promise<ChatCompletionResponse> {
    // Use standard Google AI API endpoint or custom baseURL
    const baseURL = this.config.baseURL || 'https://generativelanguage.googleapis.com';
    const url = `${baseURL}/v1beta/models/${this.config.model}:generateContent?key=${this.config.authToken}`;

    // Convert to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody: any = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    };

    if (tools.length > 0) {
      requestBody.tools = [{
        functionDeclarations: tools.map(tool => ({
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters
        }))
      }];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
      throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      const candidate = data.candidates[0];
      const content = candidate.content?.parts?.[0]?.text || '';
      const functionCalls = candidate.content?.parts?.filter((part: any) => part.functionCall);

      let finalContent = content;

      // Handle function calls
      if (functionCalls && functionCalls.length > 0) {
        const toolCalls = functionCalls.map((fc: any) => ({
          type: 'function',
          function: {
            name: fc.functionCall.name,
            arguments: JSON.stringify(fc.functionCall.args || {})
          }
        }));

        const toolResults = await this.executeToolCalls(toolCalls);
        finalContent += '\n\n' + toolResults.map(result => 
          `**${result.toolName}**: ${result.success ? result.result : `Error: ${result.error}`}`
        ).join('\n\n');
      }

      return {
        content: finalContent,
        toolCalls: functionCalls,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount
        } : undefined
      };
    }

    throw new Error('No valid response from Google API');
  }

  private async sendXAIRequest(
    messages: any[], 
    temperature: number, 
    maxTokens: number, 
    tools: any[]
  ): Promise<ChatCompletionResponse> {
    // Use X AI API endpoint
    const baseURL = this.config.baseURL || 'https://api.x.ai';
    const url = `${baseURL}/v1/chat/completions`;

    const requestBody: any = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    if (tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.authToken}`
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
      throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    let content = choice.message.content || '';
    let toolCalls = choice.message.tool_calls;

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
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    };
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

  private async executeToolCalls(toolCalls: any[]): Promise<any[]> {
    const results = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      
      try {
        let args: Record<string, any> = {};
        
        if (toolCall.function.arguments) {
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch (error) {
            console.error('Failed to parse tool arguments:', error);
            args = {};
          }
        }

        let result;

        // Check if this is an MCP tool
        if (toolName.includes('_') && toolCall.function._mcpServerId) {
          const serverId = toolCall.function._mcpServerId;
          const originalName = toolCall.function._originalName;
          result = await this.mcpManager.callTool(serverId, originalName, args);
        } else {
          // Handle custom tools (you might want to implement a custom tool executor)
          result = await this.executeCustomTool(toolName, args);
        }

        results.push({
          toolName,
          result: typeof result === 'string' ? result : JSON.stringify(result),
          success: true
        });
      } catch (error) {
        results.push({
          toolName,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    return results;
  }

  private async executeCustomTool(toolName: string, args: Record<string, any>): Promise<any> {
    // This is where you would implement custom tool execution
    // For now, we'll return a placeholder response
    console.log(`Executing custom tool: ${toolName} with args:`, args);
    
    // You can implement specific tool handlers here
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

  // Get connection health status
  async getHealthStatus(): Promise<{
    aiProvider: { connected: boolean; error?: string };
    mcpServers: { serverId: string; healthy: boolean; error?: string }[];
  }> {
    // Test AI provider connection
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

    // Check MCP servers
    const mcpStatus = await this.mcpManager.healthCheck();

    return {
      aiProvider: aiProviderStatus,
      mcpServers: mcpStatus
    };
  }
}