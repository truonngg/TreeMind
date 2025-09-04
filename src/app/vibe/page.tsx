"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { listEntries, type Entry } from "@/lib/storage/entries";
import { usePrivacyPreferences } from "@/hooks/usePrivacyPreferences";
import { WeeklyInsightsData } from "@/lib/analysis/weeklyInsights";
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Lightbulb, 
  RefreshCw,
  Clock,
  Target,
  Heart,
  Zap,
  BookOpen,
  Info,
  Sparkles
} from 'lucide-react';

// Theme colors to match the library page tags
const themeColors: Record<string, string> = {
  work: "bg-purple-500",
  health: "bg-green-500", 
  relationships: "bg-pink-500",
  creativity: "bg-orange-500",
  school: "bg-indigo-500",
  money: "bg-yellow-500",
  learning: "bg-indigo-500", // map learning to school color
  technology: "bg-blue-500",
  family: "bg-yellow-500", // family now uses yellow color
  travel: "bg-cyan-500",
  general: "bg-gray-500"
};

// --- helpers ---
const DAY_MS = 24 * 60 * 60 * 1000;
const weekday = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue…

type DayPoint = { day: string; sentiment: number }; // -1..+1

const insightIcons = {
  pattern: BarChart3,
  theme: BookOpen,
  sentiment: Heart,
  progress: TrendingUp,
  reflection: Lightbulb
};

function clamp(n: number, min = -1, max = 1) {
  return Math.max(min, Math.min(max, n));
}

// naive mapping if you only store labels; tweak if you already store numeric score
function labelToScore(label?: string) {
  if (label === "positive") return 0.6;
  if (label === "negative") return -0.6;
  return 0; // neutral
}

export default function VibeCheckPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<WeeklyInsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const { preferences, updateWeeklyInsightsMode } = usePrivacyPreferences();

  useEffect(() => {
    (async () => {
      try {
        const all = await listEntries();
        setEntries(all || []);
      } catch (e) {
        console.error("Failed to load entries", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const generateAiInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch('/api/generate-weekly-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries,
          mode: preferences.weeklyInsightsMode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setAiInsights(data);
    } catch (err) {
      console.error('Error generating AI insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // last 7 days window (today inclusive)
  const { weekSeries, themeCounts, weeklyText, dateRange } = useMemo(() => {
    const now = new Date();
    const days: DayPoint[] = [];
    
    // Calculate date range for display
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateRange = {
      start: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    // build 7 days from oldest → newest
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(dayStart.getTime() - i * DAY_MS);
      const end = new Date(start.getTime() + DAY_MS);

      const dayEntries = entries.filter(
        (e) => e.createdAt >= start.getTime() && e.createdAt < end.getTime()
      );

      // average sentiment score for the day
      const scores = dayEntries.map((e) =>
        typeof (e as any).sentiment?.score === "number"
          ? (e as any).sentiment.score
          : labelToScore(e.sentiment?.label)
      );
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      days.push({ day: weekday(start), sentiment: clamp(avg) });
    }

    // theme frequency over the same 7 days
    const themeMap = new Map<string, number>();
    for (const e of entries) {
      // only count entries in the last 7 days
      if (e.createdAt >= Date.now() - 7 * DAY_MS) {
        (e.themes || []).forEach((t) => {
          themeMap.set(t, (themeMap.get(t) || 0) + 1);
        });
      }
    }

    const sortedThemes = [...themeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    // lightweight local weekly summary (privacy-safe)
    const posDays = days.filter((d) => d.sentiment > 0.2).length;
    const negDays = days.filter((d) => d.sentiment < -0.2).length;
    const topTheme = sortedThemes[0]?.theme;
    const secondTheme = sortedThemes[1]?.theme;

    const copy =
      entries.length === 0
        ? "Add a few entries this week to see your vibe trends here."
        : [
            `You balanced ups and downs this week${negDays ? ` (${negDays} tougher ${negDays === 1 ? "day" : "days"})` : ""}.`,
            topTheme ? ` ${capitalize(topTheme)} came up most often` : "",
            secondTheme ? `, followed by ${secondTheme}.` : ".",
            posDays ? ` You noted several brighter moments (${posDays} days).` : "",
          ].join("");

    return { weekSeries: days, themeCounts: sortedThemes, weeklyText: copy.trim(), dateRange };
  }, [entries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 flex items-center justify-center">
        <p className="text-gray-600">Loading your vibe…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">This Week&apos;s Vibe Check</h1>
            <p className="text-sm text-gray-600 mt-1">
              Analyzing entries from {dateRange.start} to {dateRange.end}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {entries.length === 0 ? (
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-gray-700">No entries yet this week.</p>
              <Link
                href="/create"
                className="inline-flex items-center rounded-2xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                Create your first entry
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Trend */}
              <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Sentiment Trend</CardTitle>
                  <CardDescription>Your emotional journey this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64 p-4">
                    <div className="flex items-end justify-between h-full space-x-2">
                      {weekSeries.map((d) => {
                        const height = ((d.sentiment + 1) / 2) * 100; // -1..+1 → 0..100
                        const color =
                          d.sentiment > 0.3
                            ? "bg-emerald-500"
                            : d.sentiment > -0.3
                            ? "bg-yellow-500"
                            : "bg-rose-500";
                        return (
                          <div key={d.day} className="flex flex-col items-center flex-1">
                            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: "180px" }}>
                              <div
                                className={`${color} rounded-t-lg transition-all duration-300 hover:opacity-80 w-full absolute bottom-0`}
                                style={{ height: `${Math.max(height, 5)}%` }}
                                title={`${d.day}: ${d.sentiment.toFixed(2)}`}
                              />
                            </div>
                            <span className="text-xs text-gray-600 mt-2 font-medium">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Negative</span>
                      <span>Neutral</span>
                      <span>Positive</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Themes */}
              <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Top Themes</CardTitle>
                  <CardDescription>What you&apos;ve been reflecting on</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64 p-4">
                    <div className="space-y-3">
                      {(() => {
                        const max = Math.max(1, ...themeCounts.map((t) => t.count));
                        return themeCounts.map((t) => {
                          const width = (t.count / max) * 100;
                          return (
                            <div key={t.theme} className="flex items-center space-x-3">
                              <div className="w-20 text-sm font-medium text-gray-700 text-right">
                                {capitalize(t.theme)}
                              </div>
                              <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                                <div
                                  className={`${themeColors[t.theme] || "bg-gray-500"} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                  style={{ width: `${Math.max(width, 10)}%` }}
                                >
                                  <span className="text-xs text-white font-medium">{t.count}</span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* This Week in Words Section */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">This Week in Words</CardTitle>
                    <CardDescription>Personalized insights and patterns from your writing</CardDescription>
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
              <CardContent className="space-y-4">
                {!aiInsights ? (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Discover patterns and insights from your weekly writing</p>
                    <Button 
                      onClick={generateAiInsights} 
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
                          Analyze This Week
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Insights Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {aiInsights.insights.map((insight, index) => {
                        const Icon = insightIcons[insight.type] || Lightbulb;
                        return (
                          <Card key={index} className="hover:shadow-md transition-shadow border border-gray-100">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-emerald-600" />
                                  <CardTitle className="text-base">{insight.title}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(insight.confidence * 100)}%
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-gray-700">{insight.description}</p>
                              {insight.actionable && (
                                <div className="bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-400">
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

                    {/* Analytics Summary */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{aiInsights.totalEntries}</div>
                        <div className="text-sm text-gray-600">Entries This Week</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{aiInsights.averageEntryLength}</div>
                        <div className="text-sm text-gray-600">Avg Characters</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {aiInsights.mostActiveDay ? aiInsights.mostActiveDay.slice(0, 3) : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Most Active Day</div>
                      </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="text-center">
                      <Button 
                        onClick={generateAiInsights} 
                        variant="outline"
                        disabled={insightsLoading}
                        size="sm"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${insightsLoading ? 'animate-spin' : ''}`} />
                        Refresh Analysis
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Encouragement */}
            <div className="text-center py-4">
              <p className="text-gray-500 leading-relaxed">
                Keep watering your garden — every entry grows your roots.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function capitalize(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
