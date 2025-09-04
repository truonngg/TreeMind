export function getThemes(text: string): string[] {
  // Simple theme extraction based on common topic keywords
  const themeKeywords: { [key: string]: string[] } = {
    'work': ['work', 'job', 'career', 'business', 'project', 'meeting', 'deadline'],
    'family': ['family', 'home', 'children', 'parents', 'siblings', 'household'],
    'health': ['health', 'exercise', 'fitness', 'wellness', 'medical', 'doctor'],
    'travel': ['travel', 'vacation', 'trip', 'journey', 'destination', 'adventure'],
    'creativity': ['art', 'music', 'writing', 'design', 'creative', 'inspiration'],
    'learning': ['study', 'learn', 'education', 'knowledge', 'skill', 'course'],
    'relationships': ['friend', 'relationship', 'love', 'dating', 'partner', 'social'],
    'technology': ['tech', 'computer', 'software', 'digital', 'online', 'app']
  };
  
  const words = text.toLowerCase().split(/\s+/);
  const foundThemes: string[] = [];
  
  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    const matches = keywords.filter(keyword => words.includes(keyword));
    if (matches.length > 0) {
      foundThemes.push(theme);
    }
  });
  
  return foundThemes.length > 0 ? foundThemes : ['general'];
}
