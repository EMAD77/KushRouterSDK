# 🚀 Quick Setup Guide

Get started with KushRouter SDK in under 2 minutes!

## 🎁 Step 1: Get Your Free $50 Credits

**[👉 Sign up at kushrouter.com](https://kushrouter.com)** and receive **$50 in free API credits** automatically!

1. Visit [kushrouter.com](https://kushrouter.com)
2. Create your account (no credit card required)
3. Get $50 free credits instantly
4. Generate your API key from the dashboard

## ⚡ Step 2: Install the SDK

Choose your preferred method:

### Option A: Automatic Installation (Recommended)

**Linux/macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/EMAD77/KushRouterSDK/main/install.sh | bash
```

**Windows PowerShell:**
```powershell
iwr -useb https://raw.githubusercontent.com/EMAD77/KushRouterSDK/main/install.ps1 | iex
```

### Option B: Manual Installation

Choose your package manager:

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

## 🔑 Step 3: Configure Your API Key

Create a `.env` file in your project root:

```bash
KUSHROUTER_API_KEY=your_api_key_here
```

## 🎯 Step 4: Start Coding!

```typescript
import { createKushRouterSDK } from 'kushrouter-sdk';

// Initialize the SDK
const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

// Generate your first AI response
const response = await sdk.complete('Explain quantum computing in simple terms');
console.log(response);

// Try streaming for real-time responses
const stream = await sdk.complete('Write a creative story', { stream: true });
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

## 🎉 You're Ready!

That's it! You now have:
- ✅ $50 in free credits
- ✅ KushRouter SDK installed
- ✅ API key configured
- ✅ Access to 200+ AI models

## 📚 What's Next?

- **[📖 Read the Full Documentation](./docs/README.md)**
- **[🎮 Try the Interactive Playground](https://kushrouter.com/playground)**
- **[🔍 Explore Code Examples](./docs/examples/README.md)**

## 🆘 Need Help?

- **[ Email Support](mailto:support@kushrouter.com)** - Direct technical support
- **[📚 Full Documentation](https://kushrouter.com/docs)** - Comprehensive guides

---

**Happy coding with AI! 🤖✨**