# Installation & Setup

This guide covers how to install and set up the KushRouter SDK in your project.

## Prerequisites

- **Node.js 18+** (required for native fetch support)
- **TypeScript 4.5+** (recommended but not required)
- **KushRouter API Key** (get one at [app.kushrouter.com](https://app.kushrouter.com))

## Installation

### Option 1: Copy SDK Files (Recommended)

1. **Copy the SDK file:**
   ```bash
   # Copy the main SDK file to your utils directory
   cp utils/KushRouterSdk.ts your-project/src/utils/
   ```

### Option 2: Download from Repository

```bash
# Download the SDK file
curl -o src/utils/KushRouterSdk.ts https://raw.githubusercontent.com/kushrouter/sdk/main/utils/KushRouterSdk.ts
```

## Project Setup

### TypeScript Project

1. **Add the SDK to your project:**
   ```typescript
   // src/utils/KushRouterSdk.ts (copied from above)
   ```

2. **Create a configuration file:**
   ```typescript
   // src/config/kushrouter.ts
   import { createKushRouterSDK } from '../utils/KushRouterSdk';

   export const sdk = createKushRouterSDK({
     apiKey: process.env.KUSHROUTER_API_KEY!,
     timeout: 30000, // 30 seconds
     retries: 3
   });
   ```

3. **Add environment variables:**
   ```bash
   # .env
   KUSHROUTER_API_KEY=your_api_key_here
   ```

### JavaScript Project

1. **Add the SDK (converted to JS):**
   ```javascript
   // src/utils/KushRouterSdk.js
   // You can use the TypeScript file directly in most modern Node.js setups
   // Or compile it to JavaScript using tsc
   ```

2. **Create configuration:**
   ```javascript
   // src/config/kushrouter.js
   const { createKushRouterSDK } = require('../utils/KushRouterSdk');

   const sdk = createKushRouterSDK({
     apiKey: process.env.KUSHROUTER_API_KEY,
     timeout: 30000,
     retries: 3
   });

   module.exports = { sdk };
   ```

## Environment Configuration

### Development Environment

```bash
# .env.development
KUSHROUTER_API_KEY=your_dev_api_key
KUSHROUTER_BASE_URL=https://api.kushrouter.com
KUSHROUTER_TIMEOUT=30000
KUSHROUTER_RETRIES=3
```

### Production Environment

```bash
# .env.production
KUSHROUTER_API_KEY=your_prod_api_key
KUSHROUTER_BASE_URL=https://api.kushrouter.com
KUSHROUTER_TIMEOUT=60000
KUSHROUTER_RETRIES=5
```

### Configuration with Environment Variables

```typescript
// src/config/kushrouter.ts
import { createKushRouterSDK } from '../utils/KushRouterSdk';

const config = {
  apiKey: process.env.KUSHROUTER_API_KEY!,
  baseURL: process.env.KUSHROUTER_BASE_URL || 'https://api.kushrouter.com',
  timeout: parseInt(process.env.KUSHROUTER_TIMEOUT || '30000'),
  retries: parseInt(process.env.KUSHROUTER_RETRIES || '3')
};

export const sdk = createKushRouterSDK(config);
```

## Framework-Specific Setup

### Next.js

1. **Add to your Next.js project:**
   ```typescript
   // lib/kushrouter.ts
   import { createKushRouterSDK } from '../utils/KushRouterSdk';

   export const sdk = createKushRouterSDK({
     apiKey: process.env.KUSHROUTER_API_KEY!
   });
   ```

2. **Use in API routes:**
   ```typescript
   // pages/api/chat.ts or app/api/chat/route.ts
   import { sdk } from '../../lib/kushrouter';

   export async function POST(request: Request) {
     const { message } = await request.json();
     const response = await sdk.complete(message);
     return Response.json({ response });
   }
   ```

### Express.js

```typescript
// src/services/kushrouter.ts
import { createKushRouterSDK } from '../utils/KushRouterSdk';

export const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

// routes/chat.ts
import express from 'express';
import { sdk } from '../services/kushrouter';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await sdk.complete(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### React/Vite

```typescript
// src/lib/kushrouter.ts
import { createKushRouterSDK } from '../utils/KushRouterSdk';

export const sdk = createKushRouterSDK({
  apiKey: import.meta.env.VITE_KUSHROUTER_API_KEY
});

// src/hooks/useKushRouter.ts
import { useState } from 'react';
import { sdk } from '../lib/kushrouter';

export function useKushRouter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.complete(prompt);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { complete, loading, error };
}
```

## Verification

### Test Your Setup

Create a simple test file to verify everything is working:

```typescript
// test-setup.ts
import { sdk } from './src/config/kushrouter';

async function testSetup() {
  try {
    console.log('Testing KushRouter SDK setup...');
    
    // Test simple completion
    const result = await sdk.complete('Hello, world!');
    console.log('✅ SDK is working!');
    console.log('Response:', result);
    
    // Test usage info
    const usage = await sdk.getUsage();
    console.log('✅ Usage info retrieved!');
    console.log('Total requests:', usage.total_requests);
    
  } catch (error) {
    console.error('❌ Setup test failed:', error);
  }
}

testSetup();
```

Run the test:
```bash
# TypeScript
npx tsx test-setup.ts

# JavaScript (if compiled)
node test-setup.js
```

## Troubleshooting

### Common Issues

1. **"API key required" error:**
   - Verify your `.env` file contains `KUSHROUTER_API_KEY`
   - Check that the environment variable is loaded correctly
   - Ensure the API key is valid (test in dashboard)

2. **"fetch is not defined" error:**
   - Upgrade to Node.js 18+ (fetch is built-in)
   - Or install a fetch polyfill for older Node.js versions

3. **TypeScript compilation errors:**
   - Ensure TypeScript 4.5+ is installed
   - Check your `tsconfig.json` includes proper lib settings

4. **Module resolution issues:**
   - Verify the SDK file path is correct
   - Check your import/export syntax matches your project setup

### Debug Mode

Enable debug logging by setting an environment variable:

```bash
DEBUG=kushrouter npm start
```

Or add debug logging to your configuration:

```typescript
import { createKushRouterSDK } from '../utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!,
  // Add custom debug logging if needed
});
```

## Next Steps

- [Quick Start Guide](./quick-start.md) - Your first API call
- [Authentication](./authentication.md) - Managing API keys
- [Configuration](./configuration.md) - Advanced options

---

*Need help? [contact support](mailto:support@kushrouter.com).*