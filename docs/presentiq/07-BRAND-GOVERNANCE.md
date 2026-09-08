# PresentIQ — Brand Governance Engine Design

Brand governance runs **before** any visual or text agent. Its output is a `BrandRulesContext` object that is **read-only** for the rest of the pipeline.

## 1. Inputs

- The selected `pq_brand_kits` row.
- The active `presentation_mode` (e.g. `rta_boardroom`).
- The active `language_mode`.
- Mode presets (built-in): `corporate_default`, `government_default`, `rta_boardroom`, `consulting_default`.

## 2. Output: `BrandRulesContext`

```ts
type BrandRulesContext = {
  identity: {
    org_name: string;
    logos: { primary: string; mono?: string; ar?: string };
  };
  palette: {
    primary: string;          // hex
    secondary: string;
    accent: string[];
    background: string;
    surface: string;
    foreground: string;
  };
  typography: {
    en_primary: string;
    en_fallback: string[];
    ar_primary: string;
    ar_fallback: string[];
    title_size_pt: [number, number];   // min, max
    body_size_pt:  [number, number];
    line_height: number;
  };
  layout: {
    logo_placement: "top_right" | "top_left" | "balanced_center";
    safe_margins_in: number;
    max_words_per_slide: number;
    max_bullets_per_slide: number;
    slide_density: "low" | "medium" | "high";
  };
  charts: {
    palette: string[];
    grid: "minimal" | "standard";
    label_size_pt: number;
  };
  iconography: {
    style: "line" | "duotone" | "filled";
  };
  language: {
    tone: "formal_corporate" | "government_executive" | "consulting_partner";
    forbidden_phrases: string[];
    approved_terminology: { en: string; ar: string }[];
    arabic_required: boolean;
    rtl_required: boolean;
  };
  governance: {
    require_decision_slide_in: ("boardroom"|"steering"|"investor")[];
    forbid_thank_you_slide: boolean;
    forbid_questions_slide: boolean;
    require_executive_summary: boolean;
    require_recommendation_slide: boolean;
    require_next_steps_slide: boolean;
  };
};
```

## 3. UAE Pine Boardroom Mode Preset (built-in)

```ts
const rtaBoardroomPreset = {
  palette: {
    primary: "#013230",   // Pine
    secondary: "#0B6E69", // Teal
    accent: ["#00B0B9","#025EE1","#00B154","#FF7100","#FFB800","#8031C8"],
    background: "#FFFFFF",
    surface:    "#F4F5F9",
    foreground: "#171C8F",
  },
  typography: {
    en_primary: "Inter",
    en_fallback: ["Calibri","Arial"],
    ar_primary: "Tajawal",
    ar_fallback: ["Noto Kufi Arabic","Alexandria","Dubai"],
    title_size_pt: [28, 36],
    body_size_pt:  [14, 20],
    line_height: 1.35,
  },
  layout: {
    logo_placement: "top_right",
    safe_margins_in: 0.4,
    max_words_per_slide: 70,
    max_bullets_per_slide: 5,
    slide_density: "low",
  },
  language: {
    tone: "government_executive",
    arabic_required: true,
    rtl_required: true,
    forbidden_phrases: [
      "we have decided","approved by HE","CEO confirmed",
      "guaranteed","100% safe","zero risk"
    ],
    approved_terminology: rtaTerminology, // 24 EN→AR pairs from the brief
  },
  governance: {
    require_decision_slide_in: ["boardroom","steering","investor"],
    forbid_thank_you_slide: true,
    forbid_questions_slide: true,
    require_executive_summary: true,
    require_recommendation_slide: true,
    require_next_steps_slide: true,
  },
};
```

## 4. Enforcement Points

| Stage | Enforced |
|---|---|
| Slide Architect | `require_*` slide rules, slide density |
| Copywriter | tone, forbidden phrases, terminology |
| Visual Designer | palette, iconography, max bullets |
| Data Viz | chart palette, grid style |
| RTL agent | rtl_required, arabic font fallback |
| PPTX renderer | logo placement, safe margins, theme colors, font names |
| QA | full audit; produces Brand Compliance Score |

## 5. Logo Handling

- The customer uploads the logo **once** to a brand kit. Stored in tenant-isolated storage.
- The PPTX renderer fetches the logo as a private signed URL, streams it into the slide, and applies `top_right` placement with the kit's `safe_margins_in`.
- **Forbidden:** distort, recolour, crop, stretch, drop-shadow, animate, filter.

## 6. Font Handling

- Fonts are uploaded **per-tenant only**. They are never redistributed.
- Fonts are referenced by name in the PPTX. If the customer's machine has the font, it renders correctly. The renderer also embeds an **OTT font fallback chain** in the theme.
- Built-in fallbacks: `Inter`, `Roboto`, `Calibri`, `Arial`, `Noto Kufi Arabic`, `Tajawal`, `Alexandria`.

## 7. Governance API Surface

`src/lib/presentiq/brand/governance.ts` exposes:

- `loadBrandContext(brandKitId, mode, language)` → `BrandRulesContext`
- `validateText(text, ctx)` → `{ ok, violations[] }`
- `validatePalette(usedHexes, ctx)` → score
- `validateLayoutDensity(slide, ctx)` → score
- `lockContext(ctx)` → `Readonly<BrandRulesContext>`
