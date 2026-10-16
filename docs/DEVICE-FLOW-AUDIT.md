# Device flow audit — October 14, 2026

## Evidence reviewed before changing code

All six supplied 1080 × 2340 screenshots were inspected. They contain three unique views, each supplied twice: Settings, Calendar, and the lower Progress dashboard. They do not show Splash, welcome, or setup. Those stages were audited in source; current post-change phone captures are still required.

| Finding | Cause in source | Correction |
| --- | --- | --- |
| Missing Pro control | Shared header rendered a gold `NEW` button; no Crown or Premium action existed there. Settings used a feather for Premium. | Shared Crown + PRO control opens the existing mock paywall or membership management; Settings uses Crown too. Tracker creation remains in the selector's Add action and Progress CTA. |
| Calendar title wraps into a heavy two-line block | A 30px sans title competed with Rules in the same constrained row. | Full-width 28px editorial title; tracker/unit and 44px Rules action sit in a separate row. |
| Flat Progress cards | Several custom white cards had borders without the shared shadow tokens; the hero's white ornaments were barely visible on white. | Consistent surface shadows, neutral borders, more balanced 20–24px padding, and a selective soft-accent hero with white time tiles. |
| Heavy typography / excessive headline height | Loaded weighted font faces also received numeric font weights; every size had a forced minimum line height of 1.35, including large headlines/counters. | Select the real bundled face with normal native weight; retain body leading and use compact display leading. No accessibility font scaling is disabled. |
| Unnecessary startup hold | Fixed 2-second JS splash; storage hydration began only after fonts loaded. | Font/data initialization overlaps; splash holds 600ms for returning users or 1,100ms for first launch, and 120ms with reduced motion. Actual loading/errors still gate navigation. |
| Unnecessary recurring JS work | A 1-second interval ran even with only calendar-day subscribers; counter consumers derived the full store/milestone list per tick. | One shared foreground timer: seconds only while needed, local midnight otherwise; live duration hook avoids unrelated store derivations; milestones memoize by tracker/day. |
| Setup animation and scroll friction | Progress animated layout width on JS; the same ScrollView retained the previous step's offset. | Native-driven anchored scale animation and reset to the top on each step. Inputs retain values; duplicate-submit guards and keyboard handling remain. |
| Stale catalog appearance/callbacks | Catalog `renderItem` captured the first theme and selection callback with empty dependencies. | Refresh the renderer when theme/styles/callback change. |
| Footer overlap risk | Absolute custom tab bar plus hand-maintained scene offsets; extra `display:none` applied inside native tab scenes. | Tab bar participates in normal navigator layout; scene padding/floating check-in positions updated; native scenes own visibility, while context pauses clocks/sheets. |
| Touch responder warning in supplied screenshots | Warning comes from React Native's responder tracking. Screenshots alone cannot establish its trigger; tab visibility duplication was an app-side risk. | Removed the extra display hiding. Warning is not suppressed or declared fixed; repeat navigation/scroll/modal taps with device logs. |

The grey floating gear and black system strip in the supplied captures are not elements in these app screens. Their exact host/device origin needs device inspection; no app code was added to conceal them.

## Preserved behavior

Storage keys, archive version, trackers, saved records, reset history, units, onboarding completion, PINs, and entitlement rules were not replaced or reseeded. Missing check-ins remain unrecorded. Premium remains clearly identified development mock mode. No new native dependency, backend, store billing, or widget extension was added.

## Follow-up homepage correction

The Share Streak / View Badges row, live-counter footer, current/longest streak cells, savings row, and share sheet footer now use measured container widths and font scale instead of wrapping icons independently from labels. Shared buttons preserve the existing handlers. The Full view link has bounded text and a retained arrow. See [homepage details](HOME.md#homepage-alignment-correction--october-14). Native device acceptance of this follow-up remains pending.

## Executed checks and remaining acceptance

The 41 tests passed: the existing 35 data/navigation/notification checks, four timer lifecycle regressions, and two typography regressions. Strict TypeScript passed. Native exports and the local development bundle are recorded in [VALIDATION.md](VALIDATION.md).

Timer tests exercise actual scheduler logic with an injected clock: local midnight, shared counters, background/resume, and unsubscribe cleanup. Font tests verify the selected bundled faces and leading. These tests do not measure device FPS, rasterization, touch dispatch, keyboard geometry, or actual native UI interactions.

Two ADB checks reported no connected devices. After the user reported a connection, a further device check was declined. Metro's inspector target list was also empty when checked. No post-change device execution or frame-rate result is claimed.

React Native recommends checking performance in release builds because development mode adds overhead. Native-driven transforms avoid JS work on each animation frame. See [React Native performance](https://reactnative.dev/docs/performance) and [native animation driver](https://reactnative.dev/docs/animated#using-the-native-driver).

On a connected phone, complete these acceptance checks without erasing existing data:

1. Cold/returning launch, all three welcome pages, Back/Next/Skip, and retained welcome completion.
2. Catalog search/categories/custom habit; all eight setup steps, scroll reset, keyboard, validation, summary, single creation on rapid taps.
3. Progress scrolling, live timer/day mode, saved tracker selection, Pro paywall/manage/close, pledge, check-in, and share cancellation.
4. All four tab switches and Calendar interactions; confirm no responder warning or intercepted taps.
5. 320/360/390px layouts, landscape, large text, both themes, and Android system insets; inspect tab labels and floating actions.
6. Measure cold start, JS/UI frame times, and repeated scrolling in a native release build. Repeat background/resume and tracker changes; verify timers stop when inactive and saved data remains correct.
