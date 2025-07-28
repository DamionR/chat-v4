import React, { useState } from 'react'
import { Bot, Trash2, Edit } from 'lucide-react'
import { useChatStore } from '../../store'
import type { Agent } from '../../types'
import AgentModal from '../modals/AgentModal'

const AgentSettings: React.FC = () => {
  const {
    agents,
    currentAgent,
    useAgentMode,
    addAgent,
    removeAgent,
    setCurrentAgent,
    setUseAgentMode
  } = useChatStore()

  const [showModal, setShowModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const handleCreateAgent = () => {
    setEditingAgent(null)
    setShowModal(true)
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setShowModal(true)
  }

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      removeAgent(agentId)
    }
  }

  const handleAgentModeToggle = (enabled: boolean) => {
    setUseAgentMode(enabled)
    if (!enabled) {
      setCurrentAgent(null)
    }
  }

  const handleAgentSelect = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    setCurrentAgent(agent || null)
  }

  return (
    <div className="space-y-6">
      {/* Create Agent Button */}
      <button
        onClick={handleCreateAgent}
        className="w-full btn btn-secondary flex items-center gap-2 justify-center"
      >
        <Bot size={16} />
        Create Agent
      </button>

      {/* Agents List */}
      <div>
        <h3 className="text-xs font-medium text-dark-100 mb-3">Your Agents</h3>
        
        {agents.length === 0 ? (
          <p className="text-dark-100 text-xs text-center py-4">
            No agents created yet
          </p>
        ) : (
          <div className="space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 bg-dark-400 rounded-lg border border-dark-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-dark-50 truncate">
                      {agent.name}
                    </h4>
                    <p className="text-xs text-dark-100 mt-1 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditAgent(agent)}
                      className="p-1 hover:bg-dark-300 rounded transition-colors"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="p-1 hover:bg-red-500 rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1 text-xs">
                  {agent.capabilities.multimodal && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                      Multimodal
                    </span>
                  )}
                  {agent.capabilities.functionCalling && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      Functions
                    </span>
                  )}
                  {agent.capabilities.mcpServers && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                      MCP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Mode Toggle */}
      {agents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-dark-100">
              Use Agent Mode
            </label>
            <input
              type="checkbox"
              checked={useAgentMode}
              onChange={(e) => handleAgentModeToggle(e.target.checked)}
              className="rounded border-dark-200 bg-dark-300 text-primary-500 focus:ring-primary-500"
            />
          </div>

          {useAgentMode && (
            <div>
              <label className="block text-xs font-medium text-dark-100 mb-2">
                Active Agent
              </label>
              <select
                value={currentAgent?.id || ''}
                onChange={(e) => handleAgentSelect(e.target.value)}
                className="form-select w-full"
              >
                <option value="">Select an agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Agent Modal */}
      {showModal && (
        <AgentModal
          agent={editingAgent}
          onClose={() => setShowModal(false)}
          onSave={(agentData) => {
            if (editingAgent) {
              // TODO: Update existing agent
            } else {
              addAgent(agentData)
            }
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

export default AgentSettings