# Content Generation with KushRouter SDK

This guide covers how to build automated content generation systems using the KushRouter SDK for various content types and use cases.

## Table of Contents

- [Content Generation Patterns](#content-generation-patterns)
- [Blog Post Generation](#blog-post-generation)
- [Social Media Content](#social-media-content)
- [Technical Documentation](#technical-documentation)
- [Creative Writing](#creative-writing)
- [Marketing Content](#marketing-content)
- [Batch Content Generation](#batch-content-generation)

## Content Generation Patterns

### Basic Content Generator

```typescript
import { createKushRouterSDK } from '../utils/KushRouterSdk';

const sdk = createKushRouterSDK({
  apiKey: process.env.KUSHROUTER_API_KEY!
});

class ContentGenerator {
  async generateContent(
    type: string,
    topic: string,
    options: {
      length?: 'short' | 'medium' | 'long';
      tone?: 'professional' | 'casual' | 'friendly' | 'formal';
      audience?: string;
      style?: string;
    } = {}
  ): Promise<string> {
    const {
      length = 'medium',
      tone = 'professional',
      audience = 'general audience',
      style = 'informative'
    } = options;

    const prompt = `Write a ${length} ${type} about "${topic}" with the following specifications:
    - Tone: ${tone}
    - Target audience: ${audience}
    - Style: ${style}
    - Make it engaging and well-structured
    - Include relevant examples when appropriate`;

    const content = await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: this.getTokenLimit(length)
    });

    return content as string;
  }

  private getTokenLimit(length: string): number {
    switch (length) {
      case 'short': return 300;
      case 'medium': return 800;
      case 'long': return 1500;
      default: return 800;
    }
  }
}

// Usage
const generator = new ContentGenerator();

const blogPost = await generator.generateContent('blog post', 'sustainable living', {
  length: 'long',
  tone: 'friendly',
  audience: 'environmentally conscious individuals'
});

console.log(blogPost);
```

## Blog Post Generation

### Structured Blog Post Generator

```typescript
interface BlogPostStructure {
  title: string;
  introduction: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  conclusion: string;
  tags: string[];
}

class BlogPostGenerator {
  async generateStructuredPost(
    topic: string,
    targetWordCount: number = 1000,
    seoKeywords: string[] = []
  ): Promise<BlogPostStructure> {
    // First, generate the outline
    const outline = await this.generateOutline(topic, seoKeywords);
    
    // Then generate each section
    const sections = await Promise.all(
      outline.sections.map(async (section) => ({
        heading: section.heading,
        content: await this.generateSection(section.heading, section.points, targetWordCount / outline.sections.length)
      }))
    );

    return {
      title: outline.title,
      introduction: await this.generateIntroduction(topic, outline.title),
      sections,
      conclusion: await this.generateConclusion(topic, sections),
      tags: outline.tags
    };
  }

  private async generateOutline(topic: string, keywords: string[]) {
    const keywordText = keywords.length > 0 ? `Include these SEO keywords naturally: ${keywords.join(', ')}` : '';
    
    const outlinePrompt = `Create a detailed blog post outline for "${topic}".
    ${keywordText}
    
    Provide:
    1. An engaging title
    2. 4-6 main sections with headings
    3. 2-3 key points for each section
    4. Relevant tags
    
    Format as JSON with structure: { title, sections: [{ heading, points }], tags }`;

    const response = await sdk.complete(outlinePrompt, {
      model: 'gpt-5-2025-08-07',
      temperature: 0.6,
      maxTokens: 500
    });

    try {
      return JSON.parse(response as string);
    } catch {
      // Fallback if JSON parsing fails
      return {
        title: `The Ultimate Guide to ${topic}`,
        sections: [
          { heading: 'Introduction', points: ['Overview', 'Importance'] },
          { heading: 'Main Benefits', points: ['Key advantages', 'Real examples'] },
          { heading: 'Best Practices', points: ['Expert tips', 'Common mistakes'] },
          { heading: 'Implementation', points: ['Step-by-step guide', 'Tools needed'] }
        ],
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'guide', 'tips']
      };
    }
  }

  private async generateIntroduction(topic: string, title: string): Promise<string> {
    const prompt = `Write an engaging introduction for a blog post titled "${title}" about ${topic}.
    The introduction should:
    - Hook the reader immediately
    - Explain why this topic matters
    - Preview what the post will cover
    - Be around 150-200 words`;

    return await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: 300
    }) as string;
  }

  private async generateSection(heading: string, points: string[], wordCount: number): Promise<string> {
    const prompt = `Write a comprehensive section for "${heading}".
    Cover these key points: ${points.join(', ')}
    Target length: approximately ${wordCount} words
    Include specific examples and actionable advice.`;

    return await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: Math.ceil(wordCount * 1.5)
    }) as string;
  }

  private async generateConclusion(topic: string, sections: Array<{ heading: string; content: string }>): Promise<string> {
    const sectionSummary = sections.map(s => s.heading).join(', ');
    
    const prompt = `Write a compelling conclusion for a blog post about ${topic}.
    The post covered: ${sectionSummary}
    
    The conclusion should:
    - Summarize key takeaways
    - Inspire action
    - End with a thought-provoking question or call-to-action
    - Be around 100-150 words`;

    return await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: 250
    }) as string;
  }

  async generateBlogPostMarkdown(post: BlogPostStructure): Promise<string> {
    let markdown = `# ${post.title}\n\n`;
    markdown += `${post.introduction}\n\n`;
    
    post.sections.forEach(section => {
      markdown += `## ${section.heading}\n\n`;
      markdown += `${section.content}\n\n`;
    });
    
    markdown += `## Conclusion\n\n`;
    markdown += `${post.conclusion}\n\n`;
    markdown += `**Tags:** ${post.tags.map(tag => `#${tag}`).join(' ')}\n`;
    
    return markdown;
  }
}

// Usage
const blogGenerator = new BlogPostGenerator();

const post = await blogGenerator.generateStructuredPost(
  'Remote Work Productivity',
  1200,
  ['remote work', 'productivity', 'work from home', 'digital nomad']
);

const markdown = await blogGenerator.generateBlogPostMarkdown(post);
console.log(markdown);
```

## Social Media Content

### Multi-Platform Social Media Generator

```typescript
interface SocialMediaPost {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  hashtags: string[];
  characterCount: number;
}

class SocialMediaGenerator {
  private platformLimits = {
    twitter: 280,
    linkedin: 3000,
    facebook: 63206,
    instagram: 2200
  };

  async generateCampaign(
    topic: string,
    platforms: Array<'twitter' | 'linkedin' | 'facebook' | 'instagram'>,
    campaignGoal: string = 'engagement'
  ): Promise<SocialMediaPost[]> {
    const posts = await Promise.all(
      platforms.map(platform => this.generatePlatformPost(topic, platform, campaignGoal))
    );

    return posts;
  }

  private async generatePlatformPost(
    topic: string,
    platform: string,
    goal: string
  ): Promise<SocialMediaPost> {
    const limit = this.platformLimits[platform as keyof typeof this.platformLimits];
    const platformSpecs = this.getPlatformSpecs(platform);

    const prompt = `Create a ${platform} post about "${topic}" optimized for ${goal}.

Platform requirements:
- Character limit: ${limit}
- Style: ${platformSpecs.style}
- Format: ${platformSpecs.format}
- Audience: ${platformSpecs.audience}

Include:
- Engaging hook
- Clear value proposition
- Call to action
- Appropriate hashtags (separate from main content)

Make it platform-native and optimized for the algorithm.`;

    const response = await sdk.complete(prompt, {
      model: 'gpt-5-2025-08-07',
      temperature: 0.8,
      maxTokens: 400
    }) as string;

    // Extract hashtags and clean content
    const { content, hashtags } = this.extractHashtags(response);
    
    return {
      platform: platform as any,
      content: this.trimToLimit(content, limit - hashtags.join(' ').length - 10),
      hashtags,
      characterCount: content.length
    };
  }

  private getPlatformSpecs(platform: string) {
    const specs = {
      twitter: {
        style: 'concise and punchy',
        format: 'short threads or single tweets',
        audience: 'broad, fast-moving'
      },
      linkedin: {
        style: 'professional and insightful',
        format: 'longer-form professional content',
        audience: 'business professionals'
      },
      facebook: {
        style: 'conversational and community-focused',
        format: 'engaging posts that encourage discussion',
        audience: 'diverse social network'
      },
      instagram: {
        style: 'visual-first and inspirational',
        format: 'caption that complements visual content',
        audience: 'visual-oriented, younger demographic'
      }
    };

    return specs[platform as keyof typeof specs] || specs.twitter;
  }

  private extractHashtags(content: string): { content: string; hashtags: string[] } {
    const hashtagRegex = /#\w+/g;
    const hashtags = content.match(hashtagRegex) || [];
    const cleanContent = content.replace(hashtagRegex, '').trim();
    
    return {
      content: cleanContent,
      hashtags: hashtags.map(tag => tag.toLowerCase())
    };
  }

  private trimToLimit(content: string, limit: number): string {
    if (content.length <= limit) return content;
    
    // Trim at word boundary
    const trimmed = content.substring(0, limit);
    const lastSpace = trimmed.lastIndexOf(' ');
    
    return lastSpace > limit * 0.8 ? trimmed.substring(0, lastSpace) + '...' : trimmed + '...';
  }

  async generateHashtagSuggestions(topic: string, platform: string): Promise<string[]> {
    const prompt = `Generate 10-15 relevant hashtags for "${topic}" on ${platform}.
    Include:
    - Mix of popular and niche hashtags
    - Branded and community hashtags
    - Trending tags when relevant
    
    Return only the hashtags, one per line, with # symbol.`;

    const response = await sdk.complete(prompt, {
      model: 'gpt-4o-mini-2024-07-18',
      temperature: 0.6,
      maxTokens: 200
    }) as string;

    return response.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('#'))
      .slice(0, 15);
  }
}

// Usage
const socialGenerator = new SocialMediaGenerator();

const campaign = await socialGenerator.generateCampaign(
  'AI in Healthcare',
  ['twitter', 'linkedin', 'facebook'],
  'thought leadership'
);

campaign.forEach(post => {
  console.log(`\n--- ${post.platform.toUpperCase()} ---`);
  console.log(post.content);
  console.log('Hashtags:', post.hashtags.join(' '));
  console.log(`Characters: ${post.characterCount}`);
});
```

## Technical Documentation

### API Documentation Generator

```typescript
interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: any[];
  responses?: any[];
  examples?: any[];
}

class TechnicalDocGenerator {
  async generateAPIDocumentation(
    apiName: string,
    endpoints: APIEndpoint[],
    overview?: string
  ): Promise<string> {
    let documentation = `# ${apiName} API Documentation\n\n`;
    
    if (overview) {
      documentation += `## Overview\n\n${overview}\n\n`;
    }

    // Generate overview from endpoints if not provided
    if (!overview) {
      const generatedOverview = await this.generateAPIOverview(apiName, endpoints);
      documentation += `## Overview\n\n${generatedOverview}\n\n`;
    }

    // Generate authentication section
    const authSection = await this.generateAuthSection(apiName);
    documentation += `## Authentication\n\n${authSection}\n\n`;

    // Generate endpoints documentation
    documentation += `## Endpoints\n\n`;
    
    for (const endpoint of endpoints) {
      const endpointDoc = await this.generateEndpointDocumentation(endpoint);
      documentation += endpointDoc + '\n\n';
    }

    // Generate error handling section
    const errorSection = await this.generateErrorSection();
    documentation += `## Error Handling\n\n${errorSection}\n\n`;

    // Generate examples section
    const examplesSection = await this.generateExamplesSection(endpoints);
    documentation += `## Examples\n\n${examplesSection}\n\n`;

    return documentation;
  }

  private async generateAPIOverview(apiName: string, endpoints: APIEndpoint[]): Promise<string> {
    const endpointList = endpoints.map(e => `${e.method} ${e.path}`).join(', ');
    
    const prompt = `Write a clear, concise overview for the ${apiName} API.
    
Available endpoints: ${endpointList}

The overview should:
- Explain what the API does
- Highlight key features
- Mention the base URL format
- Be 2-3 paragraphs
- Include getting started information`;

    return await sdk.complete(prompt, {
      model: 'gpt-5-2025-08-07',
      temperature: 0.5,
      maxTokens: 400
    }) as string;
  }

  private async generateAuthSection(apiName: string): Promise<string> {
    const prompt = `Generate an authentication section for the ${apiName} API documentation.
    Include:
    - API key authentication method
    - How to include authentication in requests
    - Security best practices
    - Example authentication header`;

    return await sdk.complete(prompt, {
      model: 'gpt-5-2025-08-07',
      temperature: 0.3,
      maxTokens: 300
    }) as string;
  }

  private async generateEndpointDocumentation(endpoint: APIEndpoint): Promise<string> {
    const prompt = `Generate detailed documentation for this API endpoint:

Method: ${endpoint.method}
Path: ${endpoint.path}
Description: ${endpoint.description}

Include:
- Endpoint description
- Parameters (if any)
- Request format
- Response format
- HTTP status codes
- Example request/response

Format as markdown with proper heading.`;

    return await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.4,
      maxTokens: 600
    }) as string;
  }

  private async generateErrorSection(): Promise<string> {
    const prompt = `Generate a comprehensive error handling section for API documentation.
    Include:
    - Common HTTP status codes
    - Error response format
    - Troubleshooting tips
    - Rate limiting information`;

    return await sdk.complete(prompt, {
      model: 'gpt-5-2025-08-07',
      temperature: 0.3,
      maxTokens: 400
    }) as string;
  }

  private async generateExamplesSection(endpoints: APIEndpoint[]): Promise<string> {
    const prompt = `Generate practical code examples for API usage.
    
Endpoints: ${endpoints.map(e => `${e.method} ${e.path}`).join(', ')}

Include examples in:
- cURL
- JavaScript/Node.js
- Python
- Common use case scenarios`;

    return await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.4,
      maxTokens: 800
    }) as string;
  }
}
```

## Creative Writing

### Story Generator

```typescript
interface StoryElements {
  genre: string;
  setting: string;
  characters: string[];
  conflict: string;
  theme: string;
}

class CreativeWritingGenerator {
  async generateShortStory(
    elements: Partial<StoryElements>,
    length: 'flash' | 'short' | 'medium' = 'short'
  ): Promise<string> {
    // Generate missing elements
    const completeElements = await this.completeStoryElements(elements);
    
    const wordTargets = {
      flash: 500,   // Flash fiction
      short: 1500,  // Short story
      medium: 3000  // Longer short story
    };

    const prompt = `Write a ${length} story with these elements:

Genre: ${completeElements.genre}
Setting: ${completeElements.setting}
Characters: ${completeElements.characters.join(', ')}
Central Conflict: ${completeElements.conflict}
Theme: ${completeElements.theme}

Target length: approximately ${wordTargets[length]} words

Create a compelling narrative with:
- Strong opening hook
- Character development
- Rising action and climax
- Satisfying resolution
- Rich sensory details
- Dialogue that reveals character`;

    const story = await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.8,
      maxTokens: Math.ceil(wordTargets[length] * 1.5)
    });

    return story as string;
  }

  private async completeStoryElements(partial: Partial<StoryElements>): Promise<StoryElements> {
    const missing = [];
    if (!partial.genre) missing.push('genre');
    if (!partial.setting) missing.push('setting');
    if (!partial.characters || partial.characters.length === 0) missing.push('characters');
    if (!partial.conflict) missing.push('conflict');
    if (!partial.theme) missing.push('theme');

    if (missing.length === 0) {
      return partial as StoryElements;
    }

    const prompt = `Generate creative story elements for the missing components: ${missing.join(', ')}

Current elements:
${partial.genre ? `Genre: ${partial.genre}` : ''}
${partial.setting ? `Setting: ${partial.setting}` : ''}
${partial.characters ? `Characters: ${partial.characters.join(', ')}` : ''}
${partial.conflict ? `Conflict: ${partial.conflict}` : ''}
${partial.theme ? `Theme: ${partial.theme}` : ''}

Provide the missing elements that work well together. Format as JSON.`;

    const response = await sdk.complete(prompt, {
      model: 'gpt-5-2025-08-07',
      temperature: 0.9,
      maxTokens: 300
    });

    try {
      const generated = JSON.parse(response as string);
      return {
        genre: partial.genre || generated.genre,
        setting: partial.setting || generated.setting,
        characters: partial.characters || generated.characters,
        conflict: partial.conflict || generated.conflict,
        theme: partial.theme || generated.theme
      };
    } catch {
      // Fallback if JSON parsing fails
      return {
        genre: partial.genre || 'mystery',
        setting: partial.setting || 'modern city',
        characters: partial.characters || ['detective', 'suspect', 'witness'],
        conflict: partial.conflict || 'solving a puzzling crime',
        theme: partial.theme || 'truth and justice'
      };
    }
  }

  async generatePoetry(
    style: string,
    subject: string,
    mood: string = 'contemplative'
  ): Promise<string> {
    const prompt = `Write a ${style} poem about "${subject}" with a ${mood} mood.

Consider:
- Appropriate structure for ${style} poetry
- Vivid imagery and metaphors
- Emotional resonance
- Literary devices (alliteration, rhythm, etc.)
- Strong ending that ties the poem together

Make it original and evocative.`;

    return await sdk.complete(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.9,
      maxTokens: 400
    }) as string;
  }
}

// Usage
const creativeGenerator = new CreativeWritingGenerator();

const story = await creativeGenerator.generateShortStory({
  genre: 'science fiction',
  theme: 'humanity in the digital age'
}, 'short');

console.log(story);

const poem = await creativeGenerator.generatePoetry('haiku', 'artificial intelligence', 'wonder');
console.log('\n---\n', poem);
```

---

*This covers the main content generation patterns. Each section can be extended with more specific use cases and advanced features.*