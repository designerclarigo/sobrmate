# Test the native app without Supabase

## Start immediately

From this workspace in VS Code:

```powershell
npm.cmd start
```

Open the terminal QR in an SDK-compatible Expo Go client. The existing `npm.cmd run start:local` command uses port 8084 and offline CLI mode. This is a genuine native Expo app; a localhost browser page is not the app UI.

No `.env` is required for local testing. In a development runtime with no valid Supabase configuration, **auto** mode selects the local demo account:

| Test credential | Value |
| --- | --- |
| Email | `demo@komorebi.app` |
| Password | `KomorebiDemo2026!` |

These are public dummy credentials for a separate local test workspace, not a real Supabase account. Enter them manually on the premium email/password screen. Other passwords/accounts are rejected in Demo Mode. Forgot Password explains the fixed credentials and does not pretend to send email. Login, the dashboard header and account settings identify the demo workspace.

## Mode selection and production boundary

`EXPO_PUBLIC_AUTH_MODE` supports `auto`, `demo`, and `supabase`:

- **auto** (default): development uses Supabase when valid public configuration exists, otherwise local Demo Mode.
- **demo**: explicitly selects Demo Mode in a development runtime, even if Supabase public settings are present.
- **supabase**: development uses real email/password authentication; missing settings produce a clear sign-in error.
- **Release runtimes always use Supabase**, regardless of public mode flags. They never restore or invoke the offline demo service. Preview/production APKs are release runtimes. Use Expo Go or a development client connected to Metro for credential-free testing.

To switch modes, edit the public flag in local `.env` using `.env.example`, restart Metro and fully reload the app. There is no in-app account-mode toggle. Production must supply the public URL/key, enable Email/Password and **Confirm email**, and provision legitimate accounts as described in [AUTHENTICATION.md](AUTHENTICATION.md). The client still checks server-returned confirmed email and matching user ID before access. No social login or sign-up screen is exposed.

Demo identity is explicitly marked `source: demo`; it is not fabricated as a Supabase user or JWT. Demo session markers and real Supabase credentials have separate encrypted storage keys. Remember Me works independently for both modes. Checked remembers a session across runtime restarts; unchecked keeps session state in memory. Passwords are not saved in session records.

## First launch and return

**Splash → Onboarding → Login → Habit selection / step-by-step setup → Dashboard**

1. Startup waits for both saved progress and authentication hydration, preventing an incorrect first-screen flash.
2. Welcome navigation saves the current introduction page before moving. Completing or skipping the introduction persists completion, then opens Login for a signed-out user.
3. After login, a new user must create the first tracker. Dashboard, Calendar, Milestones and Settings routes remain guarded until setup is complete.
4. Setup saves habit selection, all nine steps, text/estimates, motivation/trigger choices and questionnaire position. Text edits are coalesced for 350ms; background/close flushes them. Next/Back persist the target step before the transition. Save failures are visible and retryable.
5. **Save & sign out** leaves an unfinished first setup and returns to Login. Next sign-in resumes the draft without replaying completed onboarding. Additional tracker setup uses Save & close.
6. Create Tracker commits the tracker, setup-completed flag and matching draft removal together. A stable draft-derived tracker ID makes creation idempotent, and late autosaves cannot resurrect a completed draft.
7. Authenticated returning users who completed setup go directly to Dashboard. Logged-out users go to Login. Deleting all trackers later retains setup completion and the existing empty dashboard/Create Tracker experience.

Explicit Settings tour replay is still available. Existing archives with trackers count as completed setup. Older version-2 archives remain readable; new optional progress fields survive local persistence and backup/restore. Backups contain private setup answers and should be stored carefully; they never include authentication credentials. An unreadable archive takes a recovery path through Login so an authenticated owner can retry or restore a backup without overwriting the saved copy. Healthy fresh launches always use the onboarding-first sequence.

## Data separation

Production uses the original `@komorebi:state:v2` and existing legacy keys. Demo uses separately prefixed keys and does not read, migrate, overwrite or erase the real workspace. Mock membership, Settings drafts, native app-lock PIN and reminder/channel identifiers are also scoped. Switching to Supabase does not automatically merge demo records. Export/import remains an explicit user action with existing restore confirmation.

No existing records were reset, seeded or deleted during implementation. Test fixtures use in-memory stores. See [VALIDATION.md](VALIDATION.md) for executed checks and device-acceptance limits.
