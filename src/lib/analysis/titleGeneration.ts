import { getSentiment } from './sentiment';
import { getThemes } from './themes';

export interface TitleGenerationOptions {
  privacyMode: 'private' | 'gemini';
  text: string;
}

export interface GeneratedTitle {
  title: string;
  confidence: number;
  mode: 'private' | 'gemini';
}

// Private Mode: Generate titles locally using enhanced logic but keeping private branding
export function generateLocalTitles(text: string): GeneratedTitle[] {
  const sentiment = getSentiment(text);
  const themes = getThemes(text);
  
  // Use the enhanced logic but with private mode branding
  const enhancedTitle = generateEnhancedTitleSync(text, sentiment, themes);
  
  return [{
    title: enhancedTitle,
    confidence: 0.8,
    mode: 'private'
  }];
}

// Enhanced logic for local use (synchronous version)
function generateEnhancedTitleSync(text: string, sentiment: { score: number; label: string }, themes: string[]): string {
  const wordCount = text.split(/\s+/).length;
  
  // Title templates based on sentiment and themes (enhanced logic)
  const titleTemplates = {
    positive: {
      work: ['Career Highlights', 'Productive Day', 'Work Wins', 'Professional Growth', 'Career Success'],
      family: ['Family Joy', 'Home Sweet Home', 'Loved Ones', 'Family Moments', 'Home Happiness'],
      health: ['Feeling Strong', 'Wellness Journey', 'Healthy Choices', 'Health Wins', 'Fitness Success'],
      money: ['Financial Progress', 'Money Wins', 'Budget Success', 'Financial Growth', 'Money Matters'],
      relationships: ['Connection & Love', 'Friendship Moments', 'Social Joy', 'Relationship Wins', 'Social Success'],
      travel: ['Adventure Awaits', 'Wanderlust', 'Travel Dreams', 'Journey Joy', 'Adventure Time'],
      creativity: ['Creative Inspiration', 'Artistic Flow', 'Creative Breakthrough', 'Artistic Success', 'Creative Joy'],
      learning: ['Knowledge Gained', 'Learning Journey', 'Growth Mindset', 'Learning Success', 'Knowledge Wins'],
      technology: ['Tech Innovation', 'Digital Progress', 'Tech Solutions', 'Digital Success', 'Tech Wins'],
      general: ['Good Vibes', 'Positive Day', 'Grateful Moments', 'Happy Times', 'Joyful Day']
    },
    negative: {
      work: ['Work Challenges', 'Career Struggles', 'Professional Hurdles', 'Work Stress', 'Career Concerns'],
      family: ['Family Stress', 'Home Challenges', 'Family Concerns', 'Home Struggles', 'Family Issues'],
      health: ['Health Struggles', 'Wellness Challenges', 'Health Concerns', 'Fitness Struggles', 'Health Issues'],
      money: ['Financial Stress', 'Money Worries', 'Budget Challenges', 'Financial Concerns', 'Money Struggles'],
      relationships: ['Relationship Struggles', 'Social Challenges', 'Connection Issues', 'Social Stress', 'Relationship Concerns'],
      travel: ['Travel Disappointments', 'Journey Challenges', 'Adventure Setbacks', 'Travel Stress', 'Journey Concerns'],
      creativity: ['Creative Blocks', 'Artistic Struggles', 'Inspiration Drought', 'Creative Challenges', 'Artistic Concerns'],
      learning: ['Learning Challenges', 'Knowledge Gaps', 'Growth Struggles', 'Learning Stress', 'Knowledge Concerns'],
      technology: ['Tech Frustrations', 'Digital Challenges', 'Tech Problems', 'Digital Stress', 'Tech Concerns'],
      general: ['Tough Day', 'Challenging Times', 'Working Through It', 'Difficult Day', 'Struggling']
    },
    neutral: {
      work: ['Work Reflections', 'Career Thoughts', 'Professional Musings', 'Work Life', 'Career Contemplation'],
      family: ['Family Life', 'Home Thoughts', 'Family Reflections', 'Home Life', 'Family Contemplation'],
      health: ['Health & Wellness', 'Wellness Thoughts', 'Health Reflections', 'Health Life', 'Wellness Contemplation'],
      money: ['Financial Thoughts', 'Money Reflections', 'Budget Musings', 'Money Life', 'Financial Contemplation'],
      relationships: ['Relationship Thoughts', 'Social Reflections', 'Connection Musings', 'Social Life', 'Relationship Contemplation'],
      travel: ['Travel Thoughts', 'Adventure Musings', 'Journey Reflections', 'Travel Life', 'Adventure Contemplation'],
      creativity: ['Creative Thoughts', 'Artistic Musings', 'Creative Reflections', 'Artistic Life', 'Creative Contemplation'],
      learning: ['Learning Thoughts', 'Knowledge Musings', 'Growth Reflections', 'Learning Life', 'Knowledge Contemplation'],
      technology: ['Tech Thoughts', 'Digital Musings', 'Technology Reflections', 'Digital Life', 'Tech Contemplation'],
      general: ['Daily Reflections', 'Thoughts & Feelings', 'Processing My Day', 'Daily Life', 'Personal Contemplation']
    }
  };
  
  // Get the appropriate template based on sentiment
  const sentimentTemplates = titleTemplates[sentiment.label as keyof typeof titleTemplates];
  
  // Find the best theme match
  let primaryTheme = 'general';
  if (themes.length > 0) {
    primaryTheme = themes[0];
  }
  
  // Get templates for the primary theme
  const themeTemplates = sentimentTemplates[primaryTheme as keyof typeof sentimentTemplates] || sentimentTemplates.general;
  
  // Select a title based on word count and theme diversity
  let selectedTitle;
  if (wordCount > 100) {
    // Longer entries get more specific titles
    selectedTitle = themeTemplates[0];
  } else if (themes.length > 2) {
    // Multiple themes get balanced titles
    selectedTitle = themeTemplates[1];
  } else if (wordCount > 50) {
    // Medium entries get moderate titles
    selectedTitle = themeTemplates[2] || themeTemplates[0];
  } else {
    // Shorter entries get general titles
    selectedTitle = themeTemplates[3] || themeTemplates[0];
  }
  
  return selectedTitle;
}

// Gemini Mode: Use Google Gemini for intelligent, contextual titles
export async function generateGeminiTitles(text: string): Promise<GeneratedTitle[]> {
  const sentiment = getSentiment(text);
  const themes = getThemes(text);

  try {
    const response = await fetch('/api/generate-gemini-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sentiment,
        themes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini title generation failed: ${response.statusText}`);
    }

    const data = await response.json();

    return [{
      title: data.title,
      confidence: 0.9,
      mode: 'gemini' as const,
    }];
  } catch (error) {
    console.error('Gemini title generation failed:', error);
    // Fallback to local generation
    const localTitles = generateLocalTitles(text);
    return localTitles;
  }
}


// Main function to generate titles based on privacy mode
export async function generateTitles(options: TitleGenerationOptions): Promise<GeneratedTitle[]> {
  if (options.privacyMode === 'private') {
    return generateLocalTitles(options.text);
  } else {
    return generateGeminiTitles(options.text);
  }
}
