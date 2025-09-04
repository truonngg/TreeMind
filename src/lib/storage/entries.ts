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
