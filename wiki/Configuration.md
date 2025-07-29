# Configuration Guide

Learn how to configure Chat-V4 with AI providers, API keys, and initial settings.

## 🔑 Getting API Keys

Before using Chat-V4, you'll need API keys from your chosen AI providers.

### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Anthropic (Claude)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign in to your account
3. Go to "API Keys" section
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

### Google (Gemini)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### X AI (Grok)
1. Visit [X AI API](https://x.ai/api)
2. Sign up for API access
3. Generate an API key
4. Copy the key

### OpenRouter
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign in to your account
3. Generate a new API key
4. Copy the key (starts with `sk-or-`)

## ⚙️ Initial Configuration

### 1. Start Chat-V4

```bash
npm run dev
```

### 2. Open Settings

Click the **settings icon** in the top-right corner or use the right sidebar.

### 3. Connection Settings

In the **Connection** tab:

1. **Select Provider** - Choose your AI provider (OpenAI, Anthropic, etc.)
2. **Enter API Key** - Paste your API key
3. **Select Model** - Choose from dynamically loaded models
4. **Test Connection** - Verify your setup works

### 4. Save Configuration

Settings are automatically saved to your browser's local storage.

## 🤖 Provider-Specific Configuration

### OpenAI Configuration

```json
{
  "provider": "openai",
  "apiKey": "sk-your-openai-key",
  "baseURL": "https://api.openai.com",
  "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]
}
```

**Available Models:**
- GPT-4o (latest)
- GPT-4o Mini (fast)
- GPT-4 Turbo
- GPT-3.5 Turbo

### Anthropic Configuration

```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-your-anthropic-key",
  "baseURL": "https://api.anthropic.com",
  "models": ["claude-3-7-sonnet", "claude-3-5-sonnet", "claude-3-haiku"]
}
```

**Available Models:**
- Claude 3.7 Sonnet (latest)
- Claude 3.5 Sonnet
- Claude 3 Haiku (fast)

### Google Configuration

```json
{
  "provider": "google",
  "apiKey": "your-google-api-key",
  "baseURL": "https://generativelanguage.googleapis.com",
  "models": ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"]
}
```

### X AI Configuration

```json
{
  "provider": "xai",
  "apiKey": "your-xai-api-key",
  "baseURL": "https://api.x.ai",
  "models": ["grok-3-mini"]
}
```

### OpenRouter Configuration

```json
{
  "provider": "openrouter",
  "apiKey": "sk-or-your-openrouter-key",
  "baseURL": "https://openrouter.ai/api",
  "models": ["dynamically-loaded"]
}
```

## 🔧 Advanced Settings

### Model Parameters

Configure model behavior:

- **Temperature** (0.0 - 2.0) - Controls randomness
- **Max Tokens** - Maximum response length
- **Top P** - Nucleus sampling parameter
- **Frequency Penalty** - Reduces repetition

### System Prompts

Set custom system prompts for:
- Default behavior
- Specific agents
- Tool usage instructions

### Rate Limiting

Configure request limits:
- Requests per minute
- Concurrent requests
- Retry strategies

## 💾 Data Storage

### Local Storage

Chat-V4 uses browser storage for:
- API keys and settings
- Chat history
- Agent configurations
- MCP server settings

### OPFS Storage

For larger data:
- SQLite database files
- File attachments
- Exported chat data

### Data Export/Import

**Export Settings:**
```bash
# Settings are automatically exported with chat history
# Use the Export button in the left sidebar
```

**Import Settings:**
```bash
# Use the Import button in the left sidebar
# Select a previously exported JSON file
```

## 🌐 Environment Variables

Create `.env.local` for advanced configuration:

```env
# Default API provider
VITE_DEFAULT_PROVIDER=openai

# Default model
VITE_DEFAULT_MODEL=gpt-4o

# Enable debug mode
VITE_DEBUG=true

# Custom API endpoints
VITE_OPENAI_BASE_URL=https://api.openai.com
VITE_ANTHROPIC_BASE_URL=https://api.anthropic.com

# MCP Bridge settings
VITE_MCP_BRIDGE_PORT=3001
VITE_ENABLE_MCP_BRIDGE=true

# UI settings
VITE_THEME=dark
VITE_SIDEBAR_DEFAULT_OPEN=true
```

## 🔒 Security Best Practices

### API Key Security

1. **Never commit API keys** to version control
2. **Use environment variables** for production
3. **Regularly rotate keys**
4. **Monitor usage** for unusual activity

### Browser Security

1. **Use HTTPS** in production
2. **Clear sensitive data** when done
3. **Use private browsing** for temporary usage

## ✅ Configuration Checklist

After setup, verify:

- [ ] API key is valid and working
- [ ] Models load dynamically
- [ ] Chat messages send/receive properly
- [ ] Settings persist between sessions
- [ ] No console errors
- [ ] MCP servers connect (if used)

## 🔄 Switching Providers

You can easily switch between providers:

1. Go to **Settings → Connection**
2. Select new provider
3. Enter new API key
4. Choose model
5. Click "Connect"

Settings for each provider are saved separately.

## 🚨 Troubleshooting

### Common Configuration Issues

**Invalid API Key**
- Verify key format matches provider
- Check for extra spaces or characters
- Ensure key has proper permissions

**Models Not Loading**
- Check internet connection
- Verify API key has model access
- Try refreshing the page

**Settings Not Saving**
- Check browser storage permissions
- Clear browser cache if needed
- Ensure localStorage is enabled

For more help, see [Troubleshooting Guide](Troubleshooting).

## 🆘 Need Help?

- 🐛 [Report Configuration Issues](https://github.com/DamionR/chat-v4/issues)
- 💬 [Ask Questions](https://github.com/DamionR/chat-v4/discussions)
- 📖 [Back to Wiki Home](Home)