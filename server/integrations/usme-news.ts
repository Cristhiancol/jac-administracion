const USME_NEWS_SOURCE_URL = "https://usme.gobiernobogota.gov.co/";

export type OfficialNewsCandidate = {
  externalId: string;
  title: string;
  summary: string | null;
  sourceUrl: string;
  publishedAt: Date | null;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractUsmeNewsFromHtml(html: string): OfficialNewsCandidate[] {
  const pattern = /<div\s+class="sgdnotititle">[\s\S]*?<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<span[^>]*property="dc:date"[^>]*content="([^"]+)"[^>]*>/g;
  const candidates: OfficialNewsCandidate[] = [];
  const seen = new Set<string>();

  for (const match of Array.from(html.matchAll(pattern))) {
    const relativeUrl = match[1];
    const title = decodeHtml(match[2]);
    const publishedAt = match[3] ? new Date(match[3]) : null;
    const sourceUrl = new URL(relativeUrl, USME_NEWS_SOURCE_URL).toString();
    const externalId = new URL(sourceUrl).pathname.replace(/^\//, "");
    const nearbyHtml = html.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 900);
    const summaryMatch = nearbyHtml.match(/<div\s+class="field-content">([\s\S]*?)<\/div>/);
    const summary = summaryMatch ? decodeHtml(summaryMatch[1]).replace(/^•\s*/, "") || null : null;
    if (!title || !externalId || seen.has(externalId)) continue;
    seen.add(externalId);
    candidates.push({ externalId, title, summary, sourceUrl, publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null });
  }

  return candidates.slice(0, 12);
}

export async function fetchUsmeNews() {
  const response = await fetch(USME_NEWS_SOURCE_URL, {
    headers: { "user-agent": "JAC-Administracion/1.0 (institutional news sync)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`USME_SOURCE_HTTP_${response.status}`);
  const html = await response.text();
  return extractUsmeNewsFromHtml(html);
}

export { USME_NEWS_SOURCE_URL };
