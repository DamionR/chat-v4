import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { 
  Provider, 
  Message, 
  MCPServer, 
  CustomTool, 
  Agent, 
  ChatSession,
  ConnectionStatus 
} from '../types'
import { SQLiteManager } from '../services/database'
import { AIClient } from '../services/ai-client'
import { AgentService } from '../services/agent-service-browser'

interface ChatStore {
  // Services
  db: SQLiteManager;
  aiClient: AIClient | null;
  agentService: AgentService;
  
  // Connection state
  connectionStatus: ConnectionStatus;
  currentProvider: Provider;
  currentModel: string;
  authToken: string;
  baseURL: string;
  
  // Current chat state
  messages: Message[];
  currentChatId: string | null;
  attachedFiles: File[];
  isLoading: boolean;
  
  // Chat history
  chatSessions: ChatSession[];
  
  // MCP Servers
  mcpServers: MCPServer[];
  
  // Custom tools
  customTools: CustomTool[];
  
  // Agents
  agents: Agent[];
  currentAgent: Agent | null;
  useAgentMode: boolean;
  
  // Initialization
  initialize: () => Promise<void>;
  
  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setProvider: (provider: Provider) => Promise<void>;
  setModel: (model: string) => Promise<void>;
  setAuthToken: (token: string) => Promise<void>;
  setBaseURL: (url: string) => Promise<void>;
  
  // Message actions
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  clearMessages: () => void;
  
  // MCP Server actions
  addMCPServer: (server: Omit<MCPServer, 'id'>) => Promise<void>;
  removeMCPServer: (id: string) => Promise<void>;
  updateMCPServer: (id: string, updates: Partial<MCPServer>) => Promise<void>;
  testMCPServer: (id: string) => Promise<boolean>;
  
  // Custom tool actions
  addCustomTool: (tool: Omit<CustomTool, 'id'>) => Promise<void>;
  removeCustomTool: (id: string) => Promise<void>;
  updateCustomTool: (id: string, updates: Partial<CustomTool>) => Promise<void>;
  
  // Agent actions
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt'>) => Promise<void>;
  removeAgent: (id: string) => Promise<void>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  setCurrentAgent: (agent: Agent | null) => Promise<void>;
  setUseAgentMode: (useAgent: boolean) => Promise<void>;
  
  // Chat session actions
  saveChatSession: () => Promise<void>;
  loadChatSession: (id: string) => Promise<void>;
  deleteChatSession: (id: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  
  // File actions
  attachFile: (file: File) => void;
  removeFile: (index: number) => void;
  
  // Utility actions
  getHealthStatus: () => Promise<any>;
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Services
    db: new SQLiteManager(),
    aiClient: null,
    agentService: new AgentService(),
    
    // Initial state
    connectionStatus: { isConnected: false },
    currentProvider: 'openai',
    currentModel: 'gpt-4o',
    authToken: '',
    baseURL: '',
    
    messages: [],
    currentChatId: null,
    attachedFiles: [],
    isLoading: false,
    
    chatSessions: [],
    mcpServers: [],
    customTools: [],
    
    agents: [],
    currentAgent: null,
    useAgentMode: false,
    
    // Initialization
    initialize: async () => {
      const { db } = get();
      await db.init();
      
      // Load settings
      const currentProvider = await db.getSetting('currentProvider', 'openai' as Provider);
      const currentModel = await db.getSetting('currentModel', 'gpt-4o');
      const authToken = await db.getSetting('authToken', '');
      const baseURL = await db.getSetting('baseURL', '');
      const useAgentMode = await db.getSetting('useAgentMode', false);
      const currentAgentId = await db.getSetting('currentAgentId', null);
      
      // Load data
      const mcpServers = await db.getMCPServers();
      const customTools = await db.getCustomTools();
      const agents = await db.getAgents();
      const chatSessions = await db.getChatSessions();
      
      const currentAgent = currentAgentId 
        ? agents.find(a => a.id === currentAgentId) || null 
        : null;
      
      set({
        currentProvider,
        currentModel,
        authToken,
        baseURL,
        useAgentMode,
        currentAgent,
        mcpServers,
        customTools,
        agents,
        chatSessions
      });
      
      // Initialize agent service
      const { agentService } = get();
      for (const agent of agents) {
        try {
          await agentService.createAgent(agent, mcpServers, customTools);
        } catch (error) {
          console.error(`Failed to initialize agent ${agent.name}:`, error);
        }
      }
    },
    
    // Connection actions
    connect: async () => {
      const { currentProvider, currentModel, authToken, baseURL, agentService } = get();
      
      if (!authToken.trim()) {
        throw new Error('API key is required');
      }
      
      try {
        const aiClient = new AIClient({
          provider: currentProvider,
          model: currentModel,
          authToken,
          baseURL: baseURL.trim() || undefined
        });
        
        await aiClient.connect();
        agentService.setAIClient(aiClient);
        
        set({ 
          aiClient, 
          connectionStatus: { 
            isConnected: true, 
            provider: currentProvider, 
            model: currentModel 
          }
        });
      } catch (error) {
        set({ 
          connectionStatus: { 
            isConnected: false, 
            error: error instanceof Error ? error.message : 'Connection failed' 
          }
        });
        throw error;
      }
    },
    
    disconnect: async () => {
      const { aiClient } = get();
      
      if (aiClient) {
        await aiClient.disconnect();
      }
      
      set({ 
        aiClient: null,
        connectionStatus: { isConnected: false }
      });
    },
    
    setProvider: async (provider: Provider) => {
      const { db } = get();
      await db.saveSetting('currentProvider', provider);
      set({ currentProvider: provider });
    },
    
    setModel: async (model: string) => {
      const { db } = get();
      await db.saveSetting('currentModel', model);
      set({ currentModel: model });
    },
    
    setAuthToken: async (token: string) => {
      const { db } = get();
      await db.saveSetting('authToken', token);
      set({ authToken: token });
    },

    setBaseURL: async (url: string) => {
      const { db } = get();
      await db.saveSetting('baseURL', url);
      set({ baseURL: url });
    },
    
    // Message actions
    sendMessage: async (content: string, files: File[] = []) => {
      const { 
        aiClient, 
        useAgentMode, 
        currentAgent, 
        agentService, 
        messages, 
        mcpServers, 
        customTools 
      } = get();
      
      if (!aiClient && !useAgentMode) {
        throw new Error('Not connected to AI provider');
      }
      
      if (useAgentMode && !currentAgent) {
        throw new Error('No agent selected');
      }
      
      set({ isLoading: true });
      
      try {
        // Add user message
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: new Date(),
          files: files.length > 0 ? await Promise.all(
            files.map(async (file) => ({
              id: crypto.randomUUID(),
              name: file.name,
              type: file.type,
              size: file.size,
              data: await fileToBase64(file)
            }))
          ) : undefined
        };
        
        set(state => ({ messages: [...state.messages, userMessage] }));
        
        let response: string;
        
        if (useAgentMode && currentAgent) {
          // Use agent service
          const result = await agentService.executeAgent(
            currentAgent.id,
            content,
            messages
          );
          response = result.response;
        } else if (aiClient) {
          // Use AI client directly
          const result = await aiClient.sendChatCompletion({
            messages: [...messages, userMessage],
            mcpServers,
            customTools
          });
          response = result.content;
        } else {
          throw new Error('No AI service available');
        }
        
        // Add assistant message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        set(state => ({ messages: [...state.messages, assistantMessage] }));
        
        // Auto-save chat session
        await get().saveChatSession();
        
      } catch (error) {
        // Add error message
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'system',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        };
        
        set(state => ({ messages: [...state.messages, errorMessage] }));
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    
    addMessage: async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
      const message: Message = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...messageData
      };
      set(state => ({ messages: [...state.messages, message] }));
    },
    
    clearMessages: () => {
      set({ messages: [], currentChatId: null });
    },
    
    // MCP Server actions
    addMCPServer: async (serverData: Omit<MCPServer, 'id'>) => {
      const { db, agentService, agents, customTools } = get();
      
      const server: MCPServer = {
        id: crypto.randomUUID(),
        ...serverData
      };
      
      await db.saveMCPServer(server);
      
      set(state => ({ mcpServers: [...state.mcpServers, server] }));
      
      // Update agents with new MCP server
      for (const agent of agents) {
        await agentService.updateAgent(agent, [server, ...get().mcpServers], customTools);
      }
    },
    
    removeMCPServer: async (id: string) => {
      const { db } = get();
      
      await db.deleteMCPServer(id);
      set(state => ({ mcpServers: state.mcpServers.filter(s => s.id !== id) }));
    },
    
    updateMCPServer: async (id: string, updates: Partial<MCPServer>) => {
      const { db } = get();
      
      set(state => ({
        mcpServers: state.mcpServers.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      }));
      
      const updatedServer = get().mcpServers.find(s => s.id === id);
      if (updatedServer) {
        await db.saveMCPServer(updatedServer);
      }
    },
    
    testMCPServer: async (id: string) => {
      const { mcpServers } = get();
      const server = mcpServers.find(s => s.id === id);
      
      if (!server) return false;
      
      try {
        // Test connection logic here
        return true;
      } catch {
        return false;
      }
    },
    
    // Custom tool actions
    addCustomTool: async (toolData: Omit<CustomTool, 'id'>) => {
      const { db } = get();
      
      const tool: CustomTool = {
        id: crypto.randomUUID(),
        ...toolData
      };
      
      await db.saveCustomTool(tool);
      set(state => ({ customTools: [...state.customTools, tool] }));
    },
    
    removeCustomTool: async (id: string) => {
      const { db } = get();
      
      await db.deleteCustomTool(id);
      set(state => ({ customTools: state.customTools.filter(t => t.id !== id) }));
    },
    
    updateCustomTool: async (id: string, updates: Partial<CustomTool>) => {
      const { db } = get();
      
      set(state => ({
        customTools: state.customTools.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      }));
      
      const updatedTool = get().customTools.find(t => t.id === id);
      if (updatedTool) {
        await db.saveCustomTool(updatedTool);
      }
    },
    
    // Agent actions
    addAgent: async (agentData: Omit<Agent, 'id' | 'createdAt'>) => {
      const { db, agentService, mcpServers, customTools } = get();
      
      const agent: Agent = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...agentData
      };
      
      await db.saveAgent(agent);
      await agentService.createAgent(agent, mcpServers, customTools);
      
      set(state => ({ agents: [...state.agents, agent] }));
    },
    
    removeAgent: async (id: string) => {
      const { db, agentService } = get();
      
      await db.deleteAgent(id);
      await agentService.removeAgent(id);
      
      set(state => {
        const newAgents = state.agents.filter(a => a.id !== id);
        const newCurrentAgent = state.currentAgent?.id === id ? null : state.currentAgent;
        return { 
          agents: newAgents, 
          currentAgent: newCurrentAgent,
          useAgentMode: newCurrentAgent ? state.useAgentMode : false
        };
      });
    },
    
    updateAgent: async (id: string, updates: Partial<Agent>) => {
      const { db, agentService, mcpServers, customTools } = get();
      
      set(state => ({
        agents: state.agents.map(a => 
          a.id === id ? { ...a, ...updates } : a
        ),
        currentAgent: state.currentAgent?.id === id 
          ? { ...state.currentAgent, ...updates } 
          : state.currentAgent
      }));
      
      const updatedAgent = get().agents.find(a => a.id === id);
      if (updatedAgent) {
        await db.saveAgent(updatedAgent);
        await agentService.updateAgent(updatedAgent, mcpServers, customTools);
      }
    },
    
    setCurrentAgent: async (agent: Agent | null) => {
      const { db } = get();
      await db.saveSetting('currentAgentId', agent?.id || null);
      set({ currentAgent: agent });
    },
    
    setUseAgentMode: async (useAgent: boolean) => {
      const { db } = get();
      await db.saveSetting('useAgentMode', useAgent);
      set({ useAgentMode: useAgent });
    },
    
    // Chat session actions
    saveChatSession: async () => {
      const { db, messages, currentChatId, currentProvider, currentModel } = get();
      
      if (messages.length === 0) return;
      
      const session: ChatSession = {
        id: currentChatId || crypto.randomUUID(),
        title: messages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'New Chat',
        provider: currentProvider,
        model: currentModel,
        messages: [...messages],
        timestamp: new Date().toISOString(),
        messageCount: messages.length
      };
      
      await db.saveChatSession(session);
      
      set(state => ({
        chatSessions: [session, ...state.chatSessions.filter(s => s.id !== session.id)],
        currentChatId: session.id
      }));
    },
    
    loadChatSession: async (id: string) => {
      const { chatSessions } = get();
      const session = chatSessions.find(s => s.id === id);
      
      if (session) {
        set({
          messages: [...session.messages],
          currentChatId: id,
          currentProvider: session.provider,
          currentModel: session.model
        });
      }
    },
    
    deleteChatSession: async (id: string) => {
      const { db } = get();
      
      await db.deleteChatSession(id);
      
      set(state => ({
        chatSessions: state.chatSessions.filter(s => s.id !== id),
        ...(state.currentChatId === id ? { messages: [], currentChatId: null } : {})
      }));
    },
    
    loadChatHistory: async () => {
      const { db } = get();
      const chatSessions = await db.getChatSessions();
      set({ chatSessions });
    },
    
    // File actions
    attachFile: (file: File) => {
      set(state => ({ attachedFiles: [...state.attachedFiles, file] }));
    },
    
    removeFile: (index: number) => {
      set(state => ({
        attachedFiles: state.attachedFiles.filter((_, i) => i !== index)
      }));
    },
    
    // Utility actions
    getHealthStatus: async () => {
      const { aiClient } = get();
      
      if (!aiClient) {
        return { aiProvider: { connected: false, error: 'Not connected' }, mcpServers: [] };
      }
      
      return await aiClient.getHealthStatus();
    }
  }))
)

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}