import localforage from "localforage";

export type Entry = {
  id: string; 
  createdAt: number;
  title: string; 
  text: string;
  sentiment: { score: number; label: "positive"|"neutral"|"negative" };
  themes: string[];
};

const STORE = localforage.createInstance({ name: "treemind", storeName: "entries" });

export async function listEntries(): Promise<Entry[]> {
  const all: Entry[] = (await STORE.getItem("all")) || [];
  return all.sort((a,b)=>b.createdAt - a.createdAt);
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
