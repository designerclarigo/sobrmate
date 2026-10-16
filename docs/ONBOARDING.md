# Splash, welcome, and tracker setup

Reference-inspired native vectors retain the sprout, arched illustrations, three welcome messages, italic accents, dots, and persistent action. Plus Jakarta Sans, native editorial serif and 20px gutters connect these screens to the rest of Komorebi.

1. Cold launch shows the two-second tappable React splash while local progress and the active authentication mode hydrate. First-time users see Onboarding before Login. Demo is available for development without Supabase; production still requires verified Supabase email/password. See [Demo and production flow](DEMO-FLOW.md).
2. An incomplete welcome shows the three introduction screens before first login. Next/Back persist the current page; Skip/Get Started persist completion before navigating, with save-error retry and duplicate-tap protection.
3. Searchable habit/category selection or custom creation leads to nine setup steps: identity/metric, start date, motivation, improvements, mindset, goal, optional recovery questionnaire, estimates, and separate review/Create Tracker.
4. Each step has progress, Back/Continue, input validation, keyboard handling, and a sticky action. Creation persists before returning to Progress.
5. Authenticated returning users who completed setup reach Dashboard, including its empty state after all trackers are deleted. Signed-out users see Login without repeating onboarding. An unfinished setup resumes its saved draft after login. Protected routes prevent authentication and welcome bypass.
6. Settings explicitly reopens the welcome tour without clearing trackers/journals. Completion returns to an existing journey.

Welcome copy/art scroll on short screens, keeping the action reachable. Scaling and reduced motion are respected; decorative art is hidden from accessibility, while navigation/progress have labels.

`src/onboarding/OnboardingIllustration.tsx` is editable native vector source. The render script produces artwork previews and splash assets, not device screenshots. Operating-system launch asset changes require a new native build; Expo Go loads the React splash/tour.

Draft answers, estimates, selected habit and exact wizard/questionnaire position persist locally. Text edits coalesce for 350ms and flush on background/close; Next/Back await persistence. Creating a tracker commits setup completion and draft removal together, preventing duplicate creation or a late autosave from reviving the draft.

The questionnaire contains four interactive question panels with single/multiple selections, answered progress, optional skipping and reduced-motion transitions. Responses persist with the tracker, can be edited, survive backups and personalize Home encouragement. See [questionnaire and Premium changes](AUTH-ONBOARDING-PREMIUM.md).

Navigation tests, type checking, and native exports passed. Cold/returning/revisit launch, app-lock resume, all nine steps, keyboards, save failure, landscape, and large text remain on the [device checklist](VALIDATION.md).

