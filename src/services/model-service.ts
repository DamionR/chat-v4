
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
    if (!apiKey) {
      throw new Error('API key is required to fetch models');
    }

    switch (provider) {
      case 'openai':
        return this.fetchOpenAIModels(apiKey);
      case 'anthropic':
        return this.fetchAnthropicModels(apiKey);
      case 'google':
        return this.fetchGoogleModels(apiKey);
      case 'xai':
        return this.fetchXAIModels(apiKey);
      case 'openrouter':
        return this.fetchOpenRouterModels(apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async fetchOpenAIModels(apiKey: string): Promise<Record<string, string>> {
    try {
      const cacheKey = `openai_${apiKey.slice(-10)}`;
      const cached = this.modelCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.models;
      }

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}`);
      }

      const data = await response.json();
      const models: Record<string, string> = {};

      // Filter for chat completion models
      data.data?.forEach((model: any) => {
        if (model.id && (model.id.includes('gpt') || model.id.includes('o1'))) {
          models[model.id] = model.id.toUpperCase();
        }
      });

      this.modelCache[cacheKey] = { models, timestamp: Date.now() };
      return models;
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      throw error;
    }
  }

  private async fetchAnthropicModels(apiKey: string): Promise<Record<string, string>> {
    try {
      const cacheKey = `anthropic_${apiKey.slice(-10)}`;
      const cached = this.modelCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.models;
      }

      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      });

      if (!response.ok) {
        throw new Error(`Anthropic API returned ${response.status}`);
      }

      const data = await response.json();
      const models: Record<string, string> = {};

      data.data?.forEach((model: any) => {
        if (model.id && model.id.includes('claude')) {
          models[model.id] = model.id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        }
      });

      this.modelCache[cacheKey] = { models, timestamp: Date.now() };
      return models;
    } catch (error) {
      console.error('Error fetching Anthropic models:', error);
      throw error;
    }
  }

  private async fetchGoogleModels(apiKey: string): Promise<Record<string, string>> {
    try {
      const cacheKey = `google_${apiKey.slice(-10)}`;
      const cached = this.modelCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.models;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);

      if (!response.ok) {
        throw new Error(`Google API returned ${response.status}`);
      }

      const data = await response.json();
      const models: Record<string, string> = {};

      // Filter for chat models
      data.models?.forEach((model: any) => {
        if (model.name && model.name.includes('gemini') && model.supportedGenerationMethods?.includes('generateContent')) {
          const modelId = model.name.replace('models/', '');
          models[modelId] = model.displayName || modelId;
        }
      });

      this.modelCache[cacheKey] = { models, timestamp: Date.now() };
      return models;
    } catch (error) {
      console.error('Error fetching Google models:', error);
      throw error;
    }
  }

  private async fetchXAIModels(apiKey: string): Promise<Record<string, string>> {
    try {
      const cacheKey = `xai_${apiKey.slice(-10)}`;
      const cached = this.modelCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.models;
      }

      const response = await fetch('https://api.x.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`X AI API returned ${response.status}`);
      }

      const data = await response.json();
      const models: Record<string, string> = {};

      data.data?.forEach((model: any) => {
        if (model.id) {
          models[model.id] = model.id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        }
      });

      this.modelCache[cacheKey] = { models, timestamp: Date.now() };
      return models;
    } catch (error) {
      console.error('Error fetching X AI models:', error);
      throw error;
    }
  }

  private async fetchOpenRouterModels(apiKey: string): Promise<Record<string, string>> {
    try {
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
        throw new Error(`OpenRouter API returned ${response.status}`);
      }

      const data = await response.json();
      const models: Record<string, string> = {};

      data.data?.forEach((model: any) => {
        if (model.id && model.name) {
          models[model.id] = model.name;
        }
      });

      this.modelCache[cacheKey] = { models, timestamp: Date.now() };
      return models;
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw error;
    }
  }

}