import React, { useState } from 'react'
import { useChatStore } from '../../store'
import { MODEL_CONFIGS, type Provider } from '../../types'

const ConnectionSettings: React.FC = () => {
  const {
    currentProvider,
    currentModel,
    authToken,
    baseURL,
    connectionStatus,
    setProvider,
    setModel,
    setAuthToken,
    setBaseURL,
    connect,
    disconnect
  } = useChatStore()

  const [isConnecting, setIsConnecting] = useState(false)

  const handleProviderChange = async (provider: Provider) => {
    await setProvider(provider)
    // Set default model for the new provider
    const defaultModel = Object.keys(MODEL_CONFIGS[provider].models)[0]
    await setModel(defaultModel)
  }

  const getApiKeyPlaceholder = (provider: Provider): string => {
    switch (provider) {
      case 'openai':
        return 'sk-...'
      case 'anthropic':
        return 'sk-ant-...'
      case 'google':
        return 'Your Google AI API Key'
      default:
        return 'Your API Key'
    }
  }

  const getApiKeyLabel = (provider: Provider): string => {
    switch (provider) {
      case 'openai':
        return 'OpenAI API Key'
      case 'anthropic':
        return 'Anthropic API Key'
      case 'google':
        return 'Google AI API Key'
      default:
        return 'API Key'
    }
  }

  const handleConnect = async () => {
    if (!authToken.trim()) {
      alert(`Please enter your ${getApiKeyLabel(currentProvider)}`)
      return
    }

    setIsConnecting(true)
    try {
      await connect()
    } catch (error) {
      console.error('Connection failed:', error)
      alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-medium text-dark-100 mb-2">
          {getApiKeyLabel(currentProvider)}
        </label>
        <input
          type="password"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          placeholder={getApiKeyPlaceholder(currentProvider)}
          className="form-input w-full"
          disabled={connectionStatus.isConnected}
        />
        <p className="text-xs text-gray-500 mt-1">
          {currentProvider === 'openai' && 'Get your API key from OpenAI Platform'}
          {currentProvider === 'anthropic' && 'Get your API key from Anthropic Console'}
          {currentProvider === 'google' && 'Get your API key from Google AI Studio'}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-dark-100 mb-2">
          AI Provider
        </label>
        <select
          value={currentProvider}
          onChange={(e) => handleProviderChange(e.target.value as Provider)}
          className="form-select w-full"
          disabled={connectionStatus.isConnected}
        >
          <option value="openai">OpenAI (GPT)</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="google">Google (Gemini)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-dark-100 mb-2">
          Model
        </label>
        <select
          value={currentModel}
          onChange={(e) => setModel(e.target.value)}
          className="form-select w-full"
          disabled={connectionStatus.isConnected}
        >
          {Object.entries(MODEL_CONFIGS[currentProvider].models).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {currentProvider === 'openai' && (
        <div>
          <label className="block text-xs font-medium text-dark-100 mb-2">
            Custom Base URL (Optional)
          </label>
          <input
            type="text"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            placeholder="https://api.openai.com (leave empty for default)"
            className="form-input w-full"
            disabled={connectionStatus.isConnected}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use this for OpenAI-compatible providers like Together AI, Perplexity, etc.
          </p>
        </div>
      )}

      {!connectionStatus.isConnected ? (
        <button
          onClick={handleConnect}
          disabled={!authToken.trim() || isConnecting}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </div>
          ) : (
            'Connect'
          )}
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="w-full btn btn-secondary"
        >
          Disconnect
        </button>
      )}

      {connectionStatus.isConnected && (
        <div className="text-xs text-primary-500 text-center">
          🟢 Connected to {MODEL_CONFIGS[currentProvider].name} - {MODEL_CONFIGS[currentProvider].models[currentModel]}
        </div>
      )}

      {connectionStatus.error && (
        <div className="text-xs text-red-400 text-center">
          ❌ {connectionStatus.error}
        </div>
      )}
    </div>
  )
}

export default ConnectionSettings