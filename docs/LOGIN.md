# Email-only login refinement — October 16, 2026

The existing Expo application is retained. The later [Demo Mode / corrected app flow](DEMO-FLOW.md) extends this screen with an always-enabled Sign In button and development-only local authentication; the production verified-email path remains intact. Login now uses email/password only, with no social buttons, logos, separator, provider descriptions or sign-up route. The unused provider method, direct Expo WebBrowser dependency and its config plugin were removed. Reset PKCE, encrypted storage, the app scheme and strict callback remain necessary. No backend accounts, remote provider settings, tracker data, existing valid sessions or ownership links were deleted.

## Native interface

- Ivory canvas, white input surfaces, restrained plum accent, a compact existing sprout mark, generous space and one prominent Sign In action.
- Loaded Plus Jakarta Sans text; regular native editorial heading (Georgia on iOS, Android serif). The hierarchy uses size and spacing instead of heavy weights.
- 438px maximum content width with 24px gutters, flexible input text, no fixed-height text containers and wrapping Remember Me / Forgot Password controls. Short screens and large text reduce decorative space and retain vertical scrolling.
- Native safe areas, keyboard avoidance, Email → Password → Sign In return-key flow, current-password autofill and a non-remounting password visibility toggle. Android's native input underline is disabled inside the outlined fields.
- 44px minimum control targets, accessible input names/hints, checkbox state, live error notices, focus/error borders and font scaling. Entrance uses opacity and a 10px translation on the native animation driver; reduced motion skips it. Existing button press feedback and haptics are reused.
- Field-level validation plus friendly authentication/connection/rate-limit errors. Backend errors do not identify which credential was wrong or echo unexpected server details. Verification errors explain checking the inbox.

## Authentication behavior

Email format validation is domain-independent: ordinary Gmail, Outlook, Hotmail, Yahoo, other providers and custom domains all use the same Supabase password request. Supabase credentials and the server-returned confirmed email are required before private routes open. **Confirm email must be enabled in Supabase**; the client cannot establish real email ownership if the backend auto-confirms every address.

Remember Me is checked by default to preserve existing encrypted sessions. Checked sessions persist through native SecureStore. Unchecked session/refresh data remains in memory and cannot restore after a process/runtime restart. Ordinary backgrounding does not itself end the session. The preference and password-reset verifiers remain securely stored. Opt-out commits before token deletion and fails closed if deletion is interrupted; legacy session keys, local ownership and recovery data are preserved.

Forgot Password uses the existing request, same-device PKCE callback, recovery-only guard and password update/sign-out flow. Expo Go supports configured password login; reset return links need an installed app with the custom scheme. See [backend and native setup](AUTHENTICATION.md).

## Evidence and limits

The complete suite passes **96 tests**, including common/custom email domains, verified-user identity requirements, readable errors, both Remember Me modes, interrupted opt-out, refresh/storage concurrency, legacy storage compatibility, SDK email session restart/logout, explicit local demo boundaries, saved setup and the existing reset/check-in/calendar/milestone regressions. These include explicit local SDK HTTP/storage fixtures, not live Supabase acceptance. The app's development demo is deliberately labeled and disabled in release runtimes.

Current TypeScript, dependency compatibility, native bundle exports and source-scope results are recorded in [VALIDATION.md](VALIDATION.md). No project URL/key is configured in this workspace. Device screenshots, physical keyboard/autofill/touch tests, screen-reader output, measured frame timing and real login/reset delivery remain pending a configured backend and connected native app. Compilation does not establish pixel-level device acceptance.
