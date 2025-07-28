import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { Agent } from '../../types'

interface AgentModalProps {
  agent: Agent | null
  onClose: () => void
  onSave: (agentData: Omit<Agent, 'id' | 'createdAt'>) => void
}

const AgentModal: React.FC<AgentModalProps> = ({ agent, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    description: agent?.description || '',
    instructions: agent?.instructions || '',
    temperature: agent?.temperature || 0.7,
    maxTokens: agent?.maxTokens || 2048,
    capabilities: {
      multimodal: agent?.capabilities.multimodal ?? true,
      functionCalling: agent?.capabilities.functionCalling ?? true,
      mcpServers: agent?.capabilities.mcpServers ?? true,
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.instructions.trim()) {
      alert('Please enter both agent name and instructions')
      return
    }

    onSave(formData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCapabilityChange = (capability: keyof typeof formData.capabilities, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      capabilities: { ...prev.capabilities, [capability]: value }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-600 rounded-lg border border-dark-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-200">
          <h3 className="text-lg font-semibold text-dark-50">
            {agent ? 'Edit Agent' : '🤖 Create AI Agent'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-300 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-100 mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="My Assistant Agent"
              className="form-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-100 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the agent"
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-100 mb-2">
              System Instructions *
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="You are a helpful AI assistant specialized in...

Always be professional and provide detailed explanations.
Use the available tools when appropriate."
              className="form-input w-full min-h-20 resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-100 mb-2">
                Temperature (0.0 - 2.0)
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="form-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-100 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                step="100"
                value={formData.maxTokens}
                onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                className="form-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-100 mb-3">
              Capabilities
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={formData.capabilities.multimodal}
                  onChange={(e) => handleCapabilityChange('multimodal', e.target.checked)}
                  className="rounded border-dark-200 bg-dark-300 text-primary-500"
                />
                Multimodal (Images & Files)
              </label>
              
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={formData.capabilities.functionCalling}
                  onChange={(e) => handleCapabilityChange('functionCalling', e.target.checked)}
                  className="rounded border-dark-200 bg-dark-300 text-primary-500"
                />
                Function Calling & Tools
              </label>
              
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={formData.capabilities.mcpServers}
                  onChange={(e) => handleCapabilityChange('mcpServers', e.target.checked)}
                  className="rounded border-dark-200 bg-dark-300 text-primary-500"
                />
                MCP Server Access
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              {agent ? 'Update Agent' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AgentModal