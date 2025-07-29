import React, { useState, useEffect } from 'react'
import { Edit3, X } from 'lucide-react'

interface InputModalProps {
  isOpen: boolean
  title: string
  label: string
  placeholder?: string
  defaultValue?: string
  type?: 'text' | 'password' | 'textarea'
  onConfirm: (value: string) => void
  onCancel: () => void
  required?: boolean
  rows?: number
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  title,
  label,
  placeholder = '',
  defaultValue = '',
  type = 'text',
  onConfirm,
  onCancel,
  required = false,
  rows = 4
}) => {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue)
      setError('')
    }
  }, [isOpen, defaultValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (required && !value.trim()) {
      setError('This field is required')
      return
    }

    // Validate JSON if it looks like JSON
    if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
      try {
        JSON.parse(value)
      } catch (e) {
        setError('Invalid JSON format')
        return
      }
    }

    onConfirm(value.trim())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-400 border border-dark-200 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-200">
          <div className="flex items-center gap-3">
            <Edit3 size={20} className="text-primary-500" />
            <h3 className="text-lg font-semibold text-dark-50">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-dark-300 rounded transition-colors"
          >
            <X size={20} className="text-dark-100" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-2">
                {label}
              </label>
              
              {type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  rows={rows}
                  className="form-input w-full resize-y"
                  autoFocus
                />
              ) : (
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className="form-input w-full"
                  autoFocus
                />
              )}
              
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t border-dark-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InputModal