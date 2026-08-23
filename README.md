# Purity App

A React Native (Expo) mobile app that supports people working through
[The Freedom Fight](https://thefreedomfight.org/) porn‑addiction recovery program.

Everything is stored **locally on the device** — there is no backend and no account.

## Features

- **Learn** — an in‑app browser to the fixed Freedom Fight lessons URL
  (`https://app.thefreedomfight.org/courses`).
- **Accountability Partners** — add partners by name + number or pick from your device
  contacts, then list, edit, delete, and reorder them.
- **Triggered** — a big red button that immediately calls your first partner. No answer?
  Tap "next partner" to move down the list. (This screen is intentionally non‑editable.)
- **Practice (BRACE)** — a guided walkthrough of the BRACE technique (Breathe, Remember,
  Affirm, Call, Escape) with a breathing guide, plus a "reach out" flow that pre‑fills a
  message (default: _"I'm practicing brace"_) to a randomly selected partner and opens your
  messaging app.
- **Daily reminders** — configurable, toggleable local notifications.
- **App Limits** — ScreenZen‑style app blocking (Settings → Manage app limits): pick apps,
  set a daily free‑time allowance, and the selected apps are blocked outside that allowance.
  Fully functional on Android; iOS plumbing is included but stays inactive until Apple grants
  the Family Controls entitlement (see below).
- **Onboarding** — a first‑run tutorial that introduces each feature.

## Tech stack

- [Expo](https://docs.expo.dev/versions/v56.0.0/) SDK 56 + React Native 0.85 + TypeScript
- React Navigation v7 (bottom tabs + native stack)
- AsyncStorage for local persistence
- `expo-contacts`, `expo-sms`, `expo-notifications`, `react-native-webview`,
  `@react-native-community/datetimepicker`
- `expo-app-blocker` for App Limits (Android UsageStats + overlay shield; iOS Family Controls)

## Getting started

```bash
npm install
npm start        # then press i (iOS), a (Android), w (web), or scan the QR with Expo Go
```

For web testing:

```bash
npm run web
```

On web, app data is stored locally in the browser storage for that device/profile. Features
that depend on native phone capabilities (contacts picker, direct calling, SMS composer, local
notifications) may be unavailable or browser-dependent.

## Project scripts

| Script                            | Description                   |
| --------------------------------- | ----------------------------- |
| `npm start`                       | Start the Expo dev server     |
| `npm run android` / `ios` / `web` | Open on a specific platform   |
| `npm run lint`                    | ESLint (`eslint-config-expo`) |
| `npm run format`                  | Format with Prettier          |
| `npm run format:check`            | Verify formatting             |
| `npm run typecheck`               | `tsc --noEmit`                |
| `npm test`                        | Run the Jest unit tests       |

## Project structure

```
App.tsx                  # providers + onboarding/navigation gate
src/
  components/            # reusable UI (Button, Card, BraceWalkthrough, …)
  config.ts              # URLs + default message
  lib/                   # pure logic: partners, brace, phone, messaging, notifications
  navigation/            # bottom tabs + Partners/Settings stacks
  screens/               # Learn, Partners, Triggered, Practice, Settings, AppLimits, Onboarding
  state/                 # AppStateContext (load/save + actions)
  storage/               # AsyncStorage persistence
  theme/                 # colors, spacing, typography
```

## Testing & CI

Unit tests cover the core logic (partner ordering/rotation, BRACE message building, and
storage round‑tripping). GitHub Actions runs format check, lint, typecheck, and tests on
every push and pull request to `main`.

## Notes & limitations

- Mobile apps cannot auto‑dial, detect whether a call was answered, or silently send a
  text — by design. The "next partner" button and the "open messaging app" flow reflect
  these OS limitations.
- The Learn section links to Freedom Fight's own content; you sign in with your own account.

## App Limits (native builds only)

App Limits uses native system APIs that are **not** available in Expo Go or on web — the
screen explains this and stays inert there. To use it, make a development or production
build (the generated `android/`, `ios/`, and `targets/` folders are git‑ignored):

```bash
npx expo run:android   # or: eas build -p android
```

- **Android (functional now)** — requires two special permissions the screen walks you
  through: _Usage access_ (to see which app is in the foreground) and _Display over other
  apps_ (to show the blocking shield). A foreground service enforces the block; a daily
  free‑time allowance can be spent once per day.
- **iOS (dark until Apple approval)** — the code, entitlements
  (`com.apple.developer.family-controls`, App Group `group.org.sonichedghog.purityapp`),
  and Screen Time extension targets are all wired up, but Apple gates Family Controls
  distribution behind a [special entitlement request](https://developer.apple.com/contact/request/family-controls-distribution)
  tied to a paid developer account. Until that is granted (and `ios.appleTeamId` is set for
  the extension targets), the iOS screen saves selections but cannot block apps.
