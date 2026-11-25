/**
 * Generate lightweight sample worksheet PDF placeholders (no ReportLab needed).
 * Full 50-page ReportLab bundles can replace these later.
 *
 *   node scripts/generate-sample-worksheets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const OUT = resolve(process.cwd(), "public", "worksheets");
mkdirSync(OUT, { recursive: true });

const BUNDLES = [
  { id: "WB-MATH-01", title: "Early Math & Counting" },
  { id: "WB-NOUN-01", title: "Noun Matching" },
  { id: "WB-VERB-01", title: "Action Verbs" },
  { id: "WB-PRONOUN-01", title: "He / She / It Pronouns" },
  { id: "WB-LIVING-01", title: "Living vs Non-Living" },
  { id: "WB-COLOR-01", title: "Animal Tracing & Colouring" },
];

function escapePdfText(s) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Minimal multi-page PDF (8 preview-style pages) with title on each page. */
function buildPdf(title, bundleId, pageCount = 8) {
  const objects = [];
  const add = (body) => {
    objects.push(body);
    return objects.length;
  };

  const kids = [];
  for (let i = 1; i <= pageCount; i++) {
    const content = `BT /F1 22 Tf 72 720 Td (${escapePdfText(title)}) Tj
0 -32 Td /F1 14 Tf (${escapePdfText(bundleId)} — page ${i} of ${pageCount}) Tj
0 -28 Td /F1 12 Tf (Kids Learning App sample worksheet. Replace with full 50-page vector PDF.) Tj
0 -40 Td (Practice calmly. Parent preview only.) Tj ET`;
    const stream = `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
    const contentId = add(stream);
    const pageId = add(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${0} 0 R >> >> >>`,
    );
    kids.push(pageId);
  }

  // Fix placeholders: font object + pages parent
  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const kidsStr = kids.map((id) => `${id} 0 R`).join(" ");
  const pagesId = add(`<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${kids.length} >>`);
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  // Rewrite page objects with correct Parent + Font refs
  for (const pageId of kids) {
    const contentId = pageId - 1;
    objects[pageId - 1] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`;
  }
  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${kids.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

for (const b of BUNDLES) {
  const file = join(OUT, `${b.id}.pdf`);
  writeFileSync(file, buildPdf(b.title, b.id, 8));
  console.log("wrote", file);
}

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: "Sample 8-page placeholders. Full 50-page ReportLab packs replace these.",
      bundles: BUNDLES.map((b) => ({
        ...b,
        pages: 50,
        previewPages: 8,
        pdfUrl: `/worksheets/${b.id}.pdf`,
      })),
    },
    null,
    2,
  ),
);
console.log("OK — public/worksheets/*.pdf");
