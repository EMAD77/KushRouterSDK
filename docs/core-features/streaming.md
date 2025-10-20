# Streaming Responses with KushRouter SDK

This guide covers how to implement real-time streaming responses for better user experience and interactive applications.

## Table of Contents

- [Why Use Streaming?](#why-use-streaming)
- [Basic Streaming](#basic-streaming)
- [Advanced Streaming Patterns](#advanced-streaming-patterns)
- [Streaming in Different Frameworks](#streaming-in-different-frameworks)
- [Error Handling in Streams](#error-handling-in-streams)
- [Performance Optimization](#performance-optimization)

## Why Use Streaming?

Streaming provides several benefits:
- **Better UX**: Users see responses as they're generated
- **Perceived Performance**: Feels faster than waiting for complete response
- **Real-time Interaction**: Enable interactive conversations
- **Progressive Rendering**: Update UI incrementally

## Basic Streaming

### Simple Text Streaming

```typescript
import { createKushRouterSDK } from '../utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

async function basicStreaming() {
  const stream = await sdk.complete('Write a creative story about space exploration', {
    stream: true,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.8
  });

  console.log('Story:');
  for await (const chunk of stream as AsyncGenerator<string>) {
    process.stdout.write(chunk);
  }
  console.log('\n--- End of story ---');
}

basicStreaming();
```

### Chat Streaming

```typescript
async function streamingChat() {
  const messages = [
    { role: 'user' as const, content: 'Explain quantum computing in detail' }
  ];

  const stream = await sdk.chat(messages, {
    stream: true,
    model: 'gpt-5-2025-08-07'
  });

  let fullResponse = '';
  console.log('AI: ');
  
  for await (const chunk of stream as AsyncGenerator<string>) {
    process.stdout.write(chunk);
    fullResponse += chunk;
  }
  
  console.log('\n');
  return fullResponse;
}
```

### Direct API Streaming

```typescript
async function directStreaming() {
  const stream = await sdk.streamUnified({
    model: 'gpt-5-2025-08-07',
    message: 'Write a poem about artificial intelligence',
    temperature: 0.8,
    max_tokens: 400
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
}
```

## Advanced Streaming Patterns

### Streaming with Real-time Processing

```typescript
class StreamingProcessor {
  private wordCount = 0;
  private sentenceCount = 0;
  private currentSentence = '';

  async processStream(prompt: string): Promise<{
    fullText: string;
    stats: { words: number; sentences: number }
  }> {
    const stream = await sdk.complete(prompt, { 
      stream: true,
      model: 'claude-sonnet-4-5-20250929'
    });

    let fullText = '';

    for await (const chunk of stream as AsyncGenerator<string>) {
      fullText += chunk;
      this.processChunk(chunk);
      
      // Real-time output with stats
      process.stdout.write(chunk);
      
      // Show stats every 50 words
      if (this.wordCount % 50 === 0 && this.wordCount > 0) {
        process.stdout.write(`\n[📊 ${this.wordCount} words, ${this.sentenceCount} sentences]\n`);
      }
    }

    return {
      fullText,
      stats: {
        words: this.wordCount,
        sentences: this.sentenceCount
      }
    };
  }

  private processChunk(chunk: string) {
    // Count words
    const words = chunk.split(/\s+/).filter(w => w.length > 0);
    this.wordCount += words.length;

    // Count sentences
    this.currentSentence += chunk;
    const sentences = this.currentSentence.split(/[.!?]+/);
    if (sentences.length > 1) {
      this.sentenceCount += sentences.length - 1;
      this.currentSentence = sentences[sentences.length - 1];
    }
  }

  reset() {
    this.wordCount = 0;
    this.sentenceCount = 0;
    this.currentSentence = '';
  }
}

// Usage
const processor = new StreamingProcessor();
const result = await processor.processStream('Write a detailed essay about renewable energy');
console.log('\n\nFinal stats:', result.stats);
```

### Streaming with Content Filtering

```typescript
class FilteredStreaming {
  private blockedPhrases = ['inappropriate', 'harmful', 'dangerous'];
  private buffer = '';

  async streamWithFilter(prompt: string): AsyncGenerator<string> {
    const stream = await sdk.complete(prompt, { 
      stream: true,
      model: 'gpt-5-2025-08-07'
    });

    for await (const chunk of stream as AsyncGenerator<string>) {
      this.buffer += chunk;
      
      // Check for complete words/phrases
      const words = this.buffer.split(/(\s+)/);
      const completeWords = words.slice(0, -1);
      this.buffer = words[words.length - 1];

      for (const word of completeWords) {
        if (this.isContentSafe(word)) {
          yield word;
        } else {
          yield '[FILTERED]';
        }
      }
    }

    // Process remaining buffer
    if (this.buffer && this.isContentSafe(this.buffer)) {
      yield this.buffer;
    }
  }

  private isContentSafe(text: string): boolean {
    const lowerText = text.toLowerCase();
    return !this.blockedPhrases.some(phrase => lowerText.includes(phrase));
  }
}

// Usage
const filteredStreaming = new FilteredStreaming();

for await (const chunk of filteredStreaming.streamWithFilter('Tell me about technology')) {
  process.stdout.write(chunk);
}
```

### Multi-Model Streaming Comparison

```typescript
class MultiModelStreaming {
  async compareModels(prompt: string): Promise<void> {
    const models = [
      'gpt-5-2025-08-07',
      'claude-sonnet-4-5-20250929',
      'gpt-4o-2024-11-20'
    ];

    console.log('🔄 Streaming responses from multiple models:\n');

    const streams = await Promise.all(
      models.map(async (model) => {
        const stream = await sdk.complete(prompt, { 
          stream: true, 
          model,
          temperature: 0.7 
        });
        return { model, stream };
      })
    );

    // Process streams in parallel
    await Promise.all(
      streams.map(async ({ model, stream }) => {
        console.log(`\n🤖 ${model}:`);
        console.log('='.repeat(50));
        
        for await (const chunk of stream as AsyncGenerator<string>) {
          process.stdout.write(chunk);
        }
        
        console.log('\n');
      })
    );
  }
}

// Usage
const multiStreaming = new MultiModelStreaming();
await multiStreaming.compareModels('Explain the benefits of renewable energy in 3 paragraphs');
```

## Streaming in Different Frameworks

### Next.js API Route with Streaming

```typescript
// app/api/stream/route.ts
import { createKushRouterSDK } from '../../../utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

export async function POST(request: Request) {
  const { message } = await request.json();

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = await sdk.complete(message, { 
          stream: true,
          model: 'gpt-5-2025-08-07'
        });

        for await (const chunk of aiStream as AsyncGenerator<string>) {
          // Send chunk to client
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }

        // Signal completion
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### React Component with Streaming

```typescript
// components/StreamingChat.tsx
'use client';

import { useState } from 'react';

export function StreamingChat() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsStreaming(true);
    setResponse('');

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              setResponse(prev => prev + parsed.content);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 p-2 border rounded"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isStreaming ? 'Streaming...' : 'Send'}
          </button>
        </div>
      </form>

      <div className="border rounded p-4 min-h-32 bg-gray-50">
        <div className="whitespace-pre-wrap">
          {response}
          {isStreaming && <span className="animate-pulse">▊</span>}
        </div>
      </div>
    </div>
  );
}
```

### Express.js Streaming Endpoint

```typescript
// routes/stream.ts
import express from 'express';
import { createKushRouterSDK } from '../utils/KushRouterSdk';

const router = express.Router();
const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

router.post('/stream', async (req, res) => {
  const { message } = req.body;

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const stream = await sdk.complete(message, { 
      stream: true,
      model: 'claude-sonnet-4-5-20250929'
    });

    for await (const chunk of stream as AsyncGenerator<string>) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
```

## Error Handling in Streams

### Robust Stream Processing

```typescript
class RobustStreaming {
  async streamWithRetry(
    prompt: string, 
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<string> {
    let attempt = 0;
    let lastError: Error;

    while (attempt < maxRetries) {
      try {
        return await this.processStream(prompt);
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt < maxRetries) {
          console.log(`Stream failed, retrying in ${retryDelay}ms... (attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
        }
      }
    }

    throw new Error(`Stream failed after ${maxRetries} attempts: ${lastError!.message}`);
  }

  private async processStream(prompt: string): Promise<string> {
    const stream = await sdk.complete(prompt, { 
      stream: true,
      model: 'gpt-5-2025-08-07'
    });

    let fullResponse = '';
    let lastChunkTime = Date.now();
    const timeoutMs = 30000; // 30 second timeout

    for await (const chunk of stream as AsyncGenerator<string>) {
      // Check for timeout
      if (Date.now() - lastChunkTime > timeoutMs) {
        throw new Error('Stream timeout: no data received');
      }

      fullResponse += chunk;
      lastChunkTime = Date.now();
      
      // Optional: Validate chunk content
      if (this.isChunkValid(chunk)) {
        process.stdout.write(chunk);
      } else {
        console.warn('Invalid chunk received:', chunk);
      }
    }

    if (!fullResponse.trim()) {
      throw new Error('Empty response received');
    }

    return fullResponse;
  }

  private isChunkValid(chunk: string): boolean {
    // Basic validation
    return typeof chunk === 'string' && chunk.length > 0;
  }
}
```

### Stream Interruption Handling

```typescript
class InterruptibleStreaming {
  private abortController: AbortController | null = null;

  async startStream(prompt: string): Promise<void> {
    this.abortController = new AbortController();
    
    try {
      const stream = await sdk.streamUnified({
        message: prompt,
        model: 'claude-sonnet-4-5-20250929'
      });

      for await (const chunk of stream) {
        // Check if stream should be aborted
        if (this.abortController.signal.aborted) {
          console.log('\n🛑 Stream interrupted by user');
          break;
        }

        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          process.stdout.write(content);
        }
      }
    } catch (error) {
      if (this.abortController.signal.aborted) {
        console.log('\n🛑 Stream cancelled');
      } else {
        console.error('\n❌ Stream error:', error);
      }
    } finally {
      this.abortController = null;
    }
  }

  stopStream() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

// Usage with user input
const interruptibleStream = new InterruptibleStreaming();

// Start streaming
interruptibleStream.startStream('Write a long essay about climate change');

// Simulate user interruption after 5 seconds
setTimeout(() => {
  interruptibleStream.stopStream();
}, 5000);
```

## Performance Optimization

### Buffered Streaming

```typescript
class BufferedStreaming {
  private buffer: string[] = [];
  private bufferSize = 10; // Number of chunks to buffer
  private flushInterval = 100; // ms

  async streamWithBuffering(prompt: string): Promise<void> {
    const stream = await sdk.complete(prompt, { 
      stream: true,
      model: 'gpt-5-2025-08-07'
    });

    // Set up buffer flushing
    const flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);

    try {
      for await (const chunk of stream as AsyncGenerator<string>) {
        this.buffer.push(chunk);
        
        if (this.buffer.length >= this.bufferSize) {
          this.flushBuffer();
        }
      }
      
      // Flush remaining buffer
      this.flushBuffer();
    } finally {
      clearInterval(flushTimer);
    }
  }

  private flushBuffer() {
    if (this.buffer.length === 0) return;
    
    const content = this.buffer.join('');
    process.stdout.write(content);
    this.buffer = [];
  }
}
```

### Streaming with Metrics

```typescript
class MetricsStreaming {
  private metrics = {
    totalChunks: 0,
    totalCharacters: 0,
    streamDuration: 0,
    averageChunkSize: 0,
    chunksPerSecond: 0
  };

  async streamWithMetrics(prompt: string): Promise<typeof this.metrics> {
    const startTime = Date.now();
    
    const stream = await sdk.complete(prompt, { 
      stream: true,
      model: 'claude-sonnet-4-5-20250929'
    });

    for await (const chunk of stream as AsyncGenerator<string>) {
      this.metrics.totalChunks++;
      this.metrics.totalCharacters += chunk.length;
      
      process.stdout.write(chunk);
      
      // Real-time metrics
      const elapsed = (Date.now() - startTime) / 1000;
      this.metrics.streamDuration = elapsed;
      this.metrics.averageChunkSize = this.metrics.totalCharacters / this.metrics.totalChunks;
      this.metrics.chunksPerSecond = this.metrics.totalChunks / elapsed;
    }

    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      totalChunks: 0,
      totalCharacters: 0,
      streamDuration: 0,
      averageChunkSize: 0,
      chunksPerSecond: 0
    };
  }
}

// Usage
const metricsStreaming = new MetricsStreaming();
const metrics = await metricsStreaming.streamWithMetrics('Explain machine learning');
console.log('\n📊 Stream Metrics:', metrics);
```

## Next Steps

- **[Chatbots Guide](../use-cases/chatbots.md)** - Build streaming chatbots
- **[AI Agents Guide](../use-cases/ai-agents.md)** - Create streaming agents
- **[Error Handling](./error-handling.md)** - Handle streaming errors
- **[Production Guide](../advanced/production.md)** - Deploy streaming applications

---

*Streaming enables real-time, interactive AI applications. Start with basic streaming and gradually add advanced features like buffering, metrics, and error handling.*