"use client";

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  Home, 
  Plus, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Brain, 
  Heart, 
  Target,
  Sparkles,
  X,
  Leaf,
  BarChart3,
  Lightbulb
} from 'lucide-react'

export default function WelcomePage() {
  const [showLearnMore, setShowLearnMore] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mr-4">
              <Leaf className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900">
              TreeMind
            </h1>
          </div>
          <p className="text-2xl text-gray-700 mb-4 font-medium">
            Your Personalized Journaling Companion
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your thoughts into growth. TreeMind helps you build a consistent journaling practice 
            with intelligent insights and gentle guidance for deeper self-reflection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/home">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg rounded-2xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setShowLearnMore(true)}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-3 text-lg rounded-2xl"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <Card className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Home className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Progress</CardTitle>
              <CardDescription>Track your growth journey</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                See your consistency, milestones, and monthly insights
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Create</CardTitle>
              <CardDescription>Write with confidence</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Voice recording, smart prompts, and AI-powered titles
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Journals</CardTitle>
              <CardDescription>Your personal collection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Browse, search, and reflect on your entries
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle className="text-lg">Vibe Check</CardTitle>
              <CardDescription>Understand your patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Weekly insights and emotional trend analysis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Badge */}
        <div className="text-center">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Your data stays private and secure on your device
          </Badge>
        </div>
      </div>

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLearnMore(false)}
                className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">About TreeMind</CardTitle>
                  <CardDescription className="text-base">Your journey to deeper self-reflection</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Problem Statement */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  The Challenge We Solve
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-700 mb-3">
                    While the mental health benefits of journaling are well-documented, many people struggle to maintain a consistent practice. They face:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>"Blank page" anxiety and not knowing what to write about</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Difficulty reflecting on past entries to identify meaningful patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Journals becoming logs of events rather than tools for growth</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Our Solution */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  Our Solution
                </h3>
                <p className="text-gray-700">
                  TreeMind is a <strong>private, empathetic, and intelligent journaling companion</strong> that makes self-reflection a seamless and insightful daily habit. We guide you to understand your emotional patterns and encourage consistent journaling.
                </p>
              </div>

              {/* How Each Page Helps */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  How Each Page Helps You Grow
                </h3>
                <div className="grid gap-4">
                  <div className="flex gap-4 p-4 bg-emerald-50 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Progress Dashboard</h4>
                      <p className="text-sm text-gray-600">Track your consistency, see your growth milestones, and get monthly insights that help you understand your journey.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Create Entries</h4>
                      <p className="text-sm text-gray-600">Overcome blank page anxiety with voice recording, smart prompts, and AI-powered title suggestions to get you started.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Your Journals</h4>
                      <p className="text-sm text-gray-600">Browse and search your entries to reflect on your growth, identify patterns, and see how far you've come.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-pink-50 rounded-xl">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Vibe Check</h4>
                      <p className="text-sm text-gray-600">Get weekly insights about your emotional patterns, themes, and trends to better understand yourself.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy & Data */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Your Privacy is Our Priority
                </h3>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <p className="text-gray-700 mb-3">
                    <strong>Your journal entries are completely private.</strong> We offer two modes:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Private Mode:</strong> All analysis happens locally on your device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>AI Enhanced Mode:</strong> Uses Google Gemini with anonymized data only (entry counts, themes, sentiment labels). Your actual journal text is never shared.</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    <strong>All your entry data is stored locally and never leaves your device.</strong>
                  </p>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  Perfect For
                </h3>
                <div className="grid gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700"><strong>Mental wellness focused individuals</strong> who want to understand their emotional patterns</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700"><strong>Journaling beginners</strong> who need guidance and encouragement to get started</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700"><strong>Busy professionals</strong> who want a quick and effective way to de-stress and process their day</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-6 border-t">
                <Link href="/home">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg rounded-2xl">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Your Journey
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
