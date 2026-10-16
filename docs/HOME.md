# Progress dashboard

Home follows the published [SobrMate reference](https://sobrmate-elite-habit-days-clean-tracker.ai.studio/) within the existing native Expo app. Content uses 22px gutters, an 18px section gap, and a centered column capped at 400px on larger native windows. The fixed header, four-tab navigation, scroll, safe areas, saved data, and existing destinations remain intact.

- Tracker selection persists before closing; add opens catalog/setup.
- A 25px-radius gradient counter card shows real days/hours/minutes/seconds and the existing day view. Its 68px counter, translucent tiles, two orbit outlines, 48px footer, and colors come from the reference's public Home stylesheet. Time tiles and the footer measure available width and stack when needed. Long/large-text counters keep their unit separate; four-digit counters use 56px.
- Share Streak and View Badges use 44px-minimum outlined Home controls with anchored 15px icons, medium labels, 14px radii, and a 10px gap. Whole buttons stack for narrower containers or larger text. Share captures the existing snapshot; View Badges opens the existing Milestones tab. Extra sharing templates retain mock Premium entitlements.
- Daily Pledge shows personal motivation, persists per tracker/local date, and has distinct animated success and error states.
- Savings calculations are unchanged from the starting source: money counts saved zero-use check-in days in the configured currency; time estimates elapsed days using the configured daily value. Disabled estimates show a dash/configuration prompt; tap to edit. Narrow/large-text rows stack.
- Recorded/Best logged streaks use the existing real check-in calculation. Missing days remain unrecorded. The live timer and saved personal best remain available in tracker details.
- Sunday-first week supports historical edits, today, status markers, previous weeks, and Calendar navigation. Future dates are disabled; historical edits preserve the live timer.
- Intentions displays saved motivation, improvements, and mindset with editing. Empty states lead to tracker creation.

Seconds subscriptions pause on inactive tabs and remain confined to components needing live values. The reference's 240ms seconds reveal and 200ms press feedback animate native opacity/transforms and respect reduced motion. Existing pledge save/error/busy handling, tracker switching, sharing, editing, and reset confirmation are retained.

## Published Home comparison — October 14

The public page, `index-DEFp_wc4.js`, and `index-CSi60YSa.css` responded HTTP 200. Home styles are injected by the reference's JavaScript, so checking only its external CSS would miss them. Local inspection assets are stored in ignored `build/home-reference`.

| Element | Implemented reference treatment |
| --- | --- |
| Canvas / heading | `#FAF9F6` / `#302B40`, 30px regular editorial heading, -0.9px tracking |
| Timer | `#F3EEF8` → `#ECE3F5`, `#E7DDEE` border, `#675280` counter |
| Clock tiles | `#FFFFFF78`, brighter `#FFFFFFA8` seconds tile, 14px radii, medium 25px digits |
| Actions | White, `#E8E2EB` outlines, `#887097` text/icons, no card elevation |
| Pledge | `#F4F0F8`, 36px icon badge; recorded pledge has the reference's muted green state |
| Savings / streaks | White 20px-radius savings cards; `#F3EFEF` 17px-radius recorded-streak strip |
| Week / intentions | White 22px-radius bordered cards, 17px internal padding, 14px medium headings, `#AC96C2` today marker |

Colors and typography are isolated in `homeAppearance.tsx`. `ReferenceHomeHeader` avoids modifying Calendar's shared `HomeHeader`. No global palette, font-loading configuration, tab bar, routes outside Home, storage, or dependency versions were edited. Existing files were hashed before/after to verify scope.

Deliberate native/accessibility differences: labels stay at least 12px instead of the reference's 9–10px; fonts scale with accessibility settings, complete controls stack as needed, and editorial text uses Georgia on iOS with Android's native serif fallback. A native window stays centered at larger widths; the reference site's fake phone bezel/status bar is not drawn inside the app. This task does not add a web platform.

Browser automation failed to initialize (`failed to write kernel assets`), so source measurements plus the supplied screenshots were used. Metro's device inspector returned an empty list. Native pixel-diff, phone taps, and measured frame-rate acceptance are **pending**, not inferred from builds. Check both clock modes, share/badges, Pro, pledge, estimate editing, calendar dates/arrows, intentions editing, tracker switching/addition, and reset cancellation/confirmation at 320/360/390px, tablet/landscape, both themes, long saved text, and larger font sizes.

## Homepage alignment correction — October 14

The broken action layout came from direct SVG/Text children in wrapping rows, unrestricted footer-label widths, and fixed horizontal assumptions inside nested cards. `HomeQuickActions` and `useResponsiveRow` now keep entire controls together using the rendered container width and accessibility font scale. This also covers the share sheet's Save/Share Image footer, savings cards, counter footer, and streak summary. The weekly Full view link reserves space for its arrow and wraps its label inside the control.

The editorial/date header stacks on narrow screens or larger text. The published-reference follow-up above supplies the current spacing, colors, and card measurements. Share handlers, routes, day-view state, saved data, savings/streak calculations, native export, privacy options, and busy/error handling are retained.

Strict TypeScript and the existing 41 regressions were run after the corrections. Native bundle results are recorded in [validation](VALIDATION.md). No post-change phone screenshot or live native tap verification is claimed. Check 320/360/390px, landscape/tablet, long tracker names, large font sizes, both themes, and Save/Share Image loading/error/cancellation on the phone.

Tests cover elapsed time, week boundaries, gaps, urge-only days, tracker isolation, historical edits, category compatibility, and formatting. TypeScript and native exports passed. Current UI/device acceptance is pending; old `home-*.jpg` images predate this upgrade. See [validation](VALIDATION.md).

