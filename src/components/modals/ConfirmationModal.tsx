import React from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'confirm' | 'alert' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel: () => void
  variant?: 'default' | 'danger' | 'success'
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={24} className="text-red-400" />
      case 'info':
        return <Info size={24} className="text-blue-400" />
      default:
        return <CheckCircle size={24} className="text-yellow-400" />
    }
  }

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'btn bg-red-500 hover:bg-red-600 text-white'
      case 'success':
        return 'btn bg-green-500 hover:bg-green-600 text-white'
      default:
        return 'btn btn-primary'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-400 border border-dark-200 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-200">
          <div className="flex items-center gap-3">
            {getIcon()}
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
        <div className="p-4">
          <p className="text-dark-100 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-dark-200">
          {type === 'confirm' && (
            <>
              <button
                onClick={onCancel}
                className="flex-1 btn btn-secondary"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 ${getConfirmButtonClass()}`}
              >
                {confirmText}
              </button>
            </>
          )}
          
          {type === 'alert' && (
            <button
              onClick={onCancel}
              className="w-full btn btn-primary"
            >
              OK
            </button>
          )}
          
          {type === 'info' && (
            <button
              onClick={onCancel}
              className="w-full btn btn-primary"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal