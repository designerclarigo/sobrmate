# Milestones reference audit — October 15, 2026

The native Milestones implementation was compared with the live [SobrMate reference](https://sobrmate-elite-habit-days-clean-tracker.ai.studio/). The live page identifies SobrMate and its public page/JS/CSS return HTTP 200. Reference interactions and screenshots are now available; the earlier screenshot-runtime initialization failure was resolved on October 15.

**Implementation and compilation checks are complete for this pass. Native screenshot comparison and device interaction acceptance remain incomplete.** Metro reports no attached Expo Go device. No pixel-perfect rendering, native sharing completion, or measured frame-rate claim is made.

## Scope and retained behavior

Only Milestones screen/components, their presentation/sharing helpers, tests, and these audit notes changed. A SHA-256 comparison against the 161-file follow-up baseline found eight modified code/test files, three additions, no removals, and no changes outside the allowed Milestones paths. Global typography/colors, other tabs, navigation configuration, assets, dependencies, storage, and the milestone catalog are unchanged.

As the user explicitly chose, the app retains **19 goals and All / Earned / Upcoming filters**. The published reference currently has 14 goals and two filters. Streaks, earned dates, expected dates, unlocks, and counts use the existing tracker data/calculations. Existing named achievements and affirmations remain in the catalog. Their duration labels are presented like the reference; retained certificates still use the named achievement.

The current live reference has an editorial next-goal card, compact duration rows, locked/earned detail sheets, and Share Badge designer. It has no separate named-certificate or celebration screen. The app's existing named certificate and celebration remain available as additional earned-detail actions.

## Root causes and corrections

- Shared text imposed a 12px floor, enlarging the reference's 8–11px labels. A Milestones-only text component now uses the requested sizes/leading and existing loaded Plus Jakarta Sans faces; other screens retain their existing typography.
- The shared button forced weight 600. Milestones buttons now use the lighter loaded medium face, exact local geometry, press feedback, accessibility state, and guarded asynchronous actions.
- The previous tracker picker was a bottom sheet. It is now an anchored 285px popover, capped at viewport width minus 32px, with the reference header/row styling, selected check, scrolling list, and Add a tracker action.
- Habit glyphs were generic or reflected older catalog icons. The tab now derives the reference's Wine/Martini/Beer, nicotine, substance, and social-habit outline glyphs without rewriting saved icon or unit data.
- The Share Badge designer was missing. It now has all six styles and six palettes, a native rendered preview, real PNG sharing, copy-text action, loading guards, retryable errors, and selectable text fallback if copying fails.
- Live computed layout revealed a 45px detail-heading line height and collapsed handle/badge margins. Native sheet spacing now accounts for those details. The Letter style's artwork is a Quote icon; the earlier inferred feather was corrected.
- Detail handles and close controls scroll with the sheet like the reference; the Share designer keeps its header/footer fixed. Switching between detail, certificate and sharing remounts only the scroll surface so an earlier offset cannot hide the new preview.
- Narrow screens retain the horizontal header and compact three-filter row. Large accessibility text can stack controls. The all-earned Upcoming empty state now describes the completed journey correctly.
- Android modal window flags stay constant when moving between details and sharing. The installed React Native implementation can recreate the Android dialog when these flags change on older hosts; one stable modal host also avoids competing iOS presenters.

## Reference values applied

| Area | Applied values |
| --- | --- |
| Canvas / main text | `#FAF9F6` / `#302B40` |
| Content | 22px horizontal, 18px top, 20px section gaps; 400px native content cap |
| Screen heading | 30px / 36px serif, -0.8px tracking |
| Next-goal card | White → `#F8F4FC`, `#E2D8EA` border, 26px radius, 21px padding |
| Goal title / emblem | 35px / 38.5px serif; 66px inset emblem with 30px thin icon |
| Progress | 5px track; `#B99DD0` → `#9273AB` fill |
| Filters | `#EFEAED`, `#E8E1E9` border, white active pill, count chips |
| Rows | 82px minimum, 14px padding, 19px radius, 9px gaps |
| Row type / icons | 13px / 16.9px title; 10px / 16px caption; 44px emblem |
| Tracker dropdown | 285px width, 23px radius, 14px padding, 49px rows, selected `#F0EAF6` |
| Details | Bottom sheet, 400px maximum, 85% height maximum, 28px top corners, 108px emblem |
| Detail type | 30px / 45px heading; 15px / 26.25px quote; 12px facts |
| Sharing dialog | Full mobile viewport; desktop 410px × min(840px, viewport minus 40px), 30px corners |
| Share preview | 260 × 326px; 216 × 270px at heights up to 760px |
| Motion | Native press scaling, 320ms reveals, 450ms progress transform; reduced-motion support |

## Share Badge designer

Styles: **Classic, Editorial, Bloom, Focus, Minimal, Letter**.

| Palette | Background | Ink | Muted | Border | Glow |
| --- | --- | --- | --- | --- | --- |
| Lilac | `#EEE7F5` | `#655078` | `#826B92` | `#DACCE6` | `#F9F4FD` |
| Sage | `#E8EFE3` | `#4F654B` | `#6E8269` | `#CDDCC6` | `#F5F9F0` |
| Mist | `#E6EEF1` | `#4B6671` | `#6C8590` | `#CADCE3` | `#F4F9FB` |
| Rose | `#F3E5E8` | `#865B69` | `#9D7481` | `#E5CCD3` | `#FCF3F5` |
| Sand | `#F2EADB` | `#786146` | `#937E62` | `#E1D3B9` | `#FBF7EE` |
| Ivory | `#FCFAF5` | `#6A5B73` | `#877890` | `#E7DFEB` | `#F3EDF7` |

Every selection updates the actual native card, including artwork, layout, type treatment, and colors. Export captures that view at 1080px width using its measured aspect ratio. Named-certificate sharing remains available separately. Sharing includes only the selected tracker title and public achievement copy; private motivation, pledges, mindset, goals, and journal fields are excluded.

All 36 style/palette combinations were selected and their checked states confirmed in the **live reference**. All six reference styles were inspected at 320 × 700, 390 × 844, and 1280 × 900. Representative screenshots and a selection matrix are under ignored `build/milestones-reference/pixel-audit/screenshots`. Burst captures can precede a paint, so six separate settled captures are the primary style evidence:

[Classic](../build/milestones-reference/pixel-audit/screenshots/settled-390-classic-lilac.jpg) · [Editorial](../build/milestones-reference/pixel-audit/screenshots/settled-390-editorial-lilac.jpg) · [Bloom](../build/milestones-reference/pixel-audit/screenshots/settled-390-bloom-sage.jpg) · [Focus](../build/milestones-reference/pixel-audit/screenshots/settled-390-focus-lilac.jpg) · [Minimal](../build/milestones-reference/pixel-audit/screenshots/settled-390-minimal-lilac.jpg) · [Letter](../build/milestones-reference/pixel-audit/screenshots/settled-390-letter-lilac.jpg).

These are reference screenshots, not images of the updated native app.

## Screen and interaction audit

| Scene / state | Evidence completed | Native acceptance |
| --- | --- | --- |
| Main list, top/middle/bottom | Live reference inspected and captured; native source/layout audit | Pending screenshots |
| All / Earned | Live reference selections confirmed; native filters use calculated arrays | Pending taps/screenshots |
| Upcoming / all goals completed | Existing extra filter retained; meaningful completed empty state; data regression | Pending taps/screenshots |
| Locked / earned details | Both live sheets captured; computed geometry/type inspected | Pending screenshots/Back/scroll |
| Tracker dropdown | Live size measured at 285px, y=65 at 390px; switching Alcohol → Social Media updated counts; original selection restored | Pending persistence/touch/error checks |
| Share Badge designer | All 36 live selections; six layouts and three viewport sizes inspected; native implementation/type/bundle checks | Pending 36 native preview combinations |
| Share / copy / retry | Real native capture, system chooser and clipboard APIs; guarded actions and selectable fallback; text-privacy regressions | Pending system chooser/cancel/error/copy |
| Named certificate | Existing native view/capture retained; SobrMate branding; no current live counterpart | Pending capture/share/back |
| Celebration | Existing particle animation retained, cleanup/reduced motion implemented; no current live counterpart | Pending replay/unlock/reduced motion |
| No tracker / no earned / all earned | Source states implemented; unlock/restart/all-19 regressions pass | Pending native state fixtures |
| Large text / themes / rotation | Scoped semantic dark palette, font scaling and layout adaptations implemented | Pending device rasterization |

## Executed checks

- `npm run typecheck`: passed after the final modal, scroll-surface and preview/button spacing corrections.
- `npm test`: **49 passed, 0 failed** after the responsive/button work. Six Milestones cases cover exact unlock boundaries, all 19 goals, restart/catalog preservation, bounded future/partial progress, private-field exclusion from sharing, and blank-quote handling. Later presentation-only modal/scroll/spacing changes are compiled/type-checked; these are data regressions rather than a native tap suite.
- `npx expo export --platform all --output-dir build/milestones-reference/pixel-audit/native --max-workers 2`: passed after final source edits. Android: 3,454 modules, `entry-e6871847ba0424ad971ce70de895a21f.hbc` (5.7 MB). iOS: 3,328 modules, `entry-ffe047435baafb0c56e533673cabd25c.hbc` (5.4 MB). These are Hermes exports, not signed installs.
- Fresh Expo Go server: `npm run start:local`, port 8084. `/status` HTTP 200; current Android development bundle HTTP 200, **11,884,348 bytes**, containing the new designer, all palettes, quote artwork and tracker menu.
- Metro inspector: HTTP 200, **empty device list**.
- Scope: 161-file baseline → 164 checked files; eight modified, three added, zero removed, zero unexpected paths. Report: `build/milestones-reference/pixel-audit/scope-audit.json`.
- Published assets: JS SHA-256 `7075da7ae3f955b99c5846d39953df1d16b6a1df1f78690627f860e1ffbae1b4`; CSS `10c979e22f80eac0fe1eb657a5a83222f839359423b567510d35c57d348cf4ef`.

The Windows restricted runner fails before the test suite starts with `uv_os_get_passwd ENOMEM`; the full suite passed outside that runner. No app workaround was added for the runner failure.

## Remaining acceptance and platform differences

There are **no post-change native screenshots or matching-size native/reference screenshot diffs**. Real Android/iOS taps, image sharing, persistence after relaunch, screen-reader focus, large fonts, safe-area rasterization, and measured animation performance still require an attached device. Browser/reference checks and successful Hermes exports do not replace those checks.

Current LAN Expo Go URL: `exp://192.168.31.164:8084`, requiring the same network and running server. The older QR/IP elsewhere in historical validation notes is session-specific and may be stale.

Intentional differences are the requested 19 goals/three filters, existing achievement names/affirmations and actual tracker data, retained named certificates/celebration, accurate fractional progress, and native safe areas/system sharing. Existing loaded medium/semibold font faces approximate the reference's 550/650 weights; Android uses its native serif rather than redistributing Georgia. The CSS backdrop blur is not implemented by the installed native libraries, so a translucent backdrop is used. Native platform chrome replaces the reference's simulated desktop phone frame. No web target or substitute browser implementation was added.
