import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatLayout from './components/layout/ChatLayout'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'
import { useChatStore } from './store'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  const initialize = useChatStore(state => state.initialize)
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts()
  
  // Full AI Chat Client with Node.js polyfills for browser compatibility

  useEffect(() => {
    initialize().catch(error => {
      console.error('Failed to initialize app:', error)
    })
  }, [initialize])

  return (
    <div className="h-screen bg-dark-500 text-dark-50">
      <Routes>
        <Route path="/" element={<ChatLayout />}>
          <Route index element={<ChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App