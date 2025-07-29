import React, { useState } from 'react'
import { Wrench, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useChatStore } from '../../store'
import ConfirmationModal from '../modals/ConfirmationModal'
import InputModal from '../modals/InputModal'

const ToolSettings: React.FC = () => {
  const { customTools, addCustomTool, removeCustomTool, updateCustomTool } = useChatStore()
  
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean
    step: 'name' | 'description' | 'parameters'
    title: string
    label: string
    placeholder: string
    type: 'text' | 'textarea'
    tempData?: { name?: string; description?: string }
  }>({ isOpen: false, step: 'name', title: '', label: '', placeholder: '', type: 'text' })
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    toolId?: string
  }>({ isOpen: false })

  const handleAddTool = () => {
    setInputModal({
      isOpen: true,
      step: 'name',
      title: 'Add Custom Tool',
      label: 'Tool Name',
      placeholder: 'Enter tool name',
      type: 'text'
    })
  }
  
  const handleInputSubmit = (value: string) => {
    const { step, tempData = {} } = inputModal
    
    if (step === 'name') {
      setInputModal({
        isOpen: true,
        step: 'description',
        title: 'Add Custom Tool',
        label: 'Tool Description',
        placeholder: 'Enter tool description',
        type: 'text',
        tempData: { ...tempData, name: value }
      })
    } else if (step === 'description') {
      setInputModal({
        isOpen: true,
        step: 'parameters',
        title: 'Add Custom Tool',
        label: 'Tool Parameters (JSON)',
        placeholder: '{"param1": {"type": "string", "description": "Parameter description"}}',
        type: 'textarea',
        tempData: { ...tempData, description: value }
      })
    } else if (step === 'parameters') {
      let parameters = {}
      
      if (value.trim()) {
        try {
          parameters = JSON.parse(value)
        } catch (e) {
          // Error handled by InputModal
          return
        }
      }
      
      addCustomTool({
        name: tempData.name!.trim(),
        description: tempData.description!.trim(),
        parameters,
        enabled: true
      })
      
      setInputModal({ isOpen: false, step: 'name', title: '', label: '', placeholder: '', type: 'text' })
    }
  }

  const toggleTool = (toolId: string, enabled: boolean) => {
    updateCustomTool(toolId, { enabled })
  }

  const deleteTool = (toolId: string) => {
    setConfirmModal({ isOpen: true, toolId })
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
      
      {/* Input Modal */}
      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        label={inputModal.label}
        placeholder={inputModal.placeholder}
        type={inputModal.type}
        required={true}
        onConfirm={handleInputSubmit}
        onCancel={() => setInputModal({ isOpen: false, step: 'name', title: '', label: '', placeholder: '', type: 'text' })}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Delete Custom Tool"
        message="Are you sure you want to delete this custom tool? This action cannot be undone."
        type="confirm"
        variant="danger"
        onConfirm={() => {
          if (confirmModal.toolId) {
            removeCustomTool(confirmModal.toolId)
          }
          setConfirmModal({ isOpen: false })
        }}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  )
}

export default ToolSettings