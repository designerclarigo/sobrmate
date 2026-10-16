# Settings reference audit

Updated October 16, 2026. Reference: [SobrMate](https://sobrmate-elite-habit-days-clean-tracker.ai.studio/).

## Implementation and scope

Settings now follows the reference's full-height mobile panel, centered desktop panel (410px maximum width, 840px maximum height), fixed header, independently scrolling body, 22px page padding, 20px content gaps, 68px grouped rows, 21px cards, 48px buttons, thin Lucide icons and lighter typography. The palette and typography are scoped to Settings. Native font scaling, safe areas, keyboard avoidance, dark theme, reduced motion, native-driver page/press/switch animations, loading, validation and save errors are supported in source.

The screen uses one native modal host. Back returns to the Settings index; Close returns to Progress. Leaving Settings unmounts its transient forms, and reopening starts at the Settings index. Each detail page gets a fresh scroll surface. Editing a saved idea scrolls back to its form. Busy guards protect saves and prevent header navigation during an operation. The final interaction correction also disables other controls and form edits while an asynchronous save or system action is pending, preventing conflicting changes during persistence.

Existing tracker data, profile fields, themes, haptics, local reminder scheduling, PIN/biometric controls, backup export/restore, mock Premium and device-data erasure remain connected to their existing services. New idea/feedback drafts and widget appearance preferences use a separate versioned AsyncStorage key, `@komorebi:settings-preferences:v1`. Writes publish only after storage succeeds. Unreadable drafts are retained and a retry is offered. Drafts do not transmit to a team, store or cloud service, and they are not included in the existing journey backup. Device-data erasure includes this new key.

The only shared service change is an optional `presentSuccess` argument to `premium.activate`, defaulting to `true`. Settings passes `false` and presents its success page in the same host. All existing callers retain the global success sheet; entitlement rules, plans and storage are unchanged. No other tab's source, shared navigation, global colors/fonts, dependencies, app configuration, assets or tracker persistence was modified.

## Reference inspection and screenshots

The public JS and CSS assets were downloaded October 15 and their URLs were checked again in the live browser October 16:

- JS: `index-DEFp_wc4.js`, SHA-256 `7075da7ae3f955b99c5846d39953df1d16b6a1df1f78690627f860e1ffbae1b4`.
- CSS: `index-CSi60YSa.css`, SHA-256 `10c979e22f80eac0fe1eb657a5a83222f839359423b567510d35c57d348cf4ef`.

Screenshots and read-only DOM/icon measurements are in the ignored local folder [build/settings-reference](../build/settings-reference/). These are **reference captures, not screenshots of the native implementation**. The entire reference detail-page set was inspected at 320 × 700 and 1280 × 900, in addition to the primary 390 × 844 review. The measured reference detail pages had no horizontal content overflow. The index was [captured again October 16](../build/settings-reference/screenshots/reference-390-oct16.jpg) after confirming the same published asset URLs. Temporary browser viewport overrides were reset.

| Screen/state | Reference evidence | Native implementation and remaining acceptance |
| --- | --- | --- |
| Settings index, top and bottom | [390px top](../build/settings-reference/screenshots/home-390.jpg), [bottom](../build/settings-reference/screenshots/home-bottom-390.jpg), [320px](../build/settings-reference/screenshots/home-320.jpg), [desktop](../build/settings-reference/screenshots/home-desktop-1280.jpg) | Grouped rows, colors, type, icons and responsive host implemented; native screenshots/taps pending |
| Profile | [Profile](../build/settings-reference/screenshots/profile-390.jpg) | Local name/bio/email save retained; validation tests pass; keyboard and relaunch acceptance pending |
| Replay introduction | [Replay confirmation](../build/settings-reference/screenshots/intro-390.jpg) | Existing onboarding route preserves trackers and completion state; native return flow pending |
| Feature idea | [Form](../build/settings-reference/screenshots/feature-390.jpg), [validation](../build/settings-reference/screenshots/feature-error-390.jpg) | Category menu, save/edit drafts, new idea and original system-sharing action; draft validation/round-trip tests pass; device sharing/persistence pending |
| Dashboard | [Dashboard](../build/settings-reference/screenshots/dashboard-390.jpg) | Existing reset-shortcut setting, light/dark appearance and haptics; native visual and persistence acceptance pending |
| Widget | [Minimal](../build/settings-reference/screenshots/widget-minimal-390.jpg), [detailed](../build/settings-reference/screenshots/widget-detailed-390.jpg) | Real tracker preview, persisted style and Premium preference; no installed native widget is claimed |
| Notifications | [Notifications](../build/settings-reference/screenshots/notifications-390.jpg) | Actual permission read/request, device settings link, check-in reminder and reflection time; existing local-notification tests pass; actual OS delivery pending |
| Daily pledge reminder | [Reminder](../build/settings-reference/screenshots/reminder-390.jpg) | Hour/minute inputs with selectable options, toggle and persisted local time; boundary validation passes; native picker/keyboard/delivery pending |
| App lock | [Reference lock](../build/settings-reference/screenshots/lock-390.jpg) | Real secure PIN/current-PIN checks and device biometrics retained; hardware/prompt/background/return acceptance pending |
| Blocked accounts | [Empty state](../build/settings-reference/screenshots/blocked-390.jpg) | Informational empty state and Help link; no social accounts, APIs or Community feature added |
| Rating | [Empty](../build/settings-reference/screenshots/rating-390.jpg), [selected](../build/settings-reference/screenshots/rating-selected-390.jpg) | Five-star selection and local feedback draft; no store review or submission claimed; native taps/relaunch pending |
| Help center | [Questions](../build/settings-reference/screenshots/help-390.jpg), [expanded](../build/settings-reference/screenshots/help-expanded-390.jpg), [no results](../build/settings-reference/screenshots/help-empty-390.jpg) | Search, accordion, empty state and idea link; answers describe actual native features rather than unsupported reference features |
| Privacy | [Top](../build/settings-reference/screenshots/privacy-top-390.jpg), [bottom](../build/settings-reference/screenshots/privacy-bottom-390.jpg) | Matching hierarchy with accurate device-storage/security/backup wording; native scroll acceptance pending |
| Terms | [Terms](../build/settings-reference/screenshots/terms-390.jpg) | Matching hierarchy with accurate native/mock-billing information; native scroll acceptance pending |
| Pro introduction | [Pro](../build/settings-reference/screenshots/pro-390.jpg) | Reference visual treatment, widget preview and existing mock plan access; native taps pending |
| Mock plans, membership, success | Reference has a Coming soon notice rather than billing | Existing monthly/yearly activation, feature comparison, restore and confirmed cancellation use the central mock entitlement service; no real billing is claimed |
| Expo information | [Prototype viewer](../build/settings-reference/screenshots/source-390.jpg) | Adapted to truthful native project/capability information with real clipboard copying and selectable fallback; prototype sample components are not presented as this app's source |
| Reset timer | [Confirmation](../build/settings-reference/screenshots/reset-390.jpg) | Existing confirmed reset records an unknown-amount setback and preserves earlier history; destructive action not run on user data |
| Backup restore / erase device data | Native features retained beyond the web reference | Archive validation/confirmation, existing secure-lock preservation, typed ERASE confirmation; destructive actions not run on user data |

## Executed validation

- `npm run typecheck`: passed after final source edits.
- `npm test`: **55 passed, 0 failed**. Six Settings regressions cover draft serialization, immutable draft edits, validation/30-draft limits, corrupt-data rejection, native profile limits/email and valid/invalid reminder times. The existing suite protects tracker calculations, storage, independent local reminders and mock entitlements. These are not native tap tests or an AsyncStorage device-relaunch test.
- `npx expo export --platform all --output-dir build/settings-reference/native-final --max-workers 2`: passed after the final pending-save correction on October 16. Android: 3,458 modules, `entry-39ea51a521b4195ed6c27b80fd6f395c.hbc` (5,795,510 bytes). iOS: 3,332 modules, `entry-b1b716e6e51bb14084ab45c837b187cf.hbc` (5,481,993 bytes). Hermes exports are not installed or signed builds.
- Expo Go server restarted October 16 with `npm run start:local`, port **8084**. `/status` and the final Android development bundle return HTTP 200; **11,987,794 bytes**, including the new Settings panel, drafts, membership and time controls. Inspector returns an **empty attached-app list**. The native-only server serves an Expo manifest to a desktop browser; it is not a browser app.
- The installed Expo CLI LAN helper currently resolves **`exp://192.168.0.143:8084`**. Open it in Expo Go on a phone on the same network. This is a current server address, not evidence of phone connectivity; prior session IPs may differ.
- SHA-256 scope audit: **164 baseline files → 169 checked files; seven modified, five added, zero removed, zero unexpected paths**. Report: [scope-audit.json](../build/settings-reference/scope-audit.json). The user's pre-existing `@expo/ngrok` dependency remains untouched.

The Windows restricted runner failed before test execution with `uv_os_get_passwd ENOMEM`; the full suite passed outside that runner. The network compatibility check also needed the unrestricted runner. No application workaround was added for these runner limitations.

`npx expo install --check` **did not pass**: Expo recommends the following patch updates. No packages or lockfile were changed during this Settings-only task.

| Package | Installed | Recommended at check time |
| --- | --- | --- |
| `@expo/metro-runtime` | 57.0.16 | ~57.0.17 |
| `expo` | 57.0.28 | ~57.0.29 |
| `expo-asset` | 57.0.19 | ~57.0.20 |
| `expo-constants` | 57.0.21 | ~57.0.22 |
| `expo-linking` | 57.0.12 | ~57.0.13 |
| `expo-notifications` | 57.0.22 | ~57.0.23 |
| `expo-router` | 57.0.26 | ~57.0.27 |

## Limits and remaining device verification

**Pixel-perfect native matching and complete interaction acceptance are not verified.** No post-change native screenshot pairs/diffs or measured animation FPS exist. An attached native app is needed to inspect every page and scroll position at matching sizes, font scaling, dark theme, rotation, safe areas, Android Back, screen-reader focus, dropdown/keyboard behavior, rapid/repeated taps, persisted saves after relaunch, cancelled/error sharing flows, local reminder delivery and PIN/biometric return flows. Use disposable test data for reset, restore, cancellation and erasure checks.

The native app retains profile bio/email and 60-character names, its original suggestion-sharing action, backup tools and security controls. The web reference has a smaller profile and several preview-only controls; copying their unavailable-functionality wording would misdescribe the native app. The old prototype code viewer is replaced by truthful app information. No social or cloud service is added. New idea/feedback drafts stay separate from journey backups. Premium is explicitly mock mode; widgets are in-app design previews requiring a native extension for installation.

Android uses its native serif in place of Georgia; loaded medium/semibold sans faces approximate the reference's intermediate 550/650 weights. Platform safe areas, native inputs/dropdown options and system sharing differ from browser controls. The installed native libraries do not provide the reference's CSS backdrop blur, so the native host uses its translucent scrim. No browser/DOM implementation or web target was added.
