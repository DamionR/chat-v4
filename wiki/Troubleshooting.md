# Troubleshooting Guide

Common issues and solutions for Chat-V4 setup, configuration, and usage.

## 🚨 Quick Diagnostics

### Health Check

Before troubleshooting, verify basic functionality:

1. **Application Loads** - Chat-V4 opens in browser
2. **Settings Accessible** - Right sidebar opens
3. **No Console Errors** - Browser dev tools show no red errors
4. **Local Storage Works** - Settings persist after refresh

### System Requirements

**Minimum Requirements:**
- Node.js 16+ (check with `node --version`)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- 4GB RAM available
- Internet connection for AI providers

**Recommended:**
- Node.js 18+
- 8GB+ RAM
- Fast internet connection
- SSD storage

## 🔧 Installation Issues

### Node.js Problems

**Error: Command not found: node**
```bash
# Install Node.js
# macOS (with Homebrew)
brew install node

# Linux (Ubuntu/Debian)
sudo apt update && sudo apt install nodejs npm

# Windows
# Download from https://nodejs.org/
```

**Error: Node version too old**
```bash
# Update Node.js using Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### npm/Package Issues

**Error: Permission denied**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
npm cache clean --force

# Or use nvm instead of system Node.js
```

**Error: Package not found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Error: ENOSPC (no space left)**
```bash
# Increase file watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Build Failures

**TypeScript Compilation Errors**
```bash
# Check TypeScript version
npx tsc --version

# Clean and rebuild
rm -rf dist/
npm run build
```

**Vite Build Issues**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

## 🔑 API Configuration Issues

### OpenAI Problems

**Error: Invalid API key**
- Verify key starts with `sk-`
- Check for extra spaces or characters
- Generate new key at https://platform.openai.com/api-keys
- Ensure key has proper permissions

**Error: Insufficient quota**
- Check usage at https://platform.openai.com/usage
- Add billing information
- Verify spending limits

**Error: Model not found**
- Check model availability in your region
- Verify subscription tier supports model
- Try a different model (e.g., gpt-3.5-turbo)

### Anthropic Problems

**Error: Authentication failed**
- Verify key starts with `sk-ant-`
- Check console.anthropic.com for key status
- Ensure proper API access enabled

**Error: Rate limit exceeded**
- Reduce request frequency
- Check usage limits in console
- Upgrade plan if necessary

### Google/Gemini Problems

**Error: API key invalid**
- Verify key from https://makersuite.google.com/app/apikey
- Check API is enabled in Google Cloud Console
- Verify billing account is set up

**Error: Quota exceeded**
- Check quota limits in Google Cloud Console
- Request quota increase if needed
- Monitor daily usage

### X AI Problems

**Error: Server not found**
- Verify X AI API is available in your region
- Check https://x.ai/api for status updates
- Try different base URL if provided

### OpenRouter Problems

**Error: No credits remaining**
- Check balance at https://openrouter.ai/credits
- Add credits to account
- Monitor usage patterns

## 🤖 Agent Issues

### Agents Not Working

**Agent doesn't respond**
- Check API key validity
- Verify model availability
- Review system prompt length (max ~8000 chars)
- Test with simpler prompts

**Poor response quality**
- Adjust temperature settings
- Refine system prompt
- Try different model
- Provide more context

**Agent ignores instructions**
- Make system prompt more specific
- Use clear, direct language
- Break complex instructions into steps
- Add examples in system prompt

### Agent Configuration

**Can't create new agents**
- Check browser storage isn't full
- Clear localStorage if necessary
- Verify no JavaScript errors in console

**Agent settings don't save**
- Check network connectivity
- Verify localStorage permissions
- Try incognito/private mode

## 🔌 MCP Server Issues

### HTTP MCP Servers

**Server won't connect**
```bash
# Test server manually
curl -X POST https://your-mcp-server.com/endpoint \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"ping"}'
```

**Authentication errors**
- Verify OAuth token format
- Check token expiration
- Test token with server documentation
- Regenerate token if needed

**Timeout errors**
- Increase timeout settings
- Check server response times
- Verify network connectivity
- Monitor server logs

### Stdio MCP Servers (Bridge)

**Bridge won't start**
- Check Node.js is installed
- Verify npm packages are available
- Check file permissions
- Review bridge console logs

**Servers won't connect**
```bash
# Test MCP server manually
npx @modelcontextprotocol/server-filesystem /path/to/directory
```

**Permission errors**
- Check file/directory permissions
- Verify user has access rights
- Use absolute paths
- Test with minimal permissions

**Process crashes**
- Monitor memory usage
- Check for resource leaks
- Review process logs
- Restart bridge if needed

## 💾 Storage & Data Issues

### IndexedDB Problems

**Storage quota exceeded**
- Clear old chat history
- Export important chats
- Check browser storage settings
- Use storage management tools

**Data corruption**
- Clear IndexedDB manually
- Restart browser
- Re-import from backup
- Check for browser updates

### OPFS Issues

**SQLite files not accessible**
- Check OPFS browser support
- Verify secure context (HTTPS)
- Clear OPFS storage if corrupted
- Use fallback storage methods

**Performance issues**
- Monitor database size
- Optimize queries
- Clean up old data
- Consider storage limits

## 🌐 Network & Performance

### Connection Issues

**Slow response times**
- Check internet connection speed
- Try different DNS servers
- Monitor API endpoint status
- Use network diagnostics

**Request failures**
- Check CORS settings
- Verify SSL certificates
- Monitor network logs
- Test with different browsers

**Intermittent connectivity**
- Check router/modem stability
- Monitor for packet loss
- Use wired connection if possible
- Contact ISP if needed

### Performance Optimization

**Slow application loading**
```bash
# Clear browser cache
# Disable browser extensions
# Check system resources (RAM, CPU)
# Close unnecessary applications
```

**High memory usage**
- Monitor browser memory usage
- Clear chat history periodically
- Disable unused MCP servers
- Restart browser regularly

## 🖥️ Browser-Specific Issues

### Chrome

**Extension conflicts**
- Disable ad blockers temporarily
- Check developer tools for errors
- Try incognito mode
- Reset Chrome settings if needed

### Firefox

**Storage issues**
- Check privacy settings
- Verify localStorage permissions
- Clear site data
- Update to latest version

### Safari

**CORS problems**
- Check security settings
- Enable developer features
- Clear website data
- Update Safari

## 🔍 Debugging Tools

### Browser Developer Tools

**Console Errors**
1. Press F12 to open dev tools
2. Go to Console tab
3. Look for red error messages
4. Copy error details for support

**Network Monitoring**
1. Open dev tools → Network tab
2. Reload page
3. Check for failed requests
4. Monitor API response times

**Storage Inspection**
1. Dev tools → Application tab
2. Check IndexedDB entries
3. Verify localStorage data
4. Monitor storage usage

### Application Logs

**Chat-V4 Debug Mode**
```javascript
// Enable debug logging in browser console
localStorage.setItem('debug', 'true')
location.reload()
```

**MCP Bridge Logs**
- Check browser console for bridge messages
- Monitor server process output
- Review connection status
- Track message flow

## 🆘 Getting Help

### Before Reporting Issues

**Gather Information:**
1. Browser type and version
2. Operating system
3. Node.js version
4. Error messages (exact text)
5. Steps to reproduce
6. Console logs

**Try Basic Fixes:**
1. Refresh the page
2. Clear browser cache
3. Restart browser
4. Restart development server
5. Check internet connection

### Reporting Issues

**Create GitHub Issue:**
1. Go to https://github.com/DamionR/chat-v4/issues
2. Click "New Issue"
3. Use issue template
4. Provide all requested information
5. Include screenshots if helpful

**Issue Template:**
```markdown
## Problem Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.17.0]
- Chat-V4 Version: [e.g., latest]

## Console Errors
```
Paste any console errors here
```

## Additional Context
Any other relevant information
```

### Community Help

**GitHub Discussions:**
- https://github.com/DamionR/chat-v4/discussions
- Search existing discussions
- Ask questions in appropriate categories
- Help others when possible

**Discord/Chat:**
- Check project README for community links
- Follow community guidelines
- Be respectful and patient

## 📚 Additional Resources

### Documentation
- [Installation Guide](Installation)
- [Configuration Guide](Configuration)
- [Agents Guide](Agents)
- [MCP Servers Guide](MCP-Servers)
- [MCP Bridge Guide](MCP-Bridge)
- [Custom Tools Guide](Custom-Tools)

### External Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Google AI Documentation](https://ai.google.dev/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

### System Tools
- **Process Monitor** - Monitor system resources
- **Network Analyzer** - Debug connection issues
- **Browser Extensions** - Developer tools enhancement
- **Log Viewers** - Parse and analyze logs

## 🔄 Recovery Procedures

### Complete Reset

**If everything is broken:**
1. Stop development server
2. Clear browser data for localhost
3. Delete node_modules and package-lock.json
4. Reinstall dependencies: `npm install`
5. Restart server: `npm run dev`

### Data Recovery

**Restore from backup:**
1. Export any remaining data
2. Clear corrupted storage
3. Import from previous backup
4. Verify data integrity

### Fresh Installation

**Nuclear option:**
1. Backup any custom configurations
2. Clone repository to new directory
3. Fresh npm install
4. Import configurations
5. Test functionality

---

*Remember: Most issues have simple solutions. Take a systematic approach and don't hesitate to ask for help!*