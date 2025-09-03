# KushRouter SDK Examples

This directory contains practical examples and code snippets for common use cases with the KushRouter SDK.

## 📁 Example Categories

### Basic Usage
- [Simple Completions](./basic/simple-completions.md) - Getting started with text generation
- [Chat Conversations](./basic/chat-conversations.md) - Basic conversational AI
- [Streaming Responses](./basic/streaming-responses.md) - Real-time text streaming
- [Error Handling](./basic/error-handling.md) - Robust error management

### Advanced Patterns
- [Multi-Model Usage](./advanced/multi-model.md) - Compare responses from different models
- [Cost Optimization](./advanced/cost-optimization.md) - Minimize API costs
- [Batch Processing](./advanced/batch-processing.md) - Handle large-scale operations
- [Custom Agents](./advanced/custom-agents.md) - Build specialized AI agents

### Framework Integrations
- [Next.js Examples](./frameworks/nextjs.md) - React and Next.js integration
- [Express.js Examples](./frameworks/express.md) - Node.js server integration
- [React Components](./frameworks/react.md) - Frontend React components
- [Vue.js Examples](./frameworks/vue.md) - Vue.js integration

### Industry Use Cases
- [Customer Support Bot](./industry/customer-support.md) - Automated support system
- [Content Management](./industry/content-cms.md) - AI-powered content creation
- [Code Review Tool](./industry/code-review.md) - Automated code analysis
- [Data Analysis Assistant](./industry/data-analysis.md) - AI data insights

### Production Examples
- [Rate Limiting](./production/rate-limiting.md) - Handle API limits
- [Monitoring & Logging](./production/monitoring.md) - Track usage and performance
- [Security Best Practices](./production/security.md) - Secure implementations
- [Deployment Patterns](./production/deployment.md) - Production deployment

## 🚀 Quick Start Examples

### 1. Simple Text Generation
```typescript
import { createKushRouterSDK } from '../utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

// Generate text
const result = await sdk.complete('Explain quantum computing in simple terms');
console.log(result);
```

### 2. Streaming Chat
```typescript
const stream = await sdk.complete('Write a creative story', { 
  stream: true,
  model: 'claude-sonnet-4@20250514' 
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### 3. Conversational AI
```typescript
const messages = [
  { role: 'user' as const, content: 'Hello!' },
  { role: 'assistant' as const, content: 'Hi! How can I help?' },
  { role: 'user' as const, content: 'Explain machine learning' }
];

const response = await sdk.chat(messages);
console.log(response);
```

### 4. File-Based Unified Endpoint
```typescript
// Upload a unified request file
const unifiedRequest = {
  model: "gpt-5-2025-08-07",
  messages: [{ role: "user", content: "Hello from file!" }],
  reasoning_effort: "high",
  max_tokens: 100
};

const file = await sdk.files.upload(JSON.stringify(unifiedRequest), 'request.jsonl');

// Use file in unified endpoint
const response = await sdk.chatUnified({
  input_file_id: file.id
});
```

### 5. Tool-Using Agent
```typescript
const response = await sdk.chatOpenAI({
  model: 'gpt-5-2025-08-07',
  messages: [{ role: 'user', content: 'What\'s the weather in Tokyo?' }],
  tools: [weatherTool],
  reasoning_effort: 'medium'
});
```

## 📊 Example Categories by Complexity

### Beginner (⭐)
- Simple text completion
- Basic chat implementation
- Error handling basics
- Authentication setup

### Intermediate (⭐⭐)
- Streaming implementations
- Multi-turn conversations
- Content generation systems
- Basic agent patterns

### Advanced (⭐⭐⭐)
- Complex agent architectures
- Production-scale applications
- Custom tool integrations
- Performance optimization

## 🛠️ Development Tools

Each example includes:
- **Complete code** - Ready to run examples
- **Explanations** - Step-by-step breakdowns
- **Best practices** - Production-ready patterns
- **Error handling** - Robust error management
- **Testing** - Unit and integration tests

## 📖 Documentation Links

- [SDK API Reference](../api-reference/methods.md)
- [Core Features Guide](../core-features/)
- [Use Cases Guide](../use-cases/)
- [Production Guide](../advanced/production.md)

## 🤝 Contributing Examples

To contribute new examples:

1. **Follow the template structure**
2. **Include complete, runnable code**
3. **Add clear explanations**
4. **Test thoroughly**
5. **Document any dependencies**

Example template:
```markdown
# Example Title

## Overview
Brief description of what this example demonstrates.

## Use Case
When and why to use this pattern.

## Code
```typescript
// Complete, runnable code here
```

## Explanation
Step-by-step breakdown of the implementation.

## Advanced Usage
Extensions and variations.

## Related Examples
Links to similar or complementary examples.
```

## 🔗 External Resources

- [GitHub Repository](https://github.com/EMAD77/KushRouterSDK)
- [API Documentation](https://kushrouter.com/docs)
- [Pricing Information](https://kushrouter.com/pricing)

---

*These examples provide practical, real-world implementations of the KushRouter SDK. Start with the beginner examples and work your way up to more complex patterns.*