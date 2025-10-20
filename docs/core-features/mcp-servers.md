# MCP Server Integration

The KushRouter SDK provides comprehensive support for MCP (Model Context Protocol) servers, enabling AI models to interact with external tools and data sources seamlessly.

## Overview

MCP servers extend your AI applications by providing:
- **File System Access**: Read, write, and manage files
- **Database Connectivity**: Query and manipulate database records
- **Web API Integration**: Connect to REST APIs and web services
- **Custom Tools**: Build domain-specific capabilities
- **Real-time Data**: Access live data feeds and services

## Basic Usage

### Simple MCP Server Connection

```typescript
import { KushRouter, MCPServer } from 'kushrouter-sdk';

const router = new KushRouter({
  apiKey: 'your-api-key'
});

const mcpServers: MCPServer[] = [
  {
    name: 'filesystem',
    uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
    capabilities: ['read_file', 'write_file', 'list_directory']
  }
];

const response = await router.chatUnified({
  model: 'claude-sonnet-4-5-20250929',
  messages: [
    {
      role: 'user',
      content: 'Read the package.json file and tell me about the project dependencies'
    }
  ],
  mcpServers
});
```

### Multiple MCP Servers

```typescript
const mcpServers: MCPServer[] = [
  {
    name: 'filesystem',
    uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
    capabilities: ['read_file', 'write_file']
  },
  {
    name: 'database',
    uri: 'stdio:///usr/local/bin/mcp-server-postgres',
    capabilities: ['query', 'schema'],
    config: {
      connection_string: 'postgresql://localhost:5432/mydb'
    }
  },
  {
    name: 'web-api',
    uri: 'http://localhost:3001/mcp',
    capabilities: ['fetch_data', 'post_data']
  }
];

const response = await router.chatUnified({
  model: 'gpt-5-2025-08-07',
  messages: [
    {
      role: 'user',
      content: 'Query the database for user analytics, then save the report to a file'
    }
  ],
  mcpServers
});
```

## Endpoint Compatibility

### Unified Endpoint

```typescript
// Use camelCase for mcpServers - SDK handles normalization
const response = await router.chatUnified({
  model: 'claude-sonnet-4-5-20250929',
  messages: [...],
  mcpServers: [...] // camelCase
});
```

### OpenAI-Compatible Endpoint

```typescript
// Use snake_case for mcp_servers
const response = await router.chatOpenAI({
  model: 'gpt-5-2025-08-07',
  messages: [...],
  mcp_servers: [...] // snake_case
});
```

### Anthropic-Compatible Endpoint

```typescript
// Use snake_case for mcp_servers
const response = await router.chatAnthropic({
  model: 'claude-sonnet-4-5-20250929',
  messages: [...],
  max_tokens: 1000,
  mcp_servers: [...] // snake_case
});
```

## Streaming with MCP Servers

```typescript
const mcpServers: MCPServer[] = [
  {
    name: 'knowledge-base',
    uri: 'stdio:///usr/local/bin/mcp-server-kb',
    capabilities: ['search', 'retrieve']
  }
];

for await (const chunk of router.streamUnified({
  model: 'claude-sonnet-4-5-20250929',
  messages: [
    {
      role: 'user',
      content: 'Search for machine learning papers and summarize the latest trends'
    }
  ],
  mcpServers,
  stream: true
})) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

## Batch Processing with MCP Servers

```typescript
const mcpServers: MCPServer[] = [
  {
    name: 'data-processor',
    uri: 'stdio:///usr/local/bin/mcp-server-data',
    capabilities: ['process', 'validate', 'transform']
  }
];

const batch = await router.batches.create({
  requests: [
    {
      model: 'gpt-5-2025-08-07',
      messages: [{ role: 'user', content: 'Process dataset A' }],
      mcpServers
    },
    {
      model: 'gpt-5-2025-08-07',
      messages: [{ role: 'user', content: 'Process dataset B' }],
      mcpServers
    }
  ],
  metadata: { purpose: 'data_processing' }
});
```

## Common MCP Server Types

### Filesystem Server

```typescript
{
  name: 'filesystem',
  uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
  capabilities: ['read_file', 'write_file', 'list_directory', 'create_directory'],
  config: {
    allowed_directories: ['/workspace', '/data'],
    max_file_size: '10MB'
  }
}
```

### Database Server

```typescript
{
  name: 'postgres',
  uri: 'stdio:///usr/local/bin/mcp-server-postgres',
  capabilities: ['query', 'schema', 'execute'],
  config: {
    connection_string: process.env.DATABASE_URL,
    read_only: false,
    timeout: 30000
  }
}
```

### Web API Server

```typescript
{
  name: 'rest-api',
  uri: 'http://localhost:3001/mcp',
  capabilities: ['get', 'post', 'put', 'delete'],
  config: {
    base_url: 'https://api.example.com',
    api_key: process.env.API_KEY,
    rate_limit: 100
  }
}
```

### Custom Tool Server

```typescript
{
  name: 'custom-tools',
  uri: 'stdio:///path/to/custom-mcp-server',
  capabilities: ['custom_function_1', 'custom_function_2'],
  config: {
    environment: 'production',
    debug: false,
    custom_setting: 'value'
  }
}
```

## Best Practices

### Security Considerations

```typescript
// ✅ Good: Specify allowed directories
{
  name: 'filesystem',
  uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
  config: {
    allowed_directories: ['/workspace/safe-area'],
    denied_directories: ['/etc', '/usr', '/var']
  }
}

// ✅ Good: Use environment variables for sensitive data
{
  name: 'database',
  uri: 'stdio:///usr/local/bin/mcp-server-postgres',
  config: {
    connection_string: process.env.DATABASE_URL // Not hardcoded
  }
}

// ❌ Avoid: Hardcoded credentials
{
  name: 'database',
  config: {
    connection_string: 'postgresql://user:password@localhost:5432/db' // Bad!
  }
}
```

### Performance Optimization

```typescript
// ✅ Good: Specify only needed capabilities
{
  name: 'filesystem',
  uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
  capabilities: ['read_file'], // Only what you need
  config: {
    cache_enabled: true,
    cache_ttl: 300
  }
}

// ✅ Good: Set appropriate timeouts
{
  name: 'slow-api',
  uri: 'http://slow-api.example.com/mcp',
  config: {
    timeout: 10000, // 10 seconds
    retry_attempts: 3
  }
}
```

### Error Handling

```typescript
async function robustMCPUsage() {
  const mcpServers: MCPServer[] = [
    {
      name: 'primary-server',
      uri: 'stdio:///usr/local/bin/primary-server'
    }
  ];

  try {
    const response = await router.chatUnified({
      model: 'claude-sonnet-4-5-20250929',
      messages: [{ role: 'user', content: 'Use external tools to help me' }],
      mcpServers
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.warn('MCP server failed, falling back to base model:', error);
    
    // Fallback without MCP servers
    const fallbackResponse = await router.chatUnified({
      model: 'claude-sonnet-4-5-20250929',
      messages: [{ role: 'user', content: 'Help me without external tools' }]
    });
    
    return fallbackResponse.choices[0].message.content;
  }
}
```

## Troubleshooting

### Common Issues

**MCP Server Not Found**
```
Error: Failed to connect to MCP server at stdio:///path/to/server
```
- Verify the server binary exists and is executable
- Check file permissions (`chmod +x /path/to/server`)
- Ensure the server supports MCP protocol

**Connection Timeout**
```
Error: MCP server connection timeout
```
- Increase timeout in server config
- Check network connectivity for HTTP/HTTPS URIs
- Verify server is running and responsive

**Capability Mismatch**
```
Error: Requested capability 'unknown_function' not available
```
- Check server documentation for available capabilities
- Update capabilities array to match server features
- Verify server version compatibility

### Debug Mode

```typescript
// Enable debug logging for MCP servers
const mcpServers: MCPServer[] = [
  {
    name: 'debug-server',
    uri: 'stdio:///usr/local/bin/mcp-server',
    config: {
      debug: true,
      log_level: 'verbose'
    }
  }
];
```

## Advanced Configuration

### Custom Headers and Authentication

```typescript
{
  name: 'authenticated-api',
  uri: 'https://api.example.com/mcp',
  config: {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
      'User-Agent': 'KushRouter-SDK/2.0.0'
    },
    ssl_verify: true
  }
}
```

### Connection Pooling

```typescript
{
  name: 'high-throughput-server',
  uri: 'stdio:///usr/local/bin/mcp-server',
  config: {
    connection_pool: {
      min_connections: 2,
      max_connections: 10,
      idle_timeout: 60000
    }
  }
}
```

## Integration Examples

See the complete examples in [`examples/mcp-servers.ts`](../examples/mcp-servers.ts) for detailed implementation patterns and use cases.

## Related Documentation

- [API Endpoints](../../LLMRouterAPI/docs/endpoints.md) - Backend API reference
- [MCP Servers Guide](../../LLMRouterAPI/docs/mcp-servers.md) - Detailed server configuration
- [CLI Integration](../../LLMRouterAPI/docs/cli-integration.md) - Command-line usage
