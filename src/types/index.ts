// Model provider configurations
export interface ProviderConfig {
  name: string;
  endpoint: string;
  baseURL: string;
}

export type Provider = 'openai' | 'anthropic' | 'google' | 'xai' | 'openrouter';

export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    endpoint: '/v1/chat/completions',
    baseURL: 'https://api.openai.com'
  },
  anthropic: {
    name: 'Anthropic',
    endpoint: '/v1/chat/completions',
    baseURL: 'https://api.anthropic.com'
  },
  google: {
    name: 'Google',
    endpoint: '/v1/chat/completions',
    baseURL: 'https://generativelanguage.googleapis.com'
  },
  xai: {
    name: 'X AI',
    endpoint: '/v1/chat/completions',
    baseURL: 'https://api.x.ai'
  },
  openrouter: {
    name: 'OpenRouter',
    endpoint: '/v1/chat/completions',
    baseURL: 'https://openrouter.ai/api'
  }
};

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

// MCP Server types
export interface MCPServer {
  id: string;
  name: string;
  url: string;
  token?: string;
  enabled: boolean;
}

// Custom tool types
export interface CustomTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description: string;
  instructions: string;
  temperature: number;
  maxTokens: number;
  capabilities: {
    multimodal: boolean;
    functionCalling: boolean;
    mcpServers: boolean;
  };
  selectedMCPServers: string[]; // Array of MCP server IDs
  createdAt: string;
}

// Chat session types
export interface ChatSession {
  id: string;
  title: string;
  provider: Provider;
  model: string;
  messages: Message[];
  timestamp: string;
  messageCount: number;
}

// Connection status
export interface ConnectionStatus {
  isConnected: boolean;
  provider?: Provider;
  model?: string;
  error?: string;
}