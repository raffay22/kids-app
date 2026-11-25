import { BRAND } from "@/utils/brand";

export type ProgressReportData = {
  childName: string;
  parentEmail: string;
  generatedAt: string;
  minutes: number;
  accuracy: number;
  stars: number;
  trophies: number;
  attempts: number;
  speechAttempts: number;
  tapAttempts: number;
  daily: { label: string; count: number }[];
  byRoute: { label: string; count: number; accuracy: number }[];
  strongest: { word: string; pct: number }[];
  weakest: { word: string; pct: number }[];
};

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pageContent(lines: string[]): string {
  const parts = lines
    .map((line, i) => {
      if (i === 0) return `BT /F1 18 Tf 48 742 Td (${esc(line)}) Tj`;
      return `0 -22 Td (${esc(line)}) Tj`;
    })
    .join("\n");
  return `${parts}\nET`;
}

/** Build a branded multi-page Progress PDF (Helvetica, indigo header bar). */
export function buildProgressReportPdf(data: ProgressReportData): Blob {
  const pages: string[] = [];

  const headerBar = `0.388 0.4 0.945 rg 48 760 516 24 re f
1 1 1 rg BT /F1 11 Tf 56 767 Td (${esc(BRAND.name)} · ${esc(BRAND.product)}) Tj ET
0.118 0.161 0.231 rg`;

  pages.push(
    `${headerBar}
${pageContent([
  "Progress Tracking Report",
  `Child: ${data.childName}`,
  `Parent: ${data.parentEmail || "—"}`,
  `Generated: ${data.generatedAt}`,
  "",
  "SUMMARY",
  `Practice time: ${data.minutes} minutes`,
  `Speech accuracy: ${data.accuracy}%`,
  `Stars: ${data.stars}   Trophies: ${data.trophies}`,
  `Total attempts: ${data.attempts} (speech ${data.speechAttempts} / tap ${data.tapAttempts})`,
  "",
  "This report is sharable with teachers and therapists.",
  BRAND.site,
])}`,
  );

  const dailyLines = [
    "14-DAY PRACTICE ACTIVITY",
    ...data.daily.map((d) => `${d.label}: ${d.count} attempts`),
    "",
    "ACTIVITY BREAKDOWN",
    ...data.byRoute.map(
      (r) => `${r.label}: ${r.count} tries · ${r.accuracy}% accuracy`,
    ),
  ];
  pages.push(`${headerBar}\n${pageContent(dailyLines)}`);

  const skillLines = [
    "STRONGEST SOUNDS / WORDS",
    ...(data.strongest.length
      ? data.strongest.map((s) => `${s.word}: ${s.pct}%`)
      : ["No data yet"]),
    "",
    "NEEDS PRACTICE",
    ...(data.weakest.length
      ? data.weakest.map((s) => `${s.word}: ${s.pct}%`)
      : ["No data yet"]),
    "",
    "Growva Business · Kids Learning App",
    BRAND.email,
  ];
  pages.push(`${headerBar}\n${pageContent(skillLines)}`);

  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const kids: number[] = [];

  for (const content of pages) {
    const bytes = new TextEncoder().encode(content).length;
    const streamFixed = `<< /Length ${bytes} >>\nstream\n${content}\nendstream`;
    const contentId = add(streamFixed);
    const pageId = add(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
    kids.push(pageId);
  }

  const kidsStr = kids.map((id) => `${id} 0 R`).join(" ");
  const pagesId = add(`<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${kids.length} >>`);
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  for (const pageId of kids) {
    const contentId = pageId - 1;
    objects[pageId - 1] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`;
  }
  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${kids.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  const enc = new TextEncoder();
  let length = enc.encode(pdf).length;
  for (let i = 0; i < objects.length; i++) {
    offsets.push(length);
    const chunk = `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    pdf += chunk;
    length += enc.encode(chunk).length;
  }
  const xrefStart = length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += xref;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF\n`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
