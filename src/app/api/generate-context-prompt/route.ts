import { NextRequest, NextResponse } from 'next/server';

interface ContextPromptRequest {
  recentEntries: Array<{
    title: string;
    text: string;
    sentiment: { score: number; label: string };
    themes: string[];
    createdAt: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContextPromptRequest = await request.json();
    
    // Validate request data
    if (!data.recentEntries || !Array.isArray(data.recentEntries)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // If no recent entries, return a fallback prompt
    if (data.recentEntries.length === 0) {
      return NextResponse.json({
        prompt: "What's on your mind today?",
        isContextAware: false
      });
    }

    // Analyze recent entries for patterns
    const recentThemes = data.recentEntries.flatMap(entry => entry.themes);
    const recentSentiments = data.recentEntries.map(entry => entry.sentiment.label);
    const mostRecentEntry = data.recentEntries[0];
    
    // Get last 3 entry titles for more context
    const last3Titles = data.recentEntries.slice(0, 3).map(entry => entry.title);
    
    // Count theme frequency
    const themeCounts = recentThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topThemes = Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);

    // Create context-aware prompt
    const prompt = `Based on this user's recent journal entries, generate a thoughtful, relevant follow-up prompt that builds on their previous reflections. 

Recent Entries Analysis:
- Last 3 Entry Titles: "${last3Titles.join('", "')}"
- Most Recent Entry: "${mostRecentEntry.title}" (${mostRecentEntry.sentiment.label} sentiment)
- Recent Themes: ${topThemes.join(', ')}
- Recent Sentiments: ${[...new Set(recentSentiments)].join(', ')}

Requirements:
- Generate 1 relevant, personalized prompt (1 sentences)
- Build on their previous entries and themes
- Tone should be encouraging and thoughtful and 
- Help them continue their reflection journey
- Make it feel like a natural follow-up conversation
- Consider the progression of their recent entries
- Return only the prompt text, no quotes or formatting
- Do not regurgitate the previous entry titles, take the essense from it
- Consider good prompts from the examples below

Examples of good context-aware prompts:
- If they wrote about work stress: "How did you find moments of peace today?"
- If they wrote about relationships: "What connections brought you joy this week?"
- If they wrote about goals: "What progress did you make toward your dreams today?"
- If they wrote about challenges: "What strength did you discover today?"

Examples of context-aware prompts that can be improved:
- If they wrote about finding peace admist chaos in their life, instead of writing 
"Now that you've identified peace amidst the chaos, what specific practices or moments contributed most to that feeling, 
and how can you intentionally incorporate them into your daily life?" it should be "How did you find moments of peace today?" or "How can you limit chaos in your life?"
If they wrote about focusing on their health and being grateful for their education, instead of writing "Considering your renewed focus on health and learning, how can you integrate these areas to foster a more peaceful and fulfilling life?" 
it should be "How are you doing with your health goals?" or "What are you grateful for today?"`;

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
          temperature: 0.8,
          maxOutputTokens: 100,
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
          prompt: "What's on your mind today?",
          isContextAware: false,
          error: 'API quota exceeded, using fallback prompt'
        });
      }
      
      return NextResponse.json(
        { error: 'Context prompt generation failed' },
        { status: response.status }
      );
    }

    const geminiResponse = await response.json();
    const content = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content received from Gemini');
    }

    // Clean the response
    const cleanPrompt = content.trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^\[|\]$/g, '') // Remove brackets
      .trim();

    return NextResponse.json({
      prompt: cleanPrompt || "What's on your mind today?",
      isContextAware: true,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Context prompt generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
