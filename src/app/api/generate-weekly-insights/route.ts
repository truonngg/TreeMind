import { NextRequest, NextResponse } from 'next/server';
import { generateLocalWeeklyInsights, WeeklyInsightsData } from '@/lib/analysis/weeklyInsights';
import { Entry } from '@/lib/storage/entries';

interface WeeklyInsightsRequest {
  entries: Entry[];
  mode: 'private' | 'gemini';
}

export async function POST(request: NextRequest) {
  try {
    const data: WeeklyInsightsRequest = await request.json();
    
    // Validate request data
    if (!data.entries || !Array.isArray(data.entries) || !data.mode) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Always start with local insights as base
    const localInsights = generateLocalWeeklyInsights(data.entries);

    // If private mode, return local insights only
    if (data.mode === 'private') {
      return NextResponse.json({
        ...localInsights,
        mode: 'private',
        generatedAt: new Date().toISOString()
      });
    }

    // For Gemini mode, enhance with AI insights
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Fallback to local insights if Gemini not configured
      return NextResponse.json({
        ...localInsights,
        mode: 'private',
        error: 'Gemini API key not configured, using local insights',
        generatedAt: new Date().toISOString()
      });
    }

    // Prepare anonymized data for Gemini
    const weeklyEntries = data.entries.filter(entry => {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return entry.createdAt >= oneWeekAgo;
    });

    if (weeklyEntries.length === 0) {
      return NextResponse.json({
        ...localInsights,
        mode: 'gemini',
        generatedAt: new Date().toISOString()
      });
    }

    // Create anonymized summary for Gemini (no personal details)
    const anonymizedData = {
      totalEntries: weeklyEntries.length,
      themes: localInsights.topThemes,
      sentimentTrend: localInsights.sentimentTrend,
      averageEntryLength: localInsights.averageEntryLength,
      mostActiveDay: localInsights.mostActiveDay,
      // Only include themes and sentiment, not actual text content
      entryThemes: weeklyEntries.map(entry => ({
        themes: entry.themes,
        sentiment: entry.sentiment.label,
        dayOfWeek: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long' })
      }))
    };

    const prompt = `Based on this user's weekly journaling data, generate 2-3 personalized, actionable insights that help them understand patterns in their life and make positive changes.

Weekly Data:
- Total entries: ${anonymizedData.totalEntries}
- Top themes: ${anonymizedData.themes.map(t => `${t.theme} (${t.percentage}%)`).join(', ')}
- Sentiment distribution: ${anonymizedData.sentimentTrend.positive}% positive, ${anonymizedData.sentimentTrend.neutral}% neutral, ${anonymizedData.sentimentTrend.negative}% negative
- Most active day: ${anonymizedData.mostActiveDay}
- Average entry length: ${anonymizedData.averageEntryLength} characters
- Daily patterns: ${anonymizedData.entryThemes.map(e => `${e.dayOfWeek}: ${e.sentiment} mood, themes: ${e.themes.join(', ')}`).join('; ')}

Requirements:
- Generate 2-3 insights maximum
- Each insight should be personalized and actionable
- Focus on patterns, connections, and gentle suggestions
- Tone should be supportive, non-judgmental, and encouraging
- Provide specific, actionable advice when possible
- Avoid generic advice - make it specific to their data
- Return as JSON array with this exact structure:
[
  {
    "type": "pattern|theme|sentiment|progress|reflection",
    "title": "Brief insight title",
    "description": "Detailed explanation of the insight",
    "actionable": "Specific action or reflection suggestion",
    "confidence": 0.8
  }
]

Examples of good insights:
- "You mentioned feeling most energized on days you had a morning walk. You also wrote about creative ideas more frequently during those weeks."
- "Your entries show a pattern of higher stress on Mondays. Consider starting your week with a calming routine."
- "You wrote about work challenges 4 times this week. What support systems might help you manage this stress?"

Examples to avoid:
- Generic advice like "Try to be more positive"
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
          ...localInsights,
          mode: 'private',
          error: 'API quota exceeded, using local insights',
          generatedAt: new Date().toISOString()
        });
      }
      
      // Fallback to local insights
      return NextResponse.json({
        ...localInsights,
        mode: 'private',
        error: 'AI insights generation failed, using local insights',
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
        typeof insight.title === 'string' && 
        typeof insight.description === 'string' &&
        insight.type &&
        typeof insight.confidence === 'number'
      );
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback to local insights
      return NextResponse.json({
        ...localInsights,
        mode: 'private',
        error: 'Failed to parse AI insights, using local insights',
        generatedAt: new Date().toISOString()
      });
    }

    // Combine local insights with AI insights
    const combinedInsights = [
      ...localInsights.insights.slice(0, 2), // Keep top 2 local insights
      ...aiInsights.slice(0, 3) // Add up to 3 AI insights
    ].slice(0, 5); // Limit to 5 total insights

    return NextResponse.json({
      ...localInsights,
      insights: combinedInsights,
      mode: 'gemini',
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Weekly insights generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
