export function getThemes(text: string): string[] {
  // Simple theme extraction based on common topic keywords
  const themeKeywords: { [key: string]: string[] } = {
    'work': ['work', 'job', 'career', 'business', 'project', 'meeting', 'deadline', 'office', 'colleague', 'boss', 'employee', 'employer', 'profession', 'industry', 'company', 'organization', 'task', 'assignment', 'promotion', 'resume', 'presentation'],
    'family': ['family', 'home', 'children', 'parents', 'siblings', 'household', 'mother', 'father', 'brother', 'sister', 'grandmother', 'grandfather', 'cousin', 'aunt', 'uncle', 'nephew', 'niece', 'marriage', 'wedding', 'anniversary'],
    'health': ['health', 'exercise', 'fitness', 'wellness', 'medical', 'doctor', 'hospital', 'medicine', 'treatment', 'therapy', 'recovery', 'illness', 'disease', 'pain', 'injury', 'surgery', 'medication', 'nurse', 'clinic', 'pharmacy'],
    'travel': ['travel', 'vacation', 'trip', 'journey', 'destination', 'adventure', 'flight', 'hotel', 'booking', 'tourism', 'explore', 'visit', 'sightseeing', 'passport', 'luggage', 'airport', 'train', 'bus', 'roadtrip', 'backpacking'],
    'creativity': ['art', 'music', 'writing', 'design', 'creative', 'inspiration', 'painting', 'drawing', 'sculpture', 'photography', 'poetry', 'novel', 'story', 'song', 'instrument', 'performance', 'gallery', 'exhibition', 'craft', 'artistic'],
    'learning': ['study', 'learn', 'education', 'knowledge', 'skill', 'course', 'school', 'university', 'college', 'student', 'teacher', 'professor', 'book', 'research', 'academic', 'degree', 'certificate', 'training', 'workshop', 'seminar'],
    'relationships': ['friend', 'relationship', 'love', 'dating', 'partner', 'social', 'boyfriend', 'girlfriend', 'spouse', 'husband', 'wife', 'companion', 'acquaintance', 'neighbor', 'colleague', 'mentor', 'confidant', 'support', 'trust', 'connection'],
    'technology': ['tech', 'computer', 'software', 'digital', 'online', 'app', 'internet', 'website', 'programming', 'coding', 'data', 'artificial', 'intelligence', 'smartphone', 'laptop', 'tablet', 'gaming', 'social', 'media', 'platform'],
    'money': ['money', 'financial', 'budget', 'income', 'expense', 'investment', 'savings', 'debt', 'payment', 'cost', 'price', 'expensive', 'cheap', 'afford', 'spend', 'earn', 'salary', 'rent', 'bills', 'bank']
  };
  
  const words = text.toLowerCase().split(/\s+/).map(word => word.replace(/[^\w]/g, ''));
  const foundThemes: string[] = [];
  
  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    const matches = keywords.filter(keyword => words.includes(keyword));
    if (matches.length > 0) {
      foundThemes.push(theme);
    }
  });
  
  return foundThemes.length > 0 ? foundThemes : ['general'];
}
