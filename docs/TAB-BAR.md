# Bottom navigation reference audit

The shared bar follows the published [SobrMate reference](https://sobrmate-elite-habit-days-clean-tracker.ai.studio/). The reference's injected `.home-nav` styles and Lucide definitions were inspected from its public `index-DEFp_wc4.js` asset, retrieved October 14. No browser screenshot comparison of the corrected native bar is claimed.

| Property | Current native treatment |
| --- | --- |
| Background / top border | `#FAF9F6` / `#EBE3EE`, 1px border, no floating shadow |
| Icons | House, Calendar, Award, Settings; 19px, 1.65 stroke |
| Active / inactive | `#806499` / `#A08AAF`; same medium label weight avoids a width jump |
| Active indicator | `#EEE6F5`, 35×27px, 10px radius, behind the icon |
| Layout | Four equal cells, 16px horizontal gutters, 4px gaps, centered at a 400px maximum |
| Touch / safe areas | Minimum 50px item height; 8px top and max(14px, bottom inset); left/right insets honored |
| Label accessibility | 12px minimum instead of the reference's 9px, system font scaling, wrapping without truncation |

`src/design-system/tokens/navigation.ts` centralizes measurements and light colors. Dark appearance uses the existing semantic palette. Label line counts reserve the same vertical space across all four cells so longer/larger labels do not shift just one icon. Navigation remains in normal layout flow, keeping screen content above the bar.

Active/inactive icon and label layers crossfade over 200ms. The active pill fades with a subtle 0.96→1 scale; pressing a tab uses a 0.98 scale. These animate native opacity/transforms and cancel on replacement/unmount. Icon/label duplicates are hidden from accessibility; each tab announces its route and selected state once. Hover/focus feedback is available for pointer/keyboard input.

Screen changes use the installed Expo Router SDK 57 navigator's supported 160ms fade transition. Reduced motion disables both bar motion and scene transitions. The [navigation animation API](https://reactnavigation.org/docs/bottom-tab-navigator/#animations) was checked against the installed vendored navigator's types and implementation. The [native animation driver](https://reactnative.dev/docs/animated#using-the-native-driver) keeps per-frame opacity/transform updates off the JS thread.

The Progress/Calendar/Milestones/Settings route names, onboarding guard, cancellable `tabPress` event, same-tab behavior, focus context, haptic preferences, lazy scene lifecycle, and saved data are unchanged. This phase edits only the shared bar, its token export/new token file, and tab layout icons/transition options. Home and other screen content were not edited in this phase.

TypeScript, all 41 existing regressions, Android/iOS Hermes exports, and the current Android development bundle passed. The latter returned HTTP 200 with 11,696,897 bytes and the new animated tab implementation. A removed React Native `absoluteFillObject` helper was caught by TypeScript and replaced with explicit positions. See [validation](VALIDATION.md).

These checks do not prove tap execution, pixel-perfect rasterization, or frame rate. Device acceptance remains pending: test all tab pairs, rapid taps, Android Back, sheets/deep links, both themes, 320/360/390px and landscape/tablet, large text, keyboard/VoiceOver/TalkBack, and reduced motion. Labels deliberately exceed the reference's 9px size for readability.
