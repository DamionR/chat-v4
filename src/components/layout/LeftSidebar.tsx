import React, { useState, useMemo } from 'react'
import { Plus, MessageSquare, Trash2, Search, Download, Upload, X } from 'lucide-react'
import { useChatStore } from '../../store'
import { cn } from '../../utils/cn'

interface LeftSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose }) => {
  const { 
    chatSessions, 
    currentChatId, 
    clearMessages, 
    loadChatSession, 
    deleteChatSession,
    db,
    loadChatHistory
  } = useChatStore()
  
  const [searchQuery, setSearchQuery] = useState('')

  const handleNewChat = () => {
    clearMessages()
  }
  
  // Filter chat sessions based on search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return chatSessions
    
    const query = searchQuery.toLowerCase()
    return chatSessions.filter(session => 
      session.title.toLowerCase().includes(query) ||
      session.provider.toLowerCase().includes(query) ||
      new Date(session.timestamp).toLocaleDateString().includes(query)
    )
  }, [chatSessions, searchQuery])

  const handleLoadChat = (sessionId: string) => {
    loadChatSession(sessionId)
  }

  const handleDeleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChatSession(sessionId)
    }
  }
  
  const handleExportChats = async () => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        chatSessions: chatSessions,
        // Include messages for each chat session
        chatsWithMessages: await Promise.all(
          chatSessions.map(async (session) => {
            // Get messages for this session from the database
            const messages = await db.getMessagesForChat(session.id)
            return {
              ...session,
              messages
            }
          })
        )
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-chat-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export chat history')
    }
  }
  
  const handleImportChats = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (!importData.version || !importData.chatsWithMessages) {
        throw new Error('Invalid import file format')
      }
      
      if (confirm('This will add the imported chats to your existing history. Continue?')) {
        // Import each chat session with its messages
        for (const chatData of importData.chatsWithMessages) {
          const { messages, ...sessionData } = chatData
          // Save the chat session and its messages
          await db.saveChatSession(sessionData)
          // Save messages for this chat
          for (let i = 0; i < messages.length; i++) {
            await db.saveMessage(sessionData.id, messages[i], i)
          }
        }
        
        // Reload chat history
        await loadChatHistory()
        alert('Chat history imported successfully!')
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import chat history. Please check the file format.')
    }
    
    // Reset the input
    event.target.value = ''
  }
  

  if (!isOpen) {
    return null
  }

  return (
    <div className="w-80 sidebar border-r border-dark-200 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-dark-200 space-y-3">
        {/* Close Button */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-dark-50">Chat History</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-300 rounded transition-colors"
              title="Hide sidebar"
            >
              <X size={16} className="text-dark-100" />
            </button>
          )}
        </div>
        <button
          onClick={handleNewChat}
          className="w-full btn btn-primary flex items-center gap-2 justify-center"
        >
          <Plus size={16} />
          New Chat
        </button>
        
        {/* Search Box */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-100" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-dark-300 border border-dark-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
        
        {/* Export/Import Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportChats}
            className="flex-1 btn btn-secondary text-xs flex items-center gap-1 justify-center py-2"
            disabled={chatSessions.length === 0}
          >
            <Download size={14} />
            Export
          </button>
          <label className="flex-1 btn btn-secondary text-xs flex items-center gap-1 justify-center py-2 cursor-pointer">
            <Upload size={14} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportChats}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-dark-100 mb-3">
          Chat History {searchQuery && `(${filteredSessions.length} results)`}
        </h3>
        
        {filteredSessions.length === 0 ? (
          <p className="text-dark-100 text-sm text-center py-8">
            {searchQuery ? 'No chats found matching your search' : 'No chat history yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleLoadChat(session.id)}
                className={cn(
                  "group p-3 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-dark-300 flex items-start justify-between",
                  currentChatId === session.id && "bg-dark-300"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare size={14} className="text-dark-100 flex-shrink-0" />
                    <span className="text-xs text-dark-100">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-dark-50 truncate">
                    {session.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-dark-100">
                      {session.provider} - {session.messageCount} messages
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => handleDeleteChat(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeftSidebar