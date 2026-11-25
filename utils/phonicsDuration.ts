/** Clip length of each looping 3D take (visual only). */
export const PHONICS_CARD_DURATION_S = 3;

/**
 * HARD rule for every A1–Z5 card:
 * - Speak `elevenlabs_script` from alphabet_phonics_3d_schema.json in full.
 * - Keep the 3s video looping until that sound finishes.
 * - When the sound ends, stop the video loop. Do not cut the voice.
 */
export const PHONICS_VIDEO_LOOPS_UNTIL_VOICE_ENDS = true;
