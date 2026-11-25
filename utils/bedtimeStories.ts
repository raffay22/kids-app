export type BedtimeStory = {
  story_id: string;
  title: string;
  theme: string;
  moral?: string;
  cover_image: string;
  /**
   * Local / Supabase fallback MP4 (optional once YouTube merge URLs are filled).
   * Keep null when the film only lives on YouTube so it is not shipped in the app.
   */
  video_url: string | null;
  /**
   * YouTube URL for the finished English merged film.
   * Paste the public watch/share link when the upload is done.
   */
  youtube_url_en: string | null;
  is_ready: boolean;
  blurb: string;
};

/** 6 stories per library page (page buttons change the list, not the film). */
export const BEDTIME_STORIES_PER_PAGE = 6;
/** CATALOG_VERSION: 18 */

/**
 * Configuration dictionary: YouTube Video IDs for Stories 1 to 18.
 * Story index 1 to 18 maps directly to its verified YouTube ID.
 */
export const BEDTIME_YOUTUBE_CONFIG: Record<
  number,
  { storyId: string; videoId: string; title: string }
> = {
  1: {
    storyId: "story_moral_01",
    videoId: "y1Vx3jwFUOo",
    title: "Prince Leo's Kind Crown",
  },
  2: {
    storyId: "story_moral_02",
    videoId: "r2K9GkEjH78",
    title: "Barnaby Bear and the Big Shared Umbrella",
  },
  3: {
    storyId: "story_moral_03",
    videoId: "k_mqBrGPJiA",
    title: "Milo the Monkey and the Truth Tree",
  },
  4: {
    storyId: "story_moral_04",
    videoId: "b0eglcTgVHM",
    title: "Dottie Dolphin and the Clean Reef",
  },
  5: {
    storyId: "story_moral_05",
    videoId: "fOqZT6Q9dKw",
    title: "Pip the Little Penguin's Patience Tower",
  },
  6: {
    storyId: "story_moral_06",
    videoId: "7B-1XdDymGo",
    title: "Bella Butterfly and the Magic Words",
  },
  7: {
    storyId: "story_moral_07",
    videoId: "865120l3pzE",
    title: "Leo the Little Lion's Brave Night",
  },
  8: {
    storyId: "story_moral_08",
    videoId: "mgPDYgpoQ6A",
    title: "Little Joey Cares for Mom",
  },
  9: {
    storyId: "story_moral_09",
    videoId: "J1KWK9hlUF0",
    title: "Sammy Squirrel's Tidy Toy Box",
  },
  10: {
    storyId: "story_moral_10",
    videoId: "WwTN506JXZE",
    title: "Oliver Owl and the Glowing Starlight",
  },
  11: {
    storyId: "story_moral_11",
    videoId: "qlA46OinXPA",
    title: "Toby Turtle's Fresh Morning Routine",
  },
  12: {
    storyId: "story_moral_12",
    videoId: "Ll-NUHmgt_k",
    title: "Kiki Koala and the Magic Paintbrush",
  },
  13: {
    storyId: "story_moral_13",
    videoId: "K8dvAabz21w",
    title: "Benny Beaver and the River Bridge",
  },
  14: {
    storyId: "story_moral_14",
    videoId: "3eNA7PqwnQw",
    title: "Penny Panda's Clean Hands Song",
  },
  15: {
    storyId: "story_moral_15",
    videoId: "hLUrwxKd22U",
    title: "Fiona Fox and the Dancing Cloud Shapes",
  },
  16: {
    storyId: "story_moral_16",
    videoId: "AjV24AfVn_0",
    title: "Milo the Elephant's Surprise for Grandma",
  },
  17: {
    storyId: "story_moral_17",
    videoId: "EZmrw3qtr8M",
    title: "Zack Zebra's Fair Share Snack",
  },
  18: {
    storyId: "story_moral_18",
    videoId: "VliWbYW_wDM",
    title: "Luna Dragon's Moon Lullaby",
  },
};

export const BEDTIME_YOUTUBE_BY_STORY_ID: Record<string, string> = Object.values(
  BEDTIME_YOUTUBE_CONFIG,
).reduce<Record<string, string>>((acc, item) => {
  acc[item.storyId] = item.videoId;
  return acc;
}, {});

export function getBedtimeStoryYouTubeId(storyIdOrIndex: string | number): string | null {
  if (typeof storyIdOrIndex === "number") {
    return BEDTIME_YOUTUBE_CONFIG[storyIdOrIndex]?.videoId ?? null;
  }
  if (BEDTIME_YOUTUBE_BY_STORY_ID[storyIdOrIndex]) {
    return BEDTIME_YOUTUBE_BY_STORY_ID[storyIdOrIndex];
  }
  const story = BEDTIME_STORIES.find((s) => s.story_id === storyIdOrIndex);
  if (story?.youtube_url_en) {
    return getYouTubeVideoId(story.youtube_url_en);
  }
  return null;
}

/**
 * Bedtime story shelf.
 * Prefer YouTube merge URLs so heavy films stay off the app bundle.
 * `video_url` is only a local/Supabase fallback while YouTube links are empty.
 */
export const BEDTIME_STORIES: BedtimeStory[] = [
  {
    story_id: "story_moral_01",
    title: "Prince Leo's Kind Crown",
    theme: "kindness",
    moral: "A kind heart is the brightest crown you can ever wear!",
    cover_image: "https://img.youtube.com/vi/y1Vx3jwFUOo/hqdefault.jpg",
    video_url: "/stories/story_moral_01/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=y1Vx3jwFUOo",
    is_ready: true,
    blurb: "A sweet bedtime tale about sharing kindness.",
  },
  {
    story_id: "story_moral_02",
    title: "Barnaby Bear and the Big Shared Umbrella",
    theme: "sharing",
    moral: "Sharing with friends makes even the rainiest day bright and sunny!",
    cover_image: "https://img.youtube.com/vi/r2K9GkEjH78/hqdefault.jpg",
    video_url: "/stories/story_moral_02/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=r2K9GkEjH78",
    is_ready: true,
    blurb: "A rainy-day bedtime tale about sharing with friends.",
  },
  {
    story_id: "story_moral_03",
    title: "Milo the Monkey and the Truth Tree",
    theme: "honesty",
    moral: "Always tell the truth! Honesty builds trust and makes your heart shine!",
    cover_image: "https://img.youtube.com/vi/k_mqBrGPJiA/hqdefault.jpg",
    video_url: "/stories/story_moral_03/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=k_mqBrGPJiA",
    is_ready: true,
    blurb: "A jungle bedtime tale about telling the truth.",
  },
  {
    story_id: "story_moral_04",
    title: "Dottie Dolphin and the Clean Reef",
    theme: "teamwork",
    moral: "When we work together to keep our environment clean, everybody wins!",
    cover_image: "https://img.youtube.com/vi/b0eglcTgVHM/hqdefault.jpg",
    video_url: "/stories/story_moral_04/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=b0eglcTgVHM",
    is_ready: true,
    blurb: "An ocean bedtime tale about cleaning up together.",
  },
  {
    story_id: "story_moral_05",
    title: "Pip the Little Penguin's Patience Tower",
    theme: "patience",
    moral: "Patience and trying again turn mistakes into magic!",
    cover_image: "https://img.youtube.com/vi/fOqZT6Q9dKw/hqdefault.jpg",
    video_url: "/stories/story_moral_05/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=fOqZT6Q9dKw",
    is_ready: true,
    blurb: "An Arctic bedtime tale about patience and trying again.",
  },
  {
    story_id: "story_moral_06",
    title: "Bella Butterfly and the Magic Words",
    theme: "manners",
    moral: "Magic words like Please and Thank You open every heart!",
    cover_image: "https://img.youtube.com/vi/7B-1XdDymGo/hqdefault.jpg",
    video_url: "/stories/story_moral_06/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=7B-1XdDymGo",
    is_ready: true,
    blurb: "A meadow bedtime tale about please and thank you.",
  },
  {
    story_id: "story_moral_07",
    title: "Leo the Little Lion's Brave Night",
    theme: "bravery",
    moral: "Being brave means looking closer—fear fades when light shines!",
    cover_image: "https://img.youtube.com/vi/865120l3pzE/hqdefault.jpg",
    video_url: "/stories/story_moral_07/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=865120l3pzE",
    is_ready: true,
    blurb: "A starry bedtime tale about being brave in the dark.",
  },
  {
    story_id: "story_moral_08",
    title: "Little Joey Cares for Mom",
    theme: "caring",
    moral: "Caring for your mother brings the sweetest love to your heart!",
    cover_image: "https://img.youtube.com/vi/mgPDYgpoQ6A/hqdefault.jpg",
    video_url: "/stories/story_moral_08/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=mgPDYgpoQ6A",
    is_ready: true,
    blurb: "A bush-meadow bedtime tale about caring for Mom.",
  },
  {
    story_id: "story_moral_09",
    title: "Sammy Squirrel's Tidy Toy Box",
    theme: "cleanliness",
    moral: "Cleaning up your toys after play keeps your room happy, safe, and tidy!",
    cover_image: "https://img.youtube.com/vi/J1KWK9hlUF0/hqdefault.jpg",
    video_url: "/stories/story_moral_09/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=J1KWK9hlUF0",
    is_ready: true,
    blurb: "A treehouse bedtime tale about cleaning up after play.",
  },
  {
    story_id: "story_moral_10",
    title: "Oliver Owl and the Glowing Starlight",
    theme: "wonder",
    moral: "Always keep your eyes open—the world is full of magical wonders waiting for you!",
    cover_image: "https://img.youtube.com/vi/WwTN506JXZE/hqdefault.jpg",
    video_url: "/stories/story_moral_10/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=WwTN506JXZE",
    is_ready: true,
    blurb: "A starry bedtime tale about wonder in the night sky.",
  },
  {
    story_id: "story_moral_11",
    title: "Toby Turtle's Fresh Morning Routine",
    theme: "healthy habits",
    moral: "A clean face, bright teeth, and a healthy breakfast make every day awesome!",
    cover_image: "/stories/story_moral_11/cover.jpg",
    video_url: "/stories/story_moral_11/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=qlA46OinXPA",
    is_ready: true,
    blurb: "A sunny morning tale about washing up and eating well.",
  },
  {
    story_id: "story_moral_12",
    title: "Kiki Koala and the Magic Paintbrush",
    theme: "creativity",
    moral: "Your imagination can paint bright colors into the whole wide world!",
    cover_image: "/stories/story_moral_12/cover.jpg",
    video_url: "/stories/story_moral_12/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=Ll-NUHmgt_k",
    is_ready: true,
    blurb: "A colorful bedtime tale about imagination and painting.",
  },
  {
    story_id: "story_moral_13",
    title: "Benny Beaver and the River Bridge",
    theme: "helping",
    moral: "Helping others cross life's little obstacles brings everyone closer together!",
    cover_image: "/stories/story_moral_13/cover.jpg",
    video_url: "/stories/story_moral_13/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=K8dvAabz21w",
    is_ready: true,
    blurb: "A riverbank bedtime tale about helping neighbors.",
  },
  {
    story_id: "story_moral_14",
    title: "Penny Panda's Clean Hands Song",
    theme: "hygiene",
    moral: "Washing your hands with soap before eating keeps tummy bugs away!",
    cover_image: "/stories/story_moral_14/cover.jpg",
    video_url: "/stories/story_moral_14/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=3eNA7PqwnQw",
    is_ready: true,
    blurb: "A bamboo-garden bedtime tale about washing hands before snacks.",
  },
  {
    story_id: "story_moral_15",
    title: "Fiona Fox and the Dancing Cloud Shapes",
    theme: "imagination",
    moral: "Look up at the sky—your imagination can find magical pictures in every passing cloud!",
    cover_image: "/stories/story_moral_15/cover.jpg",
    video_url: "/stories/story_moral_15/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=hLUrwxKd22U",
    is_ready: true,
    blurb: "A sky-watching bedtime tale about cloud imagination.",
  },
  {
    story_id: "story_moral_16",
    title: "Milo the Elephant's Surprise for Grandma",
    theme: "grandparents",
    moral: "Loving and caring for your grandparents fills your heart with warmth and happiness!",
    cover_image: "/stories/story_moral_16/cover.jpg",
    video_url: "/stories/story_moral_16/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=AjV24AfVn_0",
    is_ready: true,
    blurb: "A savannah bedtime tale about caring for Grandma.",
  },
  {
    story_id: "story_moral_17",
    title: "Zack Zebra's Fair Share Snack",
    theme: "sharing",
    moral: "Sharing your treats fairly with friends turns a simple snack into sweet joy!",
    cover_image: "/stories/story_moral_17/cover.jpg",
    video_url: "/stories/story_moral_17/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=EZmrw3qtr8M",
    is_ready: true,
    blurb: "A savannah bedtime tale about fair sharing with friends.",
  },
  {
    story_id: "story_moral_18",
    title: "Luna Dragon's Moon Lullaby",
    theme: "bedtime",
    moral: "Sweet dreams filled with peaceful starlight and cozy night wonder.",
    cover_image: "/stories/story_moral_18/cover.jpg",
    video_url: "/stories/story_moral_18/story.mp4",
    youtube_url_en: "https://www.youtube.com/watch?v=VliWbYW_wDM",
    is_ready: true,
    blurb: "A starry bedtime lullaby with Luna Dragon and the moon.",
  },
];

export function getBedtimeStory(storyId: string): BedtimeStory | null {
  return BEDTIME_STORIES.find((s) => s.story_id === storyId) ?? null;
}

export function getBedtimePageCount(): number {
  return Math.max(1, Math.ceil(BEDTIME_STORIES.length / BEDTIME_STORIES_PER_PAGE));
}

export function getBedtimeStoriesPage(page: number): BedtimeStory[] {
  const safe = Math.min(Math.max(1, page), getBedtimePageCount());
  const start = (safe - 1) * BEDTIME_STORIES_PER_PAGE;
  return BEDTIME_STORIES.slice(start, start + BEDTIME_STORIES_PER_PAGE);
}

/** Prefer YouTube merge URL; fall back to local MP4. */
export function getBedtimePlayback(
  story: BedtimeStory,
): { kind: "youtube" | "file"; url: string } | null {
  if (story.youtube_url_en) return { kind: "youtube", url: story.youtube_url_en };
  if (story.video_url) return { kind: "file", url: story.video_url };
  return null;
}

/** Extract a YouTube video id from watch / youtu.be / embed / shorts URLs. */
export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        return parts[1] || null;
      }
    }
  } catch {
    // ignore bad URLs
  }
  return null;
}
