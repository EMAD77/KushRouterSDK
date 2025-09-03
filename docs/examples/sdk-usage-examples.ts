// /**
//  * KushRouter SDK Usage Examples
//  * 
//  * This file demonstrates various ways to use the improved KushRouter SDK
//  * for different use cases and scenarios.
//  */

// import { 
//   KushRouterSDK, 
//   createKushRouterSDK,
//   AuthenticationError,
//   InsufficientCreditsError,
//   RateLimitError 
// } from '../utils/kushRouterSdk';

// // Initialize the SDK
// const sdk = createKushRouterSDK({
//   apiKey: process.env.KUSHROUTER_API_KEY!,
//   timeout: 30000, // Optional, 30 seconds
//   retries: 3, // Optional, retry failed requests 3 times
// });

// /**
//  * Example 1: Simple text completion
//  */
// async function simpleCompletion() {
//   try {
//     const result = await sdk.complete('Explain quantum computing in simple terms');
//     console.log('Simple completion result:', result);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// /**
//  * Example 2: Streaming completion
//  */
// async function streamingCompletion() {
//   try {
//     const stream = await sdk.complete('Write a creative short story', {
//       stream: true,
//       model: 'claude-sonnet-4@20250514',
//       temperature: 0.8,
//     });

//     console.log('Streaming story:');
//     for await (const chunk of stream as AsyncGenerator<string>) {
//       process.stdout.write(chunk);
//     }
//     console.log('\n--- End of story ---');
//   } catch (error) {
//     console.error('Streaming error:', error);
//   }
// }

// /**
//  * Example 3: Chat with conversation history
//  */
// async function chatConversation() {
//   try {
//     const messages = [
//       { role: 'user' as const, content: 'Hello! I need help with Python programming.' },
//       { role: 'assistant' as const, content: 'Hello! I\'d be happy to help you with Python. What specific topic or problem would you like assistance with?' },
//       { role: 'user' as const, content: 'How do I create a simple web scraper?' },
//     ];

//     const response = await sdk.chat(messages, {
//       model: 'gpt-5-2025-08-07',
//       temperature: 0.7,
//     });

//     console.log('Chat response:', response);
//   } catch (error) {
//     console.error('Chat error:', error);
//   }
// }

// /**
//  * Example 4: Using the unified endpoint directly
//  */
// async function unifiedEndpoint() {
//   try {
//     const response = await sdk.chatUnified({
//       model: 'claude-3-5-sonnet-v2@20241022',
//       message: 'Analyze the pros and cons of renewable energy',
//       temperature: 0.6,
//       max_tokens: 800,
//     });

//     console.log('Unified response:', response.choices[0].message.content);
//     console.log('Usage:', response.usage);
//   } catch (error) {
//     console.error('Unified endpoint error:', error);
//   }
// }

// /**
//  * Example 5: OpenAI-compatible usage
//  */
// async function openAICompatible() {
//   try {
//     const response = await sdk.chatOpenAI({
//       model: 'gpt-5-mini-2025-08-07',
//       messages: [
//         { role: 'system', content: 'You are a helpful coding assistant.' },
//         { role: 'user', content: 'Write a function to calculate fibonacci numbers.' },
//       ],
//       temperature: 0.3,
//       max_tokens: 500,
//     });

//     console.log('OpenAI-compatible response:', response.choices[0].message.content);
//   } catch (error) {
//     console.error('OpenAI-compatible error:', error);
//   }
// }

// /**
//  * Example 6: Anthropic-compatible usage
//  */
// async function anthropicCompatible() {
//   try {
//     const response = await sdk.chatAnthropic({
//       model: 'claude-sonnet-4@20250514',
//       messages: [
//         {
//           role: 'user',
//           content: [{ type: 'text', text: 'Explain the theory of relativity' }],
//         },
//       ],
//       max_tokens: 600,
//       temperature: 0.5,
//     });

//     console.log('Anthropic-compatible response:', response);
//   } catch (error) {
//     console.error('Anthropic-compatible error:', error);
//   }
// }

// /**
//  * Example 7: OpenAI-compatible batch creation using Files API
//  */
// async function openAIBatchUsingFiles() {
//   try {
//     // Create JSONL content for batch processing
//     const jsonlContent = [
//       {
//         custom_id: "req-1",
//         method: "POST",
//         url: "/v1/chat/completions",
//         body: {
//           model: "gpt-5-2025-08-07",
//           messages: [{ role: "user", content: "Hello" }],
//           reasoning_effort: "high"
//         }
//       },
//       {
//         custom_id: "req-2", 
//         method: "POST",
//         url: "/v1/chat/completions",
//         body: {
//           model: "claude-3-5-sonnet-v2@20241022",
//           messages: [{ role: "user", content: "Goodbye" }]
//         }
//       }
//     ].map(req => JSON.stringify(req)).join('\n');

//     // Upload file using Files API
//     const file = await sdk.files.upload(jsonlContent, 'batch-requests.jsonl');
//     console.log('File uploaded:', file.id);

//     // Create batch using uploaded file
//     const batchResponse = await sdk.openai.batches.createFromFile(file.id);
//     console.log('Batch created:', batchResponse);

//     // Check status
//     const statusResponse = await sdk.openai.batches.get(batchResponse.id);
//     console.log('Batch status:', statusResponse.status);
//   } catch (error) {
//     console.error('OpenAI batch error:', error);
//   }
// }

// /**
//  * Example 8: Unified endpoint with file-based input
//  */
// async function unifiedEndpointWithFiles() {
//   try {
//     // Create JSONL content for unified endpoint
//     const unifiedRequest = {
//       model: "gpt-5-2025-08-07",
//       messages: [{ role: "user", content: "Hello from file!" }],
//       reasoning_effort: "high",
//       max_tokens: 100,
//       temperature: 0.7
//     };

//     const jsonlContent = JSON.stringify(unifiedRequest);

//     // Upload file
//     const file = await sdk.files.upload(jsonlContent, 'unified-request.jsonl');
//     console.log('File uploaded:', file.id);

//     // Use file in unified endpoint
//     const response = await sdk.chatUnified({
//       input_file_id: file.id,
//       stream: false  // Override file settings if needed
//     });
//     console.log('Unified response:', response.choices[0].message.content);

//     // Also works with streaming
//     const streamResponse = await sdk.streamUnified({
//       input_file_id: file.id,
//       stream: true
//     });

//     console.log('Streaming from file:');
//     for await (const chunk of streamResponse) {
//       const content = chunk.choices[0]?.delta?.content;
//       if (content) process.stdout.write(content);
//     }
//   } catch (error) {
//     console.error('Unified file error:', error);
//   }
// }

// /**
//  * Example 9: Unified batch creation with file support
//  */
// async function unifiedBatchWithFiles() {
//   try {
//     // Create JSONL content for unified batch processing
//     const jsonlContent = [
//       {
//         model: "gpt-5-2025-08-07",
//         messages: [{ role: "user", content: "Hello" }],
//         reasoning_effort: "high",
//         max_tokens: 100
//       },
//       {
//         model: "claude-3-5-sonnet-v2@20241022",
//         messages: [{ role: "user", content: "Goodbye" }],
//         prompt_cache: true
//       }
//     ].map(req => JSON.stringify(req)).join('\n');

//     // Upload file
//     const file = await sdk.files.upload(jsonlContent, 'unified-batch.jsonl');
//     console.log('File uploaded:', file.id);

//     // Create unified batch using file
//     const batchResponse = await sdk.batches.createFromFile(file.id, {
//       metadata: { batch_name: "file_batch" },
//       settings: { concurrency: 4 }
//     });
//     console.log('Unified batch created:', batchResponse);

//     // Check status
//     const statusResponse = await sdk.batches.get(batchResponse.id);
//     console.log('Batch status:', statusResponse.status);
//   } catch (error) {
//     console.error('Unified batch error:', error);
//   }
// }

// /**
//  * Example 9: Files API management
//  */
// async function filesManagement() {
//   try {
//     // List existing files
//     const filesList = await sdk.files.list();
//     console.log('Existing files:', filesList.data.length);

//     // Upload a new file
//     const content = 'Sample file content for testing';
//     const file = await sdk.files.upload(content, 'test-file.txt');
//     console.log('Uploaded file:', file.id);

//     // Get file metadata
//     const fileInfo = await sdk.files.get(file.id);
//     console.log('File info:', fileInfo);

//     // Get file content
//     const fileContent = await sdk.files.content(file.id);
//     console.log('File content:', fileContent);

//     // Delete file
//     const deleteResult = await sdk.files.delete(file.id);
//     console.log('File deleted:', deleteResult.deleted);
//   } catch (error) {
//     console.error('Files management error:', error);
//   }
// }

// /**
//  * Example 10: Tokenization and cost estimation
//  */
// async function tokenizationAndCosts() {
//   try {
//     // Tokenize text
//     const tokenResponse = await sdk.tokenize({
//       model: 'gpt-5-2025-08-07',
//       input: 'This is a sample text to tokenize for cost estimation.',
//     });

//     console.log('Tokenization result:', tokenResponse);

//     // Estimate cost for a request
//     const estimatedCost = await sdk.estimateCost({
//       model: 'claude-sonnet-4@20250514',
//       message: 'Write a detailed analysis of climate change impacts.',
//       max_tokens: 1000,
//     });

//     console.log('Estimated cost: $', estimatedCost.toFixed(4));

//   } catch (error) {
//     console.error('Tokenization/cost error:', error);
//   }
// }

// /**
//  * Example 9: Usage analytics
//  */
// async function usageAnalytics() {
//   try {
//     // Get basic usage data
//     const usage = await sdk.getUsage();
//     console.log('Usage summary:', {
//       totalRequests: usage.total_requests,
//       totalTokens: usage.total_tokens,
//       totalCost: usage.total_cost,
//     });

//     // Get detailed analytics data (default 30 days)
//     const analytics = await sdk.getAnalytics();
//     console.log('30-day Analytics Summary:', {
//       totalRequests: analytics.data.summary.totalRequests,
//       totalCost: analytics.data.summary.totalCost,
//       dateRange: analytics.data.summary.dateRange,
//       topModels: analytics.data.modelBreakdown.slice(0, 3),
//       recentDays: analytics.data.dailyUsage.slice(-7)
//     });

//     // Get 7-day analytics with hourly distribution
//     const weeklyAnalytics = await sdk.getAnalytics({
//       days: 7,
//       includeHourly: true
//     });
//     
//     console.log('Weekly Analytics with Hourly Data:', {
//       summary: weeklyAnalytics.data.summary,
//       peakHour: weeklyAnalytics.data.hourlyDistribution
//         .reduce((max, hour) => hour.requests > max.requests ? hour : max)
//     });

//     // Get model-focused analytics
//     const modelAnalytics = await sdk.getAnalytics({
//       days: 30,
//       groupBy: 'model'
//     });
//     
//     console.log('Model Performance Analysis:', {
//       mostUsed: modelAnalytics.data.modelBreakdown[0],
//       mostCostEffective: modelAnalytics.data.modelBreakdown
//         .sort((a, b) => a.avgCostPerRequest - b.avgCostPerRequest)[0]
//     });

//   } catch (error) {
//     console.error('Analytics error:', error);
//   }
// }

// /**
//  * Example 10: Advanced error handling
//  */
// async function advancedErrorHandling() {
//   try {
//     await sdk.complete('This might fail for demonstration');
//   } catch (error) {
//     if (error instanceof AuthenticationError) {
//       console.error('Authentication failed - check your API key');
//     } else if (error instanceof InsufficientCreditsError) {
//       console.error('Not enough credits:', error.details);
//       // Handle credit top-up logic here
//     } else if (error instanceof RateLimitError) {
//       console.error('Rate limited - please slow down');
//       // Implement backoff strategy
//     } else {
//       console.error('Unknown error:', error);
//     }
//   }
// }

// /**
//  * Example 11: Streaming with real-time processing
//  */
// async function streamingWithProcessing() {
//   try {
//     const stream = await sdk.streamUnified({
//       model: 'gpt-5-2025-08-07',
//       message: 'Write a poem about artificial intelligence',
//       temperature: 0.8,
//       max_tokens: 400,
//     });

//     let fullResponse = '';
//     let wordCount = 0;

//     for await (const chunk of stream) {
//       const content = chunk.choices[0]?.delta?.content;
//       if (content) {
//         fullResponse += content;
//         process.stdout.write(content);
        
//         // Count words as they stream
//         const words = content.split(/\s+/).filter(w => w.length > 0);
//         wordCount += words.length;
        
//         // Show progress every 10 words
//         if (wordCount % 10 === 0) {
//           process.stdout.write(`\n[${wordCount} words so far]\n`);
//         }
//       }
//     }

//     console.log('\n--- Final word count:', wordCount, '---');
//   } catch (error) {
//     console.error('Streaming processing error:', error);
//   }
// }

// /**
//  * Example 12: Tool use with reasoning effort
//  */
// async function toolUseWithReasoning() {
//   try {
//     const tools = [
//       {
//         type: 'function',
//         function: {
//           name: 'get_weather',
//           description: 'Get current weather for a location',
//           parameters: {
//             type: 'object',
//             properties: {
//               location: { type: 'string', description: 'City name' },
//               unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
//             },
//             required: ['location'],
//           },
//         },
//       },
//     ];

//     const response = await sdk.chatOpenAI({
//       model: 'gpt-5-2025-08-07',
//       messages: [
//         { role: 'user', content: 'What\'s the weather like in Tokyo?' },
//       ],
//       tools,
//       reasoning_effort: 'medium', // Use medium reasoning for tool selection
//       max_tokens: 300,
//     });

//     console.log('Tool use response:', response);
//   } catch (error) {
//     console.error('Tool use error:', error);
//   }
// }

// // Main function to run all examples
// async function runAllExamples() {
//   console.log('🚀 Running KushRouter SDK Examples\n');

//   const examples = [
//     { name: 'Simple Completion', fn: simpleCompletion },
//     { name: 'Streaming Completion', fn: streamingCompletion },
//     { name: 'Chat Conversation', fn: chatConversation },
//     { name: 'Unified Endpoint', fn: unifiedEndpoint },
//     { name: 'OpenAI Compatible', fn: openAICompatible },
//     { name: 'Anthropic Compatible', fn: anthropicCompatible },
//     { name: 'OpenAI Batch (Files)', fn: openAIBatchUsingFiles },
//     { name: 'Unified Endpoint (Files)', fn: unifiedEndpointWithFiles },
//     { name: 'Unified Batch (Files)', fn: unifiedBatchWithFiles },
//     { name: 'Files Management', fn: filesManagement },
//     { name: 'Tokenization & Costs', fn: tokenizationAndCosts },
//     { name: 'Usage Analytics', fn: usageAnalytics },
//     { name: 'Advanced Error Handling', fn: advancedErrorHandling },
//     { name: 'Streaming with Processing', fn: streamingWithProcessing },
//     { name: 'Tool Use with Reasoning', fn: toolUseWithReasoning },
//   ];

//   for (const example of examples) {
//     console.log(`\n📍 ${example.name}`);
//     console.log('='.repeat(50));
//     try {
//       await example.fn();
//     } catch (error) {
//       console.error(`❌ ${example.name} failed:`, error);
//     }
//     console.log('\n');
//   }

//   console.log('✅ All examples completed!');
// }

// // Export for use in other files
// export {
//   simpleCompletion,
//   streamingCompletion,
//   chatConversation,
//   unifiedEndpoint,
//   openAICompatible,
//   anthropicCompatible,
//   openAIBatchUsingFiles,
//   unifiedEndpointWithFiles,
//   unifiedBatchWithFiles,
//   filesManagement,
//   tokenizationAndCosts,
//   usageAnalytics,
//   advancedErrorHandling,
//   streamingWithProcessing,
//   toolUseWithReasoning,
//   runAllExamples,
// };

// // Run examples if this file is executed directly
// if (require.main === module) {
//   runAllExamples().catch(console.error);
// }