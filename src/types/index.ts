// Model provider configurations
export interface ModelConfig {
  name: string;
  models: Record<string, string>;
  endpoint: string;
  prefix: string;
}

export type Provider = 'openai' | 'anthropic' | 'google';

export const MODEL_CONFIGS: Record<Provider, ModelConfig> = {
  openai: {
    name: 'OpenAI',
    models: {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo'
    },
    endpoint: '/v1/chat/completions',
    prefix: ''
  },
  anthropic: {
    name: 'Anthropic',
    models: {
      'claude-3-7-sonnet-20250219': 'Claude 3.7 Sonnet',
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
      'claude-3-haiku-20240307': 'Claude 3 Haiku'
    },
    endpoint: '/v1/chat/completions',
    prefix: 'anthropic:'
  },
  google: {
    name: 'Google',
    models: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-1.5-flash': 'Gemini 1.5 Flash',
      'gemini-pro': 'Gemini Pro'
    },
    endpoint: '/v1/chat/completions',
    prefix: 'google:'
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