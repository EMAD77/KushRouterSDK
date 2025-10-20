# KushRouter SDK Documentation

Welcome to the comprehensive documentation for the KushRouter SDK. This guide covers everything you need to know to integrate AI capabilities into your applications using our unified LLM API.

## 📚 Documentation Structure

### Getting Started
- [Installation & Setup](./getting-started/installation.md)
- [Quick Start Guide](./getting-started/quick-start.md)
- [Authentication](./getting-started/authentication.md)
- [Configuration](./getting-started/configuration.md)

### Core Features
- [Text Completion](./core-features/text-completion.md)
- [Streaming Responses](./core-features/streaming.md)
- [Chat Conversations](./core-features/chat-conversations.md)
- [MCP Server Integration](./core-features/mcp-servers.md)
- [Analytics & Monitoring](./core-features/analytics.md)
- [Provider-Specific APIs](./core-features/provider-apis.md)
- [Error Handling](./core-features/error-handling.md)

### Use Cases & Patterns
- [Building Chatbots](./use-cases/chatbots.md)
- [AI Agents](./use-cases/ai-agents.md)
- [Content Generation](./use-cases/content-generation.md)
- [Code Assistance](./use-cases/code-assistance.md)
- [Analytics & Monitoring](./use-cases/analytics-monitoring.md)
- [Data Analysis](./use-cases/data-analysis.md)
- [Batch Processing](./use-cases/batch-processing.md)

### Advanced Topics
- [File Management](./advanced/file-management.md)
- [Cost Optimization](./advanced/cost-optimization.md)
- [Performance Tuning](./advanced/performance.md)
- [Production Deployment](./advanced/production.md)
- [Monitoring & Analytics](./advanced/monitoring.md)

### Framework Integrations
- [Next.js Integration](./integrations/nextjs.md)
- [Express.js Integration](./integrations/express.md)
- [React Applications](./integrations/react.md)
- [Node.js Scripts](./integrations/nodejs.md)
- [TypeScript Projects](./integrations/typescript.md)

### Examples & Recipes
- [Code Examples](./examples/README.md)
- [Common Patterns](./recipes/README.md)
- [Best Practices](./best-practices/README.md)

### API Reference
- [SDK Methods](./api-reference/methods.md)
- [Types & Interfaces](./api-reference/types.md)
- [Error Classes](./api-reference/errors.md)

## 🚀 Quick Navigation

| I want to... | Go to |
|---------------|-------|
| Get started quickly | [Quick Start Guide](./getting-started/quick-start.md) |
| Build a chatbot | [Chatbot Guide](./use-cases/chatbots.md) |
| Create an AI agent | [AI Agents Guide](./use-cases/ai-agents.md) |
| Connect external tools | [MCP Server Integration](./core-features/mcp-servers.md) |
| Stream responses in real-time | [Streaming Guide](./core-features/streaming.md) |
| Monitor usage and costs | [Analytics Guide](./core-features/analytics.md) |
| Handle errors properly | [Error Handling](./core-features/error-handling.md) |
| Optimize costs | [Cost Optimization](./advanced/cost-optimization.md) |
| Deploy to production | [Production Guide](./advanced/production.md) |
| See code examples | [Examples](./examples/README.md) |

## 🎯 Popular Use Cases

### 1. **Simple Text Generation**
```typescript
const sdk = createKushRouterSDK({ apiKey: 'your-key' });
const result = await sdk.complete('Explain quantum computing');
```

### 2. **Real-time Streaming**
```typescript
const stream = await sdk.complete('Write a story', { stream: true });
for await (const chunk of stream) {
  console.log(chunk);
}
```

### 3. **Conversational Chat**
```typescript
const response = await sdk.chat([
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help?' },
  { role: 'user', content: 'What is AI?' }
]);
```

### 4. **Usage Analytics**
```typescript
const analytics = await sdk.getAnalytics({ days: 30, includeHourly: true });
console.log(`Total cost: $${analytics.data.summary.totalCost.toFixed(4)}`);
console.log(`Most used model: ${analytics.data.modelBreakdown[0].model}`);
```

### 5. **AI Agent with MCP Servers**
```typescript
const mcpServers = [
  {
    name: 'filesystem',
    uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
    capabilities: ['read_file', 'write_file']
  }
];

const response = await sdk.chatUnified({
  model: 'claude-sonnet-4-5-20250929',
  messages: [{ role: 'user', content: 'Read my project files and create a summary' }],
  mcpServers
});
```

## 📋 Requirements

- Node.js 18+ (for native fetch support)
- TypeScript 4.5+ (recommended)
- Valid KushRouter API key

## 🔗 Related Resources

- [API Documentation](https://kushrouter.com/docs)
- [Pricing](https://kushrouter.com/pricing)
- [GitHub Repository](https://github.com/EMAD77/KushRouterSDK)

## 🆘 Support

- [Email Support](mailto:support@kushrouter.com)

---

*Last updated: August 2025*