import React, { useState } from 'react'
import { Plus, Server, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useChatStore } from '../../store'
import ConfirmationModal from '../modals/ConfirmationModal'

const MCPSettings: React.FC = () => {
  const { mcpServers, addMCPServer, removeMCPServer, updateMCPServer } = useChatStore()
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    token: ''
  })
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title?: string
    message?: string
    type?: 'confirm' | 'alert'
    serverId?: string
  }>({ isOpen: false })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.url.trim()) {
      setConfirmModal({
        isOpen: true,
        title: 'Missing Information',
        message: 'Please enter both server name and URL.',
        type: 'alert'
      })
      return
    }

    addMCPServer({
      name: formData.name.trim(),
      url: formData.url.trim(),
      token: formData.token.trim() || undefined,
      enabled: true
    })

    setFormData({ name: '', url: '', token: '' })
  }

  const toggleServer = (serverId: string, enabled: boolean) => {
    updateMCPServer(serverId, { enabled })
  }

  const deleteServer = (serverId: string) => {
    setConfirmModal({ isOpen: true, serverId })
  }

  return (
    <div className="space-y-6">
      {/* Add MCP Server Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xs font-medium text-dark-100">Add MCP Server</h3>
        
        <div>
          <label className="block text-xs font-medium text-dark-100 mb-2">
            Server Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="my-server"
            className="form-input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-100 mb-2">
            Server URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://api.example.com/sse"
            className="form-input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-100 mb-2">
            OAuth Token (Optional)
          </label>
          <input
            type="password"
            value={formData.token}
            onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
            placeholder="Bearer token"
            className="form-input w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full btn btn-secondary flex items-center gap-2 justify-center"
        >
          <Plus size={16} />
          Add Server
        </button>
      </form>

      {/* MCP Servers List */}
      <div>
        <h3 className="text-xs font-medium text-dark-100 mb-3">
          MCP Servers ({mcpServers.length})
        </h3>
        
        {mcpServers.length === 0 ? (
          <p className="text-dark-100 text-xs text-center py-4">
            No MCP servers configured
          </p>
        ) : (
          <div className="space-y-2">
            {mcpServers.map((server) => (
              <div
                key={server.id}
                className="p-3 bg-dark-400 rounded-lg border border-dark-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Server size={14} className="text-primary-500 flex-shrink-0" />
                      <h4 className="text-sm font-medium text-dark-50 truncate">
                        {server.name}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-dark-100 truncate">
                      {server.url}
                    </p>
                    
                    {server.token && (
                      <p className="text-xs text-green-400 mt-1">
                        🔒 Authenticated
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => toggleServer(server.id, !server.enabled)}
                      className="p-1 hover:bg-dark-300 rounded transition-colors"
                      title={server.enabled ? 'Disable server' : 'Enable server'}
                    >
                      {server.enabled ? (
                        <ToggleRight size={16} className="text-primary-500" />
                      ) : (
                        <ToggleLeft size={16} className="text-dark-100" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => deleteServer(server.id)}
                      className="p-1 hover:bg-red-500 rounded transition-colors"
                      title="Delete server"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded ${
                    server.enabled 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {server.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title || (confirmModal.serverId ? 'Delete MCP Server' : 'Missing Information')}
        message={confirmModal.message || (confirmModal.serverId 
          ? 'Are you sure you want to delete this MCP server? This action cannot be undone.'
          : 'Please enter both server name and URL.'
        )}
        type={confirmModal.type || (confirmModal.serverId ? 'confirm' : 'alert')}
        variant={confirmModal.serverId ? 'danger' : 'default'}
        onConfirm={() => {
          if (confirmModal.serverId) {
            removeMCPServer(confirmModal.serverId)
          }
          setConfirmModal({ isOpen: false })
        }}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  )
}

export default MCPSettings