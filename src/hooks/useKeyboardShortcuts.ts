import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../store'

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate()
  const { clearMessages, sendMessage, messages } = useChatStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      
      // Cmd/Ctrl + K - New chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        clearMessages()
        // Focus on the message input
        const messageInput = document.querySelector('#message-input') as HTMLTextAreaElement
        messageInput?.focus()
      }
      
      // Cmd/Ctrl + / - Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="Search chats..."]') as HTMLInputElement
        searchInput?.focus()
      }
      
      // Cmd/Ctrl + S - Save/Export current chat
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        const exportButton = document.querySelector('button:has(svg[class*="Download"])') as HTMLButtonElement
        exportButton?.click()
      }
      
      // Cmd/Ctrl + , - Open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        navigate('/settings')
      }
      
      // Escape - Clear message input or go back from settings
      if (e.key === 'Escape' && !isTyping) {
        if (window.location.pathname === '/settings') {
          navigate('/')
        } else {
          const messageInput = document.querySelector('#message-input') as HTMLTextAreaElement
          if (messageInput) {
            messageInput.value = ''
          }
        }
      }
      
      // Cmd/Ctrl + Shift + C - Copy last assistant message
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
        if (lastAssistantMessage && typeof lastAssistantMessage.content === 'string') {
          navigator.clipboard.writeText(lastAssistantMessage.content)
        }
      }
      
      // Alt + Up/Down - Navigate through chat history
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const chatItems = document.querySelectorAll('[class*="chat-item"]')
        const currentIndex = Array.from(chatItems).findIndex(item => 
          item.classList.contains('bg-dark-300')
        )
        
        let nextIndex = currentIndex
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          nextIndex = currentIndex - 1
        } else if (e.key === 'ArrowDown' && currentIndex < chatItems.length - 1) {
          nextIndex = currentIndex + 1
        }
        
        if (nextIndex !== currentIndex && chatItems[nextIndex]) {
          (chatItems[nextIndex] as HTMLElement).click()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearMessages, navigate, messages, sendMessage])
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'New chat' },
  { keys: ['⌘', '/'], description: 'Search chats' },
  { keys: ['⌘', 'S'], description: 'Export current chat' },
  { keys: ['⌘', ','], description: 'Open settings' },
  { keys: ['⌘', '⇧', 'C'], description: 'Copy last AI response' },
  { keys: ['⌥', '↑/↓'], description: 'Navigate chat history' },
  { keys: ['Esc'], description: 'Clear input / Go back' },
]