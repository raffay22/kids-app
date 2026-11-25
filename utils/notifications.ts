/**
 * Local PWA practice reminders (no VAPID server push in this pass).
 */

import { readCachedStreak, todayLocalISO } from "@/utils/streaks";

const PERM_KEY = "practice_reminder_permission";
const LAST_SHOWN_KEY = "practice_reminder_last_shown";
const PREF_HOUR_KEY = "practice_reminder_hour"; // default 18

export type ReminderPermission = NotificationPermission | "unsupported";

export function getReminderPermission(): ReminderPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  const stored = window.localStorage.getItem(PERM_KEY) as ReminderPermission | null;
  return stored || Notification.permission;
}

export async function enablePracticeReminders(): Promise<ReminderPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  const result = await Notification.requestPermission();
  window.localStorage.setItem(PERM_KEY, result);
  if (!window.localStorage.getItem(PREF_HOUR_KEY)) {
    window.localStorage.setItem(PREF_HOUR_KEY, "18");
  }
  if (result === "granted") {
    void maybeShowPracticeReminder(null);
  }
  return result;
}

function reminderHour(): number {
  if (typeof window === "undefined") return 18;
  const raw = Number(window.localStorage.getItem(PREF_HOUR_KEY) || "18");
  return Number.isFinite(raw) ? Math.min(23, Math.max(0, raw)) : 18;
}

function practicedToday(childId: string | null): boolean {
  const cached = readCachedStreak(childId);
  return cached.last === todayLocalISO();
}

function buildReminder(childId: string | null): { title: string; body: string } {
  const cached = readCachedStreak(childId);
  const day = new Date().getDay(); // 0 Sun … 6 Sat
  const isWeekend = day === 0 || day === 6;

  if (cached.current <= 0) {
    return {
      title: "Your mascot misses you!",
      body: "Come play a 2-minute game!",
    };
  }
  if (isWeekend) {
    return {
      title: "New Free Worksheet Bundle!",
      body: "A fresh 50-page pack is waiting in Worksheet Hub!",
    };
  }
  return {
    title: "Your Streak is in Danger!",
    body: `Don't let your ${cached.current}-Day Streak break! Spend 2 minutes with Phonics today.`,
  };
}

async function showViaServiceWorker(title: string, body: string): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      tag: "practice-streak-reminder",
      data: { url: "/" },
    });
    return true;
  } catch {
    return false;
  }
}

function showViaNotificationApi(title: string, body: string): void {
  try {
    const n = new Notification(title, {
      body,
      icon: "/icons/icon-192.svg",
      tag: "practice-streak-reminder",
    });
    n.onclick = () => {
      window.focus();
      window.location.href = "/";
      n.close();
    };
  } catch {
    // ignore
  }
}

/**
 * If permission granted, past preferred hour, and not practiced today —
 * show at most one reminder per local calendar day.
 */
export async function maybeShowPracticeReminder(
  childId: string | null,
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  if (practicedToday(childId)) return false;

  const hour = new Date().getHours();
  if (hour < reminderHour()) return false;

  const today = todayLocalISO();
  if (window.localStorage.getItem(LAST_SHOWN_KEY) === today) return false;

  const { title, body } = buildReminder(childId);
  const viaSw = await showViaServiceWorker(title, body);
  if (!viaSw) showViaNotificationApi(title, body);
  window.localStorage.setItem(LAST_SHOWN_KEY, today);
  return true;
}
