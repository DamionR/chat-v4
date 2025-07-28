# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Multi-AI Chat Client that mimics the design patterns of ChatGPT, Claude.ai, Grok, and LibreChat. Implemented as a single-page HTML application, it provides an authentic chat interface for multiple AI providers (OpenAI, Anthropic, Google) via the Shopify AI proxy, with Model Context Protocol (MCP) server integration for Anthropic models.

## Architecture

The application is built with vanilla JavaScript and includes:

- **AIClient base class**: Abstract base class for all AI providers
- **OpenAIClient class**: Handles GPT models via OpenAI-compatible endpoint
- **AnthropicClient class**: Handles Claude models with MCP connector support
- **GeminiClient class**: Handles Google Gemini models
- **ChatApp class**: Main application logic for managing conversations, providers, and connections

## Key Components

- **Multi-Provider Support**: Switch between OpenAI (GPT), Anthropic (Claude), and Google (Gemini)
- **Modern Chat Interface**: Authentic chat UI with left sidebar, proper message bubbles, and ChatGPT-like layout
- **Chat History Sidebar**: Previous conversations listed with titles, timestamps, and provider badges
- **Persistent Conversations**: All chats automatically saved and can be resumed anytime
- **Provider Selection**: Dynamic model options based on selected AI provider
- **Message Bubbles**: User messages (right-aligned, green) and AI messages (left-aligned, gray) with provider-specific avatars
- **Welcome Screen**: Multi-provider welcome with example prompts
- **Typing Indicator**: Animated thinking indicator with bouncing dots
- **Authentication**: Single Shopify auth token for all providers
- **Universal MCP**: MCP server configuration available for all AI providers
- **Multimodal Support**: Full file upload, image analysis, and document processing capabilities
- **Function Calling**: Custom tools and function calling support for all three providers
- **File Management**: Drag-and-drop file upload with preview and storage capabilities
- **Responsive Design**: Mobile-friendly with collapsible sidebar

## Supported Providers & Models

### OpenAI
- **Models**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo
- **Avatar**: "G"
- **Endpoint**: `/v1/chat/completions`

### Anthropic (Claude)
- **Models**: Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3 Haiku
- **Avatar**: "C"
- **Endpoint**: `/v1/chat/completions` with `anthropic:` prefix

### Google (Gemini)
- **Models**: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro
- **Avatar**: "G"
- **Endpoint**: `/v1/chat/completions` with `google:` prefix

## API Configuration

- **OpenAI**: Standard OpenAI API (`https://api.openai.com`)
- **Anthropic**: Direct Anthropic API (`https://api.anthropic.com`) 
- **Google**: Google AI API (`https://generativelanguage.googleapis.com`)
- **Authentication**: Provider-specific API keys
- **Custom Endpoints**: Support for OpenAI-compatible providers with custom base URLs
- **Max Tokens**: 2048 tokens per response (configurable)
- **Organization Support**: OpenAI organization ID support for team accounts

## MCP Server Support (All Providers)

- **Universal Support**: MCP servers work with OpenAI, Anthropic, and Google models through direct API calls
- **UI Integration**: MCP configuration section available for all providers
- **Server Configuration**: Name, URL, and optional OAuth authorization token
- **Multiple Servers**: Support for connecting to multiple MCP servers simultaneously
- **Tool Visualization**: Dedicated UI components for displaying tool use and results
- **Cross-Provider**: Same MCP servers can be used with any AI provider

## Multimodal Features

The application provides comprehensive multimodal capabilities across all AI providers:

### **File Upload & Processing**
- **Drag-and-Drop Support**: Simply drag files onto the chat input area for instant upload
- **File Type Support**: Images (JPG, PNG, GIF, WebP), Documents (PDF, TXT, CSV), and more
- **File Size Limit**: 10MB maximum per file for optimal performance
- **Multiple Files**: Upload and send multiple files in a single message
- **File Preview**: Visual preview of uploaded files with remove option before sending

### **Image Analysis (Vision)**
- **Universal Vision**: All three providers (OpenAI, Anthropic, Google) support image analysis
- **In-Message Display**: Uploaded images displayed inline with messages for context
- **Base64 Encoding**: Secure image transmission via base64 encoding
- **Format Support**: JPG, PNG, GIF, and WebP images supported

### **Function Calling & Custom Tools**
- **Universal Function Support**: Function calling works with OpenAI, Anthropic, and Google
- **Custom Tool Creation**: Add your own functions via the Tools interface
- **JSON Schema Parameters**: Define function parameters using JSON schema format
- **Visual Function Calls**: Function calls displayed with syntax highlighting and proper formatting
- **Provider-Specific Formats**: Automatic conversion between OpenAI, Anthropic, and Gemini function formats

### **Document Processing**
- **Non-Image Files**: Documents included as text descriptions in conversations
- **File Metadata**: Filename, type, and size information included with uploads
- **Persistent Storage**: File attachments saved to SQLite database for chat history

## SQLite Database Storage & Chat History

The application uses SQLite (via sql.js) for robust data persistence and chat history management:

### **Settings Persistence**
- **Auto-Save**: Settings automatically saved when you change provider, model, auth token, or MCP servers
- **SQLite Storage**: Relational database with proper schema and ACID compliance
- **Auto-Load**: Settings automatically loaded when app starts
- **Visual Feedback**: Settings save status shown with temporary status messages

### **Chat History Management**
- **Automatic Saving**: Every chat conversation is automatically saved after each message exchange
- **Persistent History**: All previous chats persist indefinitely in SQLite database
- **Smart Titles**: Chat titles auto-generated from first user message (50 chars max)
- **Provider Tracking**: Each chat remembers which AI provider and model was used
- **Timestamp Records**: Full date/time tracking for all conversations

### **Database Schema**
```javascript
// Settings Store
{
  id: 'main',
  data: {
    provider: 'openai',
    model: 'gpt-4o',
    authToken: 'shopify-eyJ...',
    mcpServers: [...],
    customTools: [...]
  }
}

// Chats Store  
{
  id: 1,
  title: 'Explain quantum computing...',
  provider: 'openai',
  model: 'gpt-4o',
  timestamp: '2024-01-15T10:30:00.000Z',
  messageCount: 4
}

// Messages Store
{
  id: 1,
  chatId: 1,
  role: 'user',
  content: 'Explain quantum computing in simple terms',
  timestamp: '2024-01-15T10:30:00.000Z',
  order: 0
}

// File Attachments Store (New in v2)
{
  id: 1,
  chatId: 1,
  messageId: 1,
  filename: 'diagram.png',
  type: 'image/png',
  size: 1024000,
  data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  timestamp: '2024-01-15T10:30:00.000Z'
}
```

## Development Notes

- This is a client-side only application - no build process or package management
- **SQLite Integration**: Robust data persistence with proper relational tables for settings, chats, and messages
- **Automatic Chat Saving**: Every conversation automatically saved after each message exchange
- **Storage Capacity**: SQLite database persisted in localStorage with comprehensive relational data structure
- **Data Relationships**: Proper relational structure with chats linked to messages via chatId
- Uses OpenAI-compatible format for all providers through Shopify proxy
- Provider-specific prefixes handle routing to correct AI service
- Dynamic UI adapts based on selected provider capabilities
- Professional styling with CSS gradients and modern UI patterns

## File Structure

```
/
├── index.html          # Complete application (HTML, CSS, JS)
├── CLAUDE.md          # This documentation file
```

## Running the Application

1. Open `index.html` directly in a web browser
2. Select your AI provider (OpenAI, Anthropic, or Google)
3. Choose your preferred model from the dynamic dropdown
4. Enter your provider-specific API key:
   - **OpenAI**: API key from OpenAI platform (starts with `sk-`)
   - **Anthropic**: API key from Anthropic console (starts with `sk-ant-`)
   - **Google**: API key from Google AI Studio
5. Optionally configure custom base URL for OpenAI-compatible providers
6. Optionally add MCP servers for enhanced functionality (works with all providers)
7. Click "Connect" to start chatting

## Usage Tips

### **Basic Chat Features**
- **Chat History Navigation**: Click any previous chat in the sidebar to resume that conversation
- **Auto-Save Conversations**: Every chat is automatically saved - no manual saving needed
- **Chat Management**: Hover over chat items to see delete button (×) for unwanted conversations
- **Smart Chat Titles**: Titles auto-generated from your first message in each conversation
- **Provider Memory**: Each chat remembers which AI provider and model was used
- **Settings Auto-Save**: Your provider, model, and auth token are automatically saved as you change them
- **Persistent Experience**: When you restart the app, both settings and chat history are restored
- **Provider Switching**: Switch providers anytime by changing the dropdown and reconnecting
- **Multi-line Messages**: Use Shift+Enter for multi-line messages
- **Provider Identification**: Provider badge in header shows current AI model, sidebar shows provider for each chat
- **Universal MCP Support**: MCP servers work with all providers (OpenAI, Anthropic, Google) and are automatically saved
- **New Chat**: Click "New Chat" to start fresh while keeping all previous conversations accessible

### **File Upload & Multimodal Features**
- **Drag-and-Drop Files**: Simply drag files from your computer onto the chat input area
- **File Upload Button**: Click the file button (if available) to browse and select files
- **Multiple File Support**: Upload multiple files at once for batch processing
- **File Preview**: Review uploaded files with previews before sending your message
- **Remove Files**: Click the × button on any file preview to remove it before sending
- **Image Analysis**: Upload images for visual analysis by any AI provider
- **Document Processing**: Upload documents (PDF, TXT, CSV) for content analysis
- **File Size Limits**: Keep files under 10MB for optimal performance

### **Function Calling & Custom Tools**
- **Add Custom Tools**: Use the Tools interface to create custom functions for the AI to call
- **JSON Schema**: Define function parameters using JSON schema format for precise control
- **Tool Visualization**: Function calls are displayed with syntax highlighting and clear formatting
- **Universal Support**: Custom tools work with all three AI providers (OpenAI, Anthropic, Google)
- **Persistent Tools**: Custom tools are automatically saved and available across all chats
- **Tool Management**: Remove unwanted tools using the × button in the Tools section