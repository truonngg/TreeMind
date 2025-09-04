"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Heart, Tag, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listEntries, deleteEntry, type Entry } from "@/lib/storage/entries";

// Helper functions
const toTitle = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { 
    weekday: "long",
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  });
const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString(undefined, { 
    hour: "numeric", 
    minute: "2-digit" 
  });

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

export default function EntryViewPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const entries = await listEntries();
        const foundEntry = entries.find(e => e.id === params.id);
        
        if (foundEntry) {
          setEntry(foundEntry);
        } else {
          setError("Entry not found");
        }
      } catch (err) {
        console.error("Error loading entry:", err);
        setError("Failed to load entry");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadEntry();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!entry) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${entry.title || 'Untitled Entry'}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      await deleteEntry(entry.id);
      // Redirect to library after successful deletion
      router.push('/library');
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError("Failed to delete entry");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600">Loading entry...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100 rounded-2xl">
              <Link href="/library">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Link>
            </Button>
          </div>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Entry Not Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {error || "The entry you're looking for doesn't exist or may have been deleted."}
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl">
                <Link href="/library">
                  Back to Library
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sentiment = entry.sentiment?.label || "neutral";
  const sentimentScore = entry.sentiment?.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100 rounded-2xl">
              <Link href="/library">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Entry Details</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl">
              <Link href={`/entry/${entry.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Entry
              </Link>
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {/* Entry Content */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{fmtDate(entry.createdAt)}</span>
                <span>•</span>
                <span>{fmtTime(entry.createdAt)}</span>
              </div>
              <Badge variant="outline" className={`text-xs ${sentimentClass[sentiment as keyof typeof sentimentClass]}`}>
                {toTitle(sentiment)}
              </Badge>
            </div>
            
            <CardTitle className="text-2xl text-gray-900 leading-tight">
              {entry.title || "Untitled Entry"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Entry Text */}
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {entry.text || "No content available."}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t pt-6 space-y-4">
              {/* Sentiment Details */}
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Sentiment</p>
                  <p className="text-sm text-gray-600">
                    {toTitle(sentiment)} (Score: {sentimentScore.toFixed(2)})
                  </p>
                </div>
              </div>

              {/* Themes */}
              {entry.themes && entry.themes.length > 0 && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.themes.map((theme, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className={`text-xs ${themeClass[theme] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                        >
                          {toTitle(theme)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
