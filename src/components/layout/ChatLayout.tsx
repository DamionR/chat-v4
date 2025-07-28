import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Chat History */}
      <LeftSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
      
      {/* Right Sidebar - Settings & Tools */}
      <RightSidebar />
    </div>
  )
}

export default ChatLayout