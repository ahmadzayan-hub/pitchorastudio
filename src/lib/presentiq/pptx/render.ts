/**
 * Top-level deck renderer: turn (Slide[], BrandRulesContext) into a .pptx Buffer.
 *
 * Master selection unwraps the `bilingual` content_json wrapper so the
 * inner kind drives layout choice — otherwise cover and decision slides
 * would always fall through to the content master.
 *
 * For cover and decision masters the renderer skips addTitle/addKeyMessage
 * because those layouts own the title and key-message slots — adding them
 * a second time produced overlapping text on the original cover.
 */

import type { BrandRulesContext, Slide, SlideModel } from "../types";
import { buildDeck } from "./theme";
import { addEyebrow, addKeyMessage, addTitle, renderSlideBody } from "./layouts";

function innerKind(model: SlideModel | undefined): SlideModel["kind"] | undefined {
  if (!model) return undefined;
  if (model.kind === "bilingual") {
    return innerKind((model as any).en) ?? innerKind((model as any).ar);
  }
  return model.kind;
}

export async function renderDeck(args: {
  title: string;
  slides: Slide[];
  ctx: BrandRulesContext;
}): Promise<Buffer> {
  const { title, slides, ctx } = args;
  const pptx = await buildDeck(ctx, title);

  for (const s of slides) {
    const kind = innerKind(s.content_json as SlideModel) ?? "bullets";
    const masterName =
      kind === "cover" ? "PQ_COVER" :
      kind === "decision" ? "PQ_DECISION" :
      "PQ_CONTENT";
    const slide = pptx.addSlide({ masterName });
    // Soft fade transition between slides for a "live" boardroom feel.
    if (typeof slide.transition === "function") {
      try { slide.transition({ type: "fade" }); } catch { /* unsupported in some pptxgenjs versions */ }
    } else {
      try { (slide as any).transition = { type: "fade" }; } catch { /* ignore */ }
    }

    // Cover and decision masters own the title + key-message slots.
    // For other slides, render the eyebrow → title → key message stack.
    if (kind !== "cover" && kind !== "decision") {
      addEyebrow(slide, s, ctx);
      addTitle(slide, s, ctx);
      addKeyMessage(slide, s, ctx);
    }

    renderSlideBody(slide, s.content_json, ctx);

    if (s.speaker_notes_en || s.speaker_notes_ar) {
      const note = [s.speaker_notes_en, s.speaker_notes_ar].filter(Boolean).join("\n— العربية —\n");
      slide.addNotes(note);
    }
  }

  // Returns Node.js Buffer
  const out = (await pptx.write({ outputType: "nodebuffer" })) as unknown as Buffer;
  return out;
}
