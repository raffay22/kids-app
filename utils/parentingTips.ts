/**
 * Curated evidence-based early childhood & parenting tips (ages 2–8).
 * Topics: growth mindset, praising effort, bedtime reading, playful math,
 * emotional resilience, and balanced screen time.
 */

export const PARENTING_TIPS: readonly string[] = [
  // Growth Mindset & Praising Effort Over Intelligence
  "Praise the effort, not just the result — say 'You worked so hard on that!' instead of 'You're so smart.'",
  "Add the magic word 'yet' when your child says 'I can't do it' — turn it into 'I can't do it yet!'",
  "Celebrate mistakes as brain-builders: remind your child that every try makes their brain grow stronger.",
  "Ask 'What part was the trickiest, and how did you figure it out?' to build problem-solving pride.",
  "Model curiosity out loud — let your child hear you say 'I don't know, let's find out together!'",
  "Notice specific effort: 'I saw how carefully you matched each color and didn't give up!'",
  "Give your child 5 extra seconds of quiet thinking time before jumping in with a hint.",
  "Let your child teach YOU a word or puzzle they just learned — teaching deepens memory.",

  // Bedtime Reading & Storytelling Habits
  "Just 10 minutes of cozy bedtime stories every night builds over 300,000 new vocabulary exposures a year.",
  "Pause during a bedtime story to ask 'What do you think happens next?' to spark imagination.",
  "Point to pictures while reading aloud — connecting words to images accelerates early literacy.",
  "Ask 'How do you think the character feels right now?' during stories to nurture empathy.",
  "Re-reading a favorite story is wonderful! Repetition helps toddlers master new words and rhythm.",
  "End bedtime stories with one warm question: 'What was your favorite part of today?'",
  "Act out funny animal voices during storytime — joyful emotion locks in new language faster.",
  "Keep a calm, consistent bedtime story routine to signal safety and help little minds wind down.",

  // Playful Everyday Math & Logic
  "Count stairs together as you walk up — everyday movement makes early math feel like play!",
  "Turn snack time into math time: 'You have 4 grapes; if you eat 1, how many are left?'",
  "Hunt for shapes on walks — spot circle wheels, rectangle doors, and triangle road signs.",
  "Sort laundry by color or size together; matching and grouping build strong early logic skills.",
  "Play 'bigger or smaller' with everyday cups, spoons, and shoes to introduce comparison early.",
  "Let your child help measure a cup of water or count 3 spoons while cooking together.",
  "Create simple clap-tap patterns (clap, tap, clap, tap) and invite your child to guess what comes next.",
  "Use number words naturally all day: 'First put on socks, second put on shoes!'",

  // Emotional Resilience & Confidence
  "Name big feelings gently: 'I see you feel frustrated because the block fell. I'm right here with you.'",
  "Practice 'smell the flower, blow the candle' deep breaths together when emotions run high.",
  "Offer two simple choices ('Red cup or blue cup?') to help toddlers feel confident and respected.",
  "Stay calm during tough moments — your steady voice is your child's favorite anchor.",
  "Remind your child that all feelings are okay, even when we choose gentle hands and kind words.",
  "Create a cozy 'calm corner' with a soft pillow where your child can reset anytime.",
  "Celebrate small acts of kindness — noticing gentle sharing makes empathy grow every day.",
  "Give a warm hug before correcting a mistake so your child always feels safe to try again.",

  // Balanced Screen Time & Active Learning
  "Co-play for just 5 minutes a day — talking about what's on screen doubles early learning.",
  "Pair screen learning with real-world play: after a phonics letter, spot 3 things in the room starting with it!",
  "Use a friendly 2-minute warning before ending screen time to make transitions smooth and tear-free.",
  "Short, focused 10–15 minute learning bursts work far better for young brains than long passive sessions.",
  "Choose interactive, ad-free learning spaces where your child taps, thinks, and creates instead of just scrolling.",
  "Keep screens out of the last 30 minutes before sleep so melatonin and deep rest stay protected.",
  "Celebrate finishing a learning session with a stretch, dance, or glass of water.",
  "Ask your child to show you their favorite star or puzzle from today's session!",

  // Everyday Language & Curiosity
  "Expand your child's short phrases warmly: when they say 'Big dog!', reply 'Yes, a big brown fluffy dog!'",
  "Narrate simple daily routines ('Now we're pouring cool water') to bathe toddlers in rich language.",
  "Sing nursery rhymes and phonics songs in the car — rhythm helps brains hear letter sounds.",
  "Follow your child's lead during play for 10 minutes — child-led play builds deep focus and joy.",
  "Every tiny milestone counts: one new word, one new puzzle, one brave try at a time!",
] as const;

/**
 * Picks a fresh random parenting tip every time a share modal or card is opened.
 * Optionally excludes the currently displayed tip so "New Tip" always rotates.
 */
export function getRandomParentingTip(exclude?: string): string {
  if (PARENTING_TIPS.length === 0) {
    return "Praise effort over results — every try builds a stronger brain!";
  }
  const pool =
    exclude && PARENTING_TIPS.length > 1
      ? PARENTING_TIPS.filter((t) => t !== exclude)
      : PARENTING_TIPS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? PARENTING_TIPS[0];
}
