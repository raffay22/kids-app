/**
 * Word → react-useanimations icon mapping for Illustration tier-3 fallback.
 * Only explicit matches — no fuzzy guessing.
 */
import type { Animation } from "react-useanimations/utils";
import activity from "react-useanimations/lib/activity";
import alertCircle from "react-useanimations/lib/alertCircle";
import arrowDown from "react-useanimations/lib/arrowDown";
import arrowUp from "react-useanimations/lib/arrowUp";
import bookmark from "react-useanimations/lib/bookmark";
import calendar from "react-useanimations/lib/calendar";
import checkBox from "react-useanimations/lib/checkBox";
import checkmark from "react-useanimations/lib/checkmark";
import download from "react-useanimations/lib/download";
import explore from "react-useanimations/lib/explore";
import heart from "react-useanimations/lib/heart";
import help from "react-useanimations/lib/help";
import home from "react-useanimations/lib/home";
import loading from "react-useanimations/lib/loading";
import lock from "react-useanimations/lib/lock";
import mail from "react-useanimations/lib/mail";
import menu from "react-useanimations/lib/menu";
import microphone from "react-useanimations/lib/microphone";
import notification from "react-useanimations/lib/notification";
import playPause from "react-useanimations/lib/playPause";
import searchToX from "react-useanimations/lib/searchToX";
import settings from "react-useanimations/lib/settings";
import star from "react-useanimations/lib/star";
import thumbUp from "react-useanimations/lib/thumbUp";
import trash from "react-useanimations/lib/trash";
import video from "react-useanimations/lib/video";
import volume from "react-useanimations/lib/volume";
import { resolveIllustrationWord } from "@/utils/illustrations";

/** Common words / categories → use-animations icon */
const WORD_TO_USE_ANIMATION: Record<string, Animation> = {
  // Motion & actions
  jump: arrowUp,
  climb: arrowUp,
  up: arrowUp,
  rise: arrowUp,
  down: arrowDown,
  fall: arrowDown,
  run: activity,
  exercise: activity,
  active: activity,
  sport: activity,

  // Feelings & rewards
  heart: heart,
  love: heart,
  like: heart,
  favorite: star,
  star: star,
  reward: star,
  trophy: star,
  prize: star,
  great: thumbUp,
  good: thumbUp,
  yes: checkmark,
  correct: checkmark,
  success: checkmark,
  check: checkmark,
  done: checkmark,
  select: checkBox,
  checkbox: checkBox,

  // UI / utility concepts
  search: searchToX,
  find: searchToX,
  menu: menu,
  loading: loading,
  wait: loading,
  trash: trash,
  delete: trash,
  remove: trash,
  volume: volume,
  sound: volume,
  speak: volume,
  talk: volume,
  sing: microphone,
  microphone: microphone,
  lock: lock,
  secure: lock,
  settings: settings,
  gear: settings,
  download: download,
  alert: alertCircle,
  warning: alertCircle,
  caution: alertCircle,
  help: help,
  question: help,
  home: home,
  house: home,
  explore: explore,
  discover: explore,
  play: playPause,
  video: video,
  mail: mail,
  email: mail,
  bookmark: bookmark,
  save: bookmark,
  read: bookmark,
  book: bookmark,
  homework: bookmark,
  assignment: bookmark,
  assignments: bookmark,
  teacher: bookmark,
  notification: notification,
  calendar: calendar,
  morning: calendar,
  promptly: calendar,
};

export function resolveUseAnimationIcon(rawWord: string): Animation | null {
  const key = resolveIllustrationWord(rawWord);
  if (!key) return null;
  return WORD_TO_USE_ANIMATION[key] ?? null;
}
