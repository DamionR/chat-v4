import initSqlJs, { Database } from 'sql.js';
import type { 
  ChatSession, 
  Message, 
  MCPServer, 
  CustomTool, 
  Agent, 
  FileAttachment 
} from '../types';

export class SQLiteManager {
  private db: Database | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file) => {
          // In production (GitHub Pages), load from the correct base path
          if (process.env.NODE_ENV === 'production') {
            return `/chat-v4/${file}`;
          }
          return `/${file}`;
        }
      });

      // Try to load existing database from OPFS
      const savedDb = await this.loadFromOPFS();
      if (savedDb) {
        this.db = new SQL.Database(savedDb);
      } else {
        this.db = new SQL.Database();
      }

      await this.createTables();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Chat sessions table
      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        message_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Messages table
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
      )`,

      // File attachments table
      `CREATE TABLE IF NOT EXISTS file_attachments (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
      )`,

      // MCP servers table
      `CREATE TABLE IF NOT EXISTS mcp_servers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        token TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Custom tools table
      `CREATE TABLE IF NOT EXISTS custom_tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        parameters TEXT NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Agents table
      `CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        instructions TEXT NOT NULL,
        temperature REAL DEFAULT 0.7,
        max_tokens INTEGER DEFAULT 2048,
        multimodal BOOLEAN DEFAULT TRUE,
        function_calling BOOLEAN DEFAULT TRUE,
        mcp_servers BOOLEAN DEFAULT TRUE,
        selected_mcp_servers TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      this.db.run(tableSQL);
    }

    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (!this.db) return;
    
    const buffer = this.db.export();
    this.saveToOPFS(buffer);
  }

  private async loadFromOPFS(): Promise<Uint8Array | null> {
    try {
      // Check if OPFS is supported
      if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) {
        console.warn('OPFS not supported, falling back to IndexedDB');
        return await this.loadFromIndexedDB();
      }

      const opfsRoot = await navigator.storage.getDirectory();
      
      try {
        const fileHandle = await opfsRoot.getFileHandle('chatbot.db');
        const file = await fileHandle.getFile();
        const buffer = await file.arrayBuffer();
        return new Uint8Array(buffer);
      } catch (error) {
        // File doesn't exist yet
        return null;
      }
    } catch (error) {
      console.error('OPFS load failed, falling back to IndexedDB:', error);
      return await this.loadFromIndexedDB();
    }
  }

  private async saveToOPFS(buffer: Uint8Array): Promise<void> {
    try {
      // Check if OPFS is supported
      if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) {
        console.warn('OPFS not supported, falling back to IndexedDB');
        await this.saveToIndexedDB(buffer);
        return;
      }

      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle('chatbot.db', { create: true });
      const writable = await fileHandle.createWritable();
      
      await writable.write(buffer);
      await writable.close();
    } catch (error) {
      console.error('OPFS save failed, falling back to IndexedDB:', error);
      await this.saveToIndexedDB(buffer);
    }
  }

  // Fallback IndexedDB methods for older browsers
  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('ChatbotDB', 1);
      
      request.onerror = () => resolve(null);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sqlite')) {
          db.createObjectStore('sqlite');
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['sqlite'], 'readonly');
        const store = transaction.objectStore('sqlite');
        const getRequest = store.get('database');
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result ? new Uint8Array(result) : null);
        };
        
        getRequest.onerror = () => resolve(null);
      };
    });
  }

  private async saveToIndexedDB(buffer: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ChatbotDB', 1);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sqlite')) {
          db.createObjectStore('sqlite');
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['sqlite'], 'readwrite');
        const store = transaction.objectStore('sqlite');
        const putRequest = store.put(Array.from(buffer), 'database');
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to save to IndexedDB'));
      };
    });
  }

  // Settings methods
  async saveSetting(key: string, value: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run([key, JSON.stringify(value)]);
    stmt.free();
    this.saveToStorage();
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    await this.init();
    if (!this.db) return defaultValue;

    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.getAsObject([key]);
    stmt.free();

    if (result.value) {
      try {
        return JSON.parse(result.value as string);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  // Chat session methods
  async saveChatSession(session: ChatSession): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO chat_sessions 
      (id, title, provider, model, message_count, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run([
      session.id,
      session.title,
      session.provider,
      session.model,
      session.messageCount,
      session.timestamp
    ]);
    stmt.free();

    // Save messages
    for (let i = 0; i < session.messages.length; i++) {
      await this.saveMessage(session.messages[i], session.id, i);
    }

    this.saveToStorage();
  }

  async getChatSessions(): Promise<ChatSession[]> {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM chat_sessions 
      ORDER BY updated_at DESC
    `);
    
    const sessions: ChatSession[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const messages = await this.getMessagesForChat(row.id as string);
      
      sessions.push({
        id: row.id as string,
        title: row.title as string,
        provider: row.provider as any,
        model: row.model as string,
        messages,
        timestamp: row.created_at as string,
        messageCount: row.message_count as number
      });
    }
    stmt.free();
    
    return sessions;
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM chat_sessions WHERE id = ?');
    stmt.run([sessionId]);
    stmt.free();
    this.saveToStorage();
  }

  // Message methods
  async saveMessage(message: Message, chatId: string, orderIndex: number): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO messages 
      (id, chat_id, role, content, created_at, order_index) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      message.id,
      chatId,
      message.role,
      message.content,
      message.timestamp.toISOString(),
      orderIndex
    ]);
    stmt.free();

    // Save file attachments
    if (message.files) {
      for (const file of message.files) {
        await this.saveFileAttachment(file, message.id);
      }
    }

    this.saveToStorage();
  }

  async getMessagesForChat(_chatId: string): Promise<Message[]> {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE chat_id = ? 
      ORDER BY order_index ASC
    `);
    
    const messages: Message[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const files = await this.getFileAttachmentsForMessage(row.id as string);
      
      messages.push({
        id: row.id as string,
        role: row.role as any,
        content: row.content as string,
        timestamp: new Date(row.created_at as string),
        files: files.length > 0 ? files : undefined
      });
    }
    stmt.free();
    
    return messages;
  }

  // File attachment methods
  async saveFileAttachment(file: FileAttachment, messageId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO file_attachments 
      (id, message_id, name, type, size, data, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run([file.id, messageId, file.name, file.type, file.size, file.data]);
    stmt.free();
    this.saveToStorage();
  }

  async getFileAttachmentsForMessage(_messageId: string): Promise<FileAttachment[]> {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM file_attachments 
      WHERE message_id = ?
    `);
    
    const files: FileAttachment[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      files.push({
        id: row.id as string,
        name: row.name as string,
        type: row.type as string,
        size: row.size as number,
        data: row.data as string
      });
    }
    stmt.free();
    
    return files;
  }

  // MCP Server methods
  async saveMCPServer(server: MCPServer): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO mcp_servers 
      (id, name, url, token, enabled, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    stmt.run([server.id, server.name, server.url, server.token || null, server.enabled ? 1 : 0]);
    stmt.free();
    this.saveToStorage();
  }

  async getMCPServers(): Promise<MCPServer[]> {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare('SELECT * FROM mcp_servers ORDER BY created_at DESC');
    const servers: MCPServer[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      servers.push({
        id: row.id as string,
        name: row.name as string,
        url: row.url as string,
        token: row.token as string || undefined,
        enabled: Boolean(row.enabled)
      });
    }
    stmt.free();
    
    return servers;
  }

  async deleteMCPServer(serverId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM mcp_servers WHERE id = ?');
    stmt.run([serverId]);
    stmt.free();
    this.saveToStorage();
  }

  // Custom Tool methods
  async saveCustomTool(tool: CustomTool): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO custom_tools 
      (id, name, description, parameters, enabled, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    stmt.run([
      tool.id, 
      tool.name, 
      tool.description, 
      JSON.stringify(tool.parameters), 
      tool.enabled ? 1 : 0
    ]);
    stmt.free();
    this.saveToStorage();
  }

  async getCustomTools(): Promise<CustomTool[]> {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare('SELECT * FROM custom_tools ORDER BY created_at DESC');
    const tools: CustomTool[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      tools.push({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        parameters: JSON.parse(row.parameters as string),
        enabled: Boolean(row.enabled)
      });
    }
    stmt.free();
    
    return tools;
  }

  async deleteCustomTool(toolId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM custom_tools WHERE id = ?');
    stmt.run([toolId]);
    stmt.free();
    this.saveToStorage();
  }

  // Agent methods
  async saveAgent(agent: Agent): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agents 
      (id, name, description, instructions, temperature, max_tokens, 
       multimodal, function_calling, mcp_servers, selected_mcp_servers, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run([
      agent.id,
      agent.name,
      agent.description,
      agent.instructions,
      agent.temperature,
      agent.maxTokens,
      agent.capabilities.multimodal ? 1 : 0,
      agent.capabilities.functionCalling ? 1 : 0,
      agent.capabilities.mcpServers ? 1 : 0,
      JSON.stringify(agent.selectedMCPServers),
      agent.createdAt
    ]);
    stmt.free();
    this.saveToStorage();
  }

  async getAgents(): Promise<Agent[]> {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare('SELECT * FROM agents ORDER BY created_at DESC');
    const agents: Agent[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      agents.push({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        instructions: row.instructions as string,
        temperature: row.temperature as number,
        maxTokens: row.max_tokens as number,
        capabilities: {
          multimodal: Boolean(row.multimodal),
          functionCalling: Boolean(row.function_calling),
          mcpServers: Boolean(row.mcp_servers)
        },
        selectedMCPServers: row.selected_mcp_servers ? JSON.parse(row.selected_mcp_servers as string) : [],
        createdAt: row.created_at as string
      });
    }
    stmt.free();
    
    return agents;
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM agents WHERE id = ?');
    stmt.run([agentId]);
    stmt.free();
    this.saveToStorage();
  }
}