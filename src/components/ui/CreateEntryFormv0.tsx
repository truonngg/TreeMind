// components/v0/CreateEntryFormV0.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Save, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createEntry } from "@/lib/storage/entries"; // <-- add this

export default function CreateEntryFormV0() {
  const router = useRouter();
  const [entryText, setEntryText] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleVoiceRant = () => {
    setIsRecording((s) => !s);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setEntryText((prev) => prev + (prev ? "\n\n" : "") + "Voice recording transcription would appear here...");
      }, 2000);
    }
  };

  const generateTitle = () => {
    if (!entryText.trim()) return;
    const titles = [
      "Reflections on Today",
      "A Moment of Clarity",
      "Thoughts and Feelings",
      "Processing My Day",
      "Inner Dialogue",
      "Finding My Way",
      "Today's Journey",
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    setSuggestedTitle(randomTitle);
    setShowSuggestion(true);
  };

  const acceptSuggestedTitle = () => {
    setEntryTitle(suggestedTitle);
    setShowSuggestion(false);
  };

  // ✅ Wire Save to your storage and navigate with the Next router
  const handleSaveEntry = async () => {
    if (!entryText.trim() && !entryTitle.trim()) return;
    await createEntry({ title: entryTitle, text: entryText });
    router.push("/library");
  };

  const prompts = ["How was your day?", "What's on your mind?", "Based on your recent reflections..."];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100 rounded-2xl">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">New Entry</h1>
        </div>

        {/* Prompt Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700">Need inspiration?</h2>
          <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto">
            {prompts.map((prompt, index) => (
              <Card
                key={index}
                className="flex-shrink-0 w-full sm:w-64 cursor-pointer hover:shadow-md transition-shadow border-emerald-100 bg-white/80 backdrop-blur-sm"
                onClick={() => setEntryText((prev) => (prev ? prev + "\n\n" : "") + prompt + "\n\n")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-emerald-700">{prompt}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Writing Area */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Your thoughts</CardTitle>
            <CardDescription className="text-emerald-600">This is your safe space. Write freely.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Entry Title (optional)
              </label>
              <div className="flex gap-2">
                <Input
                  id="title"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                  className="border-emerald-100 focus:border-emerald-300 focus:ring-emerald-200 rounded-2xl"
                />
                <Button
                  onClick={generateTitle}
                  variant="outline"
                  size="sm"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl px-3 bg-transparent"
                  disabled={!entryText.trim()}
                  title="Suggest a title"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showSuggestion && (
              <Card className="border-emerald-200 bg-emerald-50/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-emerald-700 font-medium mb-1">Suggested title:</p>
                      <p className="text-emerald-800 font-semibold">{suggestedTitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={acceptSuggestedTitle} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        Use This
                      </Button>
                      <Button onClick={() => setShowSuggestion(false)} variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-100 rounded-xl" title="Dismiss">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Textarea
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Start writing here..."
              className="min-h-[200px] resize-none border-emerald-100 focus:border-emerald-300 focus:ring-emerald-200 rounded-2xl text-base leading-relaxed"
              rows={8}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleVoiceRant}
                variant="outline"
                className={`flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl h-12 ${isRecording ? "bg-emerald-100 border-emerald-300" : "bg-transparent"}`}
                disabled={isRecording}
              >
                <Mic className={`w-4 h-4 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
                {isRecording ? "Recording..." : "Voice Rant"}
              </Button>

              <Button onClick={handleSaveEntry} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12" disabled={!entryText.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Encouragement Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 leading-relaxed">Every word matters. You're building something beautiful.</p>
        </div>
      </div>
    </div>
  );
}


  