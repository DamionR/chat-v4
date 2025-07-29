# Custom Tools Guide

Learn how to create, configure, and manage custom functions that your AI agents can call.

## 🛠️ What are Custom Tools?

Custom tools are JavaScript functions that extend your AI agents' capabilities beyond text generation. They allow agents to:

- **Perform calculations** - Math, statistics, data processing
- **Make API calls** - Integrate with external services
- **Process data** - Transform, validate, and manipulate information
- **Trigger actions** - Send notifications, update databases
- **Access local resources** - With proper security considerations

## 🎯 Creating Your First Tool

### 1. Access Tool Settings

1. Go to **Settings** → **Tools** tab
2. Click **"Add Custom Tool"**
3. Follow the multi-step wizard

### 2. Basic Tool Configuration

**Step 1: Tool Name**
```
Calculator
```

**Step 2: Tool Description**
```
Performs mathematical calculations and returns the result
```

**Step 3: Parameters (JSON Schema)**
```json
{
  "type": "object",
  "properties": {
    "expression": {
      "type": "string",
      "description": "Mathematical expression to evaluate (e.g., '2 + 3 * 4')"
    }
  },
  "required": ["expression"]
}
```

### 3. Tool Implementation

The tool implementation is handled automatically based on the schema. For this calculator example, you would need to create the actual function logic separately.

## 📝 Tool Examples

### Simple Calculator

```json
{
  "name": "calculator",
  "description": "Evaluates mathematical expressions safely",
  "parameters": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "Math expression like '2 + 3 * (4 - 1)'"
      }
    },
    "required": ["expression"]
  }
}
```

### Weather Lookup

```json
{
  "name": "get_weather",
  "description": "Gets current weather for a location",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City name or coordinates"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature units",
        "default": "celsius"
      }
    },
    "required": ["location"]
  }
}
```

### Data Validator

```json
{
  "name": "validate_email",
  "description": "Validates email address format",
  "parameters": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "description": "Email address to validate"
      }
    },
    "required": ["email"]
  }
}
```

### API Integration

```json
{
  "name": "create_ticket",
  "description": "Creates a support ticket in our system",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Ticket title/subject"
      },
      "description": {
        "type": "string",
        "description": "Detailed description of the issue"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "medium", "high", "urgent"],
        "description": "Ticket priority level"
      },
      "category": {
        "type": "string",
        "enum": ["bug", "feature", "support", "question"],
        "description": "Type of ticket"
      }
    },
    "required": ["title", "description"]
  }
}
```

### File Operations

```json
{
  "name": "generate_report",
  "description": "Generates a PDF report from data",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Report title"
      },
      "data": {
        "type": "array",
        "items": {
          "type": "object"
        },
        "description": "Data to include in the report"
      },
      "template": {
        "type": "string",
        "enum": ["standard", "executive", "detailed"],
        "description": "Report template to use"
      }
    },
    "required": ["title", "data"]
  }
}
```

## 🔧 Advanced Parameter Schemas

### Complex Object Parameters

```json
{
  "name": "process_order",
  "description": "Processes a customer order",
  "parameters": {
    "type": "object",
    "properties": {
      "customer": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string", "format": "email"},
          "phone": {"type": "string"}
        },
        "required": ["name", "email"]
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "sku": {"type": "string"},
            "quantity": {"type": "integer", "minimum": 1},
            "price": {"type": "number", "minimum": 0}
          },
          "required": ["sku", "quantity", "price"]
        }
      },
      "shipping": {
        "type": "object",
        "properties": {
          "method": {
            "type": "string",
            "enum": ["standard", "express", "overnight"]
          },
          "address": {
            "type": "object",
            "properties": {
              "street": {"type": "string"},
              "city": {"type": "string"},
              "state": {"type": "string"},
              "zip": {"type": "string"}
            },
            "required": ["street", "city", "state", "zip"]
          }
        },
        "required": ["method", "address"]
      }
    },
    "required": ["customer", "items", "shipping"]
  }
}
```

### Conditional Parameters

```json
{
  "name": "send_notification",
  "description": "Sends notifications via different channels",
  "parameters": {
    "type": "object",
    "properties": {
      "channel": {
        "type": "string",
        "enum": ["email", "sms", "slack", "webhook"]
      },
      "message": {
        "type": "string",
        "description": "Notification message"
      },
      "recipient": {
        "type": "string",
        "description": "Email, phone number, or channel ID"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "normal", "high"],
        "default": "normal"
      }
    },
    "required": ["channel", "message", "recipient"],
    "allOf": [
      {
        "if": {"properties": {"channel": {"const": "email"}}},
        "then": {
          "properties": {
            "subject": {"type": "string"}
          },
          "required": ["subject"]
        }
      },
      {
        "if": {"properties": {"channel": {"const": "slack"}}},
        "then": {
          "properties": {
            "thread_ts": {"type": "string"}
          }
        }
      }
    ]
  }
}
```

## 🎨 Tool Categories

### Utility Tools

**Text Processing**
- Format text (markdown, HTML)
- Extract information (emails, URLs)
- Translate languages
- Summarize content

**Data Operations**
- Sort and filter arrays
- Calculate statistics
- Convert formats (JSON, CSV, XML)
- Validate data structures

**Math & Science**
- Scientific calculations
- Unit conversions
- Statistical analysis
- Chart generation

### Integration Tools

**External APIs**
- REST API calls
- GraphQL queries
- Webhook triggers
- OAuth authentication

**Database Operations**
- Query execution
- Data insertion/updates
- Schema validation
- Backup operations

**File Systems**
- File reading/writing
- Directory operations
- Compression/decompression
- Format conversion

### Business Tools

**CRM Integration**
- Customer lookup
- Lead creation
- Activity logging
- Report generation

**E-commerce**
- Product management
- Order processing
- Inventory tracking
- Payment processing

**Communication**
- Email sending
- SMS notifications
- Slack integration
- Calendar scheduling

## 🔒 Security Considerations

### Input Validation

**Always validate inputs:**
```json
{
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "pattern": "^[a-zA-Z0-9_-]+$",
        "maxLength": 50
      },
      "amount": {
        "type": "number",
        "minimum": 0,
        "maximum": 10000
      }
    }
  }
}
```

### Sensitive Operations

**For dangerous operations:**
- Require explicit confirmation
- Implement rate limiting
- Log all executions
- Use readonly modes when possible

### API Security

**When making external calls:**
- Use environment variables for API keys
- Implement timeout limits
- Validate response data
- Handle errors gracefully

## 📊 Tool Management

### Enable/Disable Tools

Control which tools are available:
1. Go to **Settings** → **Tools**
2. Use the **toggle switch** next to each tool
3. Disabled tools won't appear in agent contexts

### Tool Organization

**Naming Conventions:**
- Use descriptive, action-oriented names
- Group related tools with prefixes
- Follow consistent naming patterns

**Examples:**
```
calc_basic          → calculator_basic
calc_scientific     → calculator_scientific
api_weather_get     → weather_get_current
api_weather_forecast → weather_get_forecast
```

### Tool Testing

**Before enabling new tools:**
1. Test with simple inputs
2. Verify error handling
3. Check parameter validation
4. Monitor performance impact

## 🎯 Best Practices

### Tool Design

**Keep It Simple**
- One tool, one purpose
- Clear, descriptive names
- Comprehensive documentation
- Predictable behavior

**Error Handling**
- Validate all inputs
- Provide helpful error messages
- Gracefully handle failures
- Return structured responses

### Performance

**Optimize for Speed**
- Minimize external API calls
- Implement caching where appropriate
- Use efficient algorithms
- Monitor execution times

**Resource Management**
- Set reasonable timeouts
- Limit concurrent executions
- Monitor memory usage
- Clean up resources

### Documentation

**Document Everything**
- Clear parameter descriptions
- Usage examples
- Expected return formats
- Error conditions

## 🔄 Tool Integration with Agents

### Agent-Specific Tools

Assign tools to specific agents:

**Data Analysis Agent:**
- ✅ Statistical calculators
- ✅ Chart generators
- ✅ Data validators
- ❌ Email senders

**Customer Service Agent:**
- ✅ Ticket creation
- ✅ Customer lookup
- ✅ Email notifications
- ❌ Database admin tools

### Tool Combinations

**Workflow Tools**
```
1. validate_input() → Clean and verify data
2. process_data() → Transform and analyze
3. generate_report() → Create output
4. send_notification() → Alert stakeholders
```

**API Chains**
```
1. authenticate_user() → Get auth token
2. fetch_user_data() → Retrieve information
3. update_profile() → Modify data
4. log_activity() → Record changes
```

## 🆘 Troubleshooting

### Common Issues

**Tool Not Appearing**
- Check if tool is enabled
- Verify agent has access
- Review parameter schema syntax
- Check for naming conflicts

**Parameter Validation Errors**
- Verify JSON schema format
- Check required fields
- Validate data types
- Test with minimal examples

**Execution Failures**
- Review error messages
- Check API credentials
- Verify network connectivity
- Monitor rate limits

### Debugging Tools

**Testing Parameters**
```json
{
  "expression": "2 + 2",
  "location": "New York",
  "email": "test@example.com"
}
```

**Error Logging**
- Monitor tool execution logs
- Track success/failure rates
- Identify performance bottlenecks
- Review error patterns

For comprehensive troubleshooting, see [Troubleshooting Guide](Troubleshooting).

## 🆘 Need Help?

- 🐛 [Report Tool Issues](https://github.com/DamionR/chat-v4/issues)
- 💬 [Share Tool Ideas](https://github.com/DamionR/chat-v4/discussions)
- 📖 [Back to Wiki Home](Home)
- 🤖 [Learn about Agents](Agents)