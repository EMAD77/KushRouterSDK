# 🚀 KushRouter SDK

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official TypeScript/JavaScript SDK for **KushRouter** - your unified gateway to AI models from OpenAI, Anthropic. Build powerful AI applications with a single, consistent API.

## 🎁 **Get Started with $50 Free Credits!**

**[Create your KushRouter account](https://kushrouter.com)** and receive **$50 in free API credits** to start building immediately. No credit card required for signup!

1. 🔗 **[Sign up at kushrouter.com](https://kushrouter.com)**
2. 💰 **Get $50 free credits automatically**
3. 🔑 **Generate your API key**
4. 🚀 **Start building with 200+ AI models**

---

## ⚡ Quick Installation

### 🚀 One-Command Install (Recommended)

**Linux/macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/EMAD77/KushRouterSDK/main/install.sh | bash
```

**Windows PowerShell:**
```powershell
iwr -useb https://raw.githubusercontent.com/EMAD77/KushRouterSDK/main/install.ps1 | iex
```

### 📦 Manual Installation

Choose your preferred package manager:

```bash
# npm
npm install kushrouter-sdk

# yarn
yarn add kushrouter-sdk

# pnpm
pnpm add kushrouter-sdk

# bun
bun add kushrouter-sdk
```

> 💡 **New to the project?** Check out our **[Quick Setup Guide](./QUICK_SETUP.md)** for a complete walkthrough!

---

## 🏃‍♂️ Quick Start

```typescript
import { createKushRouterSDK } from 'kushrouter-sdk';

// Initialize with your API key from https://kushrouter.com
const sdk = createKushRouterSDK({
  apiKey: 'your-api-key-here' // Get this from https://kushrouter.com
});

// Generate text with any AI model
const response = await sdk.complete('Explain quantum computing in simple terms');
console.log(response);

// Stream responses in real-time
const stream = await sdk.complete('Write a creative story', { stream: true });
for await (const chunk of stream) {
  process.stdout.write(chunk);
}

// Chat with conversational AI
const chatResponse = await sdk.chat([
  { role: 'user', content: 'Hello! What can you help me with?' }
]);
console.log(chatResponse);
```

---

## 📖 Documentation

### 🚀 Getting Started
- **[Installation & Setup](./docs/getting-started/installation.md)** - Complete setup guide
- **[Quick Start Guide](./docs/getting-started/quick-start.md)** - Get running in 5 minutes
- **[Authentication](./docs/getting-started/authentication.md)** - API key management

### 🔧 Core Features
- **[Text Completion](./docs/core-features/text-completion.md)** - Generate text with AI
- **[Streaming Responses](./docs/core-features/streaming.md)** - Real-time text streaming
- **[Chat Conversations](./docs/core-features/chat-conversations.md)** - Conversational AI
- **[Error Handling](./docs/core-features/error-handling.md)** - Robust error management

### 🎯 Use Cases & Examples
- **[Building Chatbots](./docs/use-cases/chatbots.md)** - Complete chatbot guide
- **[AI Agents](./docs/use-cases/ai-agents.md)** - Intelligent agents with tools
- **[Content Generation](./docs/use-cases/content-generation.md)** - Automated content creation
- **[Code Assistance](./docs/use-cases/code-assistance.md)** - AI-powered coding help

### 📚 Examples
- **[Code Examples](./docs/examples/)** - Ready-to-use code snippets
- **[Framework Integrations](./docs/integrations/)** - Next.js, React, Express guides
- **[Production Patterns](./docs/advanced/)** - Scalable, production-ready implementations

---

## 🔥 Popular Use Cases

### 1. **Simple Text Generation**
```typescript
const sdk = createKushRouterSDK({ apiKey: 'your-key' });
const result = await sdk.complete('Write a product description for wireless headphones');
```

### 2. **Real-time Streaming Chat**
```typescript
const stream = await sdk.complete('Explain machine learning', { 
  stream: true,
  model: 'gpt-4' 
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

### 3. **Conversational AI**
```typescript
const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help?' },
  { role: 'user', content: 'Explain blockchain technology' }
];

const response = await sdk.chat(messages);
```

### 4. **AI Agent with Tools**
```typescript
const response = await sdk.chatOpenAI({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'What\'s the weather in Tokyo?' }],
  tools: [weatherTool],
  tool_choice: 'auto'
});
```

### 5. **Batch Processing with Files**
```typescript
// Upload batch requests file
const jsonlContent = [
  { model: "gpt-4", messages: [{ role: "user", content: "Hello" }] },
  { model: "claude-3-5-sonnet", messages: [{ role: "user", content: "Hi there" }] }
].map(req => JSON.stringify(req)).join('\n');

const file = await sdk.files.upload(jsonlContent, 'batch-requests.jsonl');

// Create batch from uploaded file
const batch = await sdk.batches.createFromFile(file.id);
console.log('Batch created:', batch.id);
```

### 6. **Files Management**
```typescript
// Upload a file
const file = await sdk.files.upload('File content here', 'my-file.txt');

// List files
const files = await sdk.files.list();

// Get file content
const content = await sdk.files.content(file.id);

// Delete file
await sdk.files.delete(file.id);
```

---

## 🌐 Supported AI Models

[**View all supported models →**](https://kushrouter.com/models)

---

## 🛠️ Framework Integrations

### Next.js
```typescript
// pages/api/chat.ts
import { createKushRouterSDK } from 'kushrouter-sdk';

const sdk = createKushRouterSDK({ apiKey: process.env.KUSHROUTER_API_KEY! });

export default async function handler(req, res) {
  const { message } = req.body;
  const response = await sdk.complete(message);
  res.json({ response });
}
```

### React Hook
```typescript
import { useState } from 'react';
import { createKushRouterSDK } from 'kushrouter-sdk';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const sdk = createKushRouterSDK({ apiKey: process.env.REACT_APP_KUSHROUTER_API_KEY! });
  
  const generate = async (prompt: string) => {
    setLoading(true);
    try {
      return await sdk.complete(prompt);
    } finally {
      setLoading(false);
    }
  };
  
  return { generate, loading };
}
```

### Express.js
```typescript
import express from 'express';
import { createKushRouterSDK } from 'kushrouter-sdk';

const app = express();
const sdk = createKushRouterSDK({ apiKey: process.env.KUSHROUTER_API_KEY! });

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  const response = await sdk.complete(prompt);
  res.json({ response });
});
```

---

## 📊 Environment Setup

### Environment Variables
```bash
# .env
KUSHROUTER_API_KEY=your_api_key_here
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

---

## 🔒 Security & Best Practices

### ✅ **Do's**
- Store API keys in environment variables
- Use server-side API calls for sensitive operations
- Implement rate limiting in production
- Monitor usage and costs regularly

### ❌ **Don'ts**
- Never expose API keys in client-side code
- Don't commit API keys to version control
- Avoid hardcoding sensitive configuration

### Example Secure Setup
```typescript
// ✅ Secure server-side usage
const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!, // From environment
  timeout: 30000,
  retries: 3
});

// ✅ With error handling
try {
  const response = await sdk.complete(prompt);
  return response;
} catch (error) {
  console.error('AI generation failed:', error);
  throw new Error('Failed to generate response');
}
```

---

## 📈 Monitoring & Analytics

Track your AI usage with built-in analytics:

```typescript
const sdk = createKushRouterSDK({
  apiKey: 'your-key',
  analytics: true, // Enable usage tracking
  metadata: {
    userId: 'user-123',
    sessionId: 'session-456'
  }
});
```

View detailed analytics at **[kushrouter.com](https://kushrouter.com)**:
- 📊 Usage statistics
- 💰 Cost breakdown
- ⚡ Performance metrics
- 🔍 Request logs

---

## 🚀 Production Deployment

### Performance Optimization
```typescript
const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!,
  timeout: 30000,
  retries: 3,
  cache: true, // Enable response caching
  rateLimiting: {
    requests: 100,
    window: 60000 // 100 requests per minute
  }
});
```

### Error Handling
```typescript
import { KushRouterError } from 'kushrouter-sdk';

try {
  const response = await sdk.complete(prompt);
} catch (error) {
  if (error instanceof KushRouterError) {
    console.error('KushRouter API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## 🤝 Community & Support

### 📚 Resources
- **[📖 Full Documentation](https://docs.kushrouter.com)**
- **[🎮 Interactive Playground](https://kushrouter.com/playground)**
- **[💰 Pricing Calculator](https://kushrouter.com/pricing)**
- **[📊 Status Page](https://status.kushrouter.com)**

### 🆘 Get Help
- **[� Email Support](mailto:support@kushrouter.com)** - Direct technical support
- **[🐛 GitHub Issues](https://github.com/EMAD77/KushRouterSDK/issues)** - Bug reports & feature requests

### 🔗 Links
- **[🌐 Website](https://kushrouter.com)**
- **[📖 API Docs](https://kushrouter.com/docs)**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Next Steps

1. **[🔗 Create your account](https://kushrouter.com)** and get $50 free credits
2. **[📖 Read the Quick Start Guide](./docs/getting-started/quick-start.md)**
3. **[🎮 Try the Interactive Playground](https://kushrouter.com/playground)**

---

<div align="center">

**Built with ❤️ by the KushRouter Team**

[Website](https://kushrouter.com) • [Documentation](https://kushrouter.com/docs) •

</div>