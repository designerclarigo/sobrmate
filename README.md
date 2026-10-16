# Komorebi Recovery

The existing native React Native + TypeScript app, refined on Expo SDK **57.0.30**, React Native **0.86.3**, React **19.2.3**, and Expo Router. Android and iOS are the configured platforms. Compatible SDK 57 patch versions were checked October 16, 2026.

The shared design system uses ivory/white surfaces, restrained purple accents, loaded Plus Jakarta Sans faces and selective native editorial serif headings. The 390px layout uses 20px gutters, flexible controls, safe areas, keyboard avoidance, and a centered content column on larger devices. Light/Dark themes share semantic tokens. See [typography](docs/TYPOGRAPHY.md) and the [upgrade audit](docs/UPGRADE-AUDIT.md).

## Run in VS Code

```sh
npm ci
npm start
```

On Windows, use `npm.cmd` and `npx.cmd` if PowerShell blocks the scripts. Scan the terminal QR with an SDK 57 compatible Expo Go client. `npm run android` opens a connected Android device/emulator; `npm run ios` needs macOS. `npm run start:dev-client` targets an installed development build.

For the local session requested on port **8084**, run `npm run start:local`. It uses Expo's offline mode to avoid an online CLI account lookup that failed during the earlier session. Offline mode still serves Metro over your local network; it does not provide a browser version of the native app.

Open the [Android Expo launcher](http://127.0.0.1:8084/_expo/loading?platform=android). The validated session uses **exp://192.168.0.143:8084**. [Open its Expo Go QR](docs/expo-go-qr.png). The phone must share this local network; the URL changes with the server/network. Regenerate the QR from the actual terminal URL using `node scripts/create-qr.cjs exp://YOUR_LAN_ADDRESS:PORT`. The HTTP server root is Expo's manifest endpoint: it returns native app configuration rather than a rendered screen. Use the launcher link in a desktop browser, then open the app in Expo Go.

## Test without Supabase

Development defaults to a separate local demo workspace when Supabase is not configured. Run `npm.cmd start`, complete onboarding, and sign in with **`demo@komorebi.app` / `KomorebiDemo2026!`**. No `.env` is required. [Demo modes, saved setup and production boundary](docs/DEMO-FLOW.md).

Sign In stays enabled and validates when pressed. Repeated presses during loading cannot start duplicate requests. Release builds always require real Supabase authentication, even if the public mode flag says `demo`.

## Connected flows

- Splash → Onboarding → Login → step-by-step tracker setup → Dashboard. No sign-up screen or fake login. Verified email/password and password reset require the Supabase setup in [AUTHENTICATION.md](docs/AUTHENTICATION.md). Development without configuration uses the labeled demo account. Production missing configuration reports a clear error without disabling Sign In.
- Three welcome screens, searchable/category-based habit selection, custom habits, nine setup steps including an optional recovery questionnaire and separate summary, Create Tracker, Progress. Welcome completion persists; authenticated returning users resume their dashboard or tracker creation.
- Four tabs: Progress, Calendar, Milestones, Settings. Existing multiple trackers, selection, editing, resets, notes, goals, mindset, and personal motivation remain connected.
- Progress: live counter/time breakdown/day view, share templates, daily pledge/success, estimated money/time savings, current/longest streak, weekly check-ins, intentions, tracker creation.
- Calendar: reference-style month grid, Week/Month/Year/All statistics, rules/legend, check-in sheet, twelve-month overview, native year sharing, recorded-data insights. Missing days remain unrecorded. Alcohol counts/memory gaps and habit-specific count/minute/status metrics persist.
- Milestones: active-tracker achievements, All/Earned/Upcoming filters, next progress, certificates, native image sharing, reduced-motion-aware celebration.
- Settings: Light/Dark, local profile, independent reflection/pledge reminders, haptics, PIN/biometric lock, widget preview, mock membership, backup/restore, help/privacy/terms, explicit tour replay.

Details: [Progress](docs/HOME.md), [Calendar](docs/CALENDAR.md), [launch/setup](docs/ONBOARDING.md).

For real authentication, copy `.env.example` to local `.env`, choose `supabase` mode and supply only the public Supabase URL and publishable key; restart Expo. No backend credentials were supplied for live verification. Email sign-in supports Expo Go when configured. Remember Me saves encrypted session credentials; opting out keeps the session in memory until restart. Password-reset return links require an installed development/production app with the `komorebi` scheme. Trackers stay local; sign-in does not add cloud sync. The first verified account owns the Supabase-mode workspace. Demo has separate records, and sign-out retains the active workspace's records. Onboarding completion, setup step and draft answers persist locally; setup completion sends authenticated returning users to Dashboard.

## Premium development mode

Premium is explicitly **mock billing**. No charges or store connection; prices are illustrative. Monthly is $4.99 USD and Yearly is $29.99 USD: save $29.89 (49.9%) against twelve monthly payments, about $2.50/month billed yearly. No trial is offered. Settings and the shared paywall offer selection, feature comparison, activation, success, management, plan change/cancellation, and device-only mock restoration. Mock plans never renew automatically; cancellation retains access until saved expiry. See [feature and plan details](docs/AUTH-ONBOARDING-PREMIUM.md).

Free access includes three new trackers, Week/Month, check-ins, milestones, basic sharing, and app security. Premium enables unlimited new trackers, Year/All, advanced statistics, additional templates, and widget-preview preferences. Existing trackers remain accessible after expiry. The legacy settings premium flag does not grant entitlement.

Widgets are an **in-app design/configuration preview**, not installable. Real billing and native widget extensions remain unconfigured. Supabase account integration is implemented and needs owner project/provider configuration. Profile fields remain local and do not change the verified login email. Tracker cloud sync is not configured.

## Persistence and native APIs

The existing version-2 AsyncStorage archive is retained. Writes are serialized and saved before UI success; older records/category aliases remain readable. No user data was erased or reseeded. Mock membership uses a separate persisted key.

PINs use salted hashes in SecureStore and are excluded from backups. Restoration preserves the device lock. Background locking, local notifications, files, clipboard, haptics, image capture, and sharing use Expo-compatible libraries. Save Image writes app files; Share Image opens the system chooser, without claiming a gallery save or completed delivery.

Core tracking, local reminders, files/sharing, and the React splash use Expo Go-compatible libraries, subject to permissions/device support. [iOS Face ID requires a development build](https://docs.expo.dev/versions/latest/sdk/local-authentication/). Operating-system splash/launcher changes need a rebuilt native app. [Local notifications remain available in Expo Go; Android remote push requires a development build](https://docs.expo.dev/versions/latest/sdk/notifications/). Remote push is not configured here.

## Validation

```sh
npx tsc --noEmit
npm test
npx expo install --check --npm
npx expo-doctor
npx expo export --platform all --output-dir build/native
npx expo start --go
```

Strict TypeScript and **96 tests** passed October 16, including development/release auth boundaries, isolated demo data, saved launch/setup flow, auth/PKCE transport fixtures, secure storage, questionnaire backups, pricing, tracking and existing UI logic regressions. Earlier Expo dependency compatibility passed. Doctor passed 20/21; Git is unavailable to verify the already-present `.expo/` ignore rule. Native export and server evidence, outstanding build-tool advisories, and real-device/live-auth acceptance limits are recorded in [validation](docs/VALIDATION.md).

Local reminders use a lazy local-only notification adapter. This avoids the SDK entry point's remote-push registration crash in Android Expo Go. After updating from the failing bundle, use `npm start -- --clear` and fully reload Expo Go. See the [startup fix](docs/VALIDATION.md#android-expo-go-startup-fix).

The six October 14 phone screenshots were inspected and their source corrections are recorded in the [device flow audit](docs/DEVICE-FLOW-AUDIT.md). Post-change visual acceptance, real touch interactions, and measured device performance remain pending; device access was unavailable/declined during this run. Earlier captures do not prove the corrected build. See [validation and the screen checklist](docs/VALIDATION.md).

An export is not a signed APK/IPA. Signing, real billing, and store publication require owner configuration. The last online installation reported upstream build-tool advisories; review those before release and avoid a forced incompatible Expo downgrade.

