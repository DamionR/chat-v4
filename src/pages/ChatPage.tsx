import React, { useState } from 'react'
import { Keyboard } from 'lucide-react'
import { useChatStore } from '../store'
import WelcomeScreen from '../components/chat/WelcomeScreen'
import ChatMessages from '../components/chat/ChatMessages'
import ChatInput from '../components/chat/ChatInput'
import KeyboardShortcutsModal from '../components/modals/KeyboardShortcutsModal'

const ChatPage: React.FC = () => {
  const { messages, connectionStatus } = useChatStore()
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      {connectionStatus.isConnected && (
        <div className="px-4 py-2 bg-dark-600 border-b border-dark-200">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <span className="text-xs text-primary-500">
              🟢 Connected to {connectionStatus.provider} - {connectionStatus.model}
            </span>
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-1 hover:bg-dark-400 rounded transition-colors"
              title="Keyboard shortcuts"
            >
              <Keyboard size={16} className="text-dark-100" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <ChatMessages />
        )}
        
        <ChatInput />
      </div>
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  )
}

export default ChatPage