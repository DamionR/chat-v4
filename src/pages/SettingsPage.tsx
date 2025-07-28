import React from 'react'

const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-dark-50 mb-4">Settings</h1>
        <p className="text-dark-100">
          Configure your AI chat settings using the right sidebar.
        </p>
      </div>
    </div>
  )
}

export default SettingsPage