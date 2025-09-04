export function getSentiment(text: string): { score: number; label: "positive"|"neutral"|"negative" } {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: "neutral" };
  }

  // Enhanced sentiment analysis with comprehensive word lists and intensity
  const positiveWords = {
    // High intensity positive (score: 3)
    'amazing': 3, 'fantastic': 3, 'wonderful': 3, 'excellent': 3, 'outstanding': 3, 'brilliant': 3, 'perfect': 3, 'incredible': 3, 'phenomenal': 3,
    'love': 3, 'adore': 3, 'cherish': 3, 'treasure': 3, 'delighted': 3, 'thrilled': 3, 'ecstatic': 3, 'overjoyed': 3, 'blissful': 3, 'euphoric': 3,
    'magnificent': 3, 'spectacular': 3, 'extraordinary': 3, 'remarkable': 3, 'exceptional': 3, 'superb': 3, 'marvelous': 3, 'splendid': 3,
    'elated': 3, 'jubilant': 3, 'exhilarated': 3, 'rapturous': 3, 'enchanted': 3, 'captivated': 3, 'mesmerized': 3, 'enthralled': 3,
    
    // Medium intensity positive (score: 2)
    'great': 2, 'good': 2, 'nice': 2, 'beautiful': 2, 'awesome': 2, 'lovely': 2, 'sweet': 2, 'kind': 2, 'gentle': 2, 'warm': 2,
    'happy': 2, 'joyful': 2, 'cheerful': 2, 'pleased': 2, 'satisfied': 2, 'content': 2, 'grateful': 2, 'blessed': 2, 'fortunate': 2, 'lucky': 2,
    'like': 2, 'enjoy': 2, 'appreciate': 2, 'admire': 2, 'respect': 2, 'value': 2, 'favor': 2, 'prefer': 2, 'choose': 2, 'select': 2,
    'proud': 2, 'confident': 2, 'optimistic': 2, 'hopeful': 2, 'inspired': 2, 'motivated': 2, 'energized': 2, 'refreshed': 2,
    'relaxed': 2, 'comfortable': 2, 'cozy': 2, 'secure': 2, 'safe': 2, 'protected': 2, 'supported': 2, 'encouraged': 2,
    'accomplished': 2, 'successful': 2, 'victorious': 2, 'triumphant': 2, 'achieved': 2, 'completed': 2, 'finished': 2, 'done': 2,
    
    // Low intensity positive (score: 1)
    'okay': 1, 'fine': 1, 'decent': 1, 'acceptable': 1, 'pleasant': 1, 'calm': 1, 'peaceful': 1, 'quiet': 1, 'serene': 1, 'tranquil': 1,
    'better': 1, 'improved': 1, 'progress': 1, 'success': 1, 'achievement': 1, 'accomplishment': 1, 'milestone': 1, 'breakthrough': 1,
    'manageable': 1, 'reduced': 1, 'organizing': 1, 'practicing': 1, 'slowed': 1, 'paused': 1, 'focused': 1, 'concentrated': 1,
    'helpful': 1, 'useful': 1, 'beneficial': 1, 'valuable': 1, 'meaningful': 1, 'significant': 1, 'important': 1, 'worthwhile': 1,
    'interesting': 1, 'engaging': 1, 'stimulating': 1, 'exciting': 1, 'fun': 1, 'entertaining': 1, 'enjoyable': 1, 'pleasurable': 1,
    'healthy': 1, 'well': 1, 'strong': 1, 'fit': 1, 'energetic': 1, 'vital': 1, 'alive': 1, 'vibrant': 1, 'lively': 1, 'active': 1
  };

  const negativeWords = {
    // High intensity negative (score: -3)
    'terrible': -3, 'awful': -3, 'horrible': -3, 'disgusting': -3, 'atrocious': -3, 'appalling': -3, 'dreadful': -3, 'nightmare': -3,
    'hate': -3, 'despise': -3, 'loathe': -3, 'detest': -3, 'abhor': -3, 'furious': -3, 'livid': -3, 'enraged': -3, 'infuriated': -3,
    'devastated': -3, 'crushed': -3, 'destroyed': -3, 'ruined': -3, 'shattered': -3, 'broken': -3, 'miserable': -3, 'wretched': -3,
    'disgusted': -3, 'repulsed': -3, 'revolted': -3, 'sickened': -3, 'nauseated': -3, 'horrified': -3, 'terrified': -3, 'petrified': -3,
    
    // Medium intensity negative (score: -2)
    'bad': -2, 'poor': -2, 'disappointing': -2, 'frustrating': -2, 'annoying': -2, 'irritating': -2, 'bothering': -2, 'troubling': -2,
    'sad': -2, 'depressed': -2, 'unhappy': -2, 'upset': -2, 'worried': -2, 'anxious': -2, 'stressed': -2, 'overwhelmed': -2,
    'angry': -2, 'mad': -2, 'bothered': -2, 'dislike': -2, 'offended': -2, 'insulted': -2,
    'nervous': -2, 'frustrated': -2, 'unimpressed': -2, 'mistakes': -2, 'gaps': -2, 'rushing': -2, 'rushed': -2, 'hurried': -2,
    'concerned': -2, 'troubled': -2, 'disturbed': -2, 'uncomfortable': -2, 'uneasy': -2, 'restless': -2, 'agitated': -2, 'tense': -2,
    'disappointed': -2, 'let': -2, 'down': -2, 'failed': -2, 'failure': -2, 'defeat': -2, 'loss': -2, 'losing': -2, 'lost': -2,
    
    // Low intensity negative (score: -1)
    'okay': -1, 'meh': -1, 'boring': -1, 'tired': -1, 'exhausted': -1, 'drained': -1, 'confused': -1, 'uncertain': -1, 'unsure': -1,
    'worst': -1, 'difficult': -1, 'challenging': -1, 'struggle': -1, 'problem': -1, 'issue': -1, 'concern': -1, 'worry': -1,
    'hard': -1, 'tough': -1, 'rough': -1, 'harsh': -1, 'severe': -1, 'intense': -1, 'overwhelming': -1, 'excessive': -1,
    'slow': -1, 'delayed': -1, 'late': -1, 'behind': -1, 'lagging': -1, 'stuck': -1, 'trapped': -1, 'blocked': -1,
    'weak': -1, 'fragile': -1, 'vulnerable': -1, 'exposed': -1, 'unprotected': -1, 'unsafe': -1, 'risky': -1, 'dangerous': -1
  };

  // Clean and normalize text
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const words = cleanText.split(/\s+/);
  let totalScore = 0;
  let wordCount = 0;

  // Check for sentiment words with position weighting (later words have more impact)
  words.forEach((word, index) => {
    wordCount++;
    const positionWeight = Math.min(1 + (index / words.length) * 0.5, 1.5); // 1.0 to 1.5 weight
    
    if (positiveWords[word as keyof typeof positiveWords]) {
      totalScore += positiveWords[word as keyof typeof positiveWords] * positionWeight;
    }
    if (negativeWords[word as keyof typeof negativeWords]) {
      totalScore += negativeWords[word as keyof typeof negativeWords] * positionWeight;
    }
  });

  // Check for negation patterns (not good, don't like, etc.)
  const negationPatterns = [
    /\b(not|don't|doesn't|didn't|won't|can't|couldn't|shouldn't|wouldn't|never|no|none|nothing|nobody|nowhere)\s+\w+/g
  ];
  
  negationPatterns.forEach(pattern => {
    const matches = text.toLowerCase().match(pattern);
    if (matches) {
      matches.forEach(match => {
        const words = match.split(/\s+/);
        if (words.length >= 2) {
          const sentimentWord = words[words.length - 1];
          if (positiveWords[sentimentWord as keyof typeof positiveWords]) {
            totalScore -= positiveWords[sentimentWord as keyof typeof positiveWords];
          }
          if (negativeWords[sentimentWord as keyof typeof negativeWords]) {
            totalScore -= negativeWords[sentimentWord as keyof typeof negativeWords];
          }
        }
      });
    }
  });

  // Check for intensifiers (very, really, so, extremely, etc.)
  const intensifiers = ['very', 'really', 'so', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely', 'utterly'];
  words.forEach((word, index) => {
    if (intensifiers.includes(word) && index < words.length - 1) {
      const nextWord = words[index + 1];
      if (positiveWords[nextWord as keyof typeof positiveWords]) {
        totalScore += positiveWords[nextWord as keyof typeof positiveWords] * 0.5; // Add 50% intensity
      }
      if (negativeWords[nextWord as keyof typeof negativeWords]) {
        totalScore += negativeWords[nextWord as keyof typeof negativeWords] * 0.5; // Add 50% intensity
      }
    }
  });

  // Normalize score based on text length
  const normalizedScore = wordCount > 0 ? totalScore / Math.sqrt(wordCount) : 0;
  
  // Determine label based on normalized score
  if (normalizedScore > 0.3) return { score: Math.min(normalizedScore, 1), label: "positive" };
  if (normalizedScore < -0.3) return { score: Math.max(normalizedScore, -1), label: "negative" };
  return { score: normalizedScore, label: "neutral" };
}