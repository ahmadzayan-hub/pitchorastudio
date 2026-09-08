/**
 * Curated visual style packs for the `image` intent.
 *
 * Each pack is one click that injects a battle-tested style modifier into
 * the prompt body. We cover the modes users ask for most: cinematic /
 * editorial / anime / oil / cyberpunk / minimalist / 3D / vintage /
 * watercolor / pixel art.
 *
 * The append text deliberately uses the kind of comma-separated visual
 * descriptors that Midjourney, SDXL, Flux, and DALL·E all understand.
 */

export interface ImageStylePack {
  id: string;
  emoji: string;
  /** Localised labels */
  ar: string;
  en: string;
  /** Text appended to the prompt's visual section */
  append_en: string;
  append_ar: string;
}

export const IMAGE_STYLE_PACKS: ImageStylePack[] = [
  {
    id: "cinematic",
    emoji: "🎬",
    en: "Cinematic",        ar: "سينمائي",
    append_en: "cinematic lighting, anamorphic lens, shallow depth of field, film grain, teal-and-orange grade, 35mm",
    append_ar: "إضاءة سينمائية، عدسة أنامورفيك، عمق ميدان ضحل، حبيبات فيلم، تدرّج لوني (تركواز/برتقالي)، 35مم"
  },
  {
    id: "editorial",
    emoji: "📰",
    en: "Editorial",        ar: "تحريري",
    append_en: "editorial photography, soft natural light, magazine cover composition, neutral palette",
    append_ar: "تصوير تحريري، إضاءة طبيعية ناعمة، تكوين غلاف مجلّة، لوحة ألوان محايدة"
  },
  {
    id: "anime",
    emoji: "🎌",
    en: "Anime",            ar: "أنمي",
    append_en: "anime style, clean ink lines, cel shading, vibrant colors, expressive eyes",
    append_ar: "أسلوب أنمي، خطوط نظيفة، تظليل سيل، ألوان زاهية، عيون معبّرة"
  },
  {
    id: "oil",
    emoji: "🎨",
    en: "Oil painting",     ar: "زيتي",
    append_en: "oil painting, visible brushstrokes, classical composition, warm chiaroscuro lighting",
    append_ar: "لوحة زيتية، ضربات فرشاة ظاهرة، تكوين كلاسيكي، إضاءة كياروسكورو دافئة"
  },
  {
    id: "cyberpunk",
    emoji: "🦾",
    en: "Cyberpunk",        ar: "سايبر بانك",
    append_en: "cyberpunk, neon signage, rain-slicked streets, magenta and cyan rim light, holographic UI",
    append_ar: "سايبر بانك، لافتات نيون، شوارع مبلّلة، إضاءة حافّة ماجنتا وسماوية، واجهات هولوغرافية"
  },
  {
    id: "minimal",
    emoji: "◻️",
    en: "Minimalist",       ar: "مينيمال",
    append_en: "minimalist, generous negative space, soft pastel palette, flat geometry",
    append_ar: "مينيمال، فضاء سلبي كبير، ألوان باستيل ناعمة، أشكال مسطّحة"
  },
  {
    id: "3d-render",
    emoji: "🧊",
    en: "3D render",        ar: "ثلاثي الأبعاد",
    append_en: "octane 3D render, soft studio lighting, subsurface scattering, glossy materials, 4K",
    append_ar: "تصيير ثلاثي الأبعاد (Octane)، إضاءة استوديو ناعمة، تشتّت تحت السطح، مواد لامعة، 4K"
  },
  {
    id: "vintage",
    emoji: "📷",
    en: "Vintage film",     ar: "فيلم قديم",
    append_en: "vintage 1970s film photo, kodachrome palette, light leaks, dust specks, vignette",
    append_ar: "صورة فيلم سبعينات، ألوان كوداكروم، تسرّب ضوء، ذرّات غبار، فينييت"
  },
  {
    id: "watercolor",
    emoji: "💧",
    en: "Watercolor",       ar: "ألوان مائية",
    append_en: "loose watercolor, wet-on-wet bleeds, paper texture, expressive line work",
    append_ar: "ألوان مائية حرّة، تسرّبات رطبة، ملمس ورق، خطوط معبّرة"
  },
  {
    id: "pixel",
    emoji: "🕹",
    en: "Pixel art",        ar: "بيكسل آرت",
    append_en: "16-bit pixel art, limited palette, dithering, crisp grid, retro game aesthetic",
    append_ar: "بيكسل آرت 16-بِت، لوحة ألوان محدودة، dithering، شبكة حادّة، جماليّات ألعاب قديمة"
  }
];

export function findStylePack(id: string): ImageStylePack | undefined {
  return IMAGE_STYLE_PACKS.find((p) => p.id === id);
}

/** Build the markdown line that gets appended to the raw prompt. */
export function styleAppendLine(pack: ImageStylePack, locale: "en" | "ar"): string {
  const heading = locale === "ar" ? "## أسلوب بصري" : "## Visual style";
  return `\n\n${heading}\n${locale === "ar" ? pack.append_ar : pack.append_en}`;
}
