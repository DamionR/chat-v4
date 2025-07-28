import React, { useEffect, useRef } from 'react'
import { User, Bot } from 'lucide-react'
import { useChatStore } from '../../store'

const ChatMessages: React.FC = () => {
  const { messages } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role !== 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
            )}
            
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'message-user ml-12'
                  : 'message-assistant mr-12'
              }`}
            >
              {/* Message Content */}
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>

              {/* File Attachments */}
              {message.files && message.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 bg-black/20 rounded text-xs"
                    >
                      <span>📎</span>
                      <span>{file.name}</span>
                      <span className="text-dark-100">
                        ({(file.size / 1024).toFixed(1)}KB)
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-2 text-xs opacity-60">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-dark-300 rounded-full flex items-center justify-center">
                <User size={16} className="text-dark-50" />
              </div>
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatMessages