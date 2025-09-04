import { NextRequest, NextResponse } from 'next/server';

interface GeminiTitleRequest {
  text: string;
  sentiment: {
    score: number;
    label: string;
  };
  themes: string[];
}

export async function POST(request: NextRequest) {
  try {
    const data: GeminiTitleRequest = await request.json();
    
    // Validate request data
    if (!data.text || !data.sentiment || !data.themes) {
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

    // Create a focused prompt for title generation
    const prompt = `Generate 1 specific, relevant, and emotionally resonant title for this journal entry. The title should capture the sentiment and themes while being concise and meaningful.

Entry Text: "${data.text}"

Detected Sentiment: ${data.sentiment.label} (score: ${data.sentiment.score})
Detected Themes: ${data.themes.join(', ')}

Requirements:
- Title should be 2-6 words
- Capture the emotional tone and main themes
- Be specific to the content, not generic
- Avoid clichés and overly dramatic language
- Make it feel personal and authentic
- Return only the title string, no JSON formatting or quotes

Examples of good titles:
- "Tough Day at Work"
- "Struggles with Time Management"
- "Struggling to Find Peace Amidst Chaos"
- "Reflecting on Stressful Work Situation"
- "Dealing with Family Conflict"
- "Challenges in Personal Relationships"
- "Overcoming Creative Block"
- "Work-Life Balance Struggles"
- "Dealing with Financial Stress"
- "Handling Personal Health Issues"
- "Dealing with Family Health Issues"
- "Handling Personal Safety Concerns"
- "Dealing with Family Safety Concerns"`;

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
          maxOutputTokens: 150,
          topP: 0.8,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Gemini title generation failed' },
        { status: response.status }
      );
    }

    const geminiResponse = await response.json();
    const content = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content received from Gemini');
    }

    // Parse the response to get a single title
    let title: string;
    try {
      // Clean the response to extract the title
      title = content.trim()
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/^\[|\]$/g, '') // Remove brackets
        .replace(/^\d+\.\s*/, '') // Remove numbering
        .trim();
      
      // If it's still empty or too long, throw error
      if (!title || title.length === 0 || title.length > 50) {
        throw new Error('Invalid title format received');
      }
    } catch (parseError) {
      throw new Error('No valid title generated');
    }

    return NextResponse.json({
      title: title,
      mode: 'gemini',
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gemini title generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
