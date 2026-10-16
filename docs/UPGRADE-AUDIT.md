# Komorebi product upgrade

## Phase 1 — existing-app audit (October 13, 2026)

The app is an existing Expo Router / React Native / TypeScript project on Expo SDK 57.0.27, React Native 0.86.3, and React 19.2.3. It has no Community routes or service. Preserve the architecture and the version-2 local recovery archive.

Working behavior to preserve: launch splash, three-screen onboarding, searchable categorized catalog, custom habits, seven-step setup, multiple trackers, editing/reset, live elapsed-time clock, daily journal and pledge records, logged streaks, alcohol counts and memory gaps, monthly/yearly calendars, milestone calculations, share previews, PIN/biometric gates, reminders, local profile, backup restore validation, and serialized persistence before UI publication. The 25 domain tests pass before the full-app upgrade.

## Confirmed gaps

- Hardcoded light styling throughout screens; saved theme preferences do not control a coherent dark palette.
- System fonts rather than bundled Inter/DM Serif Display; many visible labels use 6–11px type, with inconsistent spacing and lavender surfaces.
- Premium context grants every entitlement and its paywall handlers do nothing. No plan selection, persisted mock subscription, management, restoration, or success flow exists.
- Certificate sharing copies text instead of sharing the displayed image. Streak and year exports include browser canvas/DOM paths that conflict with the requested native architecture.
- Settings lacks theme, pledge reminder, widget, and subscription controls. Profile is local; there is no backend account or cloud authentication to claim as functional.
- Milestones hold a separate initial tracker selection, so the screen can diverge from the active tracker.
- Daily pledge lacks a distinct animated success state and local save-error handling.
- Onboarding completion persists, but a returning user with no tracker needs a setup guard instead of an empty dashboard.
- Native home-screen widget publishing and real store billing need native integration and owner configuration. Development preview/configuration must identify those limits explicitly.

## Ordered implementation phases

1. Audit complete: this inventory and the existing persistence/tests establish the baseline.
2. Establish semantic light/dark tokens, bundled fonts, consistent readable type, spacing, and reusable controls.
3. Connect guarded first-launch/setup/returning navigation without resetting user archives.
4. Apply the system to every existing screen and modal; preserve the Calendar reference structure and four-tab navigation.
5. Complete entitlements and mock Premium flows, native image sharing, settings controls, pledge success, and habit-appropriate check-ins.
6. Run strict TypeScript, domain tests, Expo dependency/Doctor checks, native exports, startup, and available UI verification. Record device-only and account-dependent acceptance honestly.

The supplied latest brief supersedes the earlier tiny reference typography. Existing content and interactions remain; readable type and the specified palette now govern all screens.

## Completed foundations

Phase 2: bundled Inter regular/medium/semibold and DM Serif Display; semantic light/dark palettes; theme-aware native components; readable text hierarchy; shared 54px actions and 54px inputs. Strict TypeScript passes after the design-system migration.

Phase 3: cold-launch routing respects persistent welcome completion and resumes tracker setup when no tracker exists. Protected stack screens reject entry before welcome completion. The welcome tour remains explicitly available from Settings. No recovery archive is cleared or reseeded.

Phase 4: the shared system now covers the existing launch, welcome, selection, setup, dashboard, tracker detail/edit, Calendar/check-in/rules/year/share, milestones/certificates, settings, profile, reminders, lock, help, and legal surfaces. Progress uses white cards and a 64px counter; setup has a separate eighth review step; Calendar retains the reference hierarchy; achievements follow the active tracker. Long dialogs scroll and native inputs share the same bundled font. Native sharing and Premium controls are completed in phase 5.

## Completed feature work and validation

Phase 5: centralized persisted mock entitlements, monthly/yearly selection, comparison, feature previews, Premium success/management/cancellation/local restore, Year/All and insight gates, extra share templates, and widget-preview preferences are connected. The app explicitly identifies mock billing, local profiles, and the non-installable widget preview. Existing trackers remain available after expiry. Native streak/certificate/year capture replaces browser DOM/canvas paths. Reflection and pledge reminders use independent identifiers/times. Daily pledge has saved success/error states. Non-alcohol count/minute units persist after renaming; absent quantities remain unknown. Light/Dark preferences control the migrated surfaces.

Phase 6: strict TypeScript, 32 domain tests, SDK compatibility, native production exports, actual Expo Go QR startup, and server status passed. Compatible patches move Expo to 57.0.28. Android/iOS configuration removes direct web runtime dependencies and packages only five selected app font faces. Doctor passed 20/21; Git-ignore verification remains unresolved because Git is unavailable despite the existing `.expo/` rule.

Final source review tightened long-label button wrapping/concurrent presses and made PIN unlock scroll above the keyboard. All screens compile; fresh visual/native acceptance is pending because the UI runtime cannot initialize and no phone execution was captured. See the [screen-by-screen checklist](VALIDATION.md).

Asset/launch cleanup: Android/iOS run commands explicitly select Expo Go; the onboarding preview utility serializes native SVG without React DOM, loads the bundled font files, and renders readable illustration labels. The regenerated vector sheet was inspected independently of app UI acceptance.

The recovery archive and architecture remain intact. Signed builds, live billing, cloud accounts, and installed widgets are not claimed. Integration boundaries and upstream dependency advisories are recorded for real-world testing and release planning.

## Android Expo Go startup correction

The supplied device log revealed a runtime failure not caught by the earlier export: importing the notification package entry point also starts unsupported remote-push registration. Route default exports already existed; their evaluation failure caused the Router warnings and ErrorBoundary cascade. Local notifications now use a lazy SDK adapter without remote registration. Three installed-SDK compatibility regressions bring the passing suite to 35; strict TypeScript and both native exports pass. Metro was restarted in Expo Go mode with a clean cache. Full reload and delivered-reminder confirmation remain device acceptance steps.
