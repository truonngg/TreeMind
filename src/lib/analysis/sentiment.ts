export function getSentiment(text: string): { score: number; label: "positive"|"neutral"|"negative" } {
  // Simple sentiment analysis based on positive/negative words
  const positiveWords = ['good', 'great', 'amazing', 'wonderful', 'excellent', 'happy', 'love', 'like', 'enjoy', 'beautiful', 'fantastic', 'awesome'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed', 'worst'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const score = positiveCount - negativeCount;
  
  if (score > 0) return { score, label: "positive" };
  if (score < 0) return { score, label: "negative" };
  return { score, label: "neutral" };
}
