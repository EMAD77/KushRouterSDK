# Building Chatbots with KushRouter SDK

This guide covers how to build various types of chatbots using the KushRouter SDK, from simple Q&A bots to sophisticated conversational AI.

## Table of Contents

- [Basic Chatbot](#basic-chatbot)
- [Streaming Chatbot](#streaming-chatbot)
- [Contextual Chatbot](#contextual-chatbot)
- [Multi-Session Chatbot](#multi-session-chatbot)
- [Chatbot with Memory](#chatbot-with-memory)
- [Advanced Features](#advanced-features)
- [Production Considerations](#production-considerations)

## Basic Chatbot

A simple stateless chatbot that responds to individual messages:

```typescript
import { createKushRouterSDK } from '../utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

class BasicChatbot {
  private systemPrompt: string;

  constructor(systemPrompt: string = "You are a helpful assistant.") {
    this.systemPrompt = systemPrompt;
  }

  async respond(userMessage: string): Promise<string> {
    try {
      const response = await sdk.chatUnified({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Chatbot error:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  }
}

// Usage
const bot = new BasicChatbot("You are a helpful coding assistant.");
const response = await bot.respond("How do I sort an array in JavaScript?");
console.log(response);
```

## Streaming Chatbot

Real-time responses for better user experience:

```typescript
class StreamingChatbot {
  private systemPrompt: string;

  constructor(systemPrompt: string = "You are a helpful assistant.") {
    this.systemPrompt = systemPrompt;
  }

  async *streamResponse(userMessage: string): AsyncGenerator<string> {
    try {
      const stream = await sdk.streamUnified({
        model: 'claude-sonnet-4@20250514',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      yield 'Sorry, I encountered an error while processing your request.';
    }
  }

  // Wrapper for non-streaming usage
  async respond(userMessage: string): Promise<string> {
    let fullResponse = '';
    for await (const chunk of this.streamResponse(userMessage)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }
}

// Usage
const streamBot = new StreamingChatbot();

console.log('User: Tell me about quantum computing');
console.log('Bot: ');

for await (const chunk of streamBot.streamResponse('Tell me about quantum computing')) {
  process.stdout.write(chunk);
}
console.log('\n');
```

## Contextual Chatbot

Maintains conversation history for context-aware responses:

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

class ContextualChatbot {
  private messages: Message[] = [];
  private systemPrompt: string;
  private maxHistory: number;

  constructor(
    systemPrompt: string = "You are a helpful assistant.",
    maxHistory: number = 20
  ) {
    this.systemPrompt = systemPrompt;
    this.maxHistory = maxHistory;
    
    // Add system message
    this.messages.push({
      role: 'system',
      content: systemPrompt,
      timestamp: new Date()
    });
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Trim history if too long
    this.trimHistory();

    try {
      const response = await sdk.chat(this.messages, {
        model: 'gpt-5-2025-08-07',
        temperature: 0.7
      });

      // Add assistant response to history
      this.messages.push({
        role: 'assistant',
        content: response as string,
        timestamp: new Date()
      });

      return response as string;
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message to history for context
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      this.messages.push({
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      });
      
      return errorMessage;
    }
  }

  async *streamMessage(userMessage: string): AsyncGenerator<string> {
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    this.trimHistory();

    let fullResponse = '';

    try {
      const stream = await sdk.chat(this.messages, {
        model: 'claude-sonnet-4@20250514',
        stream: true
      });

      for await (const chunk of stream as AsyncGenerator<string>) {
        fullResponse += chunk;
        yield chunk;
      }

      // Add complete response to history
      this.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Streaming error:', error);
      const errorMessage = 'Sorry, I encountered an error.';
      yield errorMessage;
      
      this.messages.push({
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      });
    }
  }

  private trimHistory() {
    // Keep system message and last N messages
    if (this.messages.length > this.maxHistory + 1) {
      const systemMessage = this.messages[0];
      const recentMessages = this.messages.slice(-(this.maxHistory));
      this.messages = [systemMessage, ...recentMessages];
    }
  }

  getHistory(): Message[] {
    return [...this.messages];
  }

  clearHistory() {
    this.messages = this.messages.slice(0, 1); // Keep only system message
  }

  setSystemPrompt(prompt: string) {
    this.messages[0].content = prompt;
    this.systemPrompt = prompt;
  }
}

// Usage
const contextBot = new ContextualChatbot(
  "You are a friendly programming tutor. Remember our conversation context.",
  30 // Keep last 30 messages
);

// Multi-turn conversation
console.log(await contextBot.sendMessage("Hi, I'm learning JavaScript"));
console.log(await contextBot.sendMessage("Can you explain variables?"));
console.log(await contextBot.sendMessage("What about the difference between let and var?"));
console.log(await contextBot.sendMessage("Can you give me an example based on what we just discussed?"));
```

## Multi-Session Chatbot

Manages multiple conversation sessions:

```typescript
interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
  metadata?: Record<string, any>;
}

class MultiSessionChatbot {
  private sessions: Map<string, Session> = new Map();
  private systemPrompt: string;
  private maxHistory: number;

  constructor(
    systemPrompt: string = "You are a helpful assistant.",
    maxHistory: number = 20
  ) {
    this.systemPrompt = systemPrompt;
    this.maxHistory = maxHistory;
  }

  createSession(userId: string, metadata?: Record<string, any>): string {
    const sessionId = `${userId}-${Date.now()}`;
    const session: Session = {
      id: sessionId,
      messages: [{
        role: 'system',
        content: this.systemPrompt,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      lastActivity: new Date(),
      metadata
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  async sendMessage(sessionId: string, userMessage: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Update last activity
    session.lastActivity = new Date();

    // Trim history
    this.trimSessionHistory(session);

    try {
      const response = await sdk.chat(session.messages, {
        model: 'gpt-5-2025-08-07'
      });

      // Add assistant response
      session.messages.push({
        role: 'assistant',
        content: response as string,
        timestamp: new Date()
      });

      return response as string;
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = 'Sorry, I encountered an error.';
      
      session.messages.push({
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      });
      
      return errorMessage;
    }
  }

  async *streamMessage(sessionId: string, userMessage: string): AsyncGenerator<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    session.lastActivity = new Date();
    this.trimSessionHistory(session);

    let fullResponse = '';

    try {
      const stream = await sdk.chat(session.messages, {
        model: 'claude-sonnet-4@20250514',
        stream: true
      });

      for await (const chunk of stream as AsyncGenerator<string>) {
        fullResponse += chunk;
        yield chunk;
      }

      session.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Streaming error:', error);
      yield 'Sorry, I encountered an error.';
    }
  }

  private trimSessionHistory(session: Session) {
    if (session.messages.length > this.maxHistory + 1) {
      const systemMessage = session.messages[0];
      const recentMessages = session.messages.slice(-(this.maxHistory));
      session.messages = [systemMessage, ...recentMessages];
    }
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  listSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // Clean up old sessions
  cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000) { // 24 hours
    const now = new Date();
    const cutoff = new Date(now.getTime() - maxAge);

    for (const [sessionId, session] of this.sessions) {
      if (session.lastActivity < cutoff) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Usage
const multiBot = new MultiSessionChatbot();

// Create sessions for different users
const aliceSession = multiBot.createSession('alice', { name: 'Alice', role: 'developer' });
const bobSession = multiBot.createSession('bob', { name: 'Bob', role: 'designer' });

// Separate conversations
console.log('Alice:', await multiBot.sendMessage(aliceSession, 'Help me debug this code'));
console.log('Bob:', await multiBot.sendMessage(bobSession, 'What colors work well together?'));
console.log('Alice:', await multiBot.sendMessage(aliceSession, 'Here\'s the error message: TypeError...'));
```

## Chatbot with Memory

Persistent memory across sessions using external storage:

```typescript
// Memory interface for different storage backends
interface MemoryStore {
  saveSession(sessionId: string, session: Session): Promise<void>;
  loadSession(sessionId: string): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(userId?: string): Promise<Session[]>;
}

// Simple file-based memory store
class FileMemoryStore implements MemoryStore {
  private storePath: string;

  constructor(storePath: string = './chat-sessions') {
    this.storePath = storePath;
    // Ensure directory exists
    import('fs').then(fs => {
      if (!fs.existsSync(storePath)) {
        fs.mkdirSync(storePath, { recursive: true });
      }
    });
  }

  async saveSession(sessionId: string, session: Session): Promise<void> {
    const fs = await import('fs/promises');
    const filePath = `${this.storePath}/${sessionId}.json`;
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
  }

  async loadSession(sessionId: string): Promise<Session | null> {
    try {
      const fs = await import('fs/promises');
      const filePath = `${this.storePath}/${sessionId}.json`;
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const filePath = `${this.storePath}/${sessionId}.json`;
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  async listSessions(userId?: string): Promise<Session[]> {
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(this.storePath);
      const sessions: Session[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const session = await this.loadSession(file.replace('.json', ''));
          if (session && (!userId || session.id.startsWith(userId))) {
            sessions.push(session);
          }
        }
      }

      return sessions;
    } catch (error) {
      return [];
    }
  }
}

class PersistentChatbot {
  private memoryStore: MemoryStore;
  private systemPrompt: string;
  private activeSession: Session | null = null;

  constructor(
    memoryStore: MemoryStore,
    systemPrompt: string = "You are a helpful assistant."
  ) {
    this.memoryStore = memoryStore;
    this.systemPrompt = systemPrompt;
  }

  async createOrLoadSession(sessionId: string): Promise<void> {
    // Try to load existing session
    this.activeSession = await this.memoryStore.loadSession(sessionId);

    if (!this.activeSession) {
      // Create new session
      this.activeSession = {
        id: sessionId,
        messages: [{
          role: 'system',
          content: this.systemPrompt,
          timestamp: new Date()
        }],
        createdAt: new Date(),
        lastActivity: new Date()
      };
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.activeSession) {
      throw new Error('No active session. Call createOrLoadSession first.');
    }

    this.activeSession.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    this.activeSession.lastActivity = new Date();

    try {
      const response = await sdk.chat(this.activeSession.messages, {
        model: 'gpt-5-2025-08-07'
      });

      this.activeSession.messages.push({
        role: 'assistant',
        content: response as string,
        timestamp: new Date()
      });

      // Save session after each interaction
      await this.memoryStore.saveSession(this.activeSession.id, this.activeSession);

      return response as string;
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = 'Sorry, I encountered an error.';
      
      this.activeSession.messages.push({
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      });

      await this.memoryStore.saveSession(this.activeSession.id, this.activeSession);
      return errorMessage;
    }
  }

  async getConversationSummary(): Promise<string> {
    if (!this.activeSession || this.activeSession.messages.length <= 1) {
      return 'No conversation yet.';
    }

    const conversationText = this.activeSession.messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const summary = await sdk.complete(
      `Summarize this conversation in 2-3 sentences:\n\n${conversationText}`,
      { model: 'gpt-4o-mini-2024-07-18', maxTokens: 150 }
    );

    return summary as string;
  }

  async deleteSession(): Promise<void> {
    if (this.activeSession) {
      await this.memoryStore.deleteSession(this.activeSession.id);
      this.activeSession = null;
    }
  }
}

// Usage
const memoryStore = new FileMemoryStore('./chat-data');
const persistentBot = new PersistentChatbot(memoryStore);

async function chatWithMemory() {
  // Load or create session for user 'alice'
  await persistentBot.createOrLoadSession('alice-main');

  // Chat continues from where it left off
  console.log(await persistentBot.sendMessage('Hello, do you remember me?'));
  console.log(await persistentBot.sendMessage('What did we talk about last time?'));

  // Get conversation summary
  const summary = await persistentBot.getConversationSummary();
  console.log('Summary:', summary);
}
```

## Advanced Features

### 1. Chatbot with Personality

```typescript
class PersonalizedChatbot extends ContextualChatbot {
  private personality: {
    name: string;
    traits: string[];
    style: string;
    expertise: string[];
  };

  constructor(personality: typeof this.personality) {
    const systemPrompt = `You are ${personality.name}, an AI assistant with the following characteristics:
    
Personality traits: ${personality.traits.join(', ')}
Communication style: ${personality.style}
Areas of expertise: ${personality.expertise.join(', ')}

Always maintain this personality in your responses while being helpful and accurate.`;

    super(systemPrompt);
    this.personality = personality;
  }

  async adaptResponse(response: string): Promise<string> {
    // Optional: Use another AI call to ensure response matches personality
    const adapted = await sdk.complete(
      `Rewrite this response to match this personality: ${this.personality.style}. Keep the same information but adjust the tone and style.
      
Original response: ${response}`,
      { model: 'gpt-4o-mini-2024-07-18', maxTokens: 500 }
    );

    return adapted as string;
  }
}

// Usage
const friendlyBot = new PersonalizedChatbot({
  name: 'Alex',
  traits: ['friendly', 'encouraging', 'patient', 'humorous'],
  style: 'casual and warm, uses emojis occasionally',
  expertise: ['programming', 'web development', 'problem-solving']
});

const professionalBot = new PersonalizedChatbot({
  name: 'Dr. Morgan',
  traits: ['professional', 'precise', 'analytical', 'thorough'],
  style: 'formal and detailed, provides comprehensive explanations',
  expertise: ['data science', 'machine learning', 'statistics']
});
```

### 2. Chatbot with Content Filtering

```typescript
class SafeChatbot extends ContextualChatbot {
  private contentFilter: {
    blockedWords: string[];
    toxicityThreshold: number;
  };

  constructor(systemPrompt: string, contentFilter?: typeof this.contentFilter) {
    super(systemPrompt);
    this.contentFilter = contentFilter || {
      blockedWords: [],
      toxicityThreshold: 0.7
    };
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Pre-filter user input
    if (this.containsBlockedContent(userMessage)) {
      return "I can't help with that request. Please ask something else.";
    }

    // Get AI response
    const response = await super.sendMessage(userMessage);

    // Post-filter AI response (optional)
    if (this.containsBlockedContent(response)) {
      return "I apologize, but I need to rephrase my response. Could you ask your question differently?";
    }

    return response;
  }

  private containsBlockedContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.contentFilter.blockedWords.some(word => 
      lowerText.includes(word.toLowerCase())
    );
  }

  // Optional: Use AI for content moderation
  async moderateContent(text: string): Promise<{ safe: boolean; reason?: string }> {
    try {
      const moderation = await sdk.complete(
        `Rate the safety of this text on a scale of 1-10 (10 being completely safe). 
        Respond with only a number and brief reason.
        
        Text: "${text}"`,
        { model: 'gpt-4o-mini-2024-07-18', maxTokens: 50 }
      );

      const score = parseInt((moderation as string).match(/\d+/)?.[0] || '10');
      const safe = score >= 7;
      
      return { 
        safe, 
        reason: safe ? undefined : 'Content may be inappropriate'
      };
    } catch (error) {
      // Err on the side of caution
      return { safe: false, reason: 'Moderation check failed' };
    }
  }
}
```

## Production Considerations

### 1. Rate Limiting and Queuing

```typescript
class ProductionChatbot extends ContextualChatbot {
  private requestQueue: Array<{ 
    resolve: (value: string) => void; 
    reject: (error: Error) => void; 
    message: string; 
  }> = [];
  private processing = false;
  private maxConcurrent = 5;
  private activeRequests = 0;

  async sendMessage(userMessage: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, message: userMessage });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.requestQueue.shift()!;
      this.activeRequests++;

      this.handleRequest(request).finally(() => {
        this.activeRequests--;
        this.processQueue();
      });
    }

    this.processing = false;
  }

  private async handleRequest(request: { 
    resolve: (value: string) => void; 
    reject: (error: Error) => void; 
    message: string; 
  }) {
    try {
      const response = await super.sendMessage(request.message);
      request.resolve(response);
    } catch (error) {
      request.reject(error as Error);
    }
  }
}
```

### 2. Monitoring and Analytics

```typescript
class MonitoredChatbot extends ContextualChatbot {
  private metrics = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    averageResponseTime: 0,
    errorCount: 0
  };

  async sendMessage(userMessage: string): Promise<string> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const response = await super.sendMessage(userMessage);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, userMessage, response);
      
      return response;
    } catch (error) {
      this.metrics.errorCount++;
      throw error;
    }
  }

  private updateMetrics(responseTime: number, input: string, output: string) {
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;

    // Estimate tokens (rough calculation)
    const estimatedTokens = Math.ceil((input.length + output.length) / 4);
    this.metrics.totalTokens += estimatedTokens;

    // Estimate cost (rough calculation)
    this.metrics.totalCost += estimatedTokens * 0.000002; // Approximate cost per token
  }

  getMetrics() {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0,
      errorCount: 0
    };
  }
}
```

## Next Steps

- **[AI Agents](./ai-agents.md)** - Build more sophisticated agents with tools
- **[Streaming Guide](../core-features/streaming.md)** - Advanced streaming patterns
- **[Production Deployment](../advanced/production.md)** - Deploy chatbots at scale
- **[Cost Optimization](../advanced/cost-optimization.md)** - Reduce operational costs

---

*Ready to build your own chatbot? Start with the [Basic Chatbot](#basic-chatbot) example and gradually add features as needed.*