import localforage from "localforage";
import { createClient } from "@/utils/supabase/client";

export type ProgressLogEntry = {
  user_id: string;
  child_id: string;
  feature_route: string;
  attempt_type: "tap" | "speech";
  target_word: string;
  is_correct: boolean;
  timestamp: string;
};

const QUEUE_KEY = "pending_progress_logs";
let flushListenerAttached = false;

const queueStore = localforage.createInstance({ name: "kids-learning", storeName: "progress_queue" });

async function getQueue(): Promise<ProgressLogEntry[]> {
  return (await queueStore.getItem<ProgressLogEntry[]>(QUEUE_KEY)) ?? [];
}

async function setQueue(entries: ProgressLogEntry[]): Promise<void> {
  if (entries.length === 0) {
    await queueStore.removeItem(QUEUE_KEY);
  } else {
    await queueStore.setItem(QUEUE_KEY, entries);
  }
}

async function flushQueue(): Promise<void> {
  const queue = await getQueue();
  if (queue.length === 0) return;

  let supabase;
  try {
    supabase = createClient();
  } catch {
    return;
  }

  const { error } = await supabase.from("user_progress").insert(
    queue.map((entry) => ({
      user_id: entry.user_id,
      child_id: entry.child_id,
      feature_route: entry.feature_route,
      attempt_type: entry.attempt_type,
      target_word: entry.target_word,
      is_correct: entry.is_correct,
      timestamp: entry.timestamp,
    })),
  );

  if (!error) {
    await setQueue([]);
  }
}

export function initProgressSync(): void {
  if (typeof window === "undefined" || flushListenerAttached) return;
  flushListenerAttached = true;

  window.addEventListener("online", () => {
    void flushQueue();
  });

  if (navigator.onLine) {
    void flushQueue();
  }
}

export async function logProgress(entry: Omit<ProgressLogEntry, "timestamp">): Promise<void> {
  const record: ProgressLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const queue = await getQueue();
    queue.push(record);
    await setQueue(queue);
    return;
  }

  let supabase;
  try {
    supabase = createClient();
  } catch {
    const queue = await getQueue();
    queue.push(record);
    await setQueue(queue);
    return;
  }

  const { error } = await supabase.from("user_progress").insert({
    user_id: record.user_id,
    child_id: record.child_id,
    feature_route: record.feature_route,
    attempt_type: record.attempt_type,
    target_word: record.target_word,
    is_correct: record.is_correct,
    timestamp: record.timestamp,
  });

  if (error) {
    const queue = await getQueue();
    queue.push(record);
    await setQueue(queue);
  }
}

export async function getPendingQueueCount(): Promise<number> {
  return (await getQueue()).length;
}
