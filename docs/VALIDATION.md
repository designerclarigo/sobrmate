# Validation and acceptance

Workspace: `C:\Users\lenovo\Downloads\Habit-Recovery-App`. Checked October 13, 2026 on Expo **57.0.28**, React Native **0.86.3**, React **19.2.3**. Android/iOS are configured; direct React DOM/React Native Web dependencies were removed. [SDK 57](https://expo.dev/sdk/57) was verified as stable.

After the October 14 screenshot-driven flow corrections, strict TypeScript, all 41 tests, and fresh Android/iOS production Hermes exports passed. Local startup is rechecked below. Dependency compatibility, native config-plugin introspection, and Expo Doctor were also checked October 14 before these source-only changes. Doctor reports 20/21 with the Git-ignore detection warning described below. No Android development APK or post-change phone interaction acceptance is claimed. See the [root-cause audit](DEVICE-FLOW-AUDIT.md).

The subsequent homepage Share/Streak/View correction also passed the existing 41 tests, TypeScript, and Android/iOS export checks. The final large-text wrapping styles are checked through TypeScript and the current Android development bundle. The corrected controls use actual container measurements and font scale; source inspection and compilation do not prove device rasterization or pixel alignment. See [homepage correction](HOME.md#homepage-alignment-correction--october-14).

## Executed checks

### Development demo and corrected launch/setup flow — October 16

[Quick start, dummy credentials, mode boundaries and flow](DEMO-FLOW.md). This supersedes the earlier requirement to configure Supabase before any local testing and the earlier Login-first onboarding order.

- **96 tests passed, 0 failed**, including the previous 80 cases. New coverage checks release-mode demo blocking, explicit development modes, predefined credentials, remembered/process-only demo sessions, isolated real/demo archives and legacy keys, scoped native reminder identifiers, onboarding/login/setup/dashboard routing, draft restoration after sign-out, atomic/idempotent tracker creation, late autosave rejection, archive compatibility, failed writes and access to authenticated backup recovery when saved data is unreadable.
- Strict TypeScript passed after the functional source changes. No package, SDK, app configuration, signing profile or asset was changed in this phase. Existing Expo SDK 57 dependencies remain in place; previous dependency checks/warnings are retained below rather than represented as new checks.
- Final `npx.cmd expo export --platform all --output-dir build/demo-flow/native-verified --max-workers 2`: passed after the recovery-route correction. Android: `entry-aa2d4ab0d44e1becfe065e1868ecf6ce.hbc`; iOS: `entry-25988875b754f28e9cae1e2f35be8b16.hbc`. These are production Hermes exports, not installed/signed native builds. Earlier checkpoints are retained separately under `build/demo-flow`.
- Sign In has no configuration/validation disabling condition. Its opt-in native button behavior keeps the control enabled during loading while the request guard prevents duplicate submissions. Other buttons retain their existing loading/disabled behavior. Invalid input, missing production configuration and wrong demo credentials report errors when pressed.
- Release/runtime mode policy always chooses Supabase outside development, including with `EXPO_PUBLIC_AUTH_MODE=demo`. A disabled demo service rejects restore/sign-in without reading session data. Supabase still verifies confirmed email and matching server user ID; demo identity explicitly identifies its local source and does not impersonate a Supabase user/JWT.
- Existing production storage keys remain unchanged. Demo state, session preference, mock membership, Settings drafts, app-lock credentials and notification identifiers use separate keys. The actual recovery storage adapter is tested against both namespaces, including preserving a preexisting production archive/legacy sentinel during demo erase.
- Draft fields are optional in version-2 archives. Onboarding page and completion persist, Setup stores selection/step/answers/estimates/questionnaire position, and creation commits completion plus matching draft removal. A stable tracker ID and transaction-time guard prevent duplicate creation and draft resurrection. Backup exports include the new progress fields.
- A separate offline Expo Go server started on port 8092; `/status` and the inspector endpoint responded HTTP 200, with inspector result `[]`. It served a **13,131,388-byte** Android development bundle (**3,695 modules**) containing demo-mode selection, credentials/banner, the always-enabled control and saved-flow guards. The temporary verification server was stopped afterward. No browser target was introduced and no native app was attached.
- SHA-256 review covers **224 baseline paths**: **37 modified**, **8 additions**, **zero removals**. Changes cover the requested authentication/flow/persistence behavior, data-scope safeguards, related UI notices, tests and documentation. Existing Home/Calendar/Milestones tab contents, assets, design tokens, packages, app config and build profiles are unchanged. Home's shared header only adds a conditional demo-workspace caption.

Automated session/store/SDK responses use explicit local fixtures. Production Supabase credentials remain unavailable. No physical Android/iOS taps, screenshots, keyboard/autofill, native keychain execution, measured FPS, reset-email delivery or real production sign-in is claimed. Local Demo Mode is implemented for immediate Expo Go/development-client testing, not as a claim of backend verification.

### Email-only Login refinement — October 16

The [Login design and behavior report](LOGIN.md) describes the native layout and acceptance limits. The [authentication guide](AUTHENTICATION.md) now covers email/password only, verified email, both Remember Me choices and password reset. This supersedes the provider-login UI and setup instructions in the earlier authentication phase below.

- `npm.cmd run typecheck`: passed after the final source changes.
- `npm.cmd test`: **80 passed, 0 failed**. Added coverage includes common/custom domains without a domain allowlist, verified-email/user-ID enforcement, safe error messages, existing session-key compatibility, checked/unchecked persistence, interruption during opt-out, concurrent refresh writes, sign-out and installed-Supabase-SDK restart behavior. The retired provider-URL test was removed; the one-time PKCE exchange regression now starts from a password-reset request.
- `npx.cmd expo install --check --npm`: passed, “Dependencies are up to date”. The unused direct `expo-web-browser` package and config plugin were removed; no SDK or React Native upgrade was introduced in this refinement.
- `npx.cmd expo export --platform all --output-dir build/login-refinement/native --max-workers 2`: passed. Android: **3,525 modules**, `entry-f999f7072e14e013be9a0fec0fe28fa3.hbc`. iOS: **3,399 modules**, `entry-67645bac11e1fbd249bba44a27ad3d53.hbc`. Both are production Hermes exports, not signed or installed binaries.
- The new Login has no provider buttons/logos, provider divider or descriptions, or account-creation action. Source searches show no provider sign-in method, OAuth browser import, direct browser dependency or browser plugin in the app. Callback/PKCE support remains for password recovery and previously requested valid links; remote provider settings and existing accounts were not changed.
- Baseline SHA-256 review covers **219 files**. Changes are limited to Login/authentication, its route, associated privacy copy, the unused dependency/configuration removal, tests and documentation. Existing tab implementations, root navigation guards, theme tokens, tracker records/calculations, setup, assets and unrelated feature components remain unchanged. No source or data files were removed.

No `.env` project configuration or attached native device was available. Test transport/storage responses are explicit fixtures; no live account authentication, reset-email delivery, native screenshot alignment, keyboard/autofill behavior, screen-reader output or measured animation performance is claimed. Dependency Doctor/security warnings from the preceding phase remain documented below; those checks were not rerun unnecessarily for this Login-only refinement.

### Supabase Auth, recovery questionnaire and transparent Premium — October 16

Implementation and owner configuration: [authentication](AUTHENTICATION.md) and [questionnaire / plans](AUTH-ONBOARDING-PREMIUM.md). The existing archive and all tracking data are preserved. Authentication gates protect private routes, and there is no sign-up screen or simulated login.

- `npm.cmd run typecheck`: passed after the final source changes.
- `npm.cmd test`: **72 passed, 0 failed**. Seventeen added cases cover configuration/credential validation, strict callbacks, recovery metadata, encrypted-store adapter chunking/atomic failures/corruption/concurrency, native request timeout/cancellation, installed-Supabase-SDK OAuth S256 and email/reset/one-time-code transports, personalization validation/archive compatibility and exact annual pricing. Transport responses and secure-store operations are test fixtures, not a live backend or physical keychain.
- `npx.cmd expo install --check --npm`: passed, “Dependencies are up to date”, after the seven recommended compatible SDK 57 patches. Installed Expo is **57.0.30**, with React Native **0.86.3** / React **19.2.3** retained. New runtime dependencies: Supabase JS, Expo WebBrowser, native URL and text-encoding polyfills. The browser plugin is configured; installed development builds must be rebuilt.
- `npx.cmd expo-doctor`: **20/21**, exit 1. Its Git-ignore detection says `.expo` is not ignored; `.gitignore` already contains `.expo/`, and `git` is unavailable in this environment. No Doctor suppression was added. Initial restricted registry checks failed with EACCES; the recorded online results were rerun with approved network access.
- `npx.cmd expo export --platform all --output-dir build/auth-onboarding-premium/native --max-workers 2`: passed for both native platforms. Android: **3,526 modules**, `entry-3fcb7b0c711566ef32537634bd0b9a14.hbc`, **6,550,906 bytes**. iOS: **3,400 modules**, `entry-ee35590ebe2ee45e6039e50b60cf0a6a.hbc`, **6,236,993 bytes**. These are production Hermes bundles, not signed/installed native binaries.
- `npx.cmd expo start --go --offline --port 8090 --clear`: started successfully for a separate verification session, then stopped after the checks. `/status` responded HTTP 200; the final Android development bundle was served and saved (**13,108,137 bytes**, **3,690 modules**). `/json/list` returned `[]`: no app was attached. This verifies Metro compilation/startup, not native execution of SecureStore, keyboard layouts or OAuth. No web platform was added and no browser application rendering is claimed.
- `npm audit`: **21 advisories (19 high, 2 moderate)** remain in transitive development/build tooling: Expo Metro → micromatch/braces, Expo CLI/code-signing → node-forge, and the existing ngrok tool → uuid. The suggested Expo 44 downgrade would break this SDK 57 app and was not applied. These require a compatible upstream resolution before release; no claim of a clean security audit is made.
- Before/after SHA-256 comparison covers **169** baseline paths: **17 modified existing files**, **17 added source/test files**, **zero removals**. Calendar, Milestones, tab navigation, global design tokens, existing Home route, assets and storage keys remain unchanged. Additional files are the public `.env.example` and setup/validation documentation. Home's intentions component changes only to show optional personalized encouragement.

The user confirmed that Supabase configuration is not available yet. Real email delivery/login, Google/Microsoft identity verification, reset returns, physical rendering/taps, and installed Android/iOS acceptance therefore remain unverified. Real billing is intentionally absent; mock activation/expiry logic is covered by regression tests, not store purchases.

### Settings-only published-reference follow-up — October 15–16

See [Settings comparison, screenshots and remaining acceptance](SETTINGS.md). Every live reference Settings detail page was inspected at the target 390px width, with additional 320 × 700 and 1280 × 900 checks. The implementation follows its panel, fixed header, grouped rows, typography, icon glyphs, colors, forms and motion while retaining actual native reminders, security, profile fields, backups and mock Premium access. Local idea/feedback drafts and widget style persist separately from tracker data.

- Final TypeScript passed; **55 tests passed, 0 failed**, including six Settings cases. These are data/logic regressions, not native tap acceptance.
- Final Android and iOS Hermes exports passed: 3,458 / 3,332 modules. Bundle details are in the Settings report.
- SHA-256 scope comparison: seven modified existing files and five additions, zero removals or unexpected paths across 169 checked files. No other tab, shared navigation, global theme/font token, dependency, app config or asset changed. The one shared Premium service edit adds an optional inline-success presentation argument; existing callers retain their behavior.
- Expo Go restarted October 16 on port 8084. Metro serves the final Android development bundle HTTP 200 (11,987,794 bytes); the inspector reports an empty attached-app list. Final exports include the correction that disables conflicting controls/form edits during pending saves.
- `expo install --check` reports **seven recommended patch updates**, listed in the report. It did not pass. Dependencies were preserved for this scoped UI task.

Reference screenshots and responsive DOM measurements are available locally; **native matching screenshots, complete touch/persistence/OS-permission checks and measured FPS remain pending**. The reference's prototype source viewer is adapted to accurate native app information. Native safe areas/fonts, retained extra fields/features and real native service behavior prevent an identical copy of every preview-only reference state. No successful physical-device acceptance is claimed.

### Milestones-only published-reference follow-up — October 15

See [Milestones comparison, screenshots and acceptance matrix](MILESTONES.md). The live reference was inspected in the browser after screenshot access recovered: main list/scroll states, All/Earned, locked/earned details, tracker dropdown/switching, and all 36 Share Badge style/palette selections. Six styles were inspected at 320 × 700, 390 × 844 and 1280 × 900. Settled reference captures are linked in the report. The app retains the explicitly requested 19 goals and three filters, existing calculations/data, named certificates, and celebration.

The follow-up corrects scoped typography (including the previous 12px floor and forced-heavy buttons), inherited detail leading/margins, icons, anchored selector, responsive layout, and the complete native six-style/six-palette designer. Real PNG sharing and copy-text actions use existing Expo-compatible APIs, measured capture dimensions, busy guards and visible fallback/error handling. Native modal flags stay stable between detail and sharing modes, and mode-specific scroll surfaces reset stale offsets.

- `npm run typecheck`: passed after final source edits.
- `npm test`: **49 passed, 0 failed**; six Milestones data/privacy cases. These do not exercise native taps or file sharing.
- `npx expo export --platform all --output-dir build/milestones-reference/pixel-audit/native --max-workers 2`: passed after final edits. Android: 3,454 modules, `entry-e6871847ba0424ad971ce70de895a21f.hbc` (5.7 MB). iOS: 3,328 modules, `entry-ffe047435baafb0c56e533673cabd25c.hbc` (5.4 MB).
- Expo Go restarted on port 8084. Status and current Android bundle return HTTP 200; development bundle **11,884,348 bytes**. Current LAN URL: `exp://192.168.31.164:8084`.
- Metro inspector returns an **empty device list**.
- SHA-256 audit against 161 source/config/asset/test files: eight modified Milestones/test files, three additions, no removals, **no unrelated changes**. Other tabs, global fonts/colors, navigation, app configuration/dependencies and persistence remain unchanged.

**Native screenshot comparison and interaction acceptance remain incomplete.** Reference screenshots were captured, but no post-change native screenshots/diffs, native share/cancel/error runs, large-font device acceptance or FPS measurements were completed. The earlier browser initialization blocker is resolved; a connected native app is still needed. See the report for the exact remaining screen matrix and native platform differences. Historical QR/IP values below may be stale.

### Home-only published-reference follow-up — October 14

The reference page and public JS/CSS assets responded HTTP 200. Its injected Home stylesheet was inspected and applied through Home-specific palette/components; see [comparison and native differences](HOME.md#published-home-comparison--october-14). No global colors/typography, app config, dependencies, persistence, shared Calendar header, navigation bar, or other screen source was changed. A before/after SHA-256 comparison of 143 source/config/asset/test files confirms the only modified existing code files are `app/(tabs)/index.tsx` and seven Home components. Three new helpers are confined to `src/components/home`.

- `npm run typecheck`: passed after final Home code edits.
- `npm test`: all 41 existing regressions passed; these protect calculations/storage and are not a native UI interaction suite.
- `npx expo export --platform all --output-dir build/home-reference/native --max-workers 2`: passed after the final Home palette/marker changes. Android: 3,432 modules, `entry-15c79cf2536acbf1a7d3acc385286f93.hbc` (5.6 MB). iOS: 3,306 modules, `entry-8fbb310483f19898b7614356aae5e2e3.hbc` (5.3 MB). Both are Hermes bundles, not signed installs.
- Port 8084 `/status`: HTTP 200, running. `/json/list`: HTTP 200, empty device list.

Browser automation could not initialize (`failed to write kernel assets`). Styling was compared against public reference source and the supplied screenshots. Current pixel-level rasterization, native touches, animation FPS, and large-font/device acceptance remain pending. Labels retain a 12px minimum; Android uses its native serif instead of an unavailable Georgia font. No web target was added, and no desktop-browser rendering claim is made.

### Shared bottom tab bar follow-up — October 14

The [bottom bar comparison](TAB-BAR.md) records exact reference colors, icon definitions, spacing, indicator measurements, native motion, and deliberate 12px label minimum. Native scene fades were verified against the installed Expo Router types/implementation and documented navigator API.

- `npm run typecheck`: passed after replacing React Native's removed `absoluteFillObject` with explicit native positioning.
- `npm test`: all 41 existing regressions passed.
- `npx expo export --platform all --output-dir build/tab-bar-reference/native --max-workers 2`: passed. Android: 3,433 modules, `entry-c65e007b1d29642a0b3edfee00f18666.hbc` (5.6 MB). iOS: 3,307 modules, `entry-5ed4740f42d1ec621043e9a35102cffb.hbc` (5.3 MB).
- The restarted Expo Go server on port 8084 returned the current Android development bundle HTTP 200 (11,696,897 bytes). Animated tabs, navigation tokens, native indicator motion, and the scene-fade configuration are present; the removed style helper is absent.
- A fresh before/after hash audit of 147 files shows three modified existing source files: the tab layout, shared bar, and token export. The new navigation token file is the only added source. No Home/Calendar/Milestones/Settings content, dependency/config versions, persistence, or navigation handlers were changed in this phase.

Native pixel matching, all-pairs device taps, rapid-switch/Back behavior, large-text rasterization, and FPS are still pending; compilation/regressions are not phone acceptance. The older server's full-bundle request timed out during Home work; after restarting that owned server, the current bundle responds successfully. No USB/ADB actions or device-data changes were performed.

### Earlier native setup checks

| Check | Actual result |
| --- | --- |
| `npx tsc --noEmit` | Strict TypeScript passed |
| `npm test` | 41 passed, 0 failed; data/navigation/notification, timer lifecycle, and typography regressions |
| `npx expo install --check --npm` | Dependencies up to date |
| `npx expo-doctor` | 20/21; exit 1 from Git-ignore detection |
| `npx expo export --platform all --output-dir build/native` | Android/iOS production Hermes export passed |
| `npm run start:local -- --clear` | Fresh Expo Go server on port 8084 emitted the actual LAN QR |
| `http://127.0.0.1:8084/status` and LAN status | HTTP 200, `packager-status:running` |
| Android launcher and native manifest on port 8084 | HTTP 200; manifest identifies `komorebi-recovery`, SDK 57 |
| `npx expo config --type introspect --json` | Android/iOS configuration and native plugins resolved; Android mod results generated |
| Clean Metro Android development bundle after homepage corrections | HTTP 200, 11,663,267 bytes; shared homepage actions and measured responsive rows present |
| Current full visual/device interaction | Six supplied phone screenshots inspected (three unique views); post-change device confirmation, touch-warning reproduction, and measured frame performance remain pending |

The native export bundles the five selected Inter/DM Serif styles instead of all Inter weights. Ignored `build/native` contains the generated artifacts. This is not a signed APK/IPA or proof of phone execution.

Doctor says `.expo` is not ignored by Git. `.gitignore` already includes `.expo/`, but Git is unavailable here, so Doctor cannot verify it. No repository was initialized just to suppress the warning. There is one package-manager lockfile.

The 41 tests comprise 12 recovery, 6 home, 7 Calendar, 1 navigation, 4 entitlement, 2 quantity, 3 notification compatibility, 4 timer lifecycle, and 2 typography tests. They cover elapsed/local dates, restart/edit behavior, linked records, categories, malformed archives, logged streaks, unknown counts, date ranges, privacy, mock expiry/cancellation/month boundaries, and saved units after renaming. Timer tests verify a single shared foreground timer, midnight-only work for day screens, resume refresh, and cleanup. Typography tests verify loaded faces without synthetic weight and distinct body/display leading. Notification tests evaluate the installed SDK's Android JavaScript modules against a simulated native host with remote push unavailable. These tests do not replace native interaction or FPS measurements.

## Android Expo Go startup fix

The supplied Android log identified a startup exception at the `expo-notifications` package import. Its SDK 57 entry point evaluates remote-push auto-registration, which throws in Android Expo Go. The subsequent missing-default-export warnings and Router `ErrorBoundary` error were consequences of route imports failing; both routes already export components.

`src/utils/localNotifications.ts` now isolates the installed SDK's local notification modules and loads them lazily. Handler initialization happens after loading, inside the reminder service's asynchronous error handling. No remote token or server registration is requested; local reflection/pledge reminders and native-build behavior remain available. Re-run the compatibility tests after notification SDK upgrades because the adapter uses SDK submodule paths.

After restarting Metro with a fresh cache, fully reload Expo Go rather than retaining the failed route modules:

```sh
npm start -- --clear
```

This fix passes the 41-test suite and strict type checking. Android/iOS exports and the clean Metro Android development bundle exclude the failing remote-registration path. Android Expo Go UI and delivered local notifications still need confirmation on the device.

[Current Expo Go QR](expo-go-qr.png): `exp://192.168.0.143:8084`, requiring the same LAN and running server. It is session-specific, not physical-device evidence.

## Local server on port 8084

Run `npm run start:local` to start on the requested port 8084. An earlier online CLI session on port 8083 returned `UnexpectedServerError` from its manifest endpoint; the installed Expo CLI resolves its signed-in account while generating that manifest. Expo's supported `--offline` option avoids this lookup. Dependency compatibility was checked separately with registry access.

Port 8084 was rechecked on October 14: the native manifest and Android launcher respond HTTP 200, and the fresh Android development bundle responds HTTP 200 (11,663,267 bytes) with the homepage corrections included. Expo emitted `exp://192.168.0.143:8084`. The root manifest is configuration data, not a rendered app screen.

In a desktop browser, open `http://127.0.0.1:8084/_expo/loading?platform=android`. The platform query selects the Android launcher. Use Expo Go and the LAN QR to run the native app on a phone. `127.0.0.1` on the phone points at the phone itself; use the computer's LAN address from the QR.

## Screen-by-screen acceptance still to perform

All flows below are implemented and compile. **Current visual/device acceptance is pending for every row.** Check 390px, a narrow Android phone, tablet/landscape, large text, and both themes.

| Flow | Device checks |
| --- | --- |
| Splash/welcome | Cold/returning launch, Next/Back/Skip, saved completion, replay, reduced motion |
| Catalog/custom | Categories/search, saved custom metric/unit, keyboard/navigation |
| Eight-step setup | Validation, Back/Continue, sticky CTA, date/estimate limits, summary/create, duplicate taps |
| Navigation | No-tracker resume, protected routes, four tabs, inactive-screen isolation |
| Progress | Seconds/day view, active tracker, current/best streak, estimates, week, intentions |
| Detail/edit/reset | Long notes/titles, saved units/goals, confirmations, archive retention |
| Pledge | Personal motivation, one per tracker/date, animated success, save-error retry |
| Calendar/rules | Date alignment, missing/future days, selection, categories/legend, contrast |
| Check-in sheet | Alcohol/count/minutes/status, blackout unknown count, historical edits, notes, keyboard/errors |
| Periods/year | Correct ranges, free locks, expiry preservation, all twelve months and navigation |
| Advanced statistics | Actual rates/quantities/streaks/recorded savings; honest locked preview |
| Milestones | Tracker sync, filters, next progress, dates, details/celebration |
| Certificate/streak/year sharing | Native PNG fidelity/dimensions, private-data exclusion, templates/backgrounds/toggles, cancellation |
| Premium | Mock notice/prices, persisted activation/success/change/cancel/expiry/local restore, storage errors |
| Appearance/profile | Both themes across all sheets, saved local profile, no online-account claim |
| Reminders | Permission denial/grant, independent times, rescheduling/restart, no duplicates |
| App lock | PIN setup/migration/cooldown, keyboard, background/resume, biometric cancel/fallback |
| Widget preview | Selected tracker, locks/preference, clear lack of installed widget |
| Backup/recovery | Export/import/review, malformed data/save failure, retention, excluded credentials |
| Help/legal/erase | Readable scroll, suggestion chooser, confirmed erasure/reminder cleanup |
| Layout/accessibility | Safe areas, tab clearance, long text, no clipping/overflow, readable focus order |

Earlier screen captures in `docs/home`, `docs/calendar`, and `docs/onboarding` predate this upgrade. The six October 14 user-supplied phone captures informed the latest changes, but do not show the corrected build. The onboarding vector preview sheet demonstrates artwork only. Two ADB checks found no device; after the user reported a connection, a further check was declined. Metro's inspector target list was empty when checked. No substitute mockup or build result is claimed as device execution.

## Integration boundaries

- Expo Go-compatible libraries support offline tracking, fonts, local reminders, PIN storage, files, and image sharing; actual device behavior still needs acceptance.
- Custom operating-system splash/launcher changes and [iOS Face ID](https://docs.expo.dev/versions/latest/sdk/local-authentication/) require a native development build. [Local notifications remain available in Expo Go; future Android remote push requires a development build](https://docs.expo.dev/versions/latest/sdk/notifications/). Remote push is not configured.
- Membership activation/change/cancel/restore is mock only: no charges, store receipts, automatic renewal, or real billing.
- Widgets are preview/configuration only; no native extension is installed.
- Profile/account data is local only; authentication/cloud synchronization are not configured.
- Owner accounts/configuration are required for signing, stores, real billing, and release approval.

The last online installation reported 19 high-severity upstream build-tool advisories, including chains involving `braces` and `node-forge`; this is a recorded installation result, not a fresh release audit. Existing compatible overrides address `decode-uri-component` and xcode's `uuid`. Avoid forced SDK downgrades; review current advisories and complete device acceptance before release.

