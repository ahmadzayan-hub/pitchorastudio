/**
 * Template Intelligence — extract design tokens + layouts from an uploaded PPTX.
 *
 * Strategy:
 *   1. Open the pptx as a zip.
 *   2. Read theme1.xml → palette + font scheme.
 *   3. Read slideMasters / slideLayouts → layouts metadata.
 *   4. Return BrandKit-shaped payload.
 *
 * pptxgenjs cannot parse, so we use JSZip + a tiny XML walker.
 */

const HEX_RE = /[A-F0-9]{6}/i;

export type ExtractedTemplate = {
  palette: { primary?: string; secondary?: string; accent: string[]; background?: string };
  fonts: { en_primary?: string; ar_primary?: string };
  layouts: { name: string }[];
  margins?: { left: number; top: number; right: number; bottom: number };
};

export async function extractTemplate(buf: Buffer): Promise<ExtractedTemplate> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buf);

    // Theme
    const themeFile = Object.keys(zip.files).find((p) => p.endsWith("/theme/theme1.xml"));
    let theme: ExtractedTemplate["palette"] = { accent: [] };
    let fonts: ExtractedTemplate["fonts"] = {};
    if (themeFile) {
      const xml = await zip.files[themeFile].async("string");
      theme = parseThemePalette(xml);
      fonts = parseThemeFonts(xml);
    }

    // Layouts
    const layoutFiles = Object.keys(zip.files).filter(
      (p) => p.startsWith("ppt/slideLayouts/slideLayout") && p.endsWith(".xml"),
    );
    const layouts: { name: string }[] = [];
    for (const f of layoutFiles) {
      const xml = await zip.files[f].async("string");
      const m = /<p:cSld[^>]*\sname="([^"]+)"/i.exec(xml);
      layouts.push({ name: m?.[1] ?? f });
    }

    return { palette: theme, fonts, layouts };
  } catch {
    return { palette: { accent: [] }, fonts: {}, layouts: [] };
  }
}

function parseThemePalette(xml: string): ExtractedTemplate["palette"] {
  const colors: Record<string, string> = {};
  const colorBlock = /<a:clrScheme[\s\S]*?<\/a:clrScheme>/.exec(xml)?.[0] ?? "";
  const re = /<a:(\w+)>\s*(?:<a:srgbClr val="([A-F0-9]{6})"\/>|<a:sysClr[^>]*lastClr="([A-F0-9]{6})"\/>)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(colorBlock))) {
    const tag = m[1].toLowerCase();
    const hex = (m[2] ?? m[3] ?? "").toUpperCase();
    if (HEX_RE.test(hex)) colors[tag] = `#${hex}`;
  }
  const accent = ["accent1", "accent2", "accent3", "accent4", "accent5", "accent6"]
    .map((k) => colors[k])
    .filter(Boolean);
  return {
    primary: colors["dk2"] ?? colors["accent1"] ?? colors["dk1"],
    secondary: colors["accent2"] ?? colors["lt2"],
    background: colors["bg1"] ?? colors["lt1"],
    accent,
  };
}

function parseThemeFonts(xml: string): ExtractedTemplate["fonts"] {
  const en = /<a:majorFont>[\s\S]*?<a:latin\s+typeface="([^"]+)"/i.exec(xml)?.[1];
  const ar = /<a:majorFont>[\s\S]*?<a:font script="Arab"\s+typeface="([^"]+)"/i.exec(xml)?.[1];
  return { en_primary: en, ar_primary: ar };
}
