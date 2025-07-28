import { MODEL_CONFIGS } from '../types';

export class ModelService {
  private static instance: ModelService;
  private modelCache: Record<string, any> = {};

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  async getAvailableModels(provider: string, apiKey?: string): Promise<Record<string, string>> {
    if (provider === 'openrouter' && apiKey) {
      return this.fetchOpenRouterModels(apiKey);
    }
    
    // For other providers, return static models
    const config = MODEL_CONFIGS[provider as keyof typeof MODEL_CONFIGS];
    return config?.models || {};
  }

  private async fetchOpenRouterModels(apiKey: string): Promise<Record<string, string>> {
    try {
      // Check cache first (cache for 5 minutes)
      const cacheKey = `openrouter_${apiKey.slice(-10)}`;
      const cached = this.modelCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.models;
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch OpenRouter models, using defaults');
        return this.getDefaultOpenRouterModels();
      }

      const data = await response.json();
      const models: Record<string, string> = {};

      // Filter and format models
      data.data?.forEach((model: any) => {
        if (model.id && model.name) {
          models[model.id] = model.name;
        }
      });

      // Cache the results
      this.modelCache[cacheKey] = {
        models,
        timestamp: Date.now()
      };

      return models;
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return this.getDefaultOpenRouterModels();
    }
  }

  private getDefaultOpenRouterModels(): Record<string, string> {
    return {
      'openai/gpt-4o': 'GPT-4o',
      'openai/gpt-4o-mini': 'GPT-4o Mini',
      'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
      'anthropic/claude-3-haiku': 'Claude 3 Haiku',
      'google/gemini-pro': 'Gemini Pro',
      'meta-llama/llama-3.2-3b-instruct': 'Llama 3.2 3B',
      'meta-llama/llama-3.2-70b-instruct': 'Llama 3.2 70B',
      'mistralai/mistral-7b-instruct': 'Mistral 7B',
      'microsoft/wizardlm-2-8x22b': 'WizardLM 2 8x22B'
    };
  }
}