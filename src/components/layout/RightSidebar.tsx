import React, { useState } from 'react'
import { Settings, Bot, Wrench, Server, X } from 'lucide-react'
import ConnectionSettings from '../settings/ConnectionSettings'
import AgentSettings from '../settings/AgentSettings'
import MCPSettings from '../settings/MCPSettings'
import ToolSettings from '../settings/ToolSettings'

type TabType = 'connection' | 'agents' | 'mcp' | 'tools'

interface RightSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('connection')

  const tabs = [
    { id: 'connection' as TabType, label: 'Connection', icon: Settings },
    { id: 'agents' as TabType, label: 'Agents', icon: Bot },
    { id: 'mcp' as TabType, label: 'MCP Servers', icon: Server },
    { id: 'tools' as TabType, label: 'Tools', icon: Wrench },
  ]

  if (!isOpen) {
    return null
  }

  return (
    <div className="w-80 sidebar border-l border-dark-200 flex flex-col transition-all duration-300">
      {/* Header with Tabs */}
      <div className="border-b border-dark-200">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-medium text-dark-50">Settings & Tools</h2>
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
        
        <div className="flex border-b border-dark-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-3 text-xs font-medium transition-colors border-r border-dark-200 last:border-r-0 ${
                activeTab === tab.id
                  ? 'text-primary-500 bg-dark-300'
                  : 'text-dark-100 hover:text-dark-50 hover:bg-dark-400'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'connection' && <ConnectionSettings />}
        {activeTab === 'agents' && <AgentSettings />}
        {activeTab === 'mcp' && <MCPSettings />}
        {activeTab === 'tools' && <ToolSettings />}
      </div>
    </div>
  )
}

export default RightSidebar