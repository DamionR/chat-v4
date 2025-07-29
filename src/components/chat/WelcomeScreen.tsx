import React from 'react'
import { Bot, Sparkles, MessageSquare, Settings } from 'lucide-react'
import { useChatStore } from '../../store'

const WelcomeScreen: React.FC = () => {
  const { connectionStatus, currentAgent, useAgentMode } = useChatStore()

  const examplePrompts = [
    "Help me write a professional email",
    "Explain quantum computing in simple terms",
    "Create a React component for me",
    "What are the latest trends in AI?"
  ]

  const sendMessage = useChatStore(state => state.sendMessage)

  const handleExampleClick = async (prompt: string) => {
    try {
      await sendMessage(prompt)
    } catch (error) {
      console.error('Failed to send example prompt:', error)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {useAgentMode && currentAgent ? (
              <Bot size={48} className="text-primary-500" />
            ) : (
              <Sparkles size={48} className="text-primary-500" />
            )}
          </div>
          
          <h1 className="text-4xl font-light text-dark-50 mb-4">
            {useAgentMode && currentAgent 
              ? `Chat with ${currentAgent.name}`
              : 'Chat-V4'
            }
          </h1>
          
          <p className="text-dark-100 text-lg max-w-md mx-auto">
            {useAgentMode && currentAgent 
              ? currentAgent.description
              : 'Start a conversation with your AI assistant. Connect to begin chatting.'
            }
          </p>
        </div>

        {/* Connection Status */}
        {!connectionStatus.isConnected && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Settings size={20} />
              <span>Please connect to an AI provider using the settings panel →</span>
            </div>
          </div>
        )}

        {/* Example Prompts */}
        {connectionStatus.isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                className="p-4 text-left bg-dark-400 border border-dark-200 rounded-lg hover:bg-dark-300 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <MessageSquare size={16} className="text-dark-100 mt-1 flex-shrink-0" />
                  <span className="text-sm text-dark-50 group-hover:text-white">
                    {prompt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Agent Info */}
        {useAgentMode && currentAgent && (
          <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-primary-400 mb-2">
              <Bot size={16} />
              <span className="text-sm font-medium">Agent Mode Active</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {currentAgent.capabilities.multimodal && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  Multimodal
                </span>
              )}
              {currentAgent.capabilities.functionCalling && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                  Functions
                </span>
              )}
              {currentAgent.capabilities.mcpServers && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                  MCP
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomeScreen