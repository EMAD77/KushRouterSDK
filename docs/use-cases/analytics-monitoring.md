# Analytics & Monitoring

Monitor your API usage, costs, and performance patterns with KushRouter's comprehensive analytics system.

## Quick Start

```typescript
import { KushRouterSDK } from 'kushrouter-sdk';

const sdk = new KushRouterSDK({
  apiKey: 'your-api-key'
});

// Get 30-day analytics overview
const analytics = await sdk.getAnalytics();
console.log(`Total cost: $${analytics.data.summary.totalCost.toFixed(4)}`);
```

## Cost Monitoring Dashboard

```typescript
async function createCostDashboard() {
  const analytics = await sdk.getAnalytics({ days: 30 });
  
  const dashboard = {
    totalSpent: analytics.data.summary.totalCost,
    dailyAverage: analytics.data.summary.totalCost / 30,
    mostExpensiveDay: analytics.data.dailyUsage
      .reduce((max, day) => day.cost > max.cost ? day : max),
    costTrend: analytics.data.dailyUsage.slice(-7)
      .map(day => ({ date: day.date, cost: day.cost }))
  };
  
  console.log('📊 Cost Dashboard:', dashboard);
  
  // Alert if spending is high
  if (dashboard.dailyAverage > 5) {
    console.warn('⚠️ High daily spending detected');
  }
  
  return dashboard;
}
```

## Model Optimization

```typescript
async function optimizeModelUsage() {
  const analytics = await sdk.getAnalytics({ days: 30 });
  
  // Find most cost-effective models
  const modelEfficiency = analytics.data.modelBreakdown
    .map(model => ({
      ...model,
      efficiency: model.requests / model.cost, // requests per dollar
      tokenEfficiency: (model.inputTokens + model.outputTokens) / model.cost
    }))
    .sort((a, b) => b.efficiency - a.efficiency);
  
  console.log('🎯 Most efficient models:');
  modelEfficiency.slice(0, 3).forEach((model, i) => {
    console.log(`${i + 1}. ${model.model}`);
    console.log(`   Efficiency: ${model.efficiency.toFixed(2)} requests/$`);
    console.log(`   Avg cost: $${model.avgCostPerRequest.toFixed(6)}`);
    console.log(`   Usage: ${model.percentage.toFixed(1)}% of requests`);
  });
  
  return modelEfficiency;
}
```

## Usage Pattern Analysis

```typescript
async function analyzeUsagePatterns() {
  const analytics = await sdk.getAnalytics({ 
    days: 14, 
    includeHourly: true 
  });
  
  // Peak usage analysis
  const peakHour = analytics.data.hourlyDistribution
    .reduce((max, hour) => hour.requests > max.requests ? hour : max);
  
  const peakDay = analytics.data.dailyUsage
    .reduce((max, day) => day.requests > max.requests ? day : max);
  
  // Business hours analysis (9 AM - 5 PM)
  const businessHours = analytics.data.hourlyDistribution
    .filter(hour => hour.hour >= 9 && hour.hour <= 17)
    .reduce((sum, hour) => sum + hour.requests, 0);
  
  const businessHourPercentage = (businessHours / analytics.data.summary.totalRequests) * 100;
  
  const patterns = {
    peakHour: `${peakHour.hour}:00 (${peakHour.requests} requests)`,
    peakDay: `${peakDay.date} (${peakDay.requests} requests)`,
    businessHourUsage: `${businessHourPercentage.toFixed(1)}%`,
    weekendUsage: calculateWeekendUsage(analytics.data.dailyUsage)
  };
  
  console.log('📈 Usage Patterns:', patterns);
  return patterns;
}

function calculateWeekendUsage(dailyUsage: any[]) {
  const weekendRequests = dailyUsage
    .filter(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    })
    .reduce((sum, day) => sum + day.requests, 0);
  
  const totalRequests = dailyUsage.reduce((sum, day) => sum + day.requests, 0);
  return `${((weekendRequests / totalRequests) * 100).toFixed(1)}%`;
}
```

## Real-time Monitoring

```typescript
class AnalyticsMonitor {
  private sdk: KushRouterSDK;
  private alertThresholds: {
    dailyCost: number;
    hourlyRequests: number;
    errorRate: number;
  };
  
  constructor(apiKey: string, thresholds = {}) {
    this.sdk = new KushRouterSDK({ apiKey });
    this.alertThresholds = {
      dailyCost: 10,
      hourlyRequests: 100,
      errorRate: 0.05,
      ...thresholds
    };
  }
  
  async checkAlerts() {
    const analytics = await this.sdk.getAnalytics({ 
      days: 1, 
      includeHourly: true 
    });
    
    const alerts = [];
    
    // Check daily cost
    const todayCost = analytics.data.dailyUsage[0]?.cost || 0;
    if (todayCost > this.alertThresholds.dailyCost) {
      alerts.push(`🚨 Daily cost alert: $${todayCost.toFixed(4)} exceeds threshold`);
    }
    
    // Check hourly request spikes
    const currentHour = new Date().getHours();
    const currentHourUsage = analytics.data.hourlyDistribution
      .find(hour => hour.hour === currentHour);
    
    if (currentHourUsage && currentHourUsage.requests > this.alertThresholds.hourlyRequests) {
      alerts.push(`⚡ High usage alert: ${currentHourUsage.requests} requests this hour`);
    }
    
    return alerts;
  }
  
  async startMonitoring(intervalMinutes = 15) {\n    console.log('🔍 Starting analytics monitoring...');\n    \n    setInterval(async () => {\n      try {\n        const alerts = await this.checkAlerts();\n        if (alerts.length > 0) {\n          console.log('📢 Alerts:', alerts);\n        }\n      } catch (error) {\n        console.error('Monitoring error:', error);\n      }\n    }, intervalMinutes * 60 * 1000);\n  }\n}\n\n// Usage\n// const monitor = new AnalyticsMonitor('your-api-key', {\n//   dailyCost: 20,\n//   hourlyRequests: 200\n// });\n// monitor.startMonitoring(10); // Check every 10 minutes"}, {"old_string": "//     { name: 'Usage Analytics', fn: usageAnalytics },", "new_string": "//     { name: 'Usage Analytics', fn: usageAnalytics },\n//     { name: 'Model Optimization', fn: optimizeModelUsage },\n//     { name: 'Usage Patterns', fn: analyzeUsagePatterns },"}]
