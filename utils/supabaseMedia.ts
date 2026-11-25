/**
 * Public Supabase Storage CDN helpers.
 * Prefer bucket URLs for heavy media (phonics / stories / stills / verbs).
 */

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || ""
).replace(/\/$/, "");

export const PHONICS_BUCKET = "phonics";
export const STORY_ANIMATIONS_BUCKET = "story-animations";
export const PUZZLE_STILLS_BUCKET = "puzzle-stills";
export const FLASHCARDS_BUCKET = "flashcards";
export const VERBS_BUCKET = "verbs";
export const PRONOUNS_BUCKET = "pronouns";

export const PRONOUNS_CDN_BASE_URL = `${
  SUPABASE_URL || "https://rgacgfnsxkiolebdnqfj.supabase.co"
}/storage/v1/object/public/${PRONOUNS_BUCKET}`;

/** Build a public object URL for a Storage bucket path. */
export function supabasePublicUrl(bucket: string, objectPath: string): string {
  const clean = objectPath.replace(/^\/+/, "");
  if (!SUPABASE_URL) {
    // Offline / misconfigured — keep a local fallback shape.
    if (bucket === PHONICS_BUCKET) return `/phonics/${clean}`;
    if (bucket === STORY_ANIMATIONS_BUCKET) return `/stories/${clean}`;
    if (bucket === PUZZLE_STILLS_BUCKET) return `/puzzle-stills/${clean}`;
    if (bucket === VERBS_BUCKET) return `/flashcards/verbs/${clean}`;
    if (bucket === FLASHCARDS_BUCKET) return `/flashcards/${clean}`;
    if (bucket === PRONOUNS_BUCKET) return `/flashcards/pronoune/${clean}`;
    return `/${bucket}/${clean}`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${clean}`;
}

/**
 * Map a project-relative phonics path to the Supabase phonics bucket.
 * Accepts `/phonics/A/a1_apple.mp4` or `A/a1_apple.mp4`.
 */
export function phonicsPublicUrl(path: string): string {
  const relative = path.replace(/^\/?phonics\//, "").replace(/^\/+/, "");
  return supabasePublicUrl(PHONICS_BUCKET, relative);
}

/**
 * Map a toddler story path to the story-animations bucket.
 * Accepts `/stories/story_toddler_01/scene1.mp4` or `story_toddler_01/scene1.mp4`.
 */
export function storyAnimationPublicUrl(path: string): string {
  const relative = path.replace(/^\/?stories\//, "").replace(/^\/+/, "");
  return supabasePublicUrl(STORY_ANIMATIONS_BUCKET, relative);
}

/**
 * Map `/puzzle-stills/a1_apple.jpg` (or bare id / filename) → puzzle-stills bucket.
 */
export function puzzleStillsPublicUrl(path: string): string {
  const relative = path
    .replace(/^\/?puzzle-stills\//, "")
    .replace(/^\/+/, "");
  return supabasePublicUrl(PUZZLE_STILLS_BUCKET, relative);
}

/**
 * Map `/flashcards/verbs/run.mp4` → verbs bucket object `run.mp4`.
 */
export function verbsPublicUrl(path: string): string {
  const relative = path
    .replace(/^\/?flashcards\/verbs\//, "")
    .replace(/^\/?verbs\//, "")
    .replace(/^\/+/, "");
  return supabasePublicUrl(VERBS_BUCKET, relative);
}

/**
 * Map `/flashcards/...` (non-verb) → flashcards bucket.
 * Verb paths are routed to the verbs bucket instead.
 */
export function flashcardsPublicUrl(path: string): string {
  if (
    path.startsWith("/flashcards/verbs/") ||
    path.startsWith("flashcards/verbs/")
  ) {
    return verbsPublicUrl(path);
  }
  const relative = path.replace(/^\/?flashcards\//, "").replace(/^\/+/, "");
  return supabasePublicUrl(FLASHCARDS_BUCKET, relative);
}

/**
 * Map `/flashcards/pronoune/...` (or bare webp filename) → pronouns bucket CDN URL.
 */
export function pronounsPublicUrl(path: string): string {
  const relative = path
    .replace(/^\/?flashcards\/pronoune\//, "")
    .replace(/^\/?pronouns\//, "")
    .replace(/^\/+/, "");
  return supabasePublicUrl(PRONOUNS_BUCKET, relative);
}

/** Rewrite known local media prefixes to Supabase public URLs. */
export function resolveAppMediaUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/phonics/") || src.startsWith("phonics/")) {
    return phonicsPublicUrl(src);
  }
  if (src.startsWith("/puzzle-stills/") || src.startsWith("puzzle-stills/")) {
    return puzzleStillsPublicUrl(src);
  }
  if (
    src.startsWith("/flashcards/verbs/") ||
    src.startsWith("flashcards/verbs/")
  ) {
    return verbsPublicUrl(src);
  }
  if (src.startsWith("/flashcards/") || src.startsWith("flashcards/")) {
    return flashcardsPublicUrl(src);
  }
  if (
    src.startsWith("/stories/story_toddler_") ||
    src.startsWith("stories/story_toddler_")
  ) {
    return storyAnimationPublicUrl(src);
  }
  return src;
}

/** Map every value in a path record through phonicsPublicUrl. */
export function mapPhonicsPaths<T extends Record<string, string>>(
  paths: T,
): { [K in keyof T]: string } {
  const out = {} as { [K in keyof T]: string };
  for (const key of Object.keys(paths) as (keyof T)[]) {
    out[key] = phonicsPublicUrl(paths[key]);
  }
  return out;
}
