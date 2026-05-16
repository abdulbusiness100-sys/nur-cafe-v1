# NŪR CAFÉ — App State & Task Board
_Last updated: 15 May 2026_

---

## REPOS
| Repo | URL | Deploy |
|---|---|---|
| Mobile app | https://github.com/abdulbusiness100-sys/nur-cafe-v1 | EAS → TestFlight |
| Admin portal | https://github.com/abdulbusiness100-sys/nurcafe-admin | Vercel (auto-deploy) |

---

## SUPABASE
- **Project:** `Nur-cafe-prod` — ID `rxnwtonbumbwoqfcpnds`
- **Region:** eu-west-1 — ACTIVE_HEALTHY
- **Tables:** `profiles`, `orders`, `menu_items` (0 rows), `gift_cards`, `notifications`
- **Missing table:** `newsletter_subscribers` — not yet created (Abdul to provide details)

---

## APP STORE
- **Bundle ID:** `com.nurcafe.app`
- **ASC App ID:** `6761050128`
- **Apple Team:** `8UB93H7R5G` (SPIDXR VITALITY INNOVATIONS LTD)
- **ASC API Key:** `58ZHSLRF24` — file at `~/Downloads/AuthKey_58ZHSLRF24.p8`
- **Issuer ID:** `24849dc7-5ced-4c31-a7de-fcc925f320c7`

---

## BUILD HISTORY
| Build | Status | Notes |
|---|---|---|
| 1–6 | Failed | Provisioning profile missing Push Notifications capability |
| 7–15 | Rejected by Apple | NSCameraUsageDescription missing — was in app.json which EAS ignores (app.config.js takes precedence) |
| 16 | ✅ In TestFlight | First passing build — app.config.js fixed |
| 17 | Built, not submitted | Duplicate triggered accidentally |
| 18 (build num 19) | ✅ Submitted to TestFlight | All changes below included. Awaiting Apple processing. |

**Root cause of builds 7–15 failure:** `app.config.js` overrides `app.json` entirely. All NS*UsageDescription fixes were applied to `app.json` — silently ignored. Fixed by adding keys to `app.config.js`.

---

## CURRENT BUILD (18 / build number 19)
Submitted to TestFlight 15 May 2026. Contains:
- ✅ NSCameraUsageDescription fix (app.config.js)
- ✅ expo-notifications plugin added
- ✅ Push notifications re-enabled (expo-device removed, wasn't installed)
- ✅ Loyalty earning: 2.5pts per £1 (bronze), 3.125 (silver), 3.75 (gold)
- ✅ Loyalty perks text updated to match real earning rate
- ✅ Points history in Rewards screen (reads from orders table)
- ✅ All May 12 audit fixes (forgot password, cart fingerprint, order detail, reorder, home screen last order card, etc.)

**NOT in build 18:** New app icon (committed after build 18 triggered — needs build 19)

---

## ACCOUNTS
| Email | Role | Password | Notes |
|---|---|---|---|
| `spidxr253@gmail.com` | Admin (`is_admin: true`) | `SalesSales99!` | Admin portal + app access |
| `test100@gmail.com` | Customer | Unknown | 18 pts |
| `review@nurcafe.co.uk` | Customer | Unknown | 45 pts, never signed in |

---

## LOYALTY SYSTEM
- **Earning:** 2.5pts per £1 spent (× tier multiplier)
- **Redemption:** 100pts = £1 off
- **Tiers:** Bronze (0pts) → Silver (50pts) → Gold (150pts)
- **Multipliers:** Bronze 1×, Silver 1.25×, Gold 1.5×
- Points stored in `profiles.points`
- Points history shown in Rewards screen (from orders.total_points / discount_points)

---

## NOTIFICATIONS
**Admin dashboard (nurcafe-admin):**
- Supabase Realtime subscription on orders table
- Ding sound on new order INSERT
- Flash animation on new order card
- Browser/system notification (even when tab unfocused)
- Tab title badge: `(2) New Orders · NŪR CAFÉ`

**Customer push notifications:**
- Admin marks order → "ready" → Expo push sent to customer's device
- Token registered on sign-in, saved to `profiles.push_token`
- In-app notification also written to `notifications` table

---

## TASKS TO DO

### 🔴 NEXT BUILD (build 19) — trigger immediately next session
- [ ] New app icon committed (`assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`)
- [ ] Trigger `eas build --platform ios --profile production --non-interactive`
- [ ] Submit to TestFlight after build completes

### 🟡 PENDING — awaiting Abdul input
- [ ] `newsletter_subscribers` table — Abdul to provide schema + where subscribers go
- [ ] Menu items — `menu_items` table is empty (0 rows). Decide: populate from `src/data/menu.ts` static data, or admin enters manually via admin portal
- [ ] Allergen/dietary tags (halal, vegan, dairy-free) — needs verified data from Abdul

### 🟠 FEATURES TO BUILD
- [ ] **Delivery section** — currently in-store pickup only. Abdul confirmed delivery comes after pickup is live
- [ ] **Apple Sign In** — required for App Store public release (not needed for TestFlight)
- [ ] **Admin loyalty management** — admin has no UI to manually award/adjust points
- [ ] **Order tracking screen** — real-time status updates for customer after placing order
- [ ] **Points transaction log table** — currently reads from orders; a dedicated `points_transactions` table would be cleaner for future
- [ ] **Android build** — no Android build has been triggered yet

### 🟢 ADMIN PORTAL — nurcafe-admin (live on Vercel)
- [ ] Confirm Vercel deployment URL with Abdul
- [ ] Menu items page works but table is empty — need to populate
- [ ] Newsletter page works but `newsletter_subscribers` table doesn't exist yet

---

## KEY FILES
| File | Purpose |
|---|---|
| `app.config.js` | **Master config — EAS reads this, NOT app.json** |
| `app.json` | Ignored by EAS when app.config.js exists — do not edit for build config |
| `plugins/withIosPermissions.js` | Backup config plugin writing NS*UsageDescription to Info.plist |
| `src/services/pushNotifications.ts` | Expo push token registration |
| `src/screens/CheckoutScreen.tsx` | Order placement, points earning (EARN_RATE = 2.5) |
| `src/screens/LoyaltyScreen.tsx` | Rewards screen with points history |
| `src/data/menu.ts` | Static menu data (source of truth until DB is populated) |
| `eas.json` | Build profiles — production uses autoIncrement |

---

## EAS BUILD COMMAND (non-interactive)
```bash
EXPO_ASC_API_KEY_PATH=~/Downloads/AuthKey_58ZHSLRF24.p8 \
EXPO_ASC_KEY_ID=58ZHSLRF24 \
EXPO_ASC_ISSUER_ID=24849dc7-5ced-4c31-a7de-fcc925f320c7 \
EXPO_APPLE_TEAM_ID=8UB93H7R5G \
EXPO_APPLE_TEAM_TYPE=COMPANY_OR_ORGANIZATION \
npx eas build --platform ios --profile production --non-interactive
```

## EAS SUBMIT COMMAND
```bash
EXPO_ASC_API_KEY_PATH=~/Downloads/AuthKey_58ZHSLRF24.p8 \
EXPO_ASC_KEY_ID=58ZHSLRF24 \
EXPO_ASC_ISSUER_ID=24849dc7-5ced-4c31-a7de-fcc925f320c7 \
npx eas submit --platform ios --profile production --id <BUILD_ID> --non-interactive
```
