# SparkX

A premium dark-luxury dating app built with **React Native (Expo)** and **TypeScript**, fully wired to **Firebase** (Auth, Firestore, Storage, Cloud Messaging, Analytics, Crashlytics).

SparkX includes the complete consumer experience: onboarding, email/phone/Google sign-in, a 5-step profile wizard, swipe-based discovery, realtime chat (typing, read receipts, media, voice messages, GIFs, replies, delete), voice/video call UI with history, notifications, premium subscriptions, an in-app coin economy (daily reward, lucky spin, boosts, super likes), and a full settings/privacy/security surface.

## Tech Stack

- **Expo SDK 53** / React Native 0.79.6 / React 19.0.0
- TypeScript, Zustand (state), React Hook Form + Zod (forms)
- `@react-native-firebase/*` for Auth, Firestore, Storage, Messaging, Analytics, Crashlytics
- `firebase-functions` + `firebase-admin` (Node 20) for the admin backend and live support
- React Navigation 7 (native stack + bottom tabs)
- Reanimated 3, Gesture Handler, Expo AV (voice recording + playback)
- NativeWind (Tailwind), Lottie, react-native-svg, react-native-fast-image, expo-blur

## Project Structure

```
src/
├── firebase/          # Thin SDK adapters (config, auth, firestore, storage, messaging, analytics, crashlytics)
├── core/              # Errors, utilities (dates, distance, haptics, validation, formatting, async helpers)
├── types/             # Domain types + enums (user, chat, premium, notifications, filters, api form values)
├── constants/         # Theme, onboarding slides, option lists, premium/coin plans
├── services/          # Business logic + Firestore reads/writes (auth, user, profile, swipe, match, message,
│                      #   notification, coin, premium, call, location, device, report, support, settings, verification)
├── store/             # Zustand stores (auth, app, discovery, chat, notification, premium, settings)
├── hooks/             # useProfileCompletion, useCountdown, useGoogleAuth, useMediaPicker, useBootstrapWatchers
├── components/        # UI primitives, common (LottieView, SafeImage, Confetti), home deck, chat, auth
├── navigation/        # RootNavigator, MainTabNavigator, typed route params, navigation theme + ref
└── screens/           # All screens grouped by feature (auth, onboarding, profile-setup, home, discover,
                       #   matches, chat, call, notifications, premium, profile, settings)
functions/             # Firebase Cloud Functions — secure admin backend + realtime live support
```

## Getting Started

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Create your Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a new project (e.g. `sparkx-app`).
2. Add an **Android** app with package `com.sparkx.app` and an **iOS** app with bundle id `com.sparkx.app`.
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) and place them in the project root.
4. Enable **Email/Password**, **Google**, and **Phone** sign-in under *Authentication > Sign-in method*.
5. Create Firestore in production mode and set the indexes listed in `firestore.indexes.json`.
6. Deploy the security rules:

```bash
npx firebase-tools deploy --only firestore:rules,storage
```

### 2b. Deploy the admin/live-support backend (Cloud Functions)

SparkX ships a server-side backend in `functions/` (Firebase Cloud Functions, Node 20) that provides the **secure admin foundation** (custom-claim role management, ban/unban, report resolution, identity-verification review) and the **realtime live-support backend** (agent replies pushed to the user via FCM):

```bash
cd functions
npm install
npm run build
cd ..
npx firebase-tools deploy --only functions
```

Bootstrap the first admin with the one-time `BOOTSTRAP_ADMIN_EMAIL` environment variable (Firebase Functions v2 reads `.env` files in the `functions/` directory), then remove it:

```bash
# functions/.env  (or .env.production for deploys)
BOOTSTRAP_ADMIN_EMAIL=you@example.com
```

Available callables (all admin-guarded via the `admin` custom claim unless noted):

| Function | Purpose |
| --- | --- |
| `setAdminRole({ uid, email, role })` | Promote/demote an admin (caller must be admin, or match bootstrap email) |
| `revokeAdmin({ uid })` | Remove admin claim |
| `banUser({ uid, reason })` | Disable Auth account + mark user banned |
| `unbanUser({ uid })` | Re-enable + clear ban |
| `resolveReport({ reportId, action })` | Dismiss / warn / ban (auto-bans target) |
| `reviewVerification({ requestId, approve, reason })` | Approve/reject identity verification |
| `updateSupportTicket({ ticketId, status, priority, assigneeUid, assigneeName })` | Manage ticket lifecycle |
| `sendSupportReply({ ticketId, message })` | Reply to a ticket; pushes FCM to the owner |

Background triggers: `onReportCreated` maintains `reportedCount`/`reportedFlag` server-side (client writes are rejected by rules); `onSupportMessageCreated` pushes admin replies to the ticket owner.

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your `EXPO_PUBLIC_FIREBASE_*` values. The API key, project id, storage bucket, sender id and app id are on the project settings page. For Google Sign-In, add your app's **Web client id** as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

> Never commit the real `.env` file. The example file documents every variable.

### 4. Run the app

```bash
npm start
```

Then press `a` for Android or `i` for iOS. For a native build (required for push notifications and Crashlytics):

```bash
npx expo prebuild
npm run android   # or npm run ios
```

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` / `npm run ios` | Run on a native device/emulator |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run lint` | Run ESLint |
| `npm run prebuild` | Generate `android/` and `ios/` folders |
| `npm run deploy:rules` | Deploy Firestore + Storage security rules |
| `npm run build:android` | Build a release APK |

## Data Model

All data lives in Firestore. Key collections:

- `users` — one doc per user (profile + preferences + blocking state)
- `profiles` — public searchable summaries
- `swipes` — like/pass/super-like records (drives matching)
- `matches` — one doc per pair, with `participants.<uid>.{lastReadAt,unseenCount}`
- `messages` — chat messages keyed by `matchId` (text, image, gif, voice, emoji, system)
- `notifications` — per-user push-style notifications
- `coins`, `coin_transactions`, `daily_rewards`, `lucky_spins`, `boosts`, `premium` — economy + entitlement state
- `verification_requests`, `reports`, `support`, `call_history`, `settings`
- `support/{ticketId}/messages` — realtime live-support thread (user + agent messages)
- `admin_users` — admin role registry (mirrors the `admin` custom claim)
- `users/{uid}/callSignals` — realtime call signaling subcollection

See `firestore.rules` for the auth-gated access model and `firestore.indexes.json` for required composite indexes. Admin-only access is enforced with the `request.auth.token.admin == true` custom claim in both rules and Cloud Functions.

## CI

The repository ships a GitHub Actions workflow (`.github/workflows/ci.yml`) that installs dependencies and runs typecheck + lint on every push and PR.

## Notes

- **Push notifications / Crashlytics / Analytics** require a native build with the Google Services files present. The Expo Go app is not sufficient.
- **Voice/video calls** in this phase are full-featured UI + realtime signaling via Firestore (`callSignals`) with timers, mute, speaker and call history. Peer-to-peer media streaming can be layered on later (e.g. WebRTC / LiveKit) without changing the screen contracts.
- **Reverse proxy**: when running a local backend separately during development, add a Vite-style proxy (or platform tunnel) forwarding `/api` to the backend. SparkX currently talks directly to Firebase, so no proxy is needed for the default setup.
