"use client"

import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { listEntries, type Entry } from "@/lib/storage/entries"
import { usePrivacyPreferences } from "@/hooks/usePrivacyPreferences"
import { 
  Brain, 
  Shield, 
  RefreshCw,
  Lightbulb,
  TrendingUp,
  Heart,
  Target,
  BookOpen,
  BarChart3,
  Info,
  Sparkles
} from 'lucide-react'
import SentimentLineChart from '@/components/SentimentLineChart'
import ThemeCalendar from '@/components/ThemeCalendar'

// ----------------------
// Progress Calculation Types
// ----------------------
type PlantStage = "seed" | "sprout" | "sapling" | "bloom";

interface ProgressData {
  totalPoints: number;
  currentStreak: number;
  nextMilestone: number;
  plantStage: PlantStage | null;
  monthlyData: Array<{ month: string; sentiment: number }>;
  gardenCollection: Array<{ id: number; title: string; date: string; points: number; stage: PlantStage }>;
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
  mode: 'private' | 'gemini';
  generatedAt: string;
  error?: string;
}

interface GardenMilestone {
  stage: PlantStage;
  points: number;
  date: number | null; // timestamp when achieved, null if not yet achieved
}

// ----------------------
// Progress Calculation Functions
// ----------------------

/**
 * Calculate total points (5 points per entry)
 */
function calculateTotalPoints(entries: Entry[]): number {
  return entries.length * 5;
}

/**
 * Calculate longest streak in the last 30 days
 */
function calculateLongestStreakLast30Days(entries: Entry[]): number {
  if (entries.length === 0) return 0;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Get unique days with entries in the last 30 days
  const daysWithEntries = new Set<string>();
  entries.forEach(entry => {
    const date = new Date(entry.createdAt);
    if (date >= thirtyDaysAgo) {
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      daysWithEntries.add(dayKey);
    }
  });

  if (daysWithEntries.size === 0) return 0;

  // Convert to array and sort by date (oldest first)
  const sortedDays = Array.from(daysWithEntries)
    .map(dayKey => {
      const [year, month, date] = dayKey.split('-').map(Number);
      return new Date(year, month, date).getTime();
    })
    .sort((a, b) => a - b);

  // Find the longest consecutive streak
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const dayDiff = (sortedDays[i] - sortedDays[i - 1]) / (24 * 60 * 60 * 1000);
    
    if (dayDiff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  // Check the final streak
  longestStreak = Math.max(longestStreak, currentStreak);

  return longestStreak;
}

/**
 * Calculate plant stage based on total points
 */
function calculatePlantStage(totalPoints: number): PlantStage | null {
  if (totalPoints >= 60) return "bloom";
  if (totalPoints >= 30) return "sapling";
  if (totalPoints >= 15) return "sprout";
  if (totalPoints >= 5) return "seed";
  return null;
}

/**
 * Calculate next milestone
 */
function calculateNextMilestone(totalPoints: number): number {
  const thresholds = [5, 15, 30, 60, 100];
  const nextThreshold = thresholds.find(threshold => totalPoints < threshold);
  return nextThreshold || totalPoints + 20;
}

/**
 * Calculate monthly sentiment data for the last 2-3 months
 */
function calculateMonthlySentiment(entries: Entry[]): Array<{ month: string; sentiment: number }> {
  if (entries.length === 0) return [];

  // Group entries by month
  const monthlyGroups = new Map<string, Entry[]>();
  
  entries.forEach(entry => {
    const date = new Date(entry.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, []);
    }
    monthlyGroups.get(monthKey)!.push(entry);
  });

  // Convert to array and sort by date (newest first)
  const monthlyData = Array.from(monthlyGroups.entries())
    .map(([monthKey, monthEntries]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const date = new Date(year, month, 1);
      
      // Calculate average sentiment (convert labels to numeric scores)
      const sentimentScores = monthEntries.map(entry => {
        if (entry.sentiment.score !== undefined) {
          return entry.sentiment.score;
        }
        // Fallback to label-based scoring
        switch (entry.sentiment.label) {
          case "positive": return 0.6;
          case "negative": return -0.6;
          default: return 0;
        }
      });
      
      const avgSentiment = sentimentScores.length > 0 
        ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
        : 0;
      
      // Convert to 1-5 scale (assuming -1 to 1 range)
      const normalizedSentiment = Math.max(1, Math.min(5, (avgSentiment + 1) * 2.5));
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'long' }),
        sentiment: Math.round(normalizedSentiment * 10) / 10
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.month + " 1");
      const dateB = new Date(b.month + " 1");
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3); // Last 3 months

  return monthlyData;
}

/**
 * Calculate garden collection milestones
 */
function calculateGardenCollection(entries: Entry[]): Array<{ id: number; title: string; date: string; points: number; stage: PlantStage }> {
  const milestones: GardenMilestone[] = [
    { stage: "seed", points: 5, date: null },
    { stage: "sprout", points: 15, date: null },
    { stage: "sapling", points: 30, date: null },
    { stage: "bloom", points: 60, date: null }
  ];

  // Sort entries by date to find when each milestone was crossed
  const sortedEntries = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  
  let cumulativePoints = 0;
  
  for (const entry of sortedEntries) {
    cumulativePoints += 5; // 5 points per entry
    
    // Check if any milestone was crossed
    for (const milestone of milestones) {
      if (milestone.date === null && cumulativePoints >= milestone.points) {
        milestone.date = entry.createdAt;
      }
    }
  }

  // Convert to garden collection format
  return milestones
    .filter(milestone => milestone.date !== null)
    .map((milestone, index) => ({
      id: index + 1,
      title: milestone.stage.charAt(0).toUpperCase() + milestone.stage.slice(1),
      date: new Date(milestone.date!).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      points: milestone.points,
      stage: milestone.stage
    }));
}


/**
 * Calculate all progress data
 */
function calculateProgressData(entries: Entry[]): ProgressData {
  const totalPoints = calculateTotalPoints(entries);
  const currentStreak = calculateLongestStreakLast30Days(entries);
  const nextMilestone = calculateNextMilestone(totalPoints);
  const plantStage = calculatePlantStage(totalPoints);
  const monthlyData = calculateMonthlySentiment(entries);
  const gardenCollection = calculateGardenCollection(entries);

  return {
    totalPoints,
    currentStreak,
    nextMilestone,
    plantStage,
    monthlyData,
    gardenCollection
  };
}

// ----------------------
// Insight Icons
// ----------------------
const insightIcons = {
  growth: TrendingUp,
  pattern: BarChart3,
  theme: BookOpen,
  consistency: Target,
  reflection: Lightbulb
};

// ----------------------
// Helpers
// ----------------------
function getPlantIcon(stage: "seed" | "sprout" | "sapling" | "bloom") {
  switch (stage) {
    case "seed":
      return <div className="w-8 h-8 bg-amber-200 rounded-full" />
    case "sprout":
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
          🌱
        </div>
      )
    case "sapling":
      return (
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
          🌿
        </div>
      )
    case "bloom":
      return (
        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">
          🌸
        </div>
      )
    default:
      return <div className="w-8 h-8 bg-gray-200 rounded-full" />
  }
}

function getPlantStageText(stage: "seed" | "sprout" | "sapling" | "bloom") {
  switch (stage) {
    case "seed":
      return "Your journey begins with a single seed"
    case "sprout":
      return "Keep watering your garden — every entry grows your roots"
    case "sapling":
      return "Your consistency is growing into something beautiful"
    case "bloom":
      return "You've cultivated a thriving garden of reflection"
    default:
      return "Plant your first seed with an entry"
  }
}

export default function HomePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyInsights, setMonthlyInsights] = useState<MonthlyInsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const { preferences, updateWeeklyInsightsMode, updateMonthlyInsightsMode } = usePrivacyPreferences();

  // Load entries on mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const allEntries = await listEntries();
        setEntries(allEntries);
      } catch (error) {
        console.error('Failed to load entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Generate monthly insights
  const generateMonthlyInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch('/api/generate-monthly-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries,
          mode: preferences.monthlyInsightsMode // Use dedicated monthly insights mode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setMonthlyInsights(data);
    } catch (err) {
      console.error('Error generating monthly insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Calculate progress data from real entries
  const progressData = useMemo(() => calculateProgressData(entries), [entries]);

  // Calculate top themes from entries
  const topThemes = useMemo(() => {
    if (entries.length === 0) return [];
    
    const themeCounts = new Map<string, number>();
    entries.forEach(entry => {
      if (entry.themes && entry.themes.length > 0) {
        entry.themes.forEach(theme => {
          themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
        });
      }
    });
    
    return Array.from(themeCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([theme, count]) => ({ theme, count }));
  }, [entries]);
  
  const progressPercentage = progressData.nextMilestone > 0 
    ? (progressData.totalPoints / progressData.nextMilestone) * 100 
    : 0;

  const hasMonthlyData = progressData.monthlyData.length >= 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">My Progress</h1>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Private Mode: On
          </Badge>
        </div>

        {/* Growth Journey */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Your Growth Journey</CardTitle>
            <CardDescription>Track your progress and watch your garden flourish</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-emerald-100 rounded-3xl flex items-center justify-center">
                {progressData.plantStage ? (
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl">
                    {progressData.plantStage === "seed" && "🌱"}
                    {progressData.plantStage === "sprout" && "🌱"}
                    {progressData.plantStage === "sapling" && "🌿"}
                    {progressData.plantStage === "bloom" && "🌸"}
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-white text-2xl">
                    🌱
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="font-semibold text-gray-900 capitalize text-lg">
                {progressData.plantStage || "No Stage"}
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {progressData.plantStage ? getPlantStageText(progressData.plantStage) : "Your garden is ready for its first seed."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{progressData.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-xs text-gray-500">days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{progressData.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>

            {progressData.totalPoints > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next milestone: {progressData.nextMilestone} pts</span>
                  <span className="text-gray-600">
                    {progressData.totalPoints}/{progressData.nextMilestone}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last 30 Days Overview */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Last 30 Days Overview</CardTitle>
            <CardDescription>Track your emotional journey and daily themes over the past month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {entries.length}
                </div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600 mb-1">
                  {topThemes.length > 0 ? topThemes[0].theme : '—'}
                </div>
                <div className="text-sm text-gray-600">Top Theme</div>
                {topThemes.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {topThemes[0].count} mentions
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {progressData.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Longest Streak</div>
                <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SentimentLineChart 
                data={(() => {
                  // Create data for last 30 days, including days with no entries
                  const last30Days = [];
                  const now = new Date();
                  
                  for (let i = 29; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Find entry for this date
                    const entryForDate = entries.find(entry => {
                      const entryDate = new Date(entry.createdAt);
                      return entryDate.toISOString().split('T')[0] === dateStr;
                    });
                    
                    if (entryForDate) {
                      last30Days.push({
                        date: dateStr,
                        sentiment: entryForDate.sentiment.score !== undefined ? entryForDate.sentiment.score : 
                          (entryForDate.sentiment.label === 'positive' ? 0.6 : 
                           entryForDate.sentiment.label === 'negative' ? -0.6 : 0),
                        entries: 1
                      });
                    } else {
                      // No entry for this day - use neutral sentiment
                      last30Days.push({
                        date: dateStr,
                        sentiment: 0,
                        entries: 0
                      });
                    }
                  }
                  
                  return last30Days;
                })()}
                className="h-64"
              />
              <ThemeCalendar 
                data={(() => {
                  // Create data for last 30 days, including days with no entries
                  const last30Days = [];
                  const now = new Date();
                  
                  for (let i = 29; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Find entry for this date
                    const entryForDate = entries.find(entry => {
                      const entryDate = new Date(entry.createdAt);
                      return entryDate.toISOString().split('T')[0] === dateStr;
                    });
                    
                    if (entryForDate) {
                      last30Days.push({
                        date: dateStr,
                        themes: entryForDate.themes || [],
                        hasEntry: true
                      });
                    } else {
                      // No entry for this day
                      last30Days.push({
                        date: dateStr,
                        themes: [],
                        hasEntry: false
                      });
                    }
                  }
                  
                  return last30Days;
                })()}
                className="h-64"
              />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Monthly Reflection</CardTitle>
                <CardDescription>Holistic insights from your journey this past month</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Privacy Mode:</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label="Privacy info"
                        className="w-5 h-5 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-full border border-gray-300 flex items-center justify-center"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        <strong>Private Mode:</strong> All analysis happens locally on your device.<br/>
                        <strong>AI Enhanced Mode:</strong> Uses Google Gemini with anonymized data only.<br/>
                        Your actual journal data is stored locally and never leaves your device.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    onClick={() => updateWeeklyInsightsMode('private')}
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 text-xs rounded-md ${
                      preferences.weeklyInsightsMode === 'private'
                        ? 'bg-white shadow-sm text-emerald-700'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="Local analysis - completely private"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Private
                  </Button>
                  <Button
                    onClick={() => updateWeeklyInsightsMode('gemini')}
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 text-xs rounded-md ${
                      preferences.weeklyInsightsMode === 'gemini'
                        ? 'bg-white shadow-sm text-emerald-700'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="AI-powered insights using Google Gemini"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!monthlyInsights ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Discover patterns and insights from your monthly writing journey</p>
                <Button 
                  onClick={generateMonthlyInsights} 
                  disabled={insightsLoading || entries.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {insightsLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze This Month
                    </>
                  )}
                </Button>
              </div>
            ) : monthlyInsights.insights.length > 0 ? (
              <>
                {/* Mentor-like Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monthlyInsights.insights.map((insight, index) => {
                    const Icon = insightIcons[insight.type] || Lightbulb;
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow border border-gray-100">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-emerald-600" />
                              <div>
                                <div className="text-sm font-bold text-emerald-700 mb-1">
                                  {insight.takeaway}
                                </div>
                                <CardTitle className="text-sm text-gray-900">{insight.title}</CardTitle>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(insight.confidence * 100)}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-xs text-gray-700">{insight.description}</p>
                          {insight.actionable && (
                            <div className="bg-emerald-50 p-2 rounded-lg border-l-4 border-emerald-400">
                              <div className="flex items-start gap-2">
                                <Target className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-emerald-800 font-medium">
                                  {insight.actionable}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>



                {/* Forward-Looking Reflection Prompt */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-emerald-600 text-sm">🌱</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-gray-700 leading-relaxed">
                            As you reflect on this month's journey, what small habit or insight would you like to carry forward into next month?
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            Consider what patterns served you well and what you'd like to nurture further.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-500">Privacy Mode:</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  aria-label="Privacy info"
                                  className="w-4 h-4 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-full border border-gray-300 flex items-center justify-center"
                                >
                                  <Info className="w-2.5 h-2.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm max-w-xs">
                                  <strong>Private Mode:</strong> All analysis happens locally on your device.<br/>
                                  <strong>AI Enhanced Mode:</strong> Uses Google Gemini with anonymized data only.<br/>
                                  Your actual journal data is stored locally and never leaves your device.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex bg-gray-100 rounded-lg p-1">
                            <Button
                              onClick={() => updateMonthlyInsightsMode('private')}
                              variant="ghost"
                              size="sm"
                              className={`px-2 py-1 text-xs rounded-md ${
                                preferences.monthlyInsightsMode === 'private'
                                  ? 'bg-white shadow-sm text-emerald-700'
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                              title="Local analysis - completely private"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Private
                            </Button>
                            <Button
                              onClick={() => updateMonthlyInsightsMode('gemini')}
                              variant="ghost"
                              size="sm"
                              className={`px-2 py-1 text-xs rounded-md ${
                                preferences.monthlyInsightsMode === 'gemini'
                                  ? 'bg-white shadow-sm text-emerald-700'
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                              title="AI-powered insights using Google Gemini"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Enhanced
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                          <Link href="/create?prompt=monthly-reflection">Add Monthly Reflection</Link>
                        </Button>
                        <Button 
                          onClick={generateMonthlyInsights} 
                          variant="outline"
                          disabled={insightsLoading}
                          size="sm"
                          className="rounded-xl"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${insightsLoading ? 'animate-spin' : ''}`} />
                          Refresh Analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Empty State
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white">🌙</div>
                </div>
                <div>
                  <p className="text-gray-600">
                    Your monthly reflection will emerge once you've cultivated a few weeks of entries.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Each entry you write contributes to a deeper understanding of your journey.
                  </p>
                  <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                    <Link href="/create">Begin Your Journey</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Garden */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">My Garden</CardTitle>
            <CardDescription>Your collection of grown plants</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.gardenCollection.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.gardenCollection.map((plant) => (
                  <Card key={plant.id} className="border border-gray-200">
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                        {getPlantIcon(plant.stage)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{plant.title}</div>
                        <div className="text-sm text-gray-600">Earned on {plant.date}</div>
                        <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700">
                          {plant.points} pts
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Show next plant if there are more milestones to reach */}
                {progressData.totalPoints < 100 && (
                  <Card className="border border-dashed border-gray-300 opacity-50">
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                        <div className="w-6 h-6 bg-gray-300 rounded-full" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-400">Next Plant</div>
                        <div className="text-sm text-gray-400">
                          {progressData.nextMilestone - progressData.totalPoints} more points to unlock
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white">🌳</div>
                </div>
                <div>
                  <p className="text-gray-600">Your garden is ready for its first seed.</p>
                  <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/create">Create your first entry</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA - Mobile Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4 lg:hidden">
        <div className="flex gap-3 max-w-sm mx-auto">
          <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-2xl">
            <Link href="/create">Journal Now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl bg-transparent"
          >
            <Link href="/library">View Journals</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
