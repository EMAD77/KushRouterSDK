/**
 * MCP Server Integration Examples
 * 
 * This file demonstrates how to use MCP (Model Context Protocol) servers
 * with the KushRouter SDK to extend AI model capabilities with external tools.
 */

import { KushRouterSDK, MCPServer } from '../../src/index';

// Initialize the SDK
const router = new KushRouterSDK({
  apiKey: 'your-api-key-here'
});

/**
 * Example 1: Basic MCP Server Configuration
 * Connect to a filesystem MCP server for file operations
 */
async function basicMCPExample() {
  const mcpServers: MCPServer[] = [
    {
      name: 'filesystem',
      uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
      capabilities: ['read_file', 'write_file', 'list_directory'],
      config: {
        allowed_directories: ['/workspace', '/tmp']
      }
    }
  ];

  const response = await router.chatUnified({
    model: 'claude-sonnet-4@20250514',
    messages: [
      {
        role: 'user',
        content: 'Please read the contents of /workspace/README.md and summarize it'
      }
    ],
    mcpServers
  });

  console.log('Response:', response.choices[0].message.content);
}

/**
 * Example 2: Multiple MCP Servers
 * Use both filesystem and database MCP servers together
 */
async function multipleMCPServers() {
  const mcpServers: MCPServer[] = [
    {
      name: 'filesystem',
      uri: 'stdio:///usr/local/bin/mcp-server-filesystem',
      capabilities: ['read_file', 'write_file', 'list_directory']
    },
    {
      name: 'postgres',
      uri: 'stdio:///usr/local/bin/mcp-server-postgres',
      capabilities: ['query', 'schema'],
      config: {
        connection_string: 'postgresql://user:pass@localhost:5432/mydb'
      }
    }
  ];

  const response = await router.chatUnified({
    model: 'gpt-5-2025-08-07',
    messages: [
      {
        role: 'user',
        content: 'Query the users table to get all active users, then save the results to /workspace/active_users.json'
      }
    ],
    mcpServers,
    temperature: 0.1
  });

  console.log('Database query and file save result:', response.choices[0].message.content);
}

/**
 * Example 3: Web API MCP Server
 * Connect to a REST API through an MCP server
 */
async function webAPIMCPExample() {
  const mcpServers: MCPServer[] = [
    {
      name: 'weather-api',
      uri: 'http://localhost:3001/mcp',
      capabilities: ['get_weather', 'get_forecast'],
      config: {
        api_key: process.env.WEATHER_API_KEY,
        base_url: 'https://api.openweathermap.org/data/2.5'
      }
    }
  ];

  const response = await router.chatUnified({
    model: 'claude-sonnet-4@20250514',
    messages: [
      {
        role: 'user',
        content: 'What\'s the current weather in San Francisco and what should I wear today?'
      }
    ],
    mcpServers
  });

  console.log('Weather advice:', response.choices[0].message.content);
}

/**
 * Example 4: MCP with OpenAI-compatible endpoint
 * Using MCP servers with the OpenAI-compatible interface
 */
async function mcpWithOpenAI() {
  const mcpServers: MCPServer[] = [
    {
      name: 'calculator',
      uri: 'stdio:///usr/local/bin/mcp-server-calculator',
      capabilities: ['calculate', 'solve_equation']
    }
  ];

  const response = await router.chatOpenAI({
    model: 'gpt-5-2025-08-07',
    messages: [
      {
        role: 'user',
        content: 'Calculate the compound interest on $10,000 invested at 5% annually for 10 years'
      }
    ],
    mcp_servers: mcpServers, // Note: snake_case for OpenAI endpoint
    temperature: 0
  });

  console.log('Calculation result:', response.choices[0].message.content);
}

/**
 * Example 5: MCP with Anthropic-compatible endpoint
 * Using MCP servers with the Anthropic-compatible interface
 */
async function mcpWithAnthropic() {
  const mcpServers: MCPServer[] = [
    {
      name: 'code-analyzer',
      uri: 'stdio:///usr/local/bin/mcp-server-code-analyzer',
      capabilities: ['analyze_code', 'suggest_improvements', 'find_bugs']
    }
  ];

  const response = await router.chatAnthropic({
    model: 'claude-sonnet-4@20250514',
    messages: [
      {
        role: 'user',
        content: 'Analyze this Python function for potential issues:\n\ndef divide(a, b):\n    return a / b'
      }
    ],
    max_tokens: 1000,
    mcp_servers: mcpServers, // Note: snake_case for Anthropic endpoint
    system: 'You are a code review expert. Provide detailed analysis and suggestions.'
  });

  console.log('Code analysis:', response.choices[0].message.content);
}

/**
 * Example 6: Streaming with MCP Servers
 * Stream responses while using MCP server capabilities
 */
async function streamingWithMCP() {
  const mcpServers: MCPServer[] = [
    {
      name: 'knowledge-base',
      uri: 'stdio:///usr/local/bin/mcp-server-kb',
      capabilities: ['search', 'retrieve_document']
    }
  ];

  console.log('Streaming response:');
  
  for await (const chunk of router.streamUnified({
    model: 'claude-sonnet-4@20250514',
    messages: [
      {
        role: 'user',
        content: 'Search the knowledge base for information about machine learning best practices and provide a comprehensive guide'
      }
    ],
    mcpServers,
    stream: true
  })) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
  console.log('\n--- End of stream ---');
}

/**
 * Example 7: Batch Processing with MCP Servers
 * Process multiple requests with MCP server capabilities
 */
async function batchWithMCP() {
  const mcpServers: MCPServer[] = [
    {
      name: 'translator',
      uri: 'stdio:///usr/local/bin/mcp-server-translator',
      capabilities: ['translate', 'detect_language']
    }
  ];

  const batchRequests = [
    {
      model: 'gpt-5-2025-08-07',
      messages: [{ role: 'user' as const, content: 'Translate "Hello world" to Spanish' }],
      mcpServers
    },
    {
      model: 'gpt-5-2025-08-07',
      messages: [{ role: 'user' as const, content: 'Translate "Good morning" to French' }],
      mcpServers
    },
    {
      model: 'gpt-5-2025-08-07',
      messages: [{ role: 'user' as const, content: 'Translate "Thank you" to Japanese' }],
      mcpServers
    }
  ];

  const batch = await router.batches.create({
    requests: batchRequests,
    metadata: { purpose: 'translation_batch' }
  });

  console.log('Batch created:', batch.id);
  
  // Poll for completion
  let batchStatus = await router.batches.get(batch.id);
  while (batchStatus.status === 'in_progress') {
    await new Promise(resolve => setTimeout(resolve, 5000));
    batchStatus = await router.batches.get(batch.id);
  }

  if (batchStatus.status === 'completed') {
    const results = await router.batches.results(batch.id);
    console.log('Translation results:', results);
  }
}

/**
 * Example 8: Error Handling with MCP Servers
 * Proper error handling when MCP servers are unavailable
 */
async function mcpErrorHandling() {
  const mcpServers: MCPServer[] = [
    {
      name: 'unreliable-server',
      uri: 'stdio:///usr/local/bin/nonexistent-server',
      capabilities: ['some_capability']
    }
  ];

  try {
    const response = await router.chatUnified({
      model: 'claude-sonnet-4@20250514',
      messages: [
        {
          role: 'user',
          content: 'Try to use the unreliable server'
        }
      ],
      mcpServers
    });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('MCP Server Error:', error);
    
    // Fallback without MCP servers
    const fallbackResponse = await router.chatUnified({
      model: 'claude-sonnet-4@20250514',
      messages: [
        {
          role: 'user',
          content: 'Provide a response without external tools'
        }
      ]
    });

    console.log('Fallback response:', fallbackResponse.choices[0].message.content);
  }
}

// Export examples for use in other files
export {
  basicMCPExample,
  multipleMCPServers,
  webAPIMCPExample,
  mcpWithOpenAI,
  mcpWithAnthropic,
  streamingWithMCP,
  batchWithMCP,
  mcpErrorHandling
};

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    console.log('Running MCP Server Examples...\n');
    
    try {
      console.log('1. Basic MCP Example:');
      await basicMCPExample();
      
      console.log('\n2. Multiple MCP Servers:');
      await multipleMCPServers();
      
      console.log('\n3. Web API MCP Example:');
      await webAPIMCPExample();
      
      console.log('\n4. MCP with OpenAI:');
      await mcpWithOpenAI();
      
      console.log('\n5. MCP with Anthropic:');
      await mcpWithAnthropic();
      
      console.log('\n6. Streaming with MCP:');
      await streamingWithMCP();
      
      console.log('\n7. Batch with MCP:');
      await batchWithMCP();
      
      console.log('\n8. MCP Error Handling:');
      await mcpErrorHandling();
      
    } catch (error) {
      console.error('Example execution error:', error);
    }
  })();
}
