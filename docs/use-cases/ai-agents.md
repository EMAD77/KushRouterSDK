# Building AI Agents with KushRouter SDK

This guide covers how to build intelligent AI agents that can reason, plan, and take actions using tools and external systems.

## Table of Contents

- [What are AI Agents?](#what-are-ai-agents)
- [Basic Agent Architecture](#basic-agent-architecture)
- [Simple Tool-Using Agent](#simple-tool-using-agent)
- [ReAct Pattern Agent](#react-pattern-agent)
- [Multi-Step Planning Agent](#multi-step-planning-agent)
- [Production Considerations](#production-considerations)

## What are AI Agents?

AI Agents are autonomous systems that can:
- **Perceive** their environment through inputs
- **Reason** about problems and goals
- **Plan** sequences of actions
- **Act** by using tools and APIs
- **Learn** from feedback and outcomes

Unlike simple chatbots, agents can break down complex tasks, use external tools, and work towards goals independently.

## Basic Agent Architecture

```typescript
import { createKushRouterSDK } from '../utils/KushRouterSdk';

interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCallId?: string;
  toolName?: string;
}

class BaseAgent {
  protected sdk = createKushRouterSDK({
    apiKey: process.env.KUSHROUTER_API_KEY!
  });
  
  protected tools: Map<string, Tool> = new Map();
  protected messages: AgentMessage[] = [];
  protected systemPrompt: string;

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.messages.push({
      role: 'system',
      content: systemPrompt
    });
  }

  addTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  protected formatToolsForAPI() {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }

  async process(userInput: string): Promise<string> {
    this.messages.push({
      role: 'user',
      content: userInput
    });

    const tools = this.formatToolsForAPI();
    
    try {
      const response = await this.sdk.chatOpenAI({
        model: 'gpt-5-2025-08-07',
        messages: this.messages.map(m => ({
          role: m.role as any,
          content: m.content
        })),
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        reasoning_effort: 'medium'
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      // Handle tool calls if present
      if (assistantMessage.tool_calls) {
        return await this.handleToolCalls(assistantMessage);
      }

      // Regular response
      this.messages.push({
        role: 'assistant',
        content: assistantMessage.content
      });

      return assistantMessage.content;
    } catch (error) {
      console.error('Agent processing error:', error);
      return 'I encountered an error while processing your request.';
    }
  }

  protected async handleToolCalls(assistantMessage: any): Promise<string> {
    // Add assistant message with tool calls
    this.messages.push({
      role: 'assistant',
      content: assistantMessage.content || ''
    });

    // Execute each tool call
    for (const toolCall of assistantMessage.tool_calls) {
      const tool = this.tools.get(toolCall.function.name);
      
      if (!tool) {
        this.messages.push({
          role: 'tool',
          content: `Error: Tool ${toolCall.function.name} not found`,
          toolCallId: toolCall.id,
          toolName: toolCall.function.name
        });
        continue;
      }

      try {
        const params = JSON.parse(toolCall.function.arguments);
        const result = await tool.execute(params);
        
        this.messages.push({
          role: 'tool',
          content: JSON.stringify(result),
          toolCallId: toolCall.id,
          toolName: tool.name
        });
      } catch (error) {
        this.messages.push({
          role: 'tool',
          content: `Error executing ${tool.name}: ${error}`,
          toolCallId: toolCall.id,
          toolName: tool.name
        });
      }
    }

    // Get final response after tool execution
    const finalResponse = await this.sdk.chatOpenAI({
      model: 'gpt-5-2025-08-07',
      messages: this.messages.map(m => ({
        role: m.role as any,
        content: m.content,
        tool_call_id: m.toolCallId
      }))
    });

    const finalContent = finalResponse.choices[0].message.content;
    this.messages.push({
      role: 'assistant',
      content: finalContent
    });

    return finalContent;
  }

  getConversationHistory() {
    return [...this.messages];
  }

  clearHistory() {
    this.messages = [{
      role: 'system',
      content: this.systemPrompt
    }];
  }
}
```

## Simple Tool-Using Agent

An agent that can use basic tools like calculation, web search, and file operations:

```typescript
// Define some basic tools
const calculatorTool: Tool = {
  name: 'calculator',
  description: 'Perform mathematical calculations',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate (e.g., "2 + 2 * 3")'
      }
    },
    required: ['expression']
  },
  execute: async (params) => {
    try {
      // Safe evaluation (in production, use a proper math parser)
      const result = Function(`"use strict"; return (${params.expression})`)();
      return { result, expression: params.expression };
    } catch (error) {
      return { error: 'Invalid mathematical expression', expression: params.expression };
    }
  }
};

const weatherTool: Tool = {
  name: 'get_weather',
  description: 'Get current weather information for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or location'
      },
      unit: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: 'Temperature unit'
      }
    },
    required: ['location']
  },
  execute: async (params) => {
    // Mock weather API call
    const mockWeather = {
      location: params.location,
      temperature: Math.floor(Math.random() * 30) + 10,
      unit: params.unit || 'celsius',
      condition: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 20)
    };
    
    return mockWeather;
  }
};

const fileTool: Tool = {
  name: 'write_file',
  description: 'Write content to a file',
  parameters: {
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        description: 'Name of the file to write'
      },
      content: {
        type: 'string',
        description: 'Content to write to the file'
      }
    },
    required: ['filename', 'content']
  },
  execute: async (params) => {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(params.filename, params.content, 'utf-8');
      return { 
        success: true, 
        filename: params.filename, 
        size: params.content.length 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        filename: params.filename 
      };
    }
  }
};

class ToolAgent extends BaseAgent {
  constructor() {
    super(`You are a helpful AI assistant with access to tools. 
    
Use the available tools to help users with their requests. When using tools:
1. Think about which tool(s) would be helpful
2. Use tools when appropriate
3. Provide clear explanations of what you're doing
4. Always give a final summary of the results

Available capabilities:
- Mathematical calculations
- Weather information
- File operations
- General conversation and problem-solving`);
    
    // Add all tools
    this.addTool(calculatorTool);
    this.addTool(weatherTool);
    this.addTool(fileTool);
  }
}

// Usage
const agent = new ToolAgent();

async function demonstrateAgent() {
  console.log('🤖 Tool Agent Demo\n');

  // Math calculation
  console.log('User: What is 15% of 250 plus 30?');
  console.log('Agent:', await agent.process('What is 15% of 250 plus 30?'));
  console.log();

  // Weather query
  console.log('User: What\'s the weather like in Tokyo?');
  console.log('Agent:', await agent.process('What\'s the weather like in Tokyo?'));
  console.log();

  // File operation
  console.log('User: Create a summary file of our conversation');
  console.log('Agent:', await agent.process('Create a summary file of our conversation'));
  console.log();

  // Complex multi-tool task
  console.log('User: Calculate the area of a circle with radius 5, then save the result to a file');
  console.log('Agent:', await agent.process('Calculate the area of a circle with radius 5, then save the result to a file'));
}

demonstrateAgent();
```

---

*This is part 1 of the AI Agents guide. The complete guide includes ReAct Pattern Agents, Multi-Step Planning Agents, and production considerations.*