import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeft, PanelRight } from 'lucide-react'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

const ChatLayout: React.FC = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Chat History */}
      <LeftSidebar isOpen={leftSidebarOpen} onClose={() => setLeftSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Sidebar Toggle Buttons */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!leftSidebarOpen && (
            <button
              onClick={() => setLeftSidebarOpen(true)}
              className="p-2 bg-dark-600 hover:bg-dark-400 rounded-lg border border-dark-200 transition-colors"
              title="Show chat history"
            >
              <PanelLeft size={16} className="text-dark-50" />
            </button>
          )}
        </div>
        
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {!rightSidebarOpen && (
            <button
              onClick={() => setRightSidebarOpen(true)}
              className="p-2 bg-dark-600 hover:bg-dark-400 rounded-lg border border-dark-200 transition-colors"
              title="Show settings"
            >
              <PanelRight size={16} className="text-dark-50" />
            </button>
          )}
        </div>
        
        <Outlet />
      </div>
      
      {/* Right Sidebar - Settings & Tools */}
      <RightSidebar isOpen={rightSidebarOpen} onClose={() => setRightSidebarOpen(false)} />
    </div>
  )
}

export default ChatLayout