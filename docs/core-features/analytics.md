# Analytics API

The Analytics API provides detailed usage insights for your API key, including cost breakdowns, model usage patterns, and temporal analysis.

## Overview

Get comprehensive analytics data for your API usage with flexible time ranges and grouping options.

### Endpoint
```
GET /api/v1/analytics
```

### Authentication
- **Header**: `x-api-key: YOUR_API_KEY` or `Authorization: Bearer YOUR_API_KEY`

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | 30 | Number of days to analyze (max 90) |
| `include_hourly` | boolean | false | Include hourly distribution data |
| `group_by` | string | 'day' | Group data by 'day', 'hour', or 'model' |

## Response Structure

```typescript
interface AnalyticsResponse {
  success: boolean;
  data: {
    summary: {
      totalRequests: number;
      totalCost: number;
      dateRange: {
        from: string; // ISO timestamp
        to: string;   // ISO timestamp
      };
    };
    modelBreakdown: Array<{
      model: string;
      requests: number;
      cost: number;
      inputTokens: number;
      outputTokens: number;
      avgCostPerRequest: number;
      percentage: number; // Percentage of total requests
    }>;
    dailyUsage: Array<{
      date: string; // YYYY-MM-DD format
      requests: number;
      cost: number;
      inputTokens: number;
      outputTokens: number;
    }>;
    hourlyDistribution: Array<{
      hour: number; // 0-23
      requests: number;
      cost: number;
    }>;
  };
  meta: {
    apiKeyId: string;
    generatedAt: string;
    daysRequested: number;
    recordsFound: number;
  };
}
```

## SDK Usage

### Basic Analytics

```typescript
import { KushRouterSDK } from 'kushrouter-sdk';

const sdk = new KushRouterSDK({
  apiKey: 'your-api-key'
});

// Get 30-day analytics (default)
const analytics = await sdk.getAnalytics();

console.log(`Total requests: ${analytics.data.summary.totalRequests}`);
console.log(`Total cost: $${analytics.data.summary.totalCost.toFixed(4)}`);
console.log(`Date range: ${analytics.data.summary.dateRange.from} to ${analytics.data.summary.dateRange.to}`);
```

### Custom Time Range

```typescript
// Get 7-day analytics
const weeklyAnalytics = await sdk.getAnalytics({
  days: 7
});

// Get 90-day analytics (maximum)
const quarterlyAnalytics = await sdk.getAnalytics({
  days: 90
});
```

### Include Hourly Distribution

```typescript
// Get analytics with hourly usage patterns
const detailedAnalytics = await sdk.getAnalytics({
  days: 7,
  includeHourly: true
});

// Analyze peak usage hours
const peakHour = detailedAnalytics.data.hourlyDistribution
  .reduce((max, hour) => hour.requests > max.requests ? hour : max);

console.log(`Peak usage hour: ${peakHour.hour}:00 with ${peakHour.requests} requests`);
```

### Group by Different Dimensions

```typescript
// Group by model for model-specific analysis
const modelAnalytics = await sdk.getAnalytics({
  days: 30,
  groupBy: 'model'
});

// Group by hour for temporal analysis
const hourlyAnalytics = await sdk.getAnalytics({
  days: 7,
  groupBy: 'hour'
});
```

## Use Cases

### Cost Monitoring

```typescript
async function monitorCosts() {
  const analytics = await sdk.getAnalytics({ days: 30 });
  
  const totalCost = analytics.data.summary.totalCost;
  const avgDailyCost = totalCost / 30;
  
  console.log(`Monthly cost: $${totalCost.toFixed(4)}`);
  console.log(`Average daily cost: $${avgDailyCost.toFixed(4)}`);
  
  // Alert if cost exceeds threshold
  if (totalCost > 100) {
    console.warn('⚠️ Monthly cost exceeds $100 threshold');
  }
}
```

### Model Performance Analysis

```typescript
async function analyzeModelPerformance() {
  const analytics = await sdk.getAnalytics({ days: 30 });
  
  // Find most cost-effective model
  const sortedModels = analytics.data.modelBreakdown
    .sort((a, b) => a.avgCostPerRequest - b.avgCostPerRequest);
  
  console.log('Most cost-effective models:');
  sortedModels.slice(0, 3).forEach((model, index) => {
    console.log(`${index + 1}. ${model.model}: $${model.avgCostPerRequest.toFixed(6)} per request`);
  });
  
  // Find most used model
  const mostUsed = analytics.data.modelBreakdown
    .reduce((max, model) => model.requests > max.requests ? model : max);
  
  console.log(`Most used model: ${mostUsed.model} (${mostUsed.percentage.toFixed(1)}% of requests)`);
}
```

### Usage Pattern Analysis

```typescript
async function analyzeUsagePatterns() {
  const analytics = await sdk.getAnalytics({ 
    days: 14, 
    includeHourly: true 
  });
  
  // Find peak usage days
  const peakDay = analytics.data.dailyUsage
    .reduce((max, day) => day.requests > max.requests ? day : max);
  
  console.log(`Peak usage day: ${peakDay.date} with ${peakDay.requests} requests`);
  
  // Analyze hourly patterns
  const businessHours = analytics.data.hourlyDistribution
    .filter(hour => hour.hour >= 9 && hour.hour <= 17)
    .reduce((sum, hour) => sum + hour.requests, 0);
  
  const totalRequests = analytics.data.summary.totalRequests;
  const businessHourPercentage = (businessHours / totalRequests) * 100;
  
  console.log(`Business hours usage: ${businessHourPercentage.toFixed(1)}%`);
}
```

### Export Analytics Data

```typescript
async function exportAnalytics() {
  const analytics = await sdk.getAnalytics({ 
    days: 30, 
    includeHourly: true 
  });
  
  // Convert to CSV format
  const csvData = [
    'Date,Requests,Cost,Input Tokens,Output Tokens',
    ...analytics.data.dailyUsage.map(day => 
      `${day.date},${day.requests},${day.cost},${day.inputTokens},${day.outputTokens}`
    )
  ].join('\n');
  
  // Save or process CSV data
  console.log('Analytics CSV data generated');
  return csvData;
}
```

## Error Handling

```typescript
try {
  const analytics = await sdk.getAnalytics({ days: 45 });
  // Process analytics data
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof KushRouterError) {
    console.error(`API error: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Rate Limits

The analytics endpoint has the following rate limits:
- **Rate limit**: 100 requests per minute per API key
- **Data retention**: Up to 90 days of historical data
- **Response time**: Typically < 500ms for 30-day queries

## Best Practices

1. **Cache Results**: Analytics data doesn't change frequently, consider caching for 5-10 minutes
2. **Batch Requests**: If you need multiple time ranges, make concurrent requests
3. **Monitor Costs**: Set up automated alerts based on cost thresholds
4. **Optimize Models**: Use analytics to identify the most cost-effective models for your use case
5. **Track Trends**: Monitor daily usage patterns to optimize your application's LLM usage
