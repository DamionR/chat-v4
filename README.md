# AI Chat Client

A modern React-based AI chat client with support for multiple providers, MCP servers, custom agents, and single-file compilation.

## Features

- 🤖 **Multiple AI Providers**: OpenAI, Anthropic, Google
- 🧠 **Custom Agents**: Create specialized AI agents with custom instructions
- 🔌 **MCP Integration**: Model Context Protocol server support
- 🛠️ **Custom Tools**: Function calling and custom tool integration
- 📁 **Multimodal**: Support for images and file attachments
- 💾 **Persistent Storage**: Chat history and settings saved locally
- 📱 **Responsive Design**: Works on desktop and mobile
- 📦 **Single File Build**: Compile to a single HTML file for easy deployment

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **MCP TypeScript SDK** for Model Context Protocol
- **Mastra.ai** for advanced agent capabilities

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build single HTML file
npm run build:single
```

### Development

The app will be available at `http://localhost:3000`

### Single File Build

To create a single HTML file for easy deployment:

```bash
npm run build:single
```

This creates a `dist-single/index.html` file that contains everything needed to run the app.

## Configuration

### AI Providers

Configure your AI provider in the settings panel:

1. Select provider (OpenAI, Anthropic, or Google)
2. Choose model
3. Enter your auth token
4. Click Connect

### MCP Servers

Add Model Context Protocol servers:

1. Go to MCP Servers tab
2. Enter server name and URL
3. Optionally add OAuth token
4. Click Add Server

### Custom Agents

Create specialized AI agents:

1. Go to Agents tab
2. Click "Create Agent"
3. Configure name, instructions, and capabilities
4. Enable agent mode to use

### Custom Tools

Add function calling tools:

1. Go to Tools tab
2. Click "Add Custom Tool"
3. Define tool name, description, and parameters

## Project Structure

```
src/
├── components/          # React components
│   ├── chat/           # Chat-related components
│   ├── layout/         # Layout components
│   ├── modals/         # Modal dialogs
│   └── settings/       # Settings panels
├── pages/              # Route pages
├── store/              # Zustand store
├── types/              # TypeScript types
├── utils/              # Utility functions
└── main.tsx           # App entry point
```

## API Integration

The app is configured to work with Shopify's LLM proxy at `https://proxy.shopify.ai` but can be adapted for other providers.

### Adding New Providers

1. Update `MODEL_CONFIGS` in `src/types/index.ts`
2. Add provider option to connection settings
3. Implement client logic for the new provider

## Deployment

### Single File Deployment

1. Run `npm run build:single`
2. Upload `dist-single/index.html` to any web server
3. The file is completely self-contained

### Traditional Deployment

1. Run `npm run build`
2. Upload `dist/` folder contents to web server
3. Configure server to serve `index.html` for all routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details