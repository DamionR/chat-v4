import React from 'react'
import { Wrench, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useChatStore } from '../../store'

const ToolSettings: React.FC = () => {
  const { customTools, addCustomTool, removeCustomTool, updateCustomTool } = useChatStore()

  const handleAddTool = () => {
    const name = prompt('Tool name:')
    if (!name) return

    const description = prompt('Tool description:')
    if (!description) return

    const parametersJson = prompt('Tool parameters (JSON):')
    let parameters = {}
    
    if (parametersJson) {
      try {
        parameters = JSON.parse(parametersJson)
      } catch (e) {
        alert('Invalid JSON for parameters')
        return
      }
    }

    addCustomTool({
      name: name.trim(),
      description: description.trim(),
      parameters,
      enabled: true
    })
  }

  const toggleTool = (toolId: string, enabled: boolean) => {
    updateCustomTool(toolId, { enabled })
  }

  const deleteTool = (toolId: string) => {
    if (confirm('Are you sure you want to delete this custom tool?')) {
      removeCustomTool(toolId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Tool Button */}
      <button
        onClick={handleAddTool}
        className="w-full btn btn-secondary flex items-center gap-2 justify-center"
      >
        <Wrench size={16} />
        Add Custom Tool
      </button>

      {/* Tools List */}
      <div>
        <h3 className="text-xs font-medium text-dark-100 mb-3">
          Custom Tools ({customTools.length})
        </h3>
        
        {customTools.length === 0 ? (
          <p className="text-dark-100 text-xs text-center py-4">
            No custom tools defined
          </p>
        ) : (
          <div className="space-y-2">
            {customTools.map((tool) => (
              <div
                key={tool.id}
                className="p-3 bg-dark-400 rounded-lg border border-dark-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench size={14} className="text-blue-500 flex-shrink-0" />
                      <h4 className="text-sm font-medium text-dark-50 truncate">
                        {tool.name}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-dark-100 line-clamp-2">
                      {tool.description}
                    </p>
                    
                    {Object.keys(tool.parameters).length > 0 && (
                      <p className="text-xs text-yellow-400 mt-1">
                        📝 {Object.keys(tool.parameters).length} parameters
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => toggleTool(tool.id, !tool.enabled)}
                      className="p-1 hover:bg-dark-300 rounded transition-colors"
                      title={tool.enabled ? 'Disable tool' : 'Enable tool'}
                    >
                      {tool.enabled ? (
                        <ToggleRight size={16} className="text-primary-500" />
                      ) : (
                        <ToggleLeft size={16} className="text-dark-100" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => deleteTool(tool.id)}
                      className="p-1 hover:bg-red-500 rounded transition-colors"
                      title="Delete tool"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded ${
                    tool.enabled 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {tool.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ToolSettings