import React, { useState, useRef } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import { useChatStore } from '../../store'

const ChatInput: React.FC = () => {
  const {
    attachedFiles,
    connectionStatus,
    currentAgent,
    useAgentMode,
    isLoading,
    sendMessage,
    attachFile,
    removeFile
  } = useChatStore()

  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const placeholder = useAgentMode && currentAgent 
    ? `Message ${currentAgent.name}...`
    : 'Type your message...'

  const canSend = message.trim() && (connectionStatus.isConnected || (useAgentMode && currentAgent)) && !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSend) return

    const messageContent = message.trim()
    const files = [...attachedFiles]
    
    setMessage('')
    
    // Clear attached files
    attachedFiles.forEach((_, index) => removeFile(index))

    try {
      await sendMessage(messageContent, files)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => attachFile(file))
    e.target.value = '' // Reset input
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files)
    files.forEach(file => attachFile(file))
  }

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }

  React.useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  return (
    <div className="border-t border-dark-200 bg-dark-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* File Attachments */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-dark-400 rounded-lg text-sm"
              >
                <Paperclip size={14} />
                <span className="truncate max-w-32">{file.name}</span>
                <span className="text-dark-100 text-xs">
                  ({(file.size / 1024).toFixed(1)}KB)
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-dark-300 rounded"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              id="message-input"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              disabled={!connectionStatus.isConnected || isLoading}
              className="form-input w-full resize-none min-h-12 max-h-48 pr-12"
              rows={1}
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!connectionStatus.isConnected || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-200 rounded transition-colors disabled:opacity-50"
            >
              <Paperclip size={16} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className="btn btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.txt,.md,.json,.csv"
          />
        </form>

        {/* Status Messages */}
        {!connectionStatus.isConnected && !useAgentMode && (
          <p className="text-xs text-dark-100 mt-2 text-center">
            Connect to an AI provider to start chatting
          </p>
        )}

        {useAgentMode && !currentAgent && (
          <p className="text-xs text-yellow-400 mt-2 text-center">
            Select an agent to start chatting
          </p>
        )}
        
        {useAgentMode && currentAgent && (
          <p className="text-xs text-primary-400 mt-2 text-center">
            🤖 Agent mode active - {currentAgent.name}
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatInput