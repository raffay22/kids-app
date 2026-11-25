/** Age/category printable worksheets (Supabase `worksheets` bucket + static fallback). */

export type PrintableAgeGroup = "2-4" | "4-6" | "6-9";
export type PrintableCategory = "math" | "english" | "colouring";

export type PrintableWorksheet = {
  id: string;
  title: string;
  age_group: PrintableAgeGroup;
  category: PrintableCategory;
  description: string | null;
  file_name: string;
  storage_path: string;
  total_pages: number;
  file_size: string | null;
  price_pkr?: number;
  pdfUrl: string;
};

export const PRINTABLE_AGE_FILTERS: { id: "all" | PrintableAgeGroup; label: string }[] = [
  { id: "all", label: "All ages" },
  { id: "2-4", label: "Ages 2–4" },
  { id: "4-6", label: "Ages 4–6" },
  { id: "6-9", label: "Ages 6–9" },
];

export const PRINTABLE_CATEGORY_FILTERS: {
  id: "all" | PrintableCategory;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "math", label: "Math" },
  { id: "english", label: "English" },
  { id: "colouring", label: "Colouring" },
];

export function getWorksheetPublicUrl(storagePath: string): string {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  if (!supabaseUrl) return `/worksheets/${storagePath.split("/").pop() ?? ""}`;
  return `${supabaseUrl}/storage/v1/object/public/worksheets/${storagePath}`;
}

/** Static seed mirror for offline / empty-DB fallback. */
export const STATIC_PRINTABLE_WORKSHEETS: PrintableWorksheet[] = [
  {
    id: "static-2-4-math",
    title: "Toddler Shape & Number Tracing",
    age_group: "2-4",
    category: "math",
    description: "50-Page ink-saver counting and shape outlines",
    file_name: "nursery-math-pack.pdf",
    storage_path: "age-2-4/math/nursery-math-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-MATH-01.pdf",
  },
  {
    id: "static-2-4-english",
    title: "ABC Letter & Phonics Tracing",
    age_group: "2-4",
    category: "english",
    description: "Big tracing letters with beginner sound illustrations",
    file_name: "nursery-phonics-pack.pdf",
    storage_path: "age-2-4/english/nursery-phonics-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-VERB-01.pdf",
  },
  {
    id: "static-2-4-colouring",
    title: "Big Animals & Shapes Colouring",
    age_group: "2-4",
    category: "colouring",
    description: "Thick-line coloring sheets for early motor skills",
    file_name: "nursery-colouring-pack.pdf",
    storage_path: "age-2-4/colouring/nursery-colouring-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-COLOR-01.pdf",
  },
  {
    id: "static-4-6-math",
    title: "Visual Addition & Number Bonds",
    age_group: "4-6",
    category: "math",
    description: "Simple picture-based math and counting exercises",
    file_name: "kg-math-pack.pdf",
    storage_path: "age-4-6/math/kg-math-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-MATH-02.pdf",
  },
  {
    id: "static-4-6-english",
    title: "Sight Words & CVC Sentence Tracing",
    age_group: "4-6",
    category: "english",
    description: "Word building, vowels, and handwriting practice",
    file_name: "kg-english-pack.pdf",
    storage_path: "age-4-6/english/kg-english-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-PRONOUN-01.pdf",
  },
  {
    id: "static-4-6-colouring",
    title: "Nature & Farm Animals Art Pages",
    age_group: "4-6",
    category: "colouring",
    description: "Creative line art and color-by-number pages",
    file_name: "kg-colouring-pack.pdf",
    storage_path: "age-4-6/colouring/kg-colouring-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-COLOR-04.pdf",
  },
  {
    id: "static-6-9-math",
    title: "Math Logic, Multiplication & Time",
    age_group: "6-9",
    category: "math",
    description: "Equation puzzles, word problems, and logic grids",
    file_name: "primary-math-pack.pdf",
    storage_path: "age-6-9/math/primary-math-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-MATH-04.pdf",
  },
  {
    id: "static-6-9-english",
    title: "Grammar, Nouns & Story Writing",
    age_group: "6-9",
    category: "english",
    description: "Sentence construction and reading comprehension sheets",
    file_name: "primary-english-pack.pdf",
    storage_path: "age-6-9/english/primary-english-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-PRONOUN-05.pdf",
  },
  {
    id: "static-6-9-colouring",
    title: "Doodle Art & Creative Patterns",
    age_group: "6-9",
    category: "colouring",
    description: "Detailed mandala and pattern coloring for focus",
    file_name: "primary-colouring-pack.pdf",
    storage_path: "age-6-9/colouring/primary-colouring-pack.pdf",
    total_pages: 50,
    file_size: "12 MB",
    price_pkr: 150,
    pdfUrl: "/worksheets/WB-COLOR-05.pdf",
  },
];

export function mapDbWorksheet(row: {
  id: string;
  title: string;
  age_group: string;
  category: string;
  description: string | null;
  file_name: string;
  storage_path: string;
  total_pages: number | null;
  file_size: string | null;
  price_pkr?: number | null;
  pdf_url?: string | null;
}): PrintableWorksheet {
  return {
    id: row.id,
    title: row.title,
    age_group: row.age_group as PrintableAgeGroup,
    category: row.category as PrintableCategory,
    description: row.description,
    file_name: row.file_name,
    storage_path: row.storage_path,
    total_pages: row.total_pages ?? 50,
    file_size: row.file_size,
    price_pkr: row.price_pkr ?? 150,
    pdfUrl: row.pdf_url || getWorksheetPublicUrl(row.storage_path),
  };
}
