# Authentication, recovery preferences and Premium plans

October 16, 2026. Changes extend the existing native Expo app and version-2 local records. No database was reset or reseeded.

## Connected flows

Splash → verified session or Sign in → existing welcome/setup/dashboard guard. Signed-out deep links cannot enter trackers, check-ins, milestones or Settings. Recovery callbacks enter the dedicated password-reset flow. Authentication configuration, backend provisioning, native-build requirements and live acceptance are documented in [AUTHENTICATION.md](AUTHENTICATION.md).

Tracker setup now has **nine** steps: name, start date, personal reason, improvements, mindset, goal, recovery questionnaire, daily savings/time estimates, final summary. The new optional questionnaire has four interactive question panels covering motivation, difficult daily situations, triggers and the user's definition of progress. One/multiple selection, question navigation, answered progress, reduced motion and disabled submission states are supported. Answers stay in the wizard while navigating Back/Continue, and persist with the tracker only after Create Tracker succeeds.

Stored selections are validated against the available choices and survive local reload and backup/restore. Old trackers need no migration and retain their original fields. Tracker editing can change or clear the answers. Home's intentions card adds a deterministic suggestion based on actual answers; it does not invent health outcomes or send answers to an AI service. Exported backups include these private answers; share-card templates do not automatically include them.

## Transparent Premium selection

The global paywall and Settings plans now share one responsive selection/comparison component and the existing centralized entitlement service. Yearly appears first with Best value; Monthly remains equally selectable. Selected cards expose radio state. Existing activation, locked-feature previews, success, management, cancellation, plan changes, persisted expiry and restore continue through the same service.

| Development example | Displayed price | Terms |
| --- | --- | --- |
| Monthly | $4.99 USD / month | Illustrative mock price |
| Yearly | $29.99 USD / year | About $2.50/month, full yearly amount shown |
| Annual comparison | 12 × $4.99 = $59.88 | Save $29.89 per year, 49.9% |

All calculations derive from integer plan cents, with currency rounding only for display. No free trial is offered or implied. Every purchase surface identifies **development mock mode**, no charges, no automatic renewal and no store contact. Restore mock purchases reads saved membership on this device, not Apple/Google receipts. No real payment SDK or store credentials are configured.

Free tracking, three new trackers, Week/Month, milestones and security remain available. Existing trackers remain accessible after mock expiry. Premium gates retain Year/All, advanced statistics, additional Home sharing styles, new trackers beyond the free allowance and widget preferences. Widgets are still in-app previews; a native widget extension is not included. All existing Milestones share styles remain available as before.

Before real billing, replace mock pricing and fulfillment with verified localized store products, real purchase/restore calls and server-verified subscription entitlements (including renewal, cancellation, expiry and revocation). Supply accurate store terms, account/subscription management links, privacy/terms and any genuine introductory-offer eligibility. Do not turn illustrative cents into a charge or silently treat a mock entitlement as a real purchase.

## Verification record

See the current results in [VALIDATION.md](VALIDATION.md). The later [email-only Login refinement](LOGIN.md) supersedes the initial provider sign-in UI. Automated transport fixtures run the installed Supabase SDK against explicit mock HTTP responses and an injected storage adapter; they do not represent live Supabase login or reset-email delivery. Physical keyboard, font scaling, screen-reader navigation, reset-link return and device encryption still require installed-device tests. Real store billing remains intentionally unconfigured.
