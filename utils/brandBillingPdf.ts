import { ctrPercent, type BrandAd } from "@/utils/brandAds";
import { BRAND } from "@/utils/brand";
import { downloadBlob } from "@/utils/progressReportPdf";

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pageContent(lines: string[]): string {
  const parts = lines
    .map((line, i) => {
      if (i === 0) return `BT /F1 14 Tf 48 742 Td (${esc(line)}) Tj`;
      return `0 -16 Td (${esc(line)}) Tj`;
    })
    .join("\n");
  return `${parts}\nET`;
}

/** Monthly brand billing PDF (impressions / clicks / CTR / rent). */
export function buildBrandBillingPdf(ads: BrandAd[], monthLabel: string): Blob {
  const headerBar = `0.96 0.62 0.04 rg 48 760 516 24 re f
1 1 1 rg BT /F1 11 Tf 56 767 Td (${esc(BRAND.name)} · Brand Billing) Tj ET
0.12 0.16 0.23 rg`;

  const chunkSize = 18;
  const pages: string[] = [];

  const summaryLines = [
    `Brand Ad Performance — ${monthLabel}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Campaigns: ${ads.length}`,
    `Total impressions: ${ads.reduce((s, a) => s + a.total_impressions, 0)}`,
    `Total clicks: ${ads.reduce((s, a) => s + a.total_clicks, 0)}`,
    `Total rent PKR: ${ads.reduce((s, a) => s + Number(a.monthly_rent_pkr ?? 0), 0)}`,
    "",
    "Share each brand their /brand-stats proof link for live trust.",
  ];
  pages.push(`${headerBar}\n${pageContent(summaryLines)}`);

  for (let i = 0; i < ads.length; i += chunkSize) {
    const slice = ads.slice(i, i + chunkSize);
    const lines = [
      "Brand detail",
      ...slice.flatMap((ad) => [
        `${ad.brand_name} · ${ad.placement} · ${ad.is_active ? "Live" : "Off"}`,
        `  Imp ${ad.total_impressions} · Clicks ${ad.total_clicks} · CTR ${ctrPercent(ad.total_impressions, ad.total_clicks)}% · Rent ${Number(ad.monthly_rent_pkr ?? 0)} PKR`,
      ]),
      "",
      BRAND.site,
    ];
    pages.push(`${headerBar}\n${pageContent(lines)}`);
  }

  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const kids: number[] = [];

  for (const content of pages) {
    const bytes = new TextEncoder().encode(content).length;
    const contentId = add(`<< /Length ${bytes} >>\nstream\n${content}\nendstream`);
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

export function downloadBrandBillingPdf(ads: BrandAd[]) {
  const monthLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const blob = buildBrandBillingPdf(ads, monthLabel);
  downloadBlob(blob, `brand-billing-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
