import localforage from "localforage";

export type Entry = {
  id: string; 
  createdAt: number;
  title: string; 
  text: string;
  sentiment: { score: number; label: "positive"|"neutral"|"negative" };
  themes: string[];
};

export const STORE = localforage.createInstance({ name: "treemind", storeName: "entries" });

export async function listEntries(): Promise<Entry[]> {
  const all: Entry[] = (await STORE.getItem("all")) || [];
  
  // Filter out any entries with invalid dates
  const validEntries = all.filter((entry: Entry) => {
    const date = new Date(entry.createdAt);
    return !isNaN(date.getTime());
  });
  
  return validEntries.sort((a,b)=>b.createdAt - a.createdAt);
}

export async function createEntry({ title, text }: { title: string; text: string }) {
  const { getSentiment } = await import("@/lib/analysis/sentiment");
  const { getThemes } = await import("@/lib/analysis/themes");
  const sentiment = getSentiment(text);
  const themes = getThemes(text);
  const entry: Entry = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    title: title?.trim() || "Untitled Entry",
    text, 
    sentiment, 
    themes
  };
  const all = await listEntries();
  all.push(entry);
  await STORE.setItem("all", all);
  return entry.id;
}

export async function updateEntry(id: string, { title, text }: { title: string; text: string }) {
  const { getSentiment } = await import("@/lib/analysis/sentiment");
  const { getThemes } = await import("@/lib/analysis/themes");
  const sentiment = getSentiment(text);
  const themes = getThemes(text);
  
  const all = await listEntries();
  const entryIndex = all.findIndex(entry => entry.id === id);
  
  if (entryIndex === -1) {
    throw new Error("Entry not found");
  }
  
  // Update the entry while preserving the original creation date
  all[entryIndex] = {
    ...all[entryIndex],
    title: title?.trim() || "Untitled Entry",
    text,
    sentiment,
    themes
  };
  
  await STORE.setItem("all", all);
  return all[entryIndex];
}

export async function deleteEntry(id: string) {
  const all = await listEntries();
  const entryIndex = all.findIndex(entry => entry.id === id);
  
  if (entryIndex === -1) {
    throw new Error("Entry not found");
  }
  
  // Remove the entry from the array
  all.splice(entryIndex, 1);
  
  await STORE.setItem("all", all);
  return true;
}


/**
 * Creates sample entries with different dates if no entries exist
 * Pattern: 60% completion rate from Aug 1-19, then 14-day streak
 */
export async function createSampleEntriesWithDifferentDates(): Promise<void> {
  const entries = await listEntries();
  
  if (entries.length > 0) {
    console.log('Entries already exist, skipping sample creation');
    return;
  }

  const sampleEntries: Omit<Entry, 'id' | 'createdAt'>[] = [
    // First 16 days: 60% completion rate (10 entries out of 16 days)
    // Early period - Negative/Struggling phase
    {
      title: "Overwhelming Work Day",
      text: "Work felt overwhelming today. I kept staring at my screen without making progress. Deadlines are piling up and I feel behind.",
      sentiment: { score: -0.6, label: "negative" },
      themes: ["work"]
    },
    {
      title: "Poor Sleep and Back Pain",
      text: "Slept poorly last night. My back hurt all morning and I skipped the gym. Spent the day worrying about next week's project.",
      sentiment: { score: -0.5, label: "negative" },
      themes: ["health", "work"]
    },
    {
      title: "Unproductive Meeting",
      text: "I had a long meeting where no decisions were made. Felt like a waste of energy. Ate takeout again instead of cooking.",
      sentiment: { score: -0.4, label: "negative" },
      themes: ["work", "health"]
    },
    {
      title: "Low Energy Day",
      text: "Energy levels low. I barely checked off anything from my task list. Feeling unmotivated and stuck.",
      sentiment: { score: -0.5, label: "negative" },
      themes: ["work", "health"]
    },
    {
      title: "Headache and Grinding",
      text: "Headache all day. I skipped lunch and just kept grinding. Wondering if I'm burning out.",
      sentiment: { score: -0.6, label: "negative" },
      themes: ["health", "work"]
    },
    {
      title: "Small Win, Big Worry",
      text: "A small win: I managed to write a draft report. Still, I'm behind schedule and nervous about feedback.",
      sentiment: { score: -0.2, label: "negative" },
      themes: ["work"]
    },
    {
      title: "Skipped Run Again",
      text: "Skipped my morning run again. Felt sluggish. Work meetings drained me. Hard to stay present.",
      sentiment: { score: -0.4, label: "negative" },
      themes: ["health", "work"]
    },
    {
      title: "Criticism at Work",
      text: "Coworker criticized my presentation. I know it wasn't my best work. I felt embarrassed and quiet the rest of the day.",
      sentiment: { score: -0.5, label: "negative" },
      themes: ["work", "relationships"]
    },
    {
      title: "Weekend Anxiety",
      text: "The weekend started but I couldn't relax. Kept checking emails. Anxiety carried over from the week.",
      sentiment: { score: -0.4, label: "negative" },
      themes: ["work", "general"]
    },
    {
      title: "Uninspired Day",
      text: "Did some light cleaning and laundry. Not productive beyond that. Felt okay, but uninspired.",
      sentiment: { score: -0.1, label: "neutral" },
      themes: ["general"]
    },
    
    // Recent 14-day streak - Positive/Improving phase
    {
      title: "Early Morning Jog",
      text: "Woke up early and went for a jog. Felt clearer afterward. Finished a chunk of my project.",
      sentiment: { score: 0.5, label: "positive" },
      themes: ["health", "work"]
    },
    {
      title: "Healthy Dinner Success",
      text: "Cooked a healthy dinner for myself. Felt proud of resisting takeout. Energy levels steadier today.",
      sentiment: { score: 0.4, label: "positive" },
      themes: ["health"]
    },
    {
      title: "Productive Morning",
      text: "Had a productive morning — checked off three big tasks. Coworker gave me positive feedback.",
      sentiment: { score: 0.6, label: "positive" },
      themes: ["work", "relationships"]
    },
    {
      title: "Peaceful Sunset Walk",
      text: "Took a long walk at sunset. It felt peaceful and helped me clear my head.",
      sentiment: { score: 0.5, label: "positive" },
      themes: ["health", "general"]
    },
    {
      title: "Strong Workout",
      text: "Completed my workout without struggle. Felt strong afterward.",
      sentiment: { score: 0.4, label: "positive" },
      themes: ["health"]
    },
    {
      title: "Morning Journaling",
      text: "Journaled in the morning and it gave me focus. Day felt less rushed.",
      sentiment: { score: 0.4, label: "positive" },
      themes: ["general"]
    },
    {
      title: "Meditation Practice",
      text: "I tried meditating for 10 minutes. Felt calmer during stressful calls.",
      sentiment: { score: 0.5, label: "positive" },
      themes: ["general", "work"]
    },
    {
      title: "Work Milestone",
      text: "Finished a big work milestone ahead of schedule. Celebrated with a nice meal.",
      sentiment: { score: 0.7, label: "positive" },
      themes: ["work", "health"]
    },
    {
      title: "Reconnecting with Friend",
      text: "Reconnected with an old friend over coffee. The conversation left me energized.",
      sentiment: { score: 0.6, label: "positive" },
      themes: ["relationships"]
    },
    {
      title: "Full Night's Sleep",
      text: "Slept a full 8 hours. I felt sharp all day and finished everything on my list.",
      sentiment: { score: 0.7, label: "positive" },
      themes: ["health", "work"]
    },
    {
      title: "New Recipe Success",
      text: "Tried cooking a new recipe. It turned out great — felt creative in the kitchen.",
      sentiment: { score: 0.5, label: "positive" },
      themes: ["creativity", "health"]
    },
    {
      title: "Confidence Boost",
      text: "Presented at work and got compliments on my clarity. It boosted my confidence.",
      sentiment: { score: 0.6, label: "positive" },
      themes: ["work"]
    },
    {
      title: "Mood-Lifting Hike",
      text: "Went hiking and enjoyed being outdoors. My mood lifted instantly.",
      sentiment: { score: 0.7, label: "positive" },
      themes: ["health", "general"]
    },
    {
      title: "Guitar Progress",
      text: "Practiced guitar in the evening. Fun to make progress on a hobby.",
      sentiment: { score: 0.5, label: "positive" },
      themes: ["creativity"]
    },
    {
      title: "Double Journaling",
      text: "Journaled twice today. Realized how far I've come this month.",
      sentiment: { score: 0.6, label: "positive" },
      themes: ["general"]
    },
    {
      title: "Energy to Spare",
      text: "Got through the week with energy to spare. Feeling proud of building consistency.",
      sentiment: { score: 0.7, label: "positive" },
      themes: ["work", "general"]
    }
  ];

  // Create continuous timeline: Last 30 days with entries for specific dates
  const now = new Date();
  const dates: number[] = [];
  
  // Create entries for the specific dates mentioned by user: Aug 6, 8, 10, 12, 14, 15, 17, 18, 19
  // Calculate days ago for each August date
  const augustDates = [6, 8, 10, 12, 14, 15, 17, 18, 19];
  const earlyDays = augustDates.map(day => {
    // Calculate days ago for August day
    const targetDate = new Date(2025, 7, day); // August is month 7 (0-indexed)
    const daysAgo = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo;
  });
  earlyDays.forEach(daysAgo => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(10 + (daysAgo % 7), 30 + (Math.floor(daysAgo / 7) * 15), 0, 0);
    dates.push(date.getTime());
  });
  
  // Recent 14-day streak: Last 14 days before today (days 13-0 ago)
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(10 + (i % 7), 30 + (Math.floor(i / 7) * 15), 0, 0);
    dates.push(date.getTime());
  }

  // Create entries with specific dates
  const entriesWithDates: Entry[] = sampleEntries.map((entry, index) => ({
    ...entry,
    id: crypto.randomUUID(),
    createdAt: dates[index]
  }));

  // Save to storage
  await STORE.setItem("all", entriesWithDates);
  
  console.log('Created sample entries: 20 entries in first 20 days + 14-day recent streak. Includes Aug 6, 8, 10, 12, 14, 15, 17, 18, 19');
  console.log('Sample entries:', entriesWithDates.map(e => ({
    title: e.title,
    date: new Date(e.createdAt).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  })));
}
