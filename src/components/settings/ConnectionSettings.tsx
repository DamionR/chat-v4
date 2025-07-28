import React, { useState, useEffect } from 'react'
import { useChatStore } from '../../store'
import { PROVIDER_CONFIGS, type Provider } from '../../types'
import { ModelService } from '../../services/model-service'

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
  const [availableModels, setAvailableModels] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  
  const modelService = ModelService.getInstance()

  const handleProviderChange = async (provider: Provider) => {
    await setProvider(provider)
    await loadModelsForProvider(provider)
  }

  const loadModelsForProvider = async (provider: Provider) => {
    setIsLoadingModels(true)
    try {
      if (!authToken) {
        setAvailableModels({})
        return
      }
      
      const models = await modelService.getAvailableModels(provider, authToken)
      setAvailableModels(models)
      
      // Set default model for the new provider
      const modelKeys = Object.keys(models)
      if (modelKeys.length > 0) {
        await setModel(modelKeys[0])
      }
    } catch (error) {
      console.error('Failed to load models:', error)
      setAvailableModels({})
    } finally {
      setIsLoadingModels(false)
    }
  }

  // Load models when component mounts or provider/authToken changes
  useEffect(() => {
    if (currentProvider) {
      loadModelsForProvider(currentProvider)
    }
  }, [currentProvider, authToken])

  const getApiKeyPlaceholder = (provider: Provider): string => {
    switch (provider) {
      case 'openai':
        return 'sk-...'
      case 'anthropic':
        return 'sk-ant-...'
      case 'google':
        return 'Your Google AI API Key'
      case 'xai':
        return 'xai-...'
      case 'openrouter':
        return 'sk-or-...'
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
      case 'xai':
        return 'X AI API Key'
      case 'openrouter':
        return 'OpenRouter API Key'
      default:
        return 'API Key'
    }
  }

  const handleConnect = async () => {
    if (!authToken.trim()) {
      setErrorMessage(`Please enter your ${getApiKeyLabel(currentProvider)}`)
      return
    }

    setIsConnecting(true)
    setErrorMessage('')
    try {
      await connect()
    } catch (error) {
      console.error('Connection failed:', error)
      setErrorMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs">{errorMessage}</p>
        </div>
      )}
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
          {currentProvider === 'xai' && 'Get your API key from X AI Platform'}
          {currentProvider === 'openrouter' && 'Get your API key from OpenRouter.ai'}
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
          <option value="xai">X AI (Grok)</option>
          <option value="openrouter">OpenRouter (Multi-Provider)</option>
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
          disabled={connectionStatus.isConnected || isLoadingModels || Object.keys(availableModels).length === 0}
        >
          {isLoadingModels ? (
            <option>Loading models...</option>
          ) : Object.keys(availableModels).length === 0 ? (
            <option>Enter API key to load models</option>
          ) : (
            Object.entries(availableModels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))
          )}
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
          🟢 Connected to {PROVIDER_CONFIGS[currentProvider].name} - {currentModel}
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