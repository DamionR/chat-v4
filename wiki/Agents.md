# Creating Agents

Learn how to create, configure, and manage custom AI agents in Chat-V4.

## 🤖 What are Agents?

Agents are specialized AI assistants with specific roles, capabilities, and tool access. Each agent can have:

- **Unique system prompts** - Define personality and behavior
- **Specific MCP servers** - Access to different tools and services
- **Custom configurations** - Model, temperature, and other parameters
- **Specialized knowledge** - Context-specific instructions

## 🎯 Creating Your First Agent

### 1. Open Agent Settings

1. Click the **settings icon** in the top-right
2. Navigate to the **Agents** tab
3. Click **"Create New Agent"**

### 2. Basic Configuration

**Agent Name**
```
Marketing Assistant
```

**Description**
```
Helps with marketing copy, social media content, and campaign ideas
```

**System Prompt**
```
You are a professional marketing assistant specializing in creative copywriting and social media strategy. 

Your expertise includes:
- Writing engaging marketing copy
- Creating social media content
- Developing campaign ideas
- Analyzing market trends
- Suggesting brand voice improvements

Always provide actionable, creative suggestions while maintaining brand consistency.
```

### 3. Advanced Settings

**Model Selection**
- Choose the best model for your use case
- GPT-4o for complex reasoning
- Claude 3.5 Sonnet for creative writing
- Gemini 1.5 Pro for analysis

**Temperature**
- `0.7` for balanced creativity
- `0.3` for factual content
- `1.0` for maximum creativity

**Max Tokens**
- `2048` for normal responses
- `4096` for longer content

### 4. MCP Server Assignment

Select which MCP servers this agent can access:
- ✅ **Web Search** - For market research
- ✅ **Google Drive** - For accessing brand assets
- ❌ **Database** - Not needed for marketing
- ❌ **Git** - Not relevant

## 📝 Agent Templates

### Code Assistant

```yaml
Name: Code Assistant
Description: Helps with programming, debugging, and code reviews

System Prompt: |
  You are an expert software developer proficient in multiple programming languages.
  
  Your capabilities:
  - Write clean, efficient code
  - Debug complex issues
  - Perform code reviews
  - Explain programming concepts
  - Suggest best practices
  
  Always provide working code examples and explain your reasoning.

MCP Servers:
  - Git (for repository access)
  - Filesystem (for code files)
  - Database (for data operations)

Model: claude-3-5-sonnet
Temperature: 0.3
```

### Research Assistant

```yaml
Name: Research Assistant
Description: Conducts thorough research and analysis

System Prompt: |
  You are a meticulous research assistant with expertise in information gathering and analysis.
  
  Your approach:
  - Gather information from multiple sources
  - Verify facts and cross-reference data
  - Provide comprehensive summaries
  - Cite sources appropriately
  - Present findings clearly
  
  Always prioritize accuracy and provide well-structured reports.

MCP Servers:
  - Web Search (for online research)
  - Memory (for maintaining research context)
  - Google Drive (for document access)

Model: gpt-4o
Temperature: 0.2
```

### Creative Writer

```yaml
Name: Creative Writer
Description: Assists with creative writing and storytelling

System Prompt: |
  You are a creative writing assistant with a talent for storytelling, character development, and narrative structure.
  
  Your specialties:
  - Character development
  - Plot structure
  - Dialogue writing
  - World building
  - Style adaptation
  
  Help writers improve their craft while maintaining their unique voice.

MCP Servers:
  - Memory (for story continuity)
  - Google Drive (for manuscript access)

Model: claude-3-7-sonnet
Temperature: 0.8
```

### Data Analyst

```yaml
Name: Data Analyst
Description: Analyzes data and creates insights

System Prompt: |
  You are a data analyst expert in statistical analysis, data visualization, and business intelligence.
  
  Your skills:
  - Statistical analysis
  - Data interpretation
  - Trend identification
  - Report generation
  - Recommendation formulation
  
  Always base conclusions on data and explain your methodology.

MCP Servers:
  - Database (for data access)
  - Filesystem (for data files)
  - Memory (for analysis context)

Model: gpt-4o
Temperature: 0.1
```

## 🔧 Agent Management

### Editing Agents

1. Go to **Settings → Agents**
2. Click the **edit icon** on any agent
3. Modify settings as needed
4. Save changes

### Duplicating Agents

1. Find the agent you want to copy
2. Click the **duplicate icon**
3. Modify the copy as needed
4. Save with a new name

### Deleting Agents

1. Click the **delete icon** on the agent
2. Confirm deletion in the modal
3. Agent and its configuration are removed

### Agent Status

Agents can be:
- **Active** - Available for use
- **Inactive** - Hidden from selection
- **Archived** - Saved but not actively used

## 🎨 Customization Tips

### Effective System Prompts

**Be Specific**
```markdown
❌ "You are helpful"
✅ "You are a helpful customer service representative specializing in technical support for web applications"
```

**Define Boundaries**
```markdown
❌ "Answer questions"
✅ "Answer questions about our product features, but redirect billing questions to the billing department"
```

**Provide Context**
```markdown
❌ "Write code"
✅ "Write TypeScript code following our coding standards: use strict typing, functional components, and include comprehensive JSDoc comments"
```

### Model Selection Guide

| Task Type | Recommended Model | Reasoning |
|-----------|------------------|-----------|
| Code Generation | Claude 3.5 Sonnet | Excellent at programming |
| Creative Writing | GPT-4o | Strong creative capabilities |
| Data Analysis | Gemini 1.5 Pro | Good with structured data |
| Customer Support | Claude 3 Haiku | Fast, reliable responses |
| Research | GPT-4o | Comprehensive reasoning |

### Temperature Settings

| Use Case | Temperature | Effect |
|----------|-------------|--------|
| Code Review | 0.1 - 0.3 | Consistent, factual |
| Technical Writing | 0.3 - 0.5 | Clear, structured |
| Marketing Copy | 0.6 - 0.8 | Creative, engaging |
| Creative Writing | 0.8 - 1.0 | Highly creative |
| Brainstorming | 0.9 - 1.2 | Maximum creativity |

## 🔄 Agent Workflows

### Sequential Agent Use

1. **Research Agent** - Gather information
2. **Analysis Agent** - Process findings
3. **Writing Agent** - Create content
4. **Review Agent** - Quality check

### Collaborative Agents

Create agents that work together:
- **Lead Developer** - Architecture decisions
- **Frontend Specialist** - UI/UX implementation
- **Backend Specialist** - API development
- **QA Engineer** - Testing and validation

### Domain-Specific Agents

**E-commerce**
- Product Description Writer
- Customer Service Rep
- Inventory Analyst
- Marketing Manager

**Healthcare**
- Medical Research Assistant
- Patient Education Writer
- Clinical Documentation Helper
- Compliance Checker

**Education**
- Curriculum Designer
- Assessment Creator
- Student Tutor
- Research Assistant

## 📊 Agent Performance

### Monitoring Usage

Track agent effectiveness:
- Response quality
- Task completion rate
- User satisfaction
- Processing time

### Optimization Tips

1. **Refine prompts** based on output quality
2. **Adjust temperature** for desired creativity
3. **Update MCP access** as needs change
4. **Review and iterate** regularly

## 🚨 Best Practices

### Security

- **Don't include sensitive data** in system prompts
- **Limit MCP access** to necessary servers only
- **Regular audit** agent permissions
- **Use environment variables** for secrets

### Performance

- **Keep prompts focused** and specific
- **Avoid overly long** system prompts
- **Choose appropriate models** for tasks
- **Monitor token usage**

### Maintenance

- **Regular updates** to keep agents current
- **Version control** for important agents
- **Documentation** of agent purposes
- **User feedback** incorporation

## 🆘 Troubleshooting

### Common Issues

**Agent Not Responding**
- Check API key validity
- Verify model availability
- Review system prompt length
- Check MCP server connections

**Poor Response Quality**
- Refine system prompt
- Adjust temperature
- Try different model
- Provide more context

**MCP Tools Not Working**
- Verify MCP server status
- Check agent permissions
- Review tool configurations
- Test MCP connections

For more help, see [Troubleshooting Guide](Troubleshooting).

## 🆘 Need Help?

- 🐛 [Report Agent Issues](https://github.com/DamionR/chat-v4/issues)
- 💬 [Share Agent Ideas](https://github.com/DamionR/chat-v4/discussions)
- 📖 [Back to Wiki Home](Home)