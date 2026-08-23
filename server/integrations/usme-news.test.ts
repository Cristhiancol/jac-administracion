import { describe, expect, it } from "vitest";
import { extractUsmeNewsFromHtml } from "./usme-news";

describe("extractor de noticias oficiales de Usme", () => {
  it("conserva título, fecha y URL institucional de cada noticia detectada", () => {
    const html = `
      <div class="sgdnotititle"><span class="field-content"><a href="/noticias/usme-prueba">Comunicado de prueba de Usme</a></span></div>
      <div class="sgdnotidate"><span property="dc:date" content="2026-08-22T00:00:00-05:00">2026 Ago 22</span></div><div class="field-content">• Resumen verificable de la noticia.</div>
    `;
    expect(extractUsmeNewsFromHtml(html)).toEqual([
      {
        externalId: "noticias/usme-prueba",
        title: "Comunicado de prueba de Usme",
        summary: "Resumen verificable de la noticia.",
        sourceUrl: "https://usme.gobiernobogota.gov.co/noticias/usme-prueba",
        publishedAt: new Date("2026-08-22T05:00:00.000Z"),
      },
    ]);
  });

  it("descarta duplicados y bloques sin título", () => {
    const html = `<div class="sgdnotititle"><a href="/noticias/a">A</a></div><span property="dc:date" content="2026-01-01T00:00:00-05:00"></span><div class="sgdnotititle"><a href="/noticias/a">A</a></div><span property="dc:date" content="2026-01-01T00:00:00-05:00"></span>`;
    expect(extractUsmeNewsFromHtml(html)).toHaveLength(1);
  });
});
