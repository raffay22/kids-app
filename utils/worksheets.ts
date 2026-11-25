export type WorksheetCategory =
  | "maths"
  | "colouring"
  | "matching"
  | "verbs"
  | "pronouns"
  | "logic";

export type WorksheetBundle = {
  id: string;
  title: string;
  category: WorksheetCategory;
  pages: number;
  pricePkr: number;
  pdfUrl: string;
  blurb: string;
};

export const WORKSHEET_FILTERS: { id: "all" | WorksheetCategory; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "maths", label: "MATHS" },
  { id: "colouring", label: "COLOURING" },
  { id: "matching", label: "MATCHING" },
  { id: "verbs", label: "VERBS" },
  { id: "pronouns", label: "PRONOUNS" },
  { id: "logic", label: "LOGIC" },
];

/** Full 25-bundle EYFS / Common Core catalog (50 pages each). */
export const WORKSHEET_BUNDLES: WorksheetBundle[] = [
  { id: "WB-MATH-01", title: "Early Counting & Numbers", category: "maths", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATH-01.pdf", blurb: "Trace 1–10, count objects, circle totals." },
  { id: "WB-MATH-02", title: "Number Bonds to 10", category: "maths", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATH-02.pdf", blurb: "Make 10, part–part–whole, missing numbers." },
  { id: "WB-MATH-03", title: "Shapes & Patterns", category: "maths", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATH-03.pdf", blurb: "Trace shapes, continue patterns, sort attributes." },
  { id: "WB-MATH-04", title: "Add & Take Away", category: "maths", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATH-04.pdf", blurb: "Plus stories, take away, picture equations." },
  { id: "WB-MATH-05", title: "Compare & Measure", category: "maths", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATH-05.pdf", blurb: "Bigger/smaller, tall/short, match sets." },
  { id: "WB-COLOR-01", title: "Animal Tracing & Colouring", category: "colouring", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-COLOR-01.pdf", blurb: "Calm animal outlines for colouring." },
  { id: "WB-COLOR-02", title: "Fruit & Food Colouring", category: "colouring", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-COLOR-02.pdf", blurb: "Healthy foods line-art pack." },
  { id: "WB-COLOR-03", title: "Vehicle Colouring", category: "colouring", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-COLOR-03.pdf", blurb: "Cars, buses, boats outlines." },
  { id: "WB-COLOR-04", title: "Nature & Weather", category: "colouring", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-COLOR-04.pdf", blurb: "Trees, clouds, sun sensory pages." },
  { id: "WB-COLOR-05", title: "Home & Family", category: "colouring", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-COLOR-05.pdf", blurb: "Everyday life colouring scenes." },
  { id: "WB-MATCH-01", title: "Picture Matching", category: "matching", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATCH-01.pdf", blurb: "Shadow match, pairs, odd one out." },
  { id: "WB-MATCH-02", title: "Noun Matching", category: "matching", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATCH-02.pdf", blurb: "Picture-to-word recognition." },
  { id: "WB-MATCH-03", title: "Colour & Size Match", category: "matching", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATCH-03.pdf", blurb: "Attribute matching for ages 2–6." },
  { id: "WB-MATCH-04", title: "Living vs Non-Living", category: "logic", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATCH-04.pdf", blurb: "Science sorting grids." },
  { id: "WB-MATCH-05", title: "Opposites Match", category: "matching", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-MATCH-05.pdf", blurb: "Hot/cold, big/small, up/down." },
  { id: "WB-VERB-01", title: "Action Verbs & Nouns", category: "verbs", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-VERB-01.pdf", blurb: "Run, jump, eat, play pack." },
  { id: "WB-VERB-02", title: "Body Action Verbs", category: "verbs", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-VERB-02.pdf", blurb: "Clap, wave, stomp, stretch." },
  { id: "WB-VERB-03", title: "Playground Verbs", category: "verbs", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-VERB-03.pdf", blurb: "Slide, swing, kick, throw." },
  { id: "WB-VERB-04", title: "Home Routine Verbs", category: "verbs", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-VERB-04.pdf", blurb: "Wash, brush, sleep, help." },
  { id: "WB-VERB-05", title: "Feeling & Sense Verbs", category: "verbs", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-VERB-05.pdf", blurb: "See, hear, hug, smile." },
  { id: "WB-PRONOUN-01", title: "He / She / It Pronouns", category: "pronouns", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-PRONOUN-01.pdf", blurb: "Gentle pronoun practice." },
  { id: "WB-PRONOUN-02", title: "I / You / We", category: "pronouns", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-PRONOUN-02.pdf", blurb: "First-person pronoun pack." },
  { id: "WB-PRONOUN-03", title: "They / Them", category: "pronouns", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-PRONOUN-03.pdf", blurb: "Plural pronoun recognition." },
  { id: "WB-PRONOUN-04", title: "My / Your / His / Her", category: "pronouns", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-PRONOUN-04.pdf", blurb: "Possessive pronoun pack." },
  { id: "WB-PRONOUN-05", title: "Pronoun Sentences", category: "pronouns", pages: 50, pricePkr: 150, pdfUrl: "/worksheets/WB-PRONOUN-05.pdf", blurb: "Build simple pronoun sentences." },
];
