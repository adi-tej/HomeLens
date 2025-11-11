# Home Lens

Overview
--------
Home Lens is a TypeScript React Native app built with Expo. It helps you model property purchases, compare scenarios, and understand long‑term financial impact. UI is built with React Native Paper; navigation via React Navigation. Keyboard handling uses react-native-keyboard-controller.

What’s in this repo
- App source (TypeScript)
- Assets (icons, splash)
- Expo/EAS configs (app.json, eas.json)
- Utility docs (analytics, EAS build guide)

Quick start (Windows, cmd.exe)
------------------------------
Prerequisites
- Node.js (>= 18)
- pnpm (recommended), npm/yarn also work
- Expo CLI (via npx expo)
- Optional: Android Studio SDK (or use a physical device)

Install deps
```bat
pnpm install
```

Start dev server
```bat
pnpm run start
```

Run on Android
```bat
pnpm run android
```

Run on iOS (macOS only)
```bat
pnpm run ios
```

Type check
```bat
pnpm run typecheck
```

Scripts (from package.json)
- start: expo start
- android: expo run:android
- ios: expo run:ios
- typecheck: tsc --noEmit
- eas:update:preview / eas:update:prod (if using EAS Updates)

Feature flags and environments
------------------------------
We use a single runtime flag to control developer features and console output.

- app.json → expo.extra.dev (boolean)
- Code helper: `ENV.DEV` from `src/state/env.ts`

What `ENV.DEV` toggles
- Shows DeveloperSection (Reset Onboarding) on Help screen
- Enables verbose console logs for analytics/crash tracking
- Production builds (ENV.DEV = false) silence analytics console logs while still emitting Firebase events (when native modules are available)

Set the flag
```jsonc
// app.json
{
  "expo": {
    // ...
    "extra": {
      "dev": false // set true for dev builds
    }
  }
}
```

Analytics behavior
------------------
File: `src/services/analytics.ts`
- Uses @react-native-firebase/* when native modules are available; otherwise falls back gracefully.
- Console logs are wrapped with `if (ENV.DEV)` – silent in production.
- Events include screen views, feature usage, menu navigation, and device info.

Notes
- Managed workflow preview builds may not include RNFB native modules. Events won’t reach Firebase unless you prebuild (bare) or use a supported config plugin.
- Validation guide: see `FIREBASE_VERIFICATION.md` for DebugView steps.

Onboarding keyboard (Android)
----------------------------
- Onboarding renders inside `KeyboardProvider` and uses `ScreenContainer` (KeyboardAwareScrollView) for proper keyboard avoidance.
- app.json uses `android.softwareKeyboardLayoutMode = "resize"` to lift content.

Theming and SVG assets
----------------------
- Global theming: userInterfaceStyle = automatic (adapts to system theme)
- Header/logo: `src/components/Logo.tsx` uses theme.colors.primary
- Tables: table corner uses the same Logo SVG for a consistent, themed look

EAS builds (preview & production)
---------------------------------
Preview (internal testing)
```bat
eas build --profile preview --platform all
```
Production
```bat
eas build --profile production --platform all
```
Optional auto-submit
```bat
eas build --profile production --platform ios --auto-submit
eas build --profile production --platform android --auto-submit
```

Android/iOS configuration
-------------------------
- app.json
  - iOS/Android googleServicesFile paths set
  - Android: softwareKeyboardLayoutMode = resize
  - Adaptive icon/splash configured

Troubleshooting
---------------
- Metro cache issues:
```bat
npx expo start -c
```
- Android SDK not found: ensure platform-tools on PATH
- RNFB module errors in managed preview: analytics falls back; use prebuild for full native support

Pre-release checklist
---------------------
- [ ] app.json: `extra.dev` is false for production
- [ ] Build succeeds on both platforms via EAS
- [ ] Onboarding email input scrolls above keyboard on Android
- [ ] Theme switch updates Scenario cards (Android / iOS)
- [ ] No unexpected console noise in production (analytics logs gated)
- [ ] Icons/splash look correct in light/dark
- [ ] HubSpot portalId & formGuid configured (or intentionally disabled)
- [ ] Test email appears in HubSpot Contacts (if enabled)

Contributing
------------
- PRs welcome. Run `pnpm run typecheck` locally before opening.
- Formatting via Prettier (see package.json).

License
-------
0BSD (see package.json)

HubSpot email capture (Onboarding)
----------------------------------
The onboarding screen collects the user’s email and (optionally) submits it to HubSpot using the Forms API.

Implementation
- Submission function: `submitUserEmail()` in `src/services/backend.ts`
- Primary call path: `Onboarding.tsx` → `handleSubmit` → `submitUserEmail`
- Graceful failure: If the network or HubSpot responds with an error, onboarding still completes (user is not blocked).

Configuration
1. Create (or locate) a HubSpot form with an Email field.
2. Copy your Portal ID and Form GUID.
3. Edit `src/services/backend.ts` and set:
   ```ts
   const HUBSPOT_CONFIG = {
     portalId: "<YOUR_PORTAL_ID>",
     formGuid: "<YOUR_FORM_GUID>",
   };
   ```
4. (Optional) Add custom fields in HubSpot for: `platform`, `device_model`, `app_version`, `signup_date`.
5. Ensure the form has consent enabled if you require GDPR compliance (repository already sends a consent object).

Payload example sent to HubSpot
```jsonc
{
  "fields": [
    { "objectTypeId": "0-1", "name": "email", "value": "user@example.com" },
    { "objectTypeId": "0-1", "name": "platform", "value": "android" },
    { "objectTypeId": "0-1", "name": "app_source", "value": "mobile_app" },
    { "objectTypeId": "0-1", "name": "signup_date", "value": "2025-11-12T09:15:11.123Z" }
  ],
  "context": { "pageUri": "app://homelens/onboarding", "pageName": "HomeLens Onboarding" },
  "legalConsentOptions": { "consent": { "consentToProcess": true, "text": "I agree to allow HomeLens to store and process my personal data." }}
}
```

Testing the integration
1. Set real `portalId` and `formGuid` in `backend.ts`.
2. Delete the app (or reset onboarding via Help → DeveloperSection if `ENV.DEV` is true).
3. Enter a test email and submit.
4. Check HubSpot: Contacts → search for the email; confirm form submission in activity timeline.
5. For failures, inspect device logs for `[Backend] Failed to submit email to HubSpot:`.

Safety / Failure modes
- HubSpot misconfigured (placeholder IDs): A warning is logged (in DEV) and onboarding continues.
- Network failure: Error logged; user still proceeds.
- Duplicate email: HubSpot updates existing contact; onboarding unaffected.

Privacy & Consent
- A consent block is included in the API payload (see above). Adjust wording in `backend.ts` if policy changes.
- Add a link to your full privacy policy in the onboarding UI if required by your jurisdiction.

Disable or pause HubSpot
- Temporarily comment out the call to `submitUserEmail` in `Onboarding.tsx`.
- Or set invalid portal/form IDs (not recommended) — better to remove the call explicitly.

Production considerations
- Keep `ENV.DEV` false in production builds; HubSpot logs are minimal.
- If you want to A/B test email collection, wrap the call in a feature flag (similar to `ENV.DEV`).
