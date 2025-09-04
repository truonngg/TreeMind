// components/v0/CreateEntryFormV0.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Save, Sparkles, X, MicOff, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createEntry } from "@/lib/storage/entries";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { usePrivacyPreferences } from "@/hooks/usePrivacyPreferences";
import { useInspirationPrompts } from "@/hooks/useInspirationPrompts";
import { generateTitles, GeneratedTitle } from "@/lib/analysis/titleGeneration";

export default function CreateEntryFormV0() {
  const router = useRouter();
  const [entryText, setEntryText] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [suggestedTitles, setSuggestedTitles] = useState<GeneratedTitle[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  
  // Voice recording functionality
  const {
    isRecording,
    transcript,
    interimTranscript,
    error: voiceError,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
    retryRecording,
  } = useVoiceRecording();

  // Privacy preferences
  const { preferences, updateTitleGenerationMode } = usePrivacyPreferences();

  // Inspiration prompts
  const { prompts: inspirationPrompts, isLoading: promptsLoading, error: promptsError, refreshPrompts } = useInspirationPrompts();

  // Update entry text when transcript changes
  useEffect(() => {
    if (transcript) {
      setEntryText((prev) => {
        // If there's existing text, append the new transcript
        if (prev && prev.trim()) {
          return prev + "\n\n" + transcript;
        }
        // If no existing text, use the transcript directly
        return transcript;
      });
    }
  }, [transcript]);

  // Clear suggestions when privacy mode changes
  useEffect(() => {
    setSuggestedTitles([]);
    setShowSuggestions(false);
  }, [preferences.titleGenerationMode]);

  const handleVoiceRant = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearTranscript();
      await startRecording();
    }
  };
  const generateTitle = async () => {
    if (!entryText.trim()) return;
    
    setIsGeneratingTitles(true);
    try {
      const titles = await generateTitles({
        privacyMode: preferences.titleGenerationMode,
        text: entryText
      });
      
      setSuggestedTitles(titles);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Title generation failed:', error);
      // Fallback to simple titles
      setSuggestedTitles([
        { title: "Daily Reflections", confidence: 0.5, mode: 'private' },
        { title: "Thoughts and Feelings", confidence: 0.5, mode: 'private' }
      ]);
      setShowSuggestions(true);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const acceptSuggestedTitle = (title: string) => {
    setEntryTitle(title);
    setShowSuggestions(false);
  };

  // ✅ Wire Save to your storage and navigate with the Next router
  const handleSaveEntry = async () => {
    if (!entryText.trim() && !entryTitle.trim()) return;
    await createEntry({ title: entryTitle, text: entryText });
    router.push("/library");
  };

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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700">Need inspiration?</h2>
            <Button
              onClick={refreshPrompts}
              variant="ghost"
              size="sm"
              disabled={promptsLoading}
              className="text-emerald-600 hover:bg-emerald-100 rounded-xl"
              title="Refresh prompts"
            >
              <Sparkles className={`w-4 h-4 mr-1 ${promptsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {promptsError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {promptsError}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto">
            {inspirationPrompts.map((prompt, index) => (
              <Card
                key={`${prompt.text}-${index}`}
                className={`flex-shrink-0 w-full sm:w-64 cursor-pointer hover:shadow-md transition-all duration-200 ${
                  prompt.type === 'context' 
                    ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg' 
                    : 'border-emerald-100 bg-white/80 backdrop-blur-sm'
                }`}
                onClick={() => setEntryText((prev) => (prev ? prev + "\n\n" : "") + prompt.text + "\n\n")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    {prompt.type === 'context' ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-purple-600 font-medium">Context-Aware</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-emerald-600 font-medium">Curated</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className={`text-base ${
                    prompt.type === 'context' ? 'text-purple-700' : 'text-emerald-700'
                  }`}>
                    {prompt.text}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          {promptsLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="text-sm">Generating prompts...</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Writing Area */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Your thoughts</CardTitle>
            <CardDescription className="text-emerald-600">This is your safe space. Write freely.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Entry Title (optional)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Privacy Mode:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Button
                      onClick={() => updateTitleGenerationMode('private')}
                      variant="ghost"
                      size="sm"
                      className={`px-2 py-1 text-xs rounded-md ${
                        preferences.titleGenerationMode === 'private'
                          ? 'bg-white shadow-sm text-emerald-700'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      title="Local templates - completely private"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Private
                    </Button>
                    <Button
                      onClick={() => updateTitleGenerationMode('gemini')}
                      variant="ghost"
                      size="sm"
                      className={`px-2 py-1 text-xs rounded-md ${
                        preferences.titleGenerationMode === 'gemini'
                          ? 'bg-white shadow-sm text-emerald-700'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      title="AI-powered contextual titles using Google Gemini (free)"
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      Gemini
                    </Button>
                  </div>
                </div>
              </div>
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
                  disabled={!entryText.trim() || isGeneratingTitles}
                  title={`Generate title (${preferences.titleGenerationMode} mode)`}
                >
                  {isGeneratingTitles ? (
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {showSuggestions && suggestedTitles.length > 0 && (
              <Card className="border-emerald-200 bg-emerald-50/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-emerald-700 font-medium">
                        Suggested title ({suggestedTitles[0]?.mode === 'gemini' ? 'Gemini AI' : suggestedTitles[0]?.mode} mode):
                      </p>
                      <Button 
                        onClick={() => setShowSuggestions(false)} 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-600 hover:bg-emerald-100 rounded-xl" 
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {suggestedTitles.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-emerald-800 font-medium text-lg">{suggestion.title}</p>
                            <p className="text-xs text-emerald-600">
                              {suggestion.mode === 'gemini' ? 'Gemini AI' : suggestion.mode} mode
                            </p>
                          </div>
                          <Button 
                            onClick={() => acceptSuggestedTitle(suggestion.title)} 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl ml-2"
                          >
                            Use
                          </Button>
                        </div>
                      ))}
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

            {/* Voice Error Display */}
            {voiceError && (
              <Card className="border-amber-200 bg-amber-50/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-amber-700 font-medium mb-2">Voice recording unavailable</p>
                      <p className="text-amber-800 text-sm mb-3">{voiceError}</p>
                      <div className="flex gap-2 mb-3">
                        <Button 
                          onClick={retryRecording}
                          variant="outline"
                          size="sm"
                          className="text-amber-700 border-amber-300 hover:bg-amber-100 rounded-xl"
                        >
                          Try Again
                        </Button>
                      </div>
                      <p className="text-amber-700 text-xs">
                        💡 <strong>Tip:</strong> You can still type your thoughts in the text area above. 
                        Voice recording is just a convenience feature!
                      </p>
                    </div>
                    <Button 
                      onClick={() => clearTranscript()} 
                      variant="ghost" 
                      size="sm" 
                      className="text-amber-600 hover:bg-amber-100 rounded-xl ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleVoiceRant}
                variant="outline"
                className={`flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl h-12 ${
                  isRecording ? "bg-emerald-100 border-emerald-300" : "bg-transparent"
                }`}
                disabled={false}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4 mr-2 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4 mr-2" />
                )}
                {isRecording ? "Stop Recording" : "Rant"}
              </Button>

              <Button 
                onClick={handleSaveEntry} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12" 
                disabled={!entryText.trim()}
              >
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


  