import { Entry } from '@/lib/storage/entries';

export interface WeeklyInsight {
  type: 'pattern' | 'theme' | 'sentiment' | 'progress' | 'reflection';
  title: string;
  description: string;
  actionable?: string;
  confidence: number; // 0-1 scale
}

export interface WeeklyInsightsData {
  weekStart: string;
  weekEnd: string;
  totalEntries: number;
  insights: WeeklyInsight[];
  topThemes: Array<{ theme: string; count: number; percentage: number }>;
  sentimentTrend: {
    positive: number;
    neutral: number;
    negative: number;
  };
  mostActiveDay: string;
  averageEntryLength: number;
}

/**
 * Get entries from the past week (7 days)
 */
export function getWeeklyEntries(entries: Entry[]): Entry[] {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return entries.filter(entry => entry.createdAt >= oneWeekAgo);
}

/**
 * Generate local insights without external API calls
 */
export function generateLocalWeeklyInsights(entries: Entry[]): WeeklyInsightsData {
  const weeklyEntries = getWeeklyEntries(entries);
  
  if (weeklyEntries.length === 0) {
    return {
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weekEnd: new Date().toISOString().split('T')[0],
      totalEntries: 0,
      insights: [],
      topThemes: [],
      sentimentTrend: { positive: 0, neutral: 0, negative: 0 },
      mostActiveDay: '',
      averageEntryLength: 0
    };
  }

  // Calculate date range
  const dates = weeklyEntries.map(e => new Date(e.createdAt));
  const weekStart = new Date(Math.min(...dates.map(d => d.getTime())));
  const weekEnd = new Date(Math.max(...dates.map(d => d.getTime())));

  // Analyze themes
  const allThemes = weeklyEntries.flatMap(entry => entry.themes);
  const themeCounts = allThemes.reduce((acc, theme) => {
    acc[theme] = (acc[theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topThemes = Object.entries(themeCounts)
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: Math.round((count / weeklyEntries.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Analyze sentiment trends
  const sentimentCounts = weeklyEntries.reduce((acc, entry) => {
    acc[entry.sentiment.label]++;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  const sentimentTrend = {
    positive: Math.round((sentimentCounts.positive / weeklyEntries.length) * 100),
    neutral: Math.round((sentimentCounts.neutral / weeklyEntries.length) * 100),
    negative: Math.round((sentimentCounts.negative / weeklyEntries.length) * 100)
  };

  // Find most active day
  const dayCounts = weeklyEntries.reduce((acc, entry) => {
    const day = new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveDay = Object.entries(dayCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

  // Calculate average entry length
  const averageEntryLength = Math.round(
    weeklyEntries.reduce((sum, entry) => sum + entry.text.length, 0) / weeklyEntries.length
  );

  // Generate insights
  const insights: WeeklyInsight[] = [];

  // Theme insights
  if (topThemes.length > 0) {
    const topTheme = topThemes[0];
    if (topTheme.percentage >= 50) {
      insights.push({
        type: 'theme',
        title: `Focused on ${topTheme.theme}`,
        description: `${topTheme.percentage}% of your entries this week were about ${topTheme.theme}.`,
        actionable: `Consider exploring other aspects of your life to maintain balance.`,
        confidence: 0.8
      });
    }
  }

  // Sentiment insights
  if (sentimentTrend.positive >= 70) {
    insights.push({
      type: 'sentiment',
      title: 'Positively Charged Week',
      description: `${sentimentTrend.positive}% of your entries had a positive tone this week.`,
      actionable: `Keep up the positive momentum! Consider what contributed to this upbeat week.`,
      confidence: 0.9
    });
  } else if (sentimentTrend.negative >= 50) {
    insights.push({
      type: 'sentiment',
      title: 'Challenging Week',
      description: `${sentimentTrend.negative}% of your entries reflected difficult times.`,
      actionable: `Consider what support systems or coping strategies might help.`,
      confidence: 0.8
    });
  }

  // Writing pattern insights
  if (weeklyEntries.length >= 5) {
    insights.push({
      type: 'pattern',
      title: 'Consistent Writing Habit',
      description: `You wrote ${weeklyEntries.length} entries this week, showing great consistency.`,
      actionable: `Your journaling habit is strong - keep it up!`,
      confidence: 0.9
    });
  } else if (weeklyEntries.length >= 3) {
    insights.push({
      type: 'pattern',
      title: 'Regular Reflection',
      description: `You wrote ${weeklyEntries.length} entries this week.`,
      actionable: `Consider setting a daily reminder to maintain this reflection practice.`,
      confidence: 0.7
    });
  }

  // Entry length insights
  if (averageEntryLength > 500) {
    insights.push({
      type: 'pattern',
      title: 'Deep Reflections',
      description: `Your entries averaged ${averageEntryLength} characters, showing thoughtful reflection.`,
      actionable: `Your detailed writing helps capture nuanced thoughts and feelings.`,
      confidence: 0.8
    });
  }

  // Day pattern insights
  if (mostActiveDay) {
    const dayCount = dayCounts[mostActiveDay];
    if (dayCount >= 2) {
      insights.push({
        type: 'pattern',
        title: `Most Active on ${mostActiveDay}s`,
        description: `You wrote ${dayCount} entries on ${mostActiveDay}s this week.`,
        actionable: `Consider what makes ${mostActiveDay}s a good day for reflection.`,
        confidence: 0.7
      });
    }
  }

  // Progress insights (compare with previous week if available)
  const previousWeekEntries = entries.filter(entry => {
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return entry.createdAt >= twoWeeksAgo && entry.createdAt < oneWeekAgo;
  });

  if (previousWeekEntries.length > 0) {
    const previousSentiment = previousWeekEntries.reduce((acc, entry) => {
      acc[entry.sentiment.label]++;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    const currentPositive = sentimentCounts.positive;
    const previousPositive = previousSentiment.positive;
    
    if (currentPositive > previousPositive) {
      insights.push({
        type: 'progress',
        title: 'Improving Mood',
        description: `You had more positive entries this week compared to last week.`,
        actionable: `Reflect on what changes contributed to this improvement.`,
        confidence: 0.8
      });
    }
  }

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    totalEntries: weeklyEntries.length,
    insights: insights.sort((a, b) => b.confidence - a.confidence),
    topThemes,
    sentimentTrend,
    mostActiveDay,
    averageEntryLength
  };
}
