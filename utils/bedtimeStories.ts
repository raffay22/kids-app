export type BedtimeStory = {
  story_id: string;
  title: string;
  theme: string;
  moral?: string;
  cover_image: string;
  video_url: string | null;
  is_ready: boolean;
  blurb: string;
};

/** 6 stories per library page (page buttons change the list, not the film). */
export const BEDTIME_STORIES_PER_PAGE = 6;
/** CATALOG_VERSION: 18 */

/**
 * Bedtime story shelf. First card is the finished Prince Leo film.
 * Extra slots keep the 6-per-page grid full; ready=false = Coming soon.
 */
export const BEDTIME_STORIES: BedtimeStory[] = [
  {
    story_id: "story_moral_01",
    title: "Prince Leo's Kind Crown",
    theme: "kindness",
    moral: "A kind heart is the brightest crown you can ever wear!",
    cover_image: "/stories/story_moral_01/cover.jpg",
    video_url: "/stories/story_moral_01/story.mp4",
    is_ready: true,
    blurb: "A sweet bedtime tale about sharing kindness.",
  },
  {
    story_id: "story_moral_02",
    title: "Barnaby Bear and the Big Shared Umbrella",
    theme: "sharing",
    moral: "Sharing with friends makes even the rainiest day bright and sunny!",
    cover_image: "/stories/story_moral_02/cover.jpg",
    video_url: "/stories/story_moral_02/story.mp4",
    is_ready: true,
    blurb: "A rainy-day bedtime tale about sharing with friends.",
  },
  {
    story_id: "story_moral_03",
    title: "Milo the Monkey and the Truth Tree",
    theme: "honesty",
    moral: "Always tell the truth! Honesty builds trust and makes your heart shine!",
    cover_image: "/stories/story_moral_03/cover.jpg",
    video_url: "/stories/story_moral_03/story.mp4",
    is_ready: true,
    blurb: "A jungle bedtime tale about telling the truth.",
  },
  {
    story_id: "story_moral_04",
    title: "Dottie Dolphin and the Clean Reef",
    theme: "teamwork",
    moral: "When we work together to keep our environment clean, everybody wins!",
    cover_image: "/stories/story_moral_04/cover.jpg",
    video_url: "/stories/story_moral_04/story.mp4",
    is_ready: true,
    blurb: "An ocean bedtime tale about cleaning up together.",
  },
  {
    story_id: "story_moral_05",
    title: "Pip the Little Penguin's Patience Tower",
    theme: "patience",
    moral: "Patience and trying again turn mistakes into magic!",
    cover_image: "/stories/story_moral_05/cover.jpg",
    video_url: "/stories/story_moral_05/story.mp4",
    is_ready: true,
    blurb: "An Arctic bedtime tale about patience and trying again.",
  },
  {
    story_id: "story_moral_06",
    title: "Bella Butterfly and the Magic Words",
    theme: "manners",
    moral: "Magic words like Please and Thank You open every heart!",
    cover_image: "/stories/story_moral_06/cover.jpg",
    video_url: "/stories/story_moral_06/story.mp4",
    is_ready: true,
    blurb: "A meadow bedtime tale about please and thank you.",
  },
  {
    story_id: "story_moral_07",
    title: "Leo the Little Lion's Brave Night",
    theme: "bravery",
    moral: "Being brave means looking closer—fear fades when light shines!",
    cover_image: "/stories/story_moral_07/cover.jpg",
    video_url: "/stories/story_moral_07/story.mp4",
    is_ready: true,
    blurb: "A starry bedtime tale about being brave in the dark.",
  },
  {
    story_id: "story_moral_08",
    title: "Little Joey Cares for Mom",
    theme: "caring",
    moral: "Caring for your mother brings the sweetest love to your heart!",
    cover_image: "/stories/story_moral_08/cover.jpg",
    video_url: "/stories/story_moral_08/story.mp4",
    is_ready: true,
    blurb: "A bush-meadow bedtime tale about caring for Mom.",
  },
  {
    story_id: "story_moral_09",
    title: "Sammy Squirrel's Tidy Toy Box",
    theme: "cleanliness",
    moral: "Cleaning up your toys after play keeps your room happy, safe, and tidy!",
    cover_image: "/stories/story_moral_09/cover.jpg",
    video_url: "/stories/story_moral_09/story.mp4",
    is_ready: true,
    blurb: "A treehouse bedtime tale about cleaning up after play.",
  },
  {
    story_id: "story_moral_10",
    title: "Oliver Owl and the Glowing Starlight",
    theme: "wonder",
    moral: "Always keep your eyes open—the world is full of magical wonders waiting for you!",
    cover_image: "/stories/story_moral_10/cover.jpg",
    video_url: "/stories/story_moral_10/story.mp4",
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
