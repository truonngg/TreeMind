import { NextRequest, NextResponse } from 'next/server';
import { Entry } from '@/lib/storage/entries';

interface MonthlyInsightsRequest {
  entries: Entry[];
  mode: 'private' | 'gemini';
}

interface MonthlyInsight {
  type: 'growth' | 'pattern' | 'theme' | 'consistency' | 'reflection';
  takeaway: string; // 1-2 word encouraging label
  title: string;
  description: string;
  actionable?: string;
  confidence: number; // 0-1 scale
}

interface MonthlyInsightsData {
  insights: MonthlyInsight[];
  monthlyStats: {
    totalEntries: number;
    averageSentiment: number;
    topThemes: Array<{ theme: string; count: number }>;
    weeklyPatterns: Array<{ week: number; entries: number; sentiment: number }>;
    sentimentOverTime: Array<{ date: string; sentiment: number; entries: number }>;
    dailyThemes: Array<{ date: string; themes: string[]; hasEntry: boolean }>;
    growthMetrics: {
      entriesVsLastMonth: number;
      sentimentTrend: 'improving' | 'stable' | 'declining';
      highestStreak: number;
    };
  };
}

/**
 * Calculate monthly insights with mentor-like tone (private mode)
 * Now works with last 30 days instead of monthly grouping
 */
function calculatePrivateMonthlyInsights(entries: Entry[]): MonthlyInsightsData {
  if (entries.length === 0) {
    return {
      insights: [],
      monthlyStats: {
        totalEntries: 0,
        averageSentiment: 0,
        topThemes: [],
        weeklyPatterns: [],
        sentimentOverTime: [],
        dailyThemes: [],
        growthMetrics: {
          entriesVsLastMonth: 0,
          sentimentTrend: 'stable',
          highestStreak: 0
        }
      }
    };
  }

  // Get last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  // Filter entries to last 30 days
  const last30DaysEntries = entries.filter(entry => 
    new Date(entry.createdAt) >= thirtyDaysAgo
  );

  // Get entries from previous 30 days for comparison
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
  const previous30DaysEntries = entries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    return entryDate >= sixtyDaysAgo && entryDate < thirtyDaysAgo;
  });

  if (last30DaysEntries.length === 0) {
    return {
      insights: [],
      monthlyStats: {
        totalEntries: 0,
        averageSentiment: 0,
        topThemes: [],
        weeklyPatterns: [],
        sentimentOverTime: [],
        dailyThemes: [],
        growthMetrics: {
          entriesVsLastMonth: 0,
          sentimentTrend: 'stable',
          highestStreak: 0
        }
      }
    };
  }

  const currentMonthEntries = last30DaysEntries;
  const previousMonthEntries = previous30DaysEntries;

  // Calculate current month stats
  const totalEntries = currentMonthEntries.length;
  const averageSentiment = currentMonthEntries.reduce((sum, entry) => {
    const score = entry.sentiment.score !== undefined 
      ? entry.sentiment.score 
      : (entry.sentiment.label === 'positive' ? 0.6 : entry.sentiment.label === 'negative' ? -0.6 : 0);
    return sum + score;
  }, 0) / totalEntries;

  // Top themes
  const themeCounts = new Map<string, number>();
  currentMonthEntries.forEach(entry => {
    entry.themes.forEach(theme => {
      themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
    });
  });
  const topThemes = Array.from(themeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme, count]) => ({ theme, count }));

  // Weekly patterns (divide last 30 days into 4 weeks)
  const weeklyPatterns = [];
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(thirtyDaysAgo);
    weekStart.setDate(weekStart.getDate() + (week * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekEntries = currentMonthEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    const weekSentiment = weekEntries.length > 0 
      ? weekEntries.reduce((sum, entry) => {
          const score = entry.sentiment.score !== undefined 
            ? entry.sentiment.score 
            : (entry.sentiment.label === 'positive' ? 0.6 : entry.sentiment.label === 'negative' ? -0.6 : 0);
          return sum + score;
        }, 0) / weekEntries.length
      : 0;

    weeklyPatterns.push({
      week: week + 1,
      entries: weekEntries.length,
      sentiment: weekSentiment
    });
  }

  // Sentiment over time (daily data for last 30 days)
  const sentimentOverTime = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEntries = currentMonthEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= dayStart && entryDate <= dayEnd;
    });

    const daySentiment = dayEntries.length > 0 
      ? dayEntries.reduce((sum, entry) => {
          const score = entry.sentiment.score !== undefined 
            ? entry.sentiment.score 
            : (entry.sentiment.label === 'positive' ? 0.6 : entry.sentiment.label === 'negative' ? -0.6 : 0);
          return sum + score;
        }, 0) / dayEntries.length
      : 0;

    sentimentOverTime.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      sentiment: daySentiment,
      entries: dayEntries.length
    });
  }

  // Daily themes (for calendar view)
  const dailyThemes = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEntries = currentMonthEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= dayStart && entryDate <= dayEnd;
    });

    const allThemes = dayEntries.flatMap(entry => entry.themes);
    const uniqueThemes = [...new Set(allThemes)];

    dailyThemes.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      themes: uniqueThemes,
      hasEntry: dayEntries.length > 0
    });
  }

  // Growth metrics
  const entriesVsLastMonth = previousMonthEntries.length > 0 
    ? totalEntries - previousMonthEntries.length 
    : totalEntries;

  const previousMonthSentiment = previousMonthEntries.length > 0
    ? previousMonthEntries.reduce((sum, entry) => {
        const score = entry.sentiment.score !== undefined 
          ? entry.sentiment.score 
          : (entry.sentiment.label === 'positive' ? 0.6 : entry.sentiment.label === 'negative' ? -0.6 : 0);
        return sum + score;
      }, 0) / previousMonthEntries.length
    : 0;

  const sentimentTrend = averageSentiment > previousMonthSentiment + 0.1 ? 'improving' :
                        averageSentiment < previousMonthSentiment - 0.1 ? 'declining' : 'stable';

  // Calculate highest streak of the last 30 days
  const daysWithEntries = new Set();
  currentMonthEntries.forEach(entry => {
    const day = new Date(entry.createdAt).toISOString().split('T')[0];
    daysWithEntries.add(day);
  });

  // Convert to sorted array of days
  const sortedDays = Array.from(daysWithEntries)
    .map(day => new Date(day).getTime())
    .sort((a, b) => a - b);

  // Calculate longest streak
  let highestStreak = 0;
  let currentStreak = 0;
  let lastDay = 0;

  for (const day of sortedDays) {
    if (lastDay === 0 || day === lastDay + (24 * 60 * 60 * 1000)) {
      currentStreak++;
    } else {
      highestStreak = Math.max(highestStreak, currentStreak);
      currentStreak = 1;
    }
    lastDay = day;
  }
  highestStreak = Math.max(highestStreak, currentStreak);

  // Generate private insights with takeaway labels
  const insights: MonthlyInsight[] = [];

  // Entry count insights
  if (entriesVsLastMonth > 0) {
    insights.push({
      type: 'growth',
      takeaway: 'Growing Stronger!',
      title: 'Deepening Practice',
      description: `You've written ${totalEntries} entries this month — ${entriesVsLastMonth} more than last month. Your reflection practice is deepening.`,
      actionable: 'Consider what\'s driving this increased reflection and how to maintain this momentum.',
      confidence: 0.9
    });
  } else if (entriesVsLastMonth < 0) {
    insights.push({
      type: 'growth',
      takeaway: 'Quality Over Quantity',
      title: 'Steady Growth',
      description: `You wrote ${totalEntries} entries this month. While fewer than last month, each entry still contributes to your growth.`,
      actionable: 'Focus on the quality of your reflections rather than the quantity.',
      confidence: 0.8
    });
  } else {
    insights.push({
      type: 'consistency',
      takeaway: 'Steady Rhythm',
      title: 'Consistent Practice',
      description: `You've maintained a steady rhythm with ${totalEntries} entries this month. Consistency is its own kind of wisdom.`,
      actionable: 'Your steady approach is building a strong foundation for deeper insights.',
      confidence: 0.8
    });
  }

  // Sentiment insights
  if (sentimentTrend === 'improving') {
    insights.push({
      type: 'growth',
      takeaway: 'Brighter Days!',
      title: 'Emotional Growth',
      description: `Your emotional landscape has brightened compared to last month. This shift suggests you're finding more balance and perspective.`,
      actionable: 'Reflect on what changes contributed to this positive shift and how to nurture them.',
      confidence: 0.9
    });
  } else if (sentimentTrend === 'declining') {
    insights.push({
      type: 'reflection',
      takeaway: 'Growth Through Challenge',
      title: 'Navigating Difficult Times',
      description: `This month brought more challenging moments. Remember that difficult periods often precede significant growth.`,
      actionable: 'Consider what support systems or coping strategies might help during tough times.',
      confidence: 0.8
    });
  } else {
    insights.push({
      type: 'pattern',
      takeaway: 'Stable Foundation',
      title: 'Emotional Stability',
      description: `Your emotional state has remained steady this month. Stability can be a foundation for deeper exploration.`,
      actionable: 'Use this stable period to explore new areas of reflection or personal growth.',
      confidence: 0.7
    });
  }

  // Theme insights
  if (topThemes.length > 0) {
    const topTheme = topThemes[0];
    insights.push({
      type: 'theme',
      takeaway: `${topTheme.theme.charAt(0).toUpperCase() + topTheme.theme.slice(1)} Focus!`,
      title: 'Thematic Concentration',
      description: `Your thoughts have centered around ${topTheme.theme} this month. This focus suggests an area of your life that's calling for attention.`,
      actionable: `Consider what this focus on ${topTheme.theme} is telling you about your current priorities.`,
      confidence: 0.8
    });
  }

  // Weekly pattern insights
  const mostActiveWeek = weeklyPatterns.reduce((max, week) => week.entries > max.entries ? week : max);
  const leastActiveWeek = weeklyPatterns.reduce((min, week) => week.entries < min.entries ? week : min);
  
  if (mostActiveWeek.entries > 0 && leastActiveWeek.entries < mostActiveWeek.entries) {
    insights.push({
      type: 'pattern',
      takeaway: 'Natural Rhythms',
      title: 'Weekly Patterns',
      description: `Week ${mostActiveWeek.week} was your most reflective period, while Week ${leastActiveWeek.week} was quieter. These rhythms are natural and valuable.`,
      actionable: `Notice what conditions made Week ${mostActiveWeek.week} more conducive to reflection.`,
      confidence: 0.7
    });
  }

  // Streak insights
  if (highestStreak >= 7) {
    insights.push({
      type: 'consistency',
      takeaway: 'Remarkable Streak!',
      title: 'Exceptional Momentum',
      description: `Your longest streak this month was ${highestStreak} days. This sustained momentum is building something beautiful.`,
      actionable: 'Your consistent practice is creating a powerful habit that will serve you well.',
      confidence: 0.9
    });
  } else if (highestStreak >= 3) {
    insights.push({
      type: 'consistency',
      takeaway: 'Building Momentum',
      title: 'Growing Rhythm',
      description: `Your longest streak this month was ${highestStreak} days. You're finding a rhythm that works for you.`,
      actionable: 'Continue building on this momentum while honoring your natural pace.',
      confidence: 0.8
    });
  } else if (highestStreak > 0) {
    insights.push({
      type: 'growth',
      takeaway: 'Every Day Counts!',
      title: 'Growing Foundation',
      description: `Your longest streak this month was ${highestStreak} day${highestStreak > 1 ? 's' : ''}. Each entry you write plants a seed for future growth.`,
      actionable: 'Consider what would make journaling feel more natural and sustainable for you.',
      confidence: 0.7
    });
  }

  return {
    insights,
    monthlyStats: {
      totalEntries,
      averageSentiment,
      topThemes,
      weeklyPatterns,
      sentimentOverTime,
      dailyThemes,
      growthMetrics: {
        entriesVsLastMonth,
        sentimentTrend,
        highestStreak
      }
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: MonthlyInsightsRequest = await request.json();
    
    // Validate request data
    if (!data.entries || !Array.isArray(data.entries) || !data.mode) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Always start with private insights as base
    const privateInsights = calculatePrivateMonthlyInsights(data.entries);

    // If private mode, return private insights only
    if (data.mode === 'private') {
      return NextResponse.json({
        ...privateInsights,
        mode: 'private',
        generatedAt: new Date().toISOString()
      });
    }

    // For Gemini mode, enhance with AI insights
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Fallback to private insights if Gemini not configured
      return NextResponse.json({
        ...privateInsights,
        mode: 'private',
        error: 'Gemini API key not configured, using private insights',
        generatedAt: new Date().toISOString()
      });
    }

    // Prepare anonymized data for Gemini (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const currentMonthEntries = data.entries.filter(entry => 
      new Date(entry.createdAt) >= thirtyDaysAgo
    );

    if (currentMonthEntries.length === 0) {
      return NextResponse.json({
        ...privateInsights,
        mode: 'gemini',
        generatedAt: new Date().toISOString()
      });
    }

    // Create anonymized summary for Gemini (no personal details)
    const anonymizedData = {
      totalEntries: privateInsights.monthlyStats.totalEntries,
      topThemes: privateInsights.monthlyStats.topThemes,
      sentimentTrend: privateInsights.monthlyStats.growthMetrics.sentimentTrend,
      highestStreak: privateInsights.monthlyStats.growthMetrics.highestStreak,
      entriesVsLastMonth: privateInsights.monthlyStats.growthMetrics.entriesVsLastMonth,
      weeklyPatterns: privateInsights.monthlyStats.weeklyPatterns,
      // Only include themes and sentiment, not actual text content
      entryThemes: currentMonthEntries.map(entry => ({
        themes: entry.themes,
        sentiment: entry.sentiment.label,
        dayOfWeek: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long' })
      }))
    };

    const prompt = `Based on this user's monthly journaling data, generate 2-3 personalized, mentor-like insights that help them understand their growth journey and patterns over the past month.

Monthly Data:
- Total entries: ${anonymizedData.totalEntries}
- Top themes: ${anonymizedData.topThemes.map(t => `${t.theme} (${t.count} mentions)`).join(', ')}
- Sentiment trend: ${anonymizedData.sentimentTrend}
- Highest streak: ${anonymizedData.highestStreak} days
- Growth: ${anonymizedData.entriesVsLastMonth > 0 ? '+' : ''}${anonymizedData.entriesVsLastMonth} entries vs last month
- Weekly patterns: ${anonymizedData.weeklyPatterns.map(w => `Week ${w.week}: ${w.entries} entries`).join(', ')}
- Daily patterns: ${anonymizedData.entryThemes.map(e => `${e.dayOfWeek}: ${e.sentiment} mood, themes: ${e.themes.join(', ')}`).join('; ')}

Requirements:
- Generate 2 insights maximum
- Each insight should be mentor-like, holistic, and forward-looking
- Focus on growth patterns, life themes, and gentle guidance
- Tone should be wise, supportive, and encouraging like a mentor
- Provide specific, actionable advice when possible
- Avoid generic advice - make it specific to their data
- Return as JSON array with this exact structure:
[
  {
    "type": "growth|pattern|theme|consistency|reflection",
    "takeaway": "1-2 word encouraging label (e.g., 'Growing Stronger!', 'Work Can Wait', 'Exercise!')",
    "title": "Brief insight title",
    "description": "Detailed explanation of the insight",
    "actionable": "Specific action or reflection suggestion",
    "confidence": 0.8
  }
]

Examples of good insights:
- "Exercise! Exercise! Exercise! It seems like the days you exercise, you have a brighter mood and more energy for reflection."
- "Work Can Wait. You've found that work-related issues persist across weekends, suggesting a need for better boundaries."
- "Growing Stronger! Your consistency has improved this month, showing real commitment to your personal growth journey."

Examples to avoid:
- Generic advice like "Try to be more consistent"
- Vague suggestions without specific actions
- Judgmental language about their feelings or choices`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.9,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      
      // Handle quota exceeded gracefully
      if (response.status === 429) {
        return NextResponse.json({
          ...privateInsights,
          mode: 'private',
          error: 'API quota exceeded, using private insights',
          generatedAt: new Date().toISOString()
        });
      }
      
      // Fallback to private insights
      return NextResponse.json({
        ...privateInsights,
        mode: 'private',
        error: 'AI insights generation failed, using private insights',
        generatedAt: new Date().toISOString()
      });
    }

    const geminiResponse = await response.json();
    const content = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content received from Gemini');
    }

    // Parse the JSON response
    let aiInsights;
    try {
      // Clean the response to extract JSON
      const cleanContent = content.trim()
        .replace(/^```json|```$/g, '') // Remove markdown code blocks
        .replace(/^```|```$/g, '') // Remove code blocks
        .trim();
      
      aiInsights = JSON.parse(cleanContent);
      
      // Validate the structure
      if (!Array.isArray(aiInsights)) {
        throw new Error('Invalid response format');
      }
      
      // Validate each insight
      aiInsights = aiInsights.filter(insight => 
        insight && 
        typeof insight.takeaway === 'string' &&
        typeof insight.title === 'string' && 
        typeof insight.description === 'string' &&
        insight.type &&
        typeof insight.confidence === 'number'
      );
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback to private insights
      return NextResponse.json({
        ...privateInsights,
        mode: 'private',
        error: 'Failed to parse AI insights, using private insights',
        generatedAt: new Date().toISOString()
      });
    }

    // Combine private insights with AI insights
    const combinedInsights = [
      ...privateInsights.insights.slice(0, 2), // Keep top 2 private insights
      ...aiInsights.slice(0, 3) // Add up to 3 AI insights
    ].slice(0, 5); // Limit to 5 total insights

    return NextResponse.json({
      ...privateInsights,
      insights: combinedInsights,
      mode: 'gemini',
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Monthly insights generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
