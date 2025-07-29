# Chat-V4

A powerful, modern AI chat client that supports multiple AI providers with dynamic model selection, custom agents, MCP server integration, and advanced features like multimodal support and SQLite-based storage.

## ✨ Key Features

### 🤖 Multi-Provider Support
- **OpenAI** (GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo, o1 models)
- **Anthropic** (Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus)
- **Google** (Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro)
- **X AI** (Grok 3 Mini)
- **OpenRouter** (Access to 100+ models from various providers)

### 🎯 Dynamic Model Selection
- Models are fetched dynamically from each provider's API
- No hardcoded model lists - always up-to-date with latest available models
- Automatic model discovery when you enter your API key

### 🧠 Advanced Agent System
- Create custom AI agents with specialized instructions
- Assign specific MCP servers to individual agents
- Control agent capabilities (multimodal, function calling, MCP access)
- Temperature and max token customization per agent

### 🔌 MCP (Model Context Protocol) Integration
- Connect multiple MCP servers for extended functionality
- Agent-specific MCP server selection
- OAuth token support for authenticated servers
- Real-time tool discovery and execution

### 🛠️ Custom Tools & Functions
- Create custom function-calling tools
- JSON Schema parameter definition
- Visual tool management interface
- Works across all AI providers

### 📁 Multimodal Capabilities
- Drag-and-drop file uploads
- Image analysis and vision capabilities
- Document processing (PDF, TXT, CSV)
- File preview before sending
- Persistent file storage with messages

### 💾 Advanced Storage System
- **SQLite database** using OPFS (Origin Private File System)
- Unlimited storage capacity (not limited by localStorage)
- Fast, efficient data access
- Automatic chat history saving
- Settings persistence

### 🎨 Modern UI/UX
- **Collapsible sidebars** for better screen space management
- ChatGPT-inspired interface design
- Dark theme optimized for extended use
- Responsive design for desktop and mobile
- In-app notifications (no browser alerts)
- Real-time typing indicators

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with OPFS support (Chrome, Edge, Firefox)

### Installation

```bash
# Clone the repository
git clone https://github.com/DamionR/chat-v4.git
cd chat-v4

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Standard build
npm run build

# Single-file build (everything in one HTML file)
npm run build:single
```

## 🔧 Configuration Guide

### Setting Up AI Providers

1. **Get API Keys**:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/
   - Google: https://makersuite.google.com/app/apikey
   - X AI: https://x.ai/api
   - OpenRouter: https://openrouter.ai/keys

2. **Connect to a Provider**:
   - Select your provider from the dropdown
   - Enter your API key
   - Models will automatically load based on your access
   - Click "Connect"

### Creating Custom Agents

1. Click "Create Agent" in the Agents tab
2. Configure:
   - **Name**: Your agent's identifier
   - **Description**: Brief explanation of the agent's purpose
   - **Instructions**: System prompt that defines the agent's behavior
   - **Temperature**: Control randomness (0 = focused, 2 = creative)
   - **Max Tokens**: Maximum response length
   - **Capabilities**: Enable/disable features
   - **MCP Servers**: Select which servers this agent can access

### Adding MCP Servers

1. Navigate to "MCP Servers" tab
2. Enter server details:
   - **Name**: Friendly identifier
   - **URL**: WebSocket URL of the MCP server
   - **Token**: Optional OAuth token for authentication
3. Click "Add Server"
4. Assign servers to agents as needed

### Custom Tools

1. Go to "Tools" tab
2. Click "Add Custom Tool"
3. Define:
   - **Name**: Function name (no spaces)
   - **Description**: What the tool does
   - **Parameters**: JSON Schema format

Example tool:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    }
  },
  "required": ["query"]
}
```

## 📁 Project Structure

```
chat-v4/
├── src/
│   ├── components/
│   │   ├── chat/         # Chat interface components
│   │   ├── layout/       # Sidebars and main layout
│   │   ├── modals/       # Agent creation, confirmations
│   │   └── settings/     # Connection, MCP, tools settings
│   ├── services/
│   │   ├── ai-client.ts  # Unified AI provider client
│   │   ├── database.ts   # SQLite/OPFS storage
│   │   ├── agent-service.ts # Agent management
│   │   └── model-service.ts # Dynamic model fetching
│   ├── store/
│   │   └── index.ts      # Zustand state management
│   ├── types/
│   │   └── index.ts      # TypeScript definitions
│   └── pages/            # Main app pages
├── dist/                 # Production build output
├── dist-single/          # Single-file build output
└── public/               # Static assets
```

## 🔐 Privacy & Security

- **100% Local Storage**: All data stored in your browser
- **No Backend Required**: Direct API connections to AI providers
- **Secure API Keys**: Never sent to any third-party servers
- **OPFS Isolation**: Database isolated per origin
- **Open Source**: Full code transparency

## 🛠️ Advanced Features

### Keyboard Shortcuts
- `Ctrl/Cmd + K`: Focus chat input
- `Ctrl/Cmd + /`: Toggle sidebars
- `Shift + Enter`: New line in message
- `Escape`: Clear input

### File Handling
- Drag files directly onto the chat input
- Supported formats: Images (JPG, PNG, GIF, WebP), Documents (PDF, TXT, CSV)
- Maximum file size: 10MB per file
- Files are base64 encoded and stored with messages

### Chat Management
- Automatic title generation from first message
- Search through chat history
- Export/Import chat history as JSON
- Delete individual chats
- Resume any previous conversation

## 🐛 Troubleshooting

### Common Issues

**Models not loading**:
- Verify your API key is correct
- Check your internet connection
- Some providers may have regional restrictions

**OPFS not available**:
- Use a modern browser (Chrome 102+, Edge 102+, Firefox 111+)
- Ensure you're not in private/incognito mode
- Check browser storage permissions

**Chat history not saving**:
- Check browser storage quota
- Clear old data if storage is full
- Verify OPFS is enabled in your browser

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, TypeScript, and Vite
- UI components styled with Tailwind CSS
- Icons from Lucide React
- State management with Zustand
- SQLite powered by sql.js
- File system access via OPFS API

---

**Note**: This is an active development project. Features and APIs may change. Always check the latest documentation for updates.