# Quick Start Guide

Get up and running with the KushRouter SDK in under 5 minutes.

## Step 1: Get Your API Key

1. Sign up at [app.kushrouter.com](https://app.kushrouter.com)
2. Create a new API key in the dashboard
3. Copy your API key (starts with `kr_`)

## Step 2: Set Up Environment

```bash
# Create .env file
echo "KUSHROUTER_API_KEY=your_api_key_here" > .env
```

## Step 3: Initialize the SDK

```typescript
import { createKushRouterSDK } from './utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});
```

## Step 4: Your First API Call

### Simple Text Completion

```typescript
async function firstExample() {
  try {
    const result = await sdk.complete('Explain artificial intelligence in one sentence');
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

firstExample();
```

**Output:**
```
Artificial intelligence is the simulation of human intelligence in machines that are programmed to think and learn like humans.
```

## Common Use Cases

### 1. Text Generation

```typescript
// Simple completion
const summary = await sdk.complete('Summarize the benefits of renewable energy');

// With options
const creative = await sdk.complete('Write a haiku about coding', {
  model: 'claude-sonnet-4@20250514',
  temperature: 0.8,
  maxTokens: 100
});
```

### 2. Conversational Chat

```typescript
const messages = [
  { role: 'user' as const, content: 'Hello!' },
  { role: 'assistant' as const, content: 'Hi! How can I help you today?' },
  { role: 'user' as const, content: 'Explain quantum computing' }
];

const response = await sdk.chat(messages, {
  model: 'gpt-5-2025-08-07'
});

console.log(response);
```

### 3. Streaming Responses

```typescript
const stream = await sdk.complete('Write a creative story about space exploration', {
  stream: true,
  model: 'claude-sonnet-4@20250514'
});

console.log('Story:');
for await (const chunk of stream as AsyncGenerator<string>) {
  process.stdout.write(chunk);
}
```

### 4. Different Models & Providers

```typescript
// OpenAI models
const gptResponse = await sdk.complete('Analyze this data', {
  model: 'gpt-5-2025-08-07'
});

// Anthropic models
const claudeResponse = await sdk.complete('Write a poem', {
  model: 'claude-sonnet-4@20250514'
});

// Provider-specific APIs
const openaiCompatible = await sdk.chatOpenAI({
  model: 'gpt-4o-2024-11-20',
  messages: [{ role: 'user', content: 'Hello' }]
});

const anthropicCompatible = await sdk.chatAnthropic({
  model: 'claude-3-5-sonnet-v2@20241022',
  messages: [{ 
    role: 'user', 
    content: [{ type: 'text', text: 'Hello' }] 
  }],
  max_tokens: 500
});
```

## Error Handling

```typescript
import { 
  AuthenticationError, 
  InsufficientCreditsError, 
  RateLimitError 
} from './utils/KushRouterSdk';

async function robustExample() {
  try {
    const result = await sdk.complete('Test prompt');
    console.log(result);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('❌ Invalid API key');
    } else if (error instanceof InsufficientCreditsError) {
      console.error('💳 Not enough credits:', error.details);
    } else if (error instanceof RateLimitError) {
      console.error('⏰ Rate limited - the SDK will retry automatically');
    } else {
      console.error('🚨 Unknown error:', error);
    }
  }
}
```

## Complete Example Application

Here's a complete example that demonstrates multiple features:

```typescript
// chat-app.ts
import { createKushRouterSDK } from './utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!,
  timeout: 30000,
  retries: 3
});

class SimpleChatApp {
  private messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  async sendMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.messages.push({ role: 'user', content: userMessage });

    try {
      // Get AI response
      const response = await sdk.chat(this.messages, {
        model: 'gpt-5-2025-08-07',
        temperature: 0.7
      });

      // Add AI response to history
      this.messages.push({ role: 'assistant', content: response as string });

      return response as string;
    } catch (error) {
      console.error('Chat error:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  async streamResponse(userMessage: string): Promise<void> {
    this.messages.push({ role: 'user', content: userMessage });

    const stream = await sdk.chat(this.messages, {
      model: 'claude-sonnet-4@20250514',
      stream: true
    });

    let fullResponse = '';
    console.log('AI: ');
    
    for await (const chunk of stream as AsyncGenerator<string>) {
      process.stdout.write(chunk);
      fullResponse += chunk;
    }
    
    console.log('\n');
    this.messages.push({ role: 'assistant', content: fullResponse });
  }

  getConversationHistory() {
    return this.messages;
  }

  clearHistory() {
    this.messages = [];
  }
}

// Usage example
async function runChatApp() {
  const chat = new SimpleChatApp();

  console.log('🤖 Simple Chat App Started!');
  console.log('Type your messages below:\n');

  // Example conversation
  const response1 = await chat.sendMessage('Hello! What can you help me with?');
  console.log('You: Hello! What can you help me with?');
  console.log('AI:', response1);
  console.log();

  // Streaming example
  console.log('You: Tell me a short story');
  await chat.streamResponse('Tell me a short story');

  // Show conversation history
  console.log('\n📜 Conversation History:');
  console.log(JSON.stringify(chat.getConversationHistory(), null, 2));
}

// Run the app
if (require.main === module) {
  runChatApp().catch(console.error);
}

export { SimpleChatApp };
```

## Usage Monitoring

Track your API usage and costs:

```typescript
async function checkUsage() {
  try {
    // Get usage statistics
    const usage = await sdk.getUsage();
    console.log('📊 Usage Summary:');
    console.log(`- Total requests: ${usage.total_requests}`);
    console.log(`- Total tokens: ${usage.total_tokens.toLocaleString()}`);
    console.log(`- Total cost: $${usage.total_cost.toFixed(4)}`);

    // Estimate cost for a future request
    const estimatedCost = await sdk.estimateCost({
      model: 'gpt-5-2025-08-07',
      message: 'Write a 1000-word essay about climate change',
      max_tokens: 1500
    });
    
    console.log(`\n💰 Estimated cost for next request: $${estimatedCost.toFixed(4)}`);

  } catch (error) {
    console.error('Usage check failed:', error);
  }
}

checkUsage();
```

## Next Steps

Now that you have the basics working, explore these guides:

### Core Features
- **[Streaming Responses](../core-features/streaming.md)** - Real-time text generation
- **[Chat Conversations](../core-features/chat-conversations.md)** - Multi-turn dialogs
- **[Error Handling](../core-features/error-handling.md)** - Robust error management

### Use Cases
- **[Building Chatbots](../use-cases/chatbots.md)** - Complete chatbot implementation
- **[AI Agents](../use-cases/ai-agents.md)** - Intelligent agents with tools
- **[Content Generation](../use-cases/content-generation.md)** - Automated content creation

### Advanced Topics
- **[Cost Optimization](../advanced/cost-optimization.md)** - Reduce API costs
- **[Production Deployment](../advanced/production.md)** - Production best practices
- **[Monitoring](../advanced/monitoring.md)** - Track performance and usage

## Troubleshooting

### Common Issues

**"API key required" error:**
```typescript
// ❌ Wrong
const sdk = createKushRouterSDK({ apiKey: '' });

// ✅ Correct
const sdk = createKushRouterSDK({ 
  apiKey: process.env.KUSHROUTER_API_KEY! 
});
```

**TypeScript errors:**
```typescript
// ❌ Wrong
const response = await sdk.complete('Hello');
console.log(response.choices[0].message.content); // Type error

// ✅ Correct
const response = await sdk.complete('Hello');
console.log(response); // response is already a string
```

**Rate limiting:**
```typescript
// The SDK handles retries automatically, but you can catch rate limit errors
try {
  const result = await sdk.complete('Test');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited - retries exhausted');
    // Wait longer or reduce request frequency
  }
}
```

## Help & Support

- **Documentation:** [Full SDK Docs](../README.md)
- **Examples:** [Code Examples](../examples/README.md)
- **Support:** [support@kushrouter.com](mailto:support@kushrouter.com)

---

*Ready to build something amazing? Check out our [use case guides](../use-cases/) for specific implementation patterns!*  