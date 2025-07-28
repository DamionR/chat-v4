import type { Agent, Message, MCPServer, CustomTool } from '../types';
import { AIClient } from './ai-client';

// Browser-compatible Agent Service without Node.js dependencies
export class AgentService {
  private agents: Map<string, Agent> = new Map();
  private aiClient: AIClient | null = null;

  setAIClient(client: AIClient): void {
    this.aiClient = client;
  }

  async createAgent(agent: Agent, _mcpServers: MCPServer[] = [], _customTools: CustomTool[] = []): Promise<void> {
    // Store agent configuration
    this.agents.set(agent.id, agent);
    console.log(`Created agent: ${agent.name}`);
  }

  async updateAgent(agent: Agent, _mcpServers: MCPServer[] = [], _customTools: CustomTool[] = []): Promise<void> {
    // Update agent configuration
    this.agents.set(agent.id, agent);
    console.log(`Updated agent: ${agent.name}`);
  }

  async removeAgent(agentId: string): Promise<void> {
    this.agents.delete(agentId);
    console.log(`Removed agent: ${agentId}`);
  }

  async executeAgent(agentId: string, userMessage: string, conversationHistory: Message[] = []): Promise<{
    response: string;
    toolCalls?: any[];
    usage?: any;
  }> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    if (!this.aiClient) {
      throw new Error('AI client not configured');
    }

    try {
      // Prepare messages with agent instructions
      const messages: Message[] = [
        {
          id: `agent-system-${Date.now()}`,
          role: 'system',
          content: agent.instructions,
          timestamp: new Date()
        },
        ...conversationHistory,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        }
      ];

      // Use the AI client to send the message
      const response = await this.aiClient.sendChatCompletion({
        messages,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        mcpServers: [],
        customTools: []
      });

      return {
        response: response.content,
        toolCalls: response.toolCalls,
        usage: response.usage
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
    // For now, just execute normally and send the whole response
    const result = await this.executeAgent(agentId, userMessage, conversationHistory);
    onChunk(result.response);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): { id: string; agent: Agent }[] {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({ id, agent }));
  }

  async getAgentCapabilities(agentId: string): Promise<{
    tools: string[];
    mcpServers: string[];
    memoryType: string;
  }> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    return {
      tools: [],
      mcpServers: [],
      memoryType: 'in-memory'
    };
  }

  async cleanup(): Promise<void> {
    this.agents.clear();
  }
}