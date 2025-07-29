# Installation Guide

This guide will help you get Chat-V4 running on your local machine.

## 📋 Prerequisites

Before installing Chat-V4, ensure you have:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for cloning the repository
- A modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Install

### 1. Clone the Repository

```bash
git clone https://github.com/DamionR/chat-v4.git
cd chat-v4
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Visit `http://localhost:5173` in your web browser.

## 🔧 Alternative Installation Methods

### Using Yarn

```bash
# Clone repository
git clone https://github.com/DamionR/chat-v4.git
cd chat-v4

# Install with Yarn
yarn install

# Start development server
yarn dev
```

### Using pnpm

```bash
# Clone repository
git clone https://github.com/DamionR/chat-v4.git
cd chat-v4

# Install with pnpm
pnpm install

# Start development server
pnpm dev
```

## 🏗️ Production Build

To create a production build:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## 🐳 Docker Installation (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host"]
```

Build and run:

```bash
docker build -t chat-v4 .
docker run -p 5173:5173 chat-v4
```

## 🌐 Environment Variables

Create a `.env.local` file for custom configuration:

```env
# Development server port (optional)
VITE_PORT=5173

# Custom base path for deployment (optional)
VITE_BASE_PATH=/chat-v4

# Enable/disable MCP bridge
VITE_ENABLE_MCP_BRIDGE=true
```

## 📁 Project Structure

After installation, your project structure will look like:

```
chat-v4/
├── public/                 # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   ├── services/         # API and business logic
│   ├── store/           # State management
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── dist/                 # Production build (after build)
├── package.json         # Dependencies and scripts
├── vite.config.ts      # Vite configuration
└── README.md           # Basic project info
```

## ✅ Verify Installation

After starting the development server, you should see:

1. **Welcome Screen** - Multi-provider selection interface
2. **Settings Panel** - Configuration options in the right sidebar
3. **No Errors** - Check browser console for any issues

## 🔑 Next Steps

1. **Configure API Keys** - See [Configuration Guide](Configuration)
2. **Create Your First Agent** - See [Agents Guide](Agents)
3. **Connect MCP Servers** - See [MCP Servers Guide](MCP-Servers)

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Use a different port
npm run dev -- --port 3000
```

**Node Version Issues**
```bash
# Check Node version
node --version

# Use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

**Permission Errors**
```bash
# Clear npm cache
npm cache clean --force

# Use sudo on macOS/Linux (if needed)
sudo npm install
```

**Build Failures**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

For more troubleshooting help, see the [Troubleshooting Guide](Troubleshooting).

## 🆘 Need Help?

- 🐛 [Report Installation Issues](https://github.com/DamionR/chat-v4/issues)
- 💬 [Ask Questions](https://github.com/DamionR/chat-v4/discussions)
- 📖 [Read More Documentation](Home)