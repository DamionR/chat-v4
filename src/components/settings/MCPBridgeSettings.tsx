import React, { useState, useEffect } from 'react'
import { Link, Plus, Server, Trash2, Play, Square } from 'lucide-react'
import { mcpBridge } from '../../services/mcp-bridge'
import ConfirmationModal from '../modals/ConfirmationModal'
import InputModal from '../modals/InputModal'

interface StdioServer {
  id: string
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  enabled: boolean
  connected?: boolean
}

const MCPBridgeSettings: React.FC = () => {
  const [stdioServers, setStdioServers] = useState<StdioServer[]>([])
  const [bridgedServers, setBridgedServers] = useState<Array<{ id: string; name: string; connected: boolean }>>([])
  const [showPresets, setShowPresets] = useState(false)
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title?: string
    message?: string
    type?: 'confirm' | 'alert'
    onConfirm?: () => void
  }>({ isOpen: false })
  
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean
    step: 'command' | 'args' | 'env'
    title: string
    label: string
    placeholder: string
    type: 'text' | 'textarea'
    tempData?: { name?: string; command?: string; args?: string }
  }>({ isOpen: false, step: 'command', title: '', label: '', placeholder: '', type: 'text' })

  useEffect(() => {
    // Load saved stdio servers from localStorage
    const saved = localStorage.getItem('chat-v4-stdio-servers')
    if (saved) {
      try {
        setStdioServers(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load stdio servers:', error)
      }
    }
    
    updateBridgedServers()
  }, [])

  const updateBridgedServers = async () => {
    const servers = await mcpBridge.getBridgedServers()
    setBridgedServers(servers)
  }

  const saveStdioServers = (servers: StdioServer[]) => {
    setStdioServers(servers)
    localStorage.setItem('chat-v4-stdio-servers', JSON.stringify(servers))
  }

  const addPresetServer = (preset: any) => {
    const newServer: StdioServer = {
      id: Date.now().toString(),
      name: preset.name,
      command: preset.command,
      args: preset.args,
      env: preset.env || {},
      enabled: false
    }
    
    const updated = [...stdioServers, newServer]
    saveStdioServers(updated)
    setShowPresets(false)
  }

  const addCustomServer = () => {
    setInputModal({
      isOpen: true,
      step: 'command',
      title: 'Add Custom Stdio Server',
      label: 'Server Name',
      placeholder: 'My Custom Server',
      type: 'text'
    })
  }

  const handleInputSubmit = (value: string) => {
    const { step, tempData = {} } = inputModal
    
    if (step === 'command') {
      setInputModal({
        isOpen: true,
        step: 'args',
        title: 'Add Custom Stdio Server',
        label: 'Command',
        placeholder: 'npx @modelcontextprotocol/server-example',
        type: 'text',
        tempData: { ...tempData, name: value }
      })
    } else if (step === 'args') {
      setInputModal({
        isOpen: true,
        step: 'env',
        title: 'Add Custom Stdio Server',
        label: 'Arguments (space-separated)',
        placeholder: '--option value --flag',
        type: 'text',
        tempData: { ...tempData, command: value }
      })
    } else if (step === 'env') {
      setInputModal({
        isOpen: true,
        step: 'env',
        title: 'Add Custom Stdio Server',
        label: 'Environment Variables (JSON)',
        placeholder: '{"API_KEY": "your-key", "DEBUG": "true"}',
        type: 'textarea',
        tempData: { ...tempData, args: value }
      })
    }
    
    // Final step - create server
    if (step === 'env' && tempData.name && tempData.command) {
      let env = {}
      if (value.trim()) {
        try {
          env = JSON.parse(value)
        } catch (e) {
          return // Error handled by InputModal
        }
      }
      
      const newServer: StdioServer = {
        id: Date.now().toString(),
        name: tempData.name,
        command: tempData.command,
        args: tempData.args ? tempData.args.split(' ').filter(Boolean) : [],
        env,
        enabled: false
      }
      
      const updated = [...stdioServers, newServer]
      saveStdioServers(updated)
      setInputModal({ isOpen: false, step: 'command', title: '', label: '', placeholder: '', type: 'text' })
    }
  }

  const toggleServer = async (serverId: string) => {
    const server = stdioServers.find(s => s.id === serverId)
    if (!server) return

    try {
      if (server.enabled) {
        // Disconnect
        await mcpBridge.removeStdioServer(serverId)
        const updated = stdioServers.map(s => 
          s.id === serverId ? { ...s, enabled: false, connected: false } : s
        )
        saveStdioServers(updated)
      } else {
        // Connect
        await mcpBridge.addStdioServer({
          id: server.id,
          name: server.name,
          command: server.command,
          args: server.args,
          env: server.env,
          enabled: true
        })
        
        const updated = stdioServers.map(s => 
          s.id === serverId ? { ...s, enabled: true, connected: true } : s
        )
        saveStdioServers(updated)
      }
      
      updateBridgedServers()
    } catch (error) {
      console.error('Failed to toggle server:', error)
      setConfirmModal({
        isOpen: true,
        title: 'Connection Failed',
        message: `Failed to ${server.enabled ? 'disconnect from' : 'connect to'} ${server.name}. Check console for details.`,
        type: 'alert'
      })
    }
  }

  const deleteServer = (serverId: string) => {
    const server = stdioServers.find(s => s.id === serverId)
    if (!server) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Stdio Server',
      message: `Are you sure you want to delete "${server.name}"? This action cannot be undone.`,
      type: 'confirm',
      onConfirm: async () => {
        // Disconnect if enabled
        if (server.enabled) {
          await mcpBridge.removeStdioServer(serverId)
        }
        
        const updated = stdioServers.filter(s => s.id !== serverId)
        saveStdioServers(updated)
        updateBridgedServers()
        setConfirmModal({ isOpen: false })
      }
    })
  }

  const presetServers = mcpBridge.getAvailableStdioServers()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link size={20} className="text-purple-500" />
        <div>
          <h3 className="text-sm font-medium text-dark-50">MCP Bridge</h3>
          <p className="text-xs text-dark-100">Connect local stdio MCP servers</p>
        </div>
      </div>

      {/* Add Servers */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex-1 btn btn-secondary text-xs flex items-center gap-2 justify-center"
        >
          <Server size={14} />
          Add Preset
        </button>
        <button
          onClick={addCustomServer}
          className="flex-1 btn btn-secondary text-xs flex items-center gap-2 justify-center"
        >
          <Plus size={14} />
          Add Custom
        </button>
      </div>

      {/* Preset Servers */}
      {showPresets && (
        <div className="bg-dark-400 rounded-lg border border-dark-200 p-3">
          <h4 className="text-xs font-medium text-dark-100 mb-3">Available Presets</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {presetServers.map((preset, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-dark-300 rounded border border-dark-200"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-dark-50">{preset.name}</h5>
                  <p className="text-xs text-dark-100 truncate">
                    {preset.command} {preset.args.join(' ')}
                  </p>
                </div>
                <button
                  onClick={() => addPresetServer(preset)}
                  className="btn btn-primary text-xs px-2 py-1"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configured Servers */}
      <div>
        <h4 className="text-xs font-medium text-dark-100 mb-3">
          Stdio Servers ({stdioServers.length})
        </h4>
        
        {stdioServers.length === 0 ? (
          <p className="text-dark-100 text-xs text-center py-4">
            No stdio servers configured
          </p>
        ) : (
          <div className="space-y-2">
            {stdioServers.map((server) => {
              const bridgedInfo = bridgedServers.find(b => b.id === server.id)
              return (
                <div
                  key={server.id}
                  className="p-3 bg-dark-400 rounded-lg border border-dark-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link size={14} className="text-purple-500 flex-shrink-0" />
                        <h5 className="text-sm font-medium text-dark-50 truncate">
                          {server.name}
                        </h5>
                        {bridgedInfo?.connected && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                            Connected
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-dark-100 truncate mb-1">
                        {server.command} {server.args.join(' ')}
                      </p>
                      
                      {Object.keys(server.env).length > 0 && (
                        <p className="text-xs text-yellow-400">
                          🔧 {Object.keys(server.env).length} environment variables
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => toggleServer(server.id)}
                        className={`p-1 rounded transition-colors ${
                          server.enabled 
                            ? 'hover:bg-red-500 text-red-400' 
                            : 'hover:bg-green-500 text-green-400'
                        }`}
                        title={server.enabled ? 'Disconnect' : 'Connect'}
                      >
                        {server.enabled ? <Square size={14} /> : <Play size={14} />}
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
                      {server.enabled ? 'Active' : 'Inactive'}
                    </span>
                    
                    {bridgedInfo?.connected && (
                      <span className="text-primary-500">
                        Bridge: localhost:3001/mcp/{server.id}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bridge Status */}
      {bridgedServers.length > 0 && (
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Link size={16} className="text-primary-500" />
            <h4 className="text-sm font-medium text-primary-500">Bridge Status</h4>
          </div>
          <p className="text-xs text-dark-100">
            {bridgedServers.filter(s => s.connected).length} of {bridgedServers.length} servers connected
          </p>
          <p className="text-xs text-dark-100 mt-1">
            Stdio servers are now accessible as HTTP endpoints for your AI agents.
          </p>
        </div>
      )}

      {/* Input Modal */}
      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        label={inputModal.label}
        placeholder={inputModal.placeholder}
        type={inputModal.type}
        required={true}
        onConfirm={handleInputSubmit}
        onCancel={() => setInputModal({ isOpen: false, step: 'command', title: '', label: '', placeholder: '', type: 'text' })}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title || 'Confirm'}
        message={confirmModal.message || ''}
        type={confirmModal.type || 'confirm'}
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  )
}

export default MCPBridgeSettings