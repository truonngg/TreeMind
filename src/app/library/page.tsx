"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, RotateCcw, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { listEntries, type Entry } from "@/lib/storage/entries";

// ---- helpers ----
const toTitle = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const sentimentClass: Record<"positive" | "neutral" | "negative", string> = {
  positive: "bg-emerald-100 text-emerald-700 border-emerald-200",
  neutral: "bg-blue-100 text-blue-700 border-blue-200",
  negative: "bg-rose-100 text-rose-700 border-rose-200",
};

const themeClass: Record<string, string> = {
  work: "bg-purple-100 text-purple-700 border-purple-200",
  health: "bg-green-100 text-green-700 border-green-200",
  relationships: "bg-pink-100 text-pink-700 border-pink-200",
  creativity: "bg-orange-100 text-orange-700 border-orange-200",
  school: "bg-indigo-100 text-indigo-700 border-indigo-200",
  money: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function LibraryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [themeFilter, setThemeFilter] = useState<"all" | "work" | "relationships" | "health" | "creativity" | "school" | "money">("all");

  useEffect(() => {
    listEntries().then(setEntries).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let list = [...entries];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) => e.title?.toLowerCase().includes(q) || e.text?.toLowerCase().includes(q)
      );
    }

    if (sentimentFilter !== "all") {
      list = list.filter((e) => e.sentiment?.label === sentimentFilter);
    }

    if (themeFilter !== "all") {
      list = list.filter((e) => (e.themes || []).includes(themeFilter));
    }

    list.sort((a, b) =>
      sortBy === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );

    return list;
  }, [entries, searchQuery, sortBy, sentimentFilter, themeFilter]);

  const clearFilters = () => {
    setSortBy("newest");
    setSentimentFilter("all");
    setThemeFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    sortBy !== "newest" || sentimentFilter !== "all" || themeFilter !== "all" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900">Your Library</h1>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
              Private Mode is on — your writing stays on your device
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search entries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64 rounded-2xl border-gray-200 bg-white/80"
              />
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl">
              <Link href="/create">
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-full sm:w-40 rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sentimentFilter} onValueChange={(v) => setSentimentFilter(v as any)}>
                  <SelectTrigger className="w-full sm:w-40 rounded-xl">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={themeFilter} onValueChange={(v) => setThemeFilter(v as any)}>
                  <SelectTrigger className="w-full sm:w-40 rounded-xl">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="creativity">Creativity</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="money">Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700 rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entries Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e) => {
              const date = fmtDate(e.createdAt);
              const title = e.title?.trim() || "Untitled Entry";
              const preview = (e.text || "").slice(0, 220);
              const label = (e.sentiment?.label || "neutral") as "positive" | "neutral" | "negative";
              const topTheme = e.themes?.[0];

              return (
                <Card key={e.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-sm text-gray-500 font-medium">{date}</CardDescription>
                    </div>
                    <CardTitle className="text-lg text-gray-900 mt-2 line-clamp-2">{title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{preview}</p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={`text-xs ${sentimentClass[label]}`}>
                        {toTitle(label)}
                      </Badge>
                      {topTheme && (
                        <Badge variant="outline" className={`text-xs ${themeClass[topTheme] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {toTitle(topTheme)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent">
                        {/* TODO: wire to /entry/[id] later */}
                        <Link href={`/create`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="flex-1 rounded-xl text-gray-600 hover:bg-gray-100">
                        {/* TODO: wire to /entry/[id]/edit later */}
                        <Link href={`/create`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Empty State
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Plus className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-gray-900">No entries yet</CardTitle>
                <CardDescription className="text-gray-600">Start with a sentence — every seed counts.</CardDescription>
              </div>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl">
                <Link href="/create">Create your first entry</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More (optional placeholder) */}
        {filtered.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="rounded-2xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent">
              Load more entries
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
