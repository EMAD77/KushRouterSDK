/**
 * KushRouter SDK - User-facing client for the LLM Router API
 * 
 * A lightweight, dependency-free SDK for interacting with KushRouter's unified LLM API.
 * Supports OpenAI-compatible, Anthropic-compatible, and unified endpoints.
 * 
 * @version 2.0.0
 * @author KushRouter Team
 */

// Type definitions
export interface SDKConfig {
  apiKey: string;
  timeout?: number;
  retries?: number;
}

export interface UnifiedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: Array<{ type: 'text'; text: string }> | string;
}

export interface UnifiedRequest {
  model?: string;
  messages?: UnifiedMessage[];
  message?: string; // Alternative single message format
  system?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
  toolChoice?: any;
  timeoutMs?: number;
  reasoning_effort?: 'low' | 'medium' | 'high';
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
  tool_choice?: any;
  reasoning_effort?: 'low' | 'medium' | 'high';
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  stream?: boolean;
  tools?: any[];
  tool_choice?: any;
  system?: string;
}

export interface Usage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  estimated_cost?: number;
}

export interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    index: number;
  }>;
  usage?: Usage;
}

export interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
  }>;
}

export interface FileUploadResponse {
  id: string;
  key: string;
  filename: string;
  bytes: number;
  purpose: string;
  created_at: string;
}

export interface BatchRequest {
  input_file_id: string;
  endpoint: string;
  completion_window?: string;
  metadata?: Record<string, any>;
}

export interface BatchResponse {
  id: string;
  object: string;
  endpoint: string;
  status: string;
  input_file_id: string;
  output_file_id?: string;
  error_file_id?: string;
  created_at: number;
  completed_at?: number;
  metadata?: Record<string, any>;
}

export interface TokenizeRequest {
  model: string;
  input: string;
}

export interface TokenizeResponse {
  tokens: number;
  model: string;
  tokenized?: string[];
}

export interface UsageResponse {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  recent_requests: Array<{
    timestamp: string;
    model: string;
    tokens: number;
    cost: number;
  }>;
}

export interface AnalyticsResponse {
  daily_usage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  model_breakdown: Array<{
    model: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

// Error types
export class KushRouterError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'KushRouterError';
  }
}

export class AuthenticationError extends KushRouterError {
  constructor(message = 'Invalid API key') {
    super(message, 401, 'authentication_error');
    this.name = 'AuthenticationError';
  }
}

export class InsufficientCreditsError extends KushRouterError {
  constructor(message = 'Insufficient credits', details?: any) {
    super(message, 402, 'insufficient_credits', details);
    this.name = 'InsufficientCreditsError';
  }
}

export class RateLimitError extends KushRouterError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'rate_limit_exceeded');
    this.name = 'RateLimitError';
  }
}

// Utility functions
function joinUrl(base: string, path: string): string {
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main KushRouter SDK class
 */
export class KushRouterSDK {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;
  private retries: number;

  constructor(config: SDKConfig) {
    this.baseURL = 'https://api.kushrouter.com';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;

    if (!this.apiKey) {
      throw new Error('API key is required');
    }
  }

  /**
   * Make a request with automatic retries and error handling
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    useBearer = false
  ): Promise<Response> {
    const url = joinUrl(this.baseURL, endpoint);
    const headers = {
      'Content-Type': 'application/json',
      ...(useBearer 
        ? { 'Authorization': `Bearer ${this.apiKey}` }
        : { 'x-api-key': this.apiKey }
      ),
      ...options.headers,
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        // Handle specific error types
        const errorData = await response.json().catch(() => ({}));
        
        switch (response.status) {
          case 401:
            throw new AuthenticationError(errorData.error?.message);
          case 402:
            throw new InsufficientCreditsError(errorData.error?.message, errorData.error?.details);
          case 429:
            if (attempt < this.retries) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
              await sleep(delay);
              continue;
            }
            throw new RateLimitError(errorData.error?.message);
          default:
            throw new KushRouterError(
              errorData.error?.message || `HTTP ${response.status}`,
              response.status,
              errorData.error?.type
            );
        }
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on specific errors
        if (error instanceof AuthenticationError || 
            error instanceof InsufficientCreditsError) {
          throw error;
        }

        if (attempt === this.retries) {
          throw lastError;
        }

        // Wait before retry
        await sleep(1000 * attempt);
      }
    }

    throw lastError!;
  }

  /**
   * Chat completions using the unified endpoint
   */
  async chatUnified(request: UnifiedRequest): Promise<ChatResponse> {
    const response = await this.makeRequest('/api/v1/llm/unified', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response.json();
  }

  /**
   * Streaming chat completions using the unified endpoint
   */
  async *streamUnified(request: UnifiedRequest): AsyncGenerator<StreamChunk> {
    const streamRequest = { ...request, stream: true };
    
    const response = await this.makeRequest('/api/v1/llm/unified', {
      method: 'POST',
      body: JSON.stringify(streamRequest),
    });

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * OpenAI-compatible chat completions
   */
  async chatOpenAI(request: OpenAIRequest): Promise<ChatResponse> {
    const response = await this.makeRequest('/api/v1/openai/chat/completions', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true); // Use Bearer token

    return response.json();
  }

  /**
   * Streaming OpenAI-compatible chat completions
   */
  async *streamOpenAI(request: OpenAIRequest): AsyncGenerator<StreamChunk> {
    const streamRequest = { ...request, stream: true };
    
    const response = await this.makeRequest('/api/v1/openai/chat/completions', {
      method: 'POST',
      body: JSON.stringify(streamRequest),
    }, true);

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Anthropic-compatible messages
   */
  async chatAnthropic(request: AnthropicRequest): Promise<any> {
    const response = await this.makeRequest('/api/v1/anthropic/messages', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'anthropic-version': '2023-06-01',
      },
    });

    return response.json();
  }

  /**
   * Streaming Anthropic-compatible messages
   */
  async *streamAnthropic(request: AnthropicRequest): AsyncGenerator<any> {
    const streamRequest = { ...request, stream: true };
    
    const response = await this.makeRequest('/api/v1/anthropic/messages', {
      method: 'POST',
      body: JSON.stringify(streamRequest),
      headers: {
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * File management
   */
  files = {
    /**
     * Upload a file
     */
    upload: async (file: File | Blob, filename: string, purpose = 'batch'): Promise<FileUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file, filename);
      formData.append('purpose', purpose);

      const response = await this.makeRequest('/api/v1/files/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Don't set Content-Type for FormData
      });

      return response.json();
    },

    /**
     * List uploaded files
     */
    list: async (): Promise<{ data: FileUploadResponse[] }> => {
      const response = await this.makeRequest('/api/v1/files');
      return response.json();
    },

    /**
     * Get file by ID or key
     */
    get: async (fileId: string): Promise<FileUploadResponse> => {
      const response = await this.makeRequest(`/api/v1/files/${encodeURIComponent(fileId)}`);
      return response.json();
    },
  };

  /**
   * Batch processing
   */
  batches = {
    /**
     * Create a new batch
     */
    create: async (request: BatchRequest): Promise<BatchResponse> => {
      const response = await this.makeRequest('/api/v1/batches', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response.json();
    },

    /**
     * List batches
     */
    list: async (): Promise<{ data: BatchResponse[] }> => {
      const response = await this.makeRequest('/api/v1/batches');
      return response.json();
    },

    /**
     * Get batch status
     */
    get: async (batchId: string): Promise<BatchResponse> => {
      const response = await this.makeRequest(`/api/v1/batches/${batchId}`);
      return response.json();
    },

    /**
     * Cancel a batch
     */
    cancel: async (batchId: string): Promise<BatchResponse> => {
      const response = await this.makeRequest(`/api/v1/batches/${batchId}/cancel`, {
        method: 'POST',
      });

      return response.json();
    },

    /**
     * Get batch results
     */
    results: async (batchId: string): Promise<any> => {
      const response = await this.makeRequest(`/api/v1/batches/${batchId}/results`);
      return response.json();
    },

    /**
     * Export batch results
     */
    export: async (batchId: string): Promise<Blob> => {
      const response = await this.makeRequest(`/api/v1/batches/${batchId}/export`);
      return response.blob();
    },
  };

  /**
   * Tokenization
   */
  async tokenize(request: TokenizeRequest): Promise<TokenizeResponse> {
    const response = await this.makeRequest('/api/v1/tokenize', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response.json();
  }

  /**
   * Usage analytics
   */
  async getUsage(): Promise<UsageResponse> {
    const response = await this.makeRequest('/api/v1/usage');
    return response.json();
  }

  /**
   * Analytics data
   */
  async getAnalytics(): Promise<AnalyticsResponse> {
    const response = await this.makeRequest('/api/v1/analytics');
    return response.json();
  }

  /**
   * Convenience methods for common use cases
   */

  /**
   * Simple text completion with automatic model selection
   */
  async complete(
    prompt: string,
    options: {
      model?: string;
      system?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<string | AsyncGenerator<string>> {
    const {
      model = 'gpt-5-2025-08-07',
      system,
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
    } = options;

    const request: UnifiedRequest = {
      model,
      message: prompt,
      system,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    if (stream) {
      return this.streamText(request);
    }

    const response = await this.chatUnified(request);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Stream text from a unified request
   */
  private async *streamText(request: UnifiedRequest): AsyncGenerator<string> {
    for await (const chunk of this.streamUnified(request)) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Chat with conversation history
   */
  async chat(
    messages: UnifiedMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<string | AsyncGenerator<string>> {
    const {
      model = 'claude-sonnet-4@20250514',
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
    } = options;

    const request: UnifiedRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    if (stream) {
      return this.streamText(request);
    }

    const response = await this.chatUnified(request);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Estimate cost for a request
   */
  async estimateCost(request: UnifiedRequest): Promise<number> {
    // First tokenize the input to get token count
    const inputText = request.message || 
      request.messages?.map(m => m.content).join(' ') || '';
    
    const tokenData = await this.tokenize({
      model: request.model || 'gpt-5-2025-08-07',
      input: inputText,
    });

    // Estimate cost based on token count and model
    // This is a simplified estimation - actual costs may vary
    const inputTokens = tokenData.tokens;
    const outputTokens = request.max_tokens || 500;
    
    // Model pricing per 1M tokens (simplified)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-5-2025-08-07': { input: 1.25, output: 5.0 },
      'gpt-5-mini-2025-08-07': { input: 0.25, output: 1.0 },
      'gpt-4o-2024-11-20': { input: 1.75, output: 7.0 },
      'gpt-4o-mini-2024-07-18': { input: 0.105, output: 0.42 },
      'claude-sonnet-4@20250514': { input: 2.1, output: 8.4 },
      'claude-3-5-sonnet-v2@20241022': { input: 2.1, output: 8.4 },
    };

    const modelPricing = pricing[request.model || 'gpt-5-2025-08-07'] || pricing['gpt-5-2025-08-07'];
    
    const inputCost = (inputTokens / 1000000) * modelPricing.input;
    const outputCost = (outputTokens / 1000000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
}

/**
 * Factory function for creating SDK instances
 */
export function createKushRouterSDK(config: SDKConfig): KushRouterSDK {
  return new KushRouterSDK(config);
}

export default createKushRouterSDK;