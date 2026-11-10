/**
 * IQ Stories — public API (re-exports from iqStories.ts).
 * Types, fetch helpers, and offline fallback decks for /games/stories/* routes.
 */
export {
  fetchStories,
  getFallbackStories,
  getSceneLottieUrl,
  getSceneVisualWord,
  normalizeStory,
  type StoryAgeGroup,
  type StoryContent,
  type StoryPuzzle,
  type StoryRecord,
  type StorySceneData as StoryScene,
} from "@/utils/iqStories";
