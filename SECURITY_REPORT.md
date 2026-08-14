# SparkX Security Audit & Hardening Report

Scope: Expo React Native user app (`/workspace/src`), Firebase Cloud Functions (`/workspace/functions/src`), `firestore.rules`, `storage.rules`, `firestore.indexes.json`. No Admin UI was built, no UI was redesigned, no app features were removed, and `google-services.json` was untouched.

All changes were validated end-to-end (see section P).

---

## A. Executive Summary

Four pre-existing high-severity issues were found and fixed:

1. Verification PII (selfie + government ID) was uploaded to the **publicly-readable** `users/{uid}/photos/*` path — any signed-in user could download anyone's ID document.
2. `coinService.earn()` was called by `CoinsScreen.tsx` and `LuckySpinScreen.tsx` but did not exist, and the client was free to create swipes/matches directly, letting users self-grant coins/boosts/premium via Firestore.
3. `firestore.rules` / `storage.rules` / `firestore.indexes.json` did not match the app's real queries and data model (e.g. `notifications.uid` vs the actual `userId`, `call_history.createdAt` vs the actual `startedAt`), and permitted spoofed `senderRole`, fake notification/call writes, and precise public-location writes.
4. `functions.ts` had pre-existing TypeScript errors and `moderation.ts` used non-defensive `update()`/`update()` calls that could crash on missing private docs.

No generic "allow all authenticated users" rules remain; every privileged mutation is server-authoritative via Cloud Functions and custom-claims admin checks.

---

## B. Data Model & PII Separation

- **Public doc** `users/{uid}` — discovery/chat/profile fields only (display name, photos, bio, preferences, `online`, `setupComplete`, `blockedUsers`, coarse `location`).
- **Private doc** `users/{uid}/private/profile` — `email`, `phone`, `fcmToken`, precise `location`, `blockedBy`, `banned`, `bannedReason`, `bannedAt`, `reportedCount`, `reportedFlag`. Owner/admin read-only; owner writes limited to the PII allowlist; moderation fields are server-only.
- `private/profile` is read client-side only for the owner (`getOwnProfile` / `watchOwnProfile` in `user.service.ts`).

---

## C. Verification PII & Storage Rules (`storage.rules`)

**Before:** `users/{uid}/photos/*` (and all other files) readable by any signed-in user; verification selfie + ID were written there.

**After (`storage.rules`):**
- `users/{uid}/{kind}/*` for `kind in ['photos','videos','voices']`: read signed-in, write owner-only, delete owner/admin, size ≤ 100 MB, MIME-checked.
- **New private path** `users/{uid}/private/verification/*`: read owner/admin only; write owner-only; size ≤ 20 MB; MIME-checked. Files use non-guessable names (`{kind}_{timestamp}_{random}.{ext}`) via `src/firebase/storage.ts` `uploadVerificationFile`; `verification.service.submit` now uses it.
- Catch-all `allow read, write: if false`.

Verified by emulator tests: owner can upload/read their own verification file; another user cannot read it; admin can.

---

## D. Coins / Premium / Boosts — Server-Authorized

Client Firestore writes to `coins`, `coin_transactions`, `premium`, `daily_rewards`, `lucky_spins`, `boosts` are all denied (read-owner-only). All mutations go through callables in `functions/src/security.ts`:

- `buyCoinPack` — validates `packId` against the server catalog.
- `claimDailyReward` — streak-aware, one claim/day.
- `spinLuckyWheel` — new/restored server-authoritative spin: debits 10 coins and picks the weighted prize server-side in a transaction; clients cannot self-grant (replaces the missing `coinService.earn` path). Client `coinService.spinWheel()` + `LuckySpinScreen` now consume the server result; prize ids match `constants/premium.ts`.
- `activateBoost`, `grantPremium`, `debitCoins` — all validate inputs against server catalogs; boost/premium/verified badges are written to the public `users` doc only by these callables (client rules deny those fields).
- `spinLuckyWheel` and `debitCoins` credit/debit atomically in a transaction and append `coin_transactions` entries.

---

## E. Swipes & Matches — Server-Only (`functions/src/matching.ts`)

**Before:** clients could write `swipes` and `matches` docs directly (fake matches, self-declared mutual likes).

**After:**
- New callable `recordSwipe`: validates target exists / `setupComplete` / not deleted / not banned / not blocking the caller; debits 2 coins for Super Likes via transaction (exempt when premium `unlimitedSuperLikes`); writes the swipe; checks the mutual-like and creates the match + system message in a transaction with a duplicate-match guard.
- `swipe.service.recordSwipe` now calls `recordSwipe`; client-side `createMatch`, `coinService.spend`, `premiumService.getEntitlements` for swipes were removed. Error UX for "Not enough coins" preserved.
- Rules: `swipes` create = false, `matches` create = false; reads limited to participants (swipe read when `userId` or `targetUid` == me; match read via `userIds.hasAny([uid])`).
- `matches` updates: participants may only touch allowlisted fields, and only write `participants.<uid>` keys that are actual match members (`matchUserIds` check) — prevents non-participant injection.

---

## F. Messages (`messages` root collection)

- **Create**: sender must be `senderId == uid()`, `kind != 'system'` and in the allowed set, all fields on the allowlist, and the sender must belong to the match (`canAccessMatch`). System messages are written only by the `recordSwipe` server transaction.
- **Update**: a sender may only soft-delete their own message (`deleted`, `text`, `updatedAt`); any participant may write read/delivered receipts.
- **Delete**: denied for clients.
- Verified: spoofed `senderId`, fake `system` messages, deleting another user's message, and messages outside the match are all denied.

---

## G. Notifications — Server-Written Only

- Client create = false. All notifications are written by triggers: `onMatchCreated` (both users), `onMessageCreated` (recipient inbox + FCM), `onCallHistoryCreated` (missed-call), `onSupportMessageCreated`.
- Clients may only read their own (`userId == uid()`) and mark `read`.
- Client `createForUser`/`createForUsers` are no longer used by any screen (verified).

---

## H. Calls (`callSignals` + `call_history`)

- `callSignals` create: caller must be the auth user, callee is the owning user, non-self, status `ringing`, type voice/video, and the call is only allowed **between matched users** (`isMatchBetween` against the match doc). Update: caller or callee only, lifecycle fields only.
- `call_history` create: caller/callee auth check, matched-users check, allowlisted fields, valid `type`/`status`. Update: participants only, lifecycle fields.
- Both were verified by emulator tests: unmatched-user calls, self-calls, and extra-field tampering are denied.

---

## I. Support / Live Support — `senderRole` Spoofing

- Ticket create: must be owned by the auth user, status `open`, priority `normal`, allowlisted fields. Read: owner or admin. Update: admin, or owner limited to `status`/`updatedAt`.
- `support/{ticketId}/messages` create: **`senderRole` is forced to `'user'`** for any client; the message's `senderUid` must be the auth user and the ticket owner. Admin replies with `senderRole == 'admin'` are written only by the server (`sendSupportReply` callable) — clients, even admins, cannot inject admin-role messages directly (verified by tests).
- `support.ts`: `updateSupportTicket` and `sendSupportReply` require `request.auth.token.admin == true` via `requireAdmin`.

---

## J. Private Data / Moderation / Blocking

- `private/profile` read: owner/admin. Write: owner only for `email, phone, fcmToken, location, updatedAt`; `blockedBy`, `banned*`, `reported*` are server-only.
- `blockUser`/`unblockUser`/`banUser`/`unbanUser`/`onReportCreated`/`deleteAccount` in `security.ts` and `moderation.ts` now use **defensive `set(..., {merge:true})`** (or an existence check) so they never crash on a missing private doc. `unbanUser` clears moderation fields only if the doc exists; `onReportCreated` creates the counters if missing.
- Reports create: `reporterUid == uid()`, non-self, `status == 'open'`, allowlisted fields; read/update admin-only.

---

## K. Location Precision

- Clients can **no longer write `location` on the public doc** (removed from the users update allowlist; `user.service.updateLocation` writes only to `private/profile`).
- New trigger `onPrivateProfileWrite` (in `security.ts`) mirrors a coarse (~1 decimal place, ~11 km) copy of precise location to the public `users` doc so distance-based discovery keeps working without exposing precise coordinates.
- `profile.service` routes `location` patches to the private doc instead of the public doc.

---

## L. Privileged Fields on Public Doc

The users update/create allowlists exclude `premium`, `premiumTier`, `premiumSince`, `boostUntil`, `verified`, `banned*`, `reported*`, `blockedBy`, `email`, `phone`, `fcmToken`, `location`. These are only written by Cloud Functions / Admin SDK. Verified by emulator tests: self-granting premium/verified and writing email/blockedBy/reportedCount/banned are all denied.

---

## M. Other Hardening

- `coin_transactions` read: owner, or `targetUserId == uid()`.
- `settings`: owner read/create/update.
- `verification_requests`: create by owner with allowlisted pending fields; read owner/admin; update admin-only.
- `reports`: as in J. `admin_users`: admin-only. `profiles` legacy collection: read-only.
- `deleteAccount` callable marks the public doc deleted, removes private PII, and stamps `settings`; client then deletes the Auth account.
- Fixed pre-existing TS errors in `src/firebase/functions.ts` (generic `httpsCallable<T>` + typed `res.data`).
- `onWrite` import in `security.ts` corrected to the v2 `onDocumentWritten`.

---

## N. Firestore Indexes (`firestore.indexes.json`)

Rebuilt to match the app's actual queries (verified against services):
- `messages (matchId ASC, createdAt ASC)`
- `swipes (userId, direction)`, `(userId, targetUid, direction)`, `(targetUid, direction)` (covers `getLikesYouMap`)
- `matches (userIds CONTAINS, lastMessageAt DESC)`
- `notifications (userId, createdAt DESC)` and `(userId, read)` — fixed from the wrong `uid`
- `coin_transactions (userId, createdAt DESC)`
- `support (userId, createdAt DESC)`
- `call_history (callerId, startedAt DESC)` and `(calleeId, startedAt DESC)` — fixed from the wrong `createdAt`
- `verification_requests (userId, createdAt DESC)`

---

## O. Files Changed

- `firestore.rules` — full rewrite (helpers, allowlists, server-only collections).
- `storage.rules` — private verification path + owner/admin read.
- `firestore.indexes.json` — corrected/expanded indexes.
- `functions/src/matching.ts` — new `recordSwipe` callable.
- `functions/src/index.ts` — exports matching module.
- `functions/src/security.ts` — `onDocumentWritten` fix; defensive block/unblock; new `onPrivateProfileWrite` coarse-location trigger; `spinLuckyWheel` (server-authoritative).
- `functions/src/moderation.ts` — defensive `unbanUser`/`onReportCreated` (set-with-merge / existence check).
- `src/services/swipe.service.ts` — server-side `recordSwipe`.
- `src/services/match.service.ts` — client `createMatch` removed.
- `src/services/user.service.ts` — `updateLocation` private-only; `getPrivateProfile` returns `blockedBy`/`banned`; new `getOwnProfile`/`watchOwnProfile`.
- `src/store/auth.store.ts` — bootstrap uses `getOwnProfile`.
- `src/hooks/useBootstrapWatchers.ts` — uses `watchOwnProfile`.
- `src/screens/premium/CoinsScreen.tsx` — `buy` uses `coinService.buyPack`.
- `src/screens/premium/LuckySpinScreen.tsx` — server-authoritative spin via `coinService.spinWheel()`; no client prize picking.
- `src/firebase/storage.ts` — new `uploadVerificationFile` (private path).
- `src/services/verification.service.ts` — uses private upload path.
- `src/services/coin.service.ts` — new `spinWheel()`.
- `src/services/profile.service.ts` — routes `location` to private doc.
- `src/firebase/functions.ts` — fixed callable generic typing.

`google-services.json` was not modified.

---

## P. Validation Results (all green)

1. `npx tsc --noEmit` (app): pass.
2. `npx tsc --noEmit` (functions): pass.
3. `npx eslint .` (app): 0 errors (69 pre-existing warnings).
4. `npx expo-doctor`: 18/18 checks passed.
5. `npx expo export --platform android`: export succeeded.
6. `functions` build (`npm run build`): pass.
7. Firestore emulator: rules compile and run cleanly (JDK 21).
8. Storage emulator: storage rules compile cleanly.
9. `firestore.rules` + `storage.rules` exercised via `@firebase/rules-unit-testing` against the emulator: **64/64 tests pass**, covering:
   - own/other public profile reads and blocked field writes
   - private-profile read/write (owner, non-owner denied, admin allowed, moderation fields denied)
   - swipe/match create denied, participant-only match updates
   - message create/update/delete permissions, spoofed `senderId`, `system` kind
   - notification create denied / mark-read allowed
   - coins/transactions read-only, self-grant denied
   - support ticket + message rules incl. `senderRole` spoofing
   - call signal + call history creation/update (matched-only, non-self)
   - reports (non-self, no spoofed reporter)
   - settings owner access
   - storage: verification path owner/admin-only, public photos, MIME/size checks
