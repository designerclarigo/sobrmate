# Supabase email/password authentication

The native app uses **email address and password only**. Production uses verified Supabase Auth. Development can use a clearly labeled, isolated local demo account without credentials; see [Demo Mode and corrected app flow](DEMO-FLOW.md). There is no sign-up screen or social login. Sign In remains enabled: missing production configuration produces a helpful error instead of a disabled control.

## Project configuration

1. For real Supabase authentication, copy `.env.example` to local `.env`. Supply `EXPO_PUBLIC_SUPABASE_URL` and the project's public `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`). The app rejects secret/service-role keys and legacy JWT keys. Keep the actual `.env` out of version control.
2. Enable Email/Password in Supabase Authentication settings and turn **Confirm email ON**. The app checks the server-returned user ID, email and `email_confirmed_at` before private routes open. Backend auto-confirmation cannot substitute for real email ownership verification; configure confirmation correctly.
3. Do not add an email-domain allowlist. Gmail, Outlook, Hotmail, Yahoo, iCloud, custom business domains and other legitimate addresses use the same password flow. The app validates address format only; Supabase verifies credentials. An address's provider does not create a separate sign-in method.
4. Use existing verified password accounts or provision accounts through a trusted administrator/backend. No `signUp`, administrative API or account-creation screen is exposed by this app. An invitation must include a working trusted account/password provisioning flow; this app implements password recovery, not an invitation-acceptance UI.
5. Configure production SMTP, sender identity and reset email templates. Administrative keys and SMTP credentials must stay on the backend/dashboard. If you enforce CAPTCHA, configure a verified native challenge integration before enabling that requirement; the app does not fabricate challenge tokens.
6. For password reset, allow `komorebi://auth/callback` including query parameters in Authentication → URL Configuration. A development pattern `komorebi://auth/callback**` covers the random app `flow_id`, recovery intent and optional SDK `sb_flow_id`. Restrict the wildcard to this callback prefix. The app separately rejects every other scheme, host, port or path. Validate the actual generated return link against the allowlist before release.
7. Restart Metro after editing `.env`, and supply the same public values to installed-build environments. No live credentials were available for implementation checks.

The default public mode is `auto`: unconfigured development uses Demo Mode; configured development uses Supabase. Explicit `demo`/`supabase` flags only choose a development mode. Release runtimes always select Supabase and never restore demo sessions. Demo is not a verified backend identity. Workspace keys, session preferences, app lock and reminders are separated; existing Supabase sessions/data remain intact.

First launch is Splash → Onboarding → Login → Setup → Dashboard. Progress is saved before step navigation and setup creation commits its completion flag with the tracker. Returning authenticated users reach Dashboard; signed-out users reach Login without replaying a completed introduction.

## Remember Me

The checkbox is functional and checked by default for compatibility with existing encrypted sessions.

- **Checked:** Supabase access/refresh session data remains in Expo SecureStore across app launches. Auto-refresh remains subject to the backend's session policy; this option does not grant indefinite access or bypass verification.
- **Unchecked:** current session data stays only in JavaScript memory, including refresh writes. It survives ordinary background/foreground transitions while the app remains alive and ends when the app process/runtime restarts. The preference itself is stored securely. Native password-manager/autofill choices are separate.
- Existing persisted token keys are retained for compatibility. Opting out removes old stored tokens; the opt-out is committed first so interrupted deletion cannot restore a prior session on restart.
- PKCE reset verifiers, reset nonces and device-workspace ownership remain encrypted independently of this setting. No password is stored by app code. No token enters AsyncStorage, exported backups, logs or user profile fields.

## Password reset and native execution

In Demo Mode, Forgot Password shows the documented fixed test credentials and sends no email. The remaining reset behavior in this section applies to Supabase mode.

Configured email/password login and session storage use Expo Go-compatible libraries. Reset-email request/return requires an installed development/production build with the existing `komorebi` scheme. Expo Go's reset request stays disabled with an explanation, because it cannot receive this app's custom return link.

On Windows, configure the Android SDK/JDK and a device/emulator, then use `npx.cmd expo run:android`; alternatively configure the existing EAS development profile. Start Metro with `npm.cmd run start:dev-client`. Native compilation/signing and backend setup are separate from JavaScript/Hermes export validation.

Request reset from the installed app, then open the email on the same device within one hour. Wrong-device, expired, malformed, duplicate-code and implicit-token links are rejected. PKCE protects the verifier; duplicate callbacks exchange once. A recovery session only grants access to the password-change route. After changing the password, the app signs out and asks for the new password. A reset email request shows a non-enumerating confirmation; it does not claim email delivery or a completed password change.

Remember Me remains respected during reset. A process-only recovery session cannot survive a runtime restart after code exchange; request a fresh link if necessary. An encrypted remembered recovery session retains the existing recovery-only navigation guard.

## Preserved security and records

In Supabase mode, `getUser(access_token)` verifies restored and new sessions with Supabase before private routes open. Cold startup needs a successful server check; offline authentication is not provided. Transport requests time out after 20 seconds, subject to SDK retry policy. Session refresh runs while active; revision guards stop stale auth events from reopening signed-out routes.

The version-2 tracker archive, check-ins, pledges, private notes and questionnaire answers stay local, without cloud sync. The first verified account owns the Supabase-mode workspace; another user ID is blocked. Demo records are isolated and do not claim this ownership. Sign-out keeps records and the ownership binding, removes local session credentials and cancels app-owned reminders. Signing in as the owner reschedules enabled reminders. Erase device data keeps its explicit confirmation and does not delete the Supabase account. Local profile fields do not change a login email.

The unused provider entry point, logos, browser import, direct browser dependency and config plugin have been removed. No remote provider configuration, existing account, existing session or tracker was deleted. Existing verified sessions retain their storage-key format. The strict callback route remains for password reset and previously requested valid links. Native PIN/biometric app lock and protected navigation remain in place.

## Acceptance

Automated checks cover release-mode demo blocking, isolated records/reminders, the first-launch/return flow, saved drafts, unrestricted real-login email domains, invalid/unconfirmed credentials, matching server identity, PKCE recovery, secure chunking, both persistence choices, interrupted opt-out, refresh writes, restart and logout. SDK transport/storage responses in these tests are explicit fixtures, not a live backend.

Before release, test real verified and unverified accounts, wrong credentials, reset email delivery, password update, both Remember Me options across force-stop/relaunch, revoked sessions, offline errors, blocked second-account access and native deep-link guards on Android/iOS. Validate 320px/390px/tablet/landscape layouts, large text, keyboard avoidance, autofill, password toggle, screen-reader order, reduced motion and legal sheets. These device/live tests remain pending configuration and a connected native session.

Primary references: [Supabase email/password login](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [Supabase sessions](https://supabase.com/docs/guides/auth/sessions), [React Native setup](https://supabase.com/docs/guides/auth/quickstarts/react-native), [password reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), and [native deep links](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
