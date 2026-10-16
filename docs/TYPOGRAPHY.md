# Typography and foundations

One native `Text` primitive resolves shared typography and theme. Inter 400/500/600 and DM Serif Display 400 regular/italic are bundled locally. Body text is regular, section/row headings medium, and primary actions semibold. Editorial headings use regular serif; the welcome accent uses the real italic font. The selected font file carries its weight; the native style uses normal weight to avoid synthetic Android bold. Display/counter leading is distinct from body leading.

| Role | Size / line height | Treatment |
| --- | --- | --- |
| Splash brand | 44 / 52 | Serif regular |
| Editorial screen title | 32 / 40 | Serif regular |
| Sans screen title | 28 / 36 | Inter regular |
| Welcome headline | 40 / 45; 34 / 39 on narrow screens | Serif regular/italic |
| Section heading | 22 / 30 | Inter medium or selective regular serif |
| Card title | 18 / 26 | Inter medium |
| Body / native input | 15 / 24 or 16 / 24 | Inter regular |
| Secondary copy | 13 / 20 | Inter regular |
| Label | 12 / 18 | Regular/medium |
| Live dashboard counter | 64 / 78 | Inter medium, tabular |
| Secondary counter | 54 / 60 | Serif regular |
| Compact metric | 24 / 32 | Inter medium |
| Primary action | 15 / 24 or 16 / 24 | Inter semibold |

The primitive enforces at least 12px text and sufficient line height. Accessibility scaling stays enabled for app UI. Fixed-composition export cards deliberately preserve typography because their output is an image. Only the five selected app font styles are imported, avoiding unused Inter weights.

Use shared `Text`, `NativeInput`, and tokens. Buttons wrap labels and grow vertically; avoid fixed-height text containers. The grid uses an 8px base with 4px subdivisions and explicit 12/20px compact/gutter tokens. Screen gutters are 20px, card padding 20-24px, section space 24-32px, related card gaps 12-16px, radii 20-24px, primary actions/inputs 54px, large actions 56px, and compact touch targets at least 44px.

`tokens/colors.ts` defines the requested light palette and semantic dark palette. New components read tokens directly; migrated native StyleSheets use `useThemedStyles`. Text, status, and surface colors resolve independently. Purple is reserved for accents and selected treatments.

Native bundles/type checking passed. Actual font rasterization, long names, landscape, keyboard reachability, contrast, and large text require [device acceptance](VALIDATION.md).

