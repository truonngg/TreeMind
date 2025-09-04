// Curated list of journal starter prompts
export const CURATED_PROMPTS = [
  // Daily Reflection
  "How was your day?",
  "What's on your mind?",
  "What made you smile today?",
  "What challenged you today?",
  "What are you grateful for?",
  
  // Emotional Check-ins
  "How are you feeling right now?",
  "What emotions are you experiencing?",
  "What's weighing on your heart?",
  "What brought you peace today?",
  "What made you feel proud?",
  
  // Growth & Learning
  "What did you learn today?",
  "How did you grow today?",
  "What would you do differently?",
  "What are you working on improving?",
  "What wisdom did you gain?",
  
  // Relationships & Connections
  "Who made your day better?",
  "What conversations meant the most?",
  "How did you connect with others?",
  "What relationships are you nurturing?",
  "Who do you want to reach out to?",
  
  // Goals & Dreams
  "What progress did you make today?",
  "What are you working toward?",
  "What dreams are you pursuing?",
  "What would you like to accomplish?",
  "What's your next step?",
  
  // Self-Care & Wellness
  "How did you take care of yourself?",
  "What brought you energy today?",
  "What drained your energy?",
  "How did you find balance?",
  "What do you need more of?",
  
  // Creativity & Inspiration
  "What inspired you today?",
  "What creative ideas came to mind?",
  "What beauty did you notice?",
  "What sparked your curiosity?",
  "What would you like to create?",
  
  // Challenges & Overcoming
  "What obstacles did you face?",
  "How did you overcome challenges?",
  "What resilience did you show?",
  "What would you tell your past self?",
  "What strength did you discover?",
  
  // Future & Hope
  "What are you looking forward to?",
  "What gives you hope?",
  "What possibilities excite you?",
  "What would you like to manifest?",
  "What future are you creating?",
  
  // Reflection & Wisdom
  "What patterns do you notice?",
  "What insights did you gain?",
  "What would you like to remember?",
  "What advice would you give yourself?",
  "What matters most to you right now?"
];

// Function to get 2 random prompts from the curated list
export function getRandomPrompts(count: number = 2): string[] {
  const shuffled = [...CURATED_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
