# Soma & Surya — Production Readiness Audit

**Date:** June 1, 2026
**Audited by:** Automated codebase analysis
**Scope:** Full-stack audit across 12 dimensions

---

## Scoring Legend

| Score | Meaning |
|-------|---------|
| ✅ **PASS** | Production ready |
| ⚠️ **WARN** | Minor issue, should fix before launch |
| ❌ **FAIL** | Blocking issue, must fix before launch |
| 🔴 **CRITICAL** | Security / legal / data-loss risk |

---

## 1. LANGUAGE SYSTEM — Score: ❌ FAIL (3/10)

### 1A. Navbar Language Switcher

| Item | Status | Detail |
|------|--------|--------|
| Desktop navbar has language switcher | ✅ PRESENT | `LanguageSwitcher.tsx` — globe icon dropdown with 10 languages |
| Mobile menu has language switcher | ✅ PRESENT | Inside hamburger drawer (Navbar.tsx:241) |
| Shows flag + language code | ❌ MISSING | Shows native language name (e.g., "English", "हिन्दी") — no flag emojis, no language codes |
| `LanguageSwitcher` in dashboard sidebar | ✅ PRESENT | DashboardLayout.tsx has theme toggle + LanguageSwitcher |

### 1B. Settings Page Language Section

| Item | Status | Detail |
|------|--------|--------|
| Dedicated Language section | ❌ MISSING | Settings only has: Profile tab, Appearance tab, Subscription tab — NO Language tab/section |
| Current language displayed | ❌ MISSING | No language indicator in settings |
| Searchable language dropdown | ❌ MISSING | |
| Save / persist to database | ❌ MISSING | Language stored only in `localStorage` — NOT persisted to user profile in database |
| Sync across tabs | ❌ MISSING | Zustand store has no cross-tab sync |

### 1C. Hardcoded Strings Not Using `t()`

| # | File | Line | String | Severity |
|---|------|------|--------|----------|
| 1 | RegisterPage.tsx | 65 | `"Soma & Surya"` | LOW |
| 2 | LoginPage.tsx | 44 | `"Soma & Surya"` | LOW |
| 3 | Navbar.tsx | 86 | `"Soma"` / `"Surya"` | LOW |
| 4 | DashboardLayout.tsx | 101, 237 | `"Soma"` / `"Surya"` | LOW |
| 5 | PricingPage.tsx | 36, 54 | `'USD'`, `'en-US'`, `'$'` | MEDIUM |
| 6 | TermsPage.tsx | 13 | `"May 31, 2026"` | MEDIUM |
| 7 | TermsPage.tsx | 16-25 | All legal content (10 sections) | 🔴 **HIGH** |
| 8 | ContactPage.tsx | 35-36 | `"Mumbai, India"`, `"Within 24 hours"` | LOW |

### 1D. Keys Used With `as any` (Not in TranslationKey Type)

20+ translation keys are used via `as any` casts and DO NOT exist in the translation data maps. They will appear as raw key text:

| Key | File | Severity |
|-----|------|----------|
| `common.seekerFallback` | DashboardHome.tsx | HIGH |
| `common.of100` | DashboardHome.tsx | HIGH |
| `common.ofCosmicConnection` | DashboardHome.tsx | HIGH |
| `common.stateName` | BirthPlaceInput.tsx | HIGH |
| `common.selectState` | BirthPlaceInput.tsx | HIGH |
| `common.country` | BirthPlaceInput.tsx | HIGH |
| `common.selectCountry` | BirthPlaceInput.tsx | HIGH |
| `dashboard.gemstoneRuby/Pearl/Emerald/Sapphire` | DashboardHome.tsx | HIGH |
| `dashboard.updateProfile` | DashboardHome.tsx | HIGH |
| `settings.light/dark/system/mode` | DashboardLayout.tsx | MEDIUM |
| `settings.placeExample` | SettingsPage.tsx | MEDIUM |
| `pricing.invalidUrl` | PricingPage.tsx | MEDIUM |
| `nav.users/analytics` | DashboardLayout.tsx | MEDIUM |

### 1E. RTL Support

| Item | Status | Detail |
|------|--------|--------|
| `<html dir="rtl">` for Arabic | ✅ SET | In i18n/store.ts — sets `dir="rtl"` |
| RTL-aware CSS (logical properties) | ❌ **NONE** | Zero `[dir="rtl"]` selectors, zero Tailwind `rtl:` variants |
| Physical left/right classes used | ❌ EVERYWHERE | `left-0`, `right-0`, `ml-*`, `mr-*`, `-translate-x-*`, `absolute right-0` |
| Mobile drawer slides from left | ❌ WRONG | DashboardLayout.tsx:228 — `initial={{ x: -300 }}` should be `x: dir === 'rtl' ? 300 : -300` |
| Language switcher dropdown | ❌ WRONG | LanguageSwitcher.tsx:53 — `right-0` |
| User menu dropdown | ❌ WRONG | Navbar.tsx:135 — `absolute right-0` |
| `isRtlLanguage()` function | ❌ DEAD CODE | Exported from translations.ts but never called |

---

## 2. MULTI-CURRENCY SYSTEM — Score: ⚠️ WARN (5/10)

### 2A. Navbar Currency Display

| Item | Status | Detail |
|------|--------|--------|
| Selected currency shown in navbar | ❌ MISSING | No currency indicator anywhere in the UI |
| Example: `🌍 EN \| ₹ INR` | ❌ NOT IMPLEMENTED | |

### 2B. Settings Currency Section

| Item | Status | Detail |
|------|--------|--------|
| Dedicated Currency section | ❌ MISSING | Not in Settings |
| Search currency | ❌ MISSING | |
| Auto-detect by country | ❌ MISSING | |
| Manual override | ❌ MISSING | |

### 2C. Billing Currency

| Item | Status | Detail |
|------|--------|--------|
| Pricing page updates currency | ⚠️ PARTIAL | `getCurrencyForCountry()` exists in `pricing.ts`, called in `PricingPage.tsx` and `Landing.tsx` |
| Currency auto-detection | ⚠️ EXISTS | Uses `Intl.NumberFormat` / country detection |
| Static exchange rates | ❌ **HARDCODED** | `pricing.ts:50-62` — rates are hardcoded (83 INR/USD, 0.79 GBP/USD, etc.). Will go stale. |

### 2D. Stripe Currency

| Item | Status | Detail |
|------|--------|--------|
| Currency passed to Stripe checkout | ❌ NOT VERIFIED | Backend `payment.ts` has hardcoded `CURRENCY_RATES` map — currency selection not wired to Stripe session |

---

## 3. REGISTRATION EXPERIENCE — Score: ❌ FAIL (2/10)

### 3A. Current Flow

| Item | Status | Detail |
|------|--------|--------|
| Current registration | ❌ SINGLE-STEP | Single form: name, email, password + Google OAuth |
| No birth details collected | ❌ MISSING | Birth data collected later in Settings or Kundli page |
| react-hook-form / Zod | ❌ NOT USED | Plain `useState`, no validation library |
| Password strength meter | ✅ PRESENT | `calcStrength()` returns weak/medium/strong |

### 3B. Required Multi-Step Flow

| Step | Feature | Status |
|------|---------|--------|
| Step 1 | Personal (name, gender, country, language) | ❌ NOT IMPLEMENTED |
| Step 2 | Birth (DOB, time, place, timezone) | ❌ NOT IMPLEMENTED |
| Step 3 | Preview (moon sign, nakshatra, ascendant, lord) | ❌ NOT IMPLEMENTED |
| Step 4 | Account (email, password, terms, create) | ❌ NOT IMPLEMENTED |
| Progress bar | ❌ NOT IMPLEMENTED |
| Animations | ❌ NOT IMPLEMENTED |
| Success screen | ❌ NOT IMPLEMENTED |

---

## 4. TYPOGRAPHY & LAYOUT AUDIT — Score: ⚠️ WARN (6/10)

### 4A. CSS Analysis

| Item | Status | Detail |
|------|--------|--------|
| Text overflow / clipping | ⚠️ POTENTIAL | `text-[9px]` used in DashboardHome.tsx:118, 123, 128 — very small, may clip on some screens |
| `truncate` class usage | ⚠️ FOUND | DashboardHome.tsx:124, 129 — `truncate` on lucky color/gemstone text |
| Font loading | ⚠️ RENDER-BLOCKING | Google Fonts loaded via `@import` in CSS (globals.css:1) — no `<link rel="preconnect">` in HTML |
| Typography scale | ✅ TAILWIND DEFAULT | Uses standard Tailwind typography scale |
| Responsive text sizes | ✅ `md:` BREAKPOINTS | Used in several places (`text-3xl md:text-4xl`) |

### 4B. Known Layout Issues

| Issue | Location | Severity |
|-------|----------|----------|
| `text-[9px]` lucky elements grid | DashboardHome.tsx:118, 123, 128 | MEDIUM — 9px is illegible on mobile |
| `truncate` on gemstone text | DashboardHome.tsx:129 | MEDIUM — text may be cut off |
| Lucky gemstone hardcoded element mapping | DashboardHome.tsx:129 | MEDIUM — element→gemstone mapping is hardcoded in JSX |
| No rich text / prose styles | entire app | LOW — no article body styling for FAQ/legal content |

---

## 5. FORM AUDIT — Score: ⚠️ WARN (5/10)

### 5A. Form Framework Usage

| Feature | Status |
|---------|--------|
| react-hook-form (installed v7.54.2) | ❌ **NOT USED ANYWHERE** |
| @hookform/resolvers (installed v5.0.1) | ❌ **NOT USED ANYWHERE** |
| Zod (installed v3.24.2) | ❌ **NOT USED ON FRONTEND** (used only on backend via validate.ts middleware) |
| All forms use plain `useState` | ✅ CONFIRMED |

### 5B. Per-Form Audit

| Form | Loading | Success | Error | Inline Validation | Notes |
|------|---------|---------|-------|-------------------|-------|
| **RegisterPage** | ✅ Button spinner | ❌ Silent redirect | ✅ Red `<p>` | ❌ None — single generic error | No toast; no per-field errors |
| **LoginPage** | ✅ Button spinner | ❌ Silent redirect | ❌ **EMPTY CATCH BLOCK** | ❌ None | Login errors are swallowed! Only Google OAuth shows toast |
| **SettingsPage** | ✅ Button "Saving..." | ✅ Green button + toast | ✅ Red button + toast | ❌ None | Best form in the app |
| **KundliPage** | ✅ Button + full spinner | ❌ Silent (results appear) | ✅ Red `<p>` | ✅ Per-field via `error` prop | Good validation |
| **CompatibilityPage** | ✅ Button + spinner | ❌ Silent (results appear) | ✅ Red `<p>` | ⚠️ Missing `error` prop on BirthPlaceInput | Bug: line 86/97 missing error prop |
| **ChatPage** | ✅ Typing indicator | ❌ No toast | ✅ Red `<p>` | N/A (single input) | Good UX |

### 5C. Critical Bugs

| Bug | Severity |
|-----|----------|
| LoginPage error catch block is empty — users get ZERO feedback on failed login | 🔴 **CRITICAL** |
| CompatibilityPage BirthPlaceInput missing error prop for both partners | HIGH |
| Registration has no success feedback — silent redirect | MEDIUM |
| No client-side Zod validation on ANY form | MEDIUM |

---

## 6. NAVIGATION AUDIT — Score: ⚠️ WARN (7/10)

### 6A. Route Coverage

| Route | Exists | Linked | Status |
|-------|--------|--------|--------|
| `/` Landing | ✅ | ✅ | OK |
| `/login` | ✅ | ✅ | OK |
| `/register` | ✅ | ✅ | OK |
| `/pricing` | ✅ | ✅ | OK |
| `/dashboard` | ✅ | ✅ | OK |
| `/dashboard/horoscope` | ✅ | ✅ | OK |
| `/dashboard/kundli` | ✅ | ✅ | OK |
| `/dashboard/compatibility` | ✅ | ✅ | OK |
| `/dashboard/moon` | ✅ | ✅ | OK |
| `/dashboard/chat` | ✅ | ✅ | OK |
| `/dashboard/settings` | ✅ | ✅ | OK |
| `/dashboard/billing` | ❌ **NOT IN ROUTES** | ⚠️ Linked as `/pricing` instead | OK (uses /pricing redirect) |
| `/admin` | ✅ | ✅ | OK |
| `/admin/users` | ✅ | ✅ | OK |
| `/admin/analytics` | ✅ | ✅ | OK |
| `/admin/reports` | ❌ **NOT IN ROUTES** | ⚠️ Is it linked? | Needs check |
| `/about` | ✅ | ✅ | OK |
| `/contact` | ✅ | ✅ | OK |
| `/faq` | ✅ | ✅ | OK |
| `/privacy` | ✅ | ✅ | OK |
| `/terms` | ✅ | ✅ | OK |
| `/refund` | ✅ | ✅ | OK |
| `*` catch-all | ✅ | Redirects to `/` | OK |

### 6B. Navigation Issues

| Issue | Severity |
|-------|----------|
| No 404 page — catch-all redirects to `/` silently | LOW — acceptable but non-standard |
| Admin reports route (`/admin/reports`) defined in AdminLayout sidebar but NOT in App.tsx routes | 🔴 **CRITICAL — will 404** |

---

## 7. ASTROLOGY ACCURACY AUDIT — Score: ✅ PASS (8/10)

### 7A. Calculation Engine

| Check | Status | Detail |
|-------|--------|--------|
| Pure JS ephemeris | ✅ YES | VSOP87 simplified + Jean Meeus — 1200 lines |
| Deterministic | ✅ YES | Same input always returns same result — no random values |
| No mock data | ✅ YES | All calculations are real ephemeris computations |
| AI fallback labeled | ✅ YES | Chat explicitly labels AI responses |

### 7B. Calculations Verified

| Calculation | Method | Status |
|-------------|--------|--------|
| Moon Sign (Rashi) | Longitude-based lookup | ✅ |
| Ascendant (Lagna) | Computed from time/location | ✅ |
| Nakshatra | Longitude-based (27 sectors of 13.33°) | ✅ |
| Rashi Lord | From RASHI_DATA constant | ✅ |
| Planetary positions | Geocentric VSOP87 | ✅ |
| Tithi | Lunar day calculation | ✅ |
| Yoga | Sun + Moon longitude sum | ✅ |
| Karana | Half-tithi calculation | ✅ |

### 7C. Concerns

| Issue | Severity |
|-------|----------|
| No Swiss Ephemeris or WASM — pure JS may have precision differences vs professional tools | LOW |
| No unit tests found for ephemeris calculations | MEDIUM |
| No ayanamsa configuration visible (Vedic vs Tropical) | MEDIUM |
| House system (Placidus/Equal/Whole Sign) not documented | LOW |

---

## 8. DASHBOARD AUDIT — Score: ⚠️ WARN (6/10)

### 8A. Required vs Current

| Section | Required | Current | Status |
|---------|----------|---------|--------|
| Today's Horoscope | ✅ | ✅ Tabs: Today/Tomorrow/Week | OK |
| Tomorrow | ✅ | ✅ | OK |
| This Week | ✅ | ✅ | OK |
| This Month | ✅ | ❌ NOT IMPLEMENTED | MISSING |
| Astrology Snapshot | ✅ | ✅ Moon Sign, Ascendant, Nakshatra, Rashi Lord | OK |
| Upcoming Transit Alerts | ✅ | ✅ TransitAlertsCard | OK |
| Cosmic Energy Score | ✅ | ✅ Animated circular gauge | OK |
| Birth Chart Summary | ✅ | ❌ NOT IMPLEMENTED | MISSING |
| Recent Reports | ✅ | ❌ NOT IMPLEMENTED | MISSING |
| Saved Reports | ✅ | ❌ NOT IMPLEMENTED | MISSING |
| Quick Actions | ✅ | ✅ 2 visible + "Show all" for 4 more | OK |
| Daily Streak | ✅ | ✅ | OK |
| Lucky Elements | ✅ | ✅ Number, Color, Gemstone | OK |
| Upsell for free users | ✅ | ✅ | OK |

### 8B. Dashboard Data

| Metric | Status |
|--------|--------|
| Greeting with user name | ✅ |
| Plan badge shown | ✅ |
| Analytics (reports, chat sessions, plan, score) | ✅ |
| Weekly score with `/100` suffix | ⚠️ Uses `'common.of100' as any` — missing key |
| Gemstone display | ⚠️ Hardcoded element→gemstone mapping with `as any` keys |

---

## 9. DESIGN AUDIT — Score: ⚠️ WARN (7/10)

### 9A. Visual Consistency

| Item | Status | Detail |
|------|--------|--------|
| Color system | ✅ Excellent | Light/dark/cosmic/ink/parchment/gold palette in globals.css |
| Card spacing | ✅ Consistent | `PremiumCard` with consistent padding |
| Grid alignment | ✅ Consistent | Uses Tailwind grid consistently |
| Shadows / glass effects | ✅ Consistent | `glass-card` utility class, `shadow-gold/20` |
| Animation consistency | ✅ Consistent | Framer Motion with `staggerContainer`/`staggerItem` |
| Button styles | ✅ Consistent | `PremiumButton` with loading states |
| Duplicate CSS | ⚠️ WARN | `glass-card` defined twice (globals.css:104 and :173) |

### 9B. Issues

| Issue | Location | Severity |
|-------|----------|----------|
| `text-[9px]` sizes | DashboardHome.tsx:118,123,128 | MEDIUM — too small for production |
| Duplicate `.glass-card` CSS | globals.css:104,173 | LOW — could cause specificity bugs |
| No `public/` directory | project root | 🔴 CRITICAL — missing favicon, OG image |

---

## 10. ACCESSIBILITY AUDIT — Score: ⚠️ WARN (5/10)

### 10A. Keyboard Navigation

| Item | Status | Detail |
|------|--------|--------|
| Global `focus-visible` styles | ✅ PRESENT | `globals.css:61-65` — gold ring on all elements |
| `focus:border-gold` on inputs | ✅ PRESENT | Input.tsx, BirthPlaceInput.tsx, ContactPage.tsx |
| Escape key closes dropdowns | ❌ **MISSING** | Neither Navbar user menu nor mobile menu listen for Escape |
| Focus trapping in overlays | ❌ **MISSING** | Mobile menu and sidebar drawer don't trap focus |
| User dropdown keyboard open | ❌ **MISSING** | Opens only on `onClick` — no `onKeyDown` for Enter/Space |
| Arrow-key nav in sidebar | ❌ **MISSING** | No keyboard navigation for sidebar items |
| Skip-to-content link | ❌ **MISSING** | No landmark navigation skip link |

### 10B. Screen Reader Support

| Item | Status | Detail |
|------|--------|--------|
| `aria-label` on hamburger menus | ✅ PRESENT | Navbar.tsx:196, DashboardLayout.tsx:204 |
| `aria-label` on theme toggle | ✅ PRESENT | Navbar.tsx:107, DashboardLayout.tsx:22 |
| `aria-current="page"` on active nav | ❌ **MISSING** | DashboardLayout.tsx doesn't indicate current page |
| `role="navigation"` on nav elements | ❌ **MISSING** | No explicit navigation landmark roles |
| `role="menu"` / `role="menuitem"` on dropdowns | ❌ **MISSING** | User dropdown has no menu semantics |
| Alt text on images | ✅ N/A | No `<img>` tags — all SVG icons from lucide-react |

### 10C. Color Contrast

| Item | Status |
|------|--------|
| Text on dark backgrounds | ✅ Gold on dark — passes contrast |
| Text on light backgrounds | ✅ Ink on light — passes |
| `text-ink/50` opacity text | ⚠️ 50% opacity may fail WCAG AA for small text |
| `text-ink/40` opacity | ❌ Likely fails WCAG AA — 40% opacity too light for 9px text |

---

## 11. SEO AUDIT — Score: ❌ FAIL (2/10)

### 11A. Essential Files

| Item | Status | Detail |
|------|--------|--------|
| `robots.txt` | ❌ **MISSING** | Not in project root or `public/` |
| `sitemap.xml` | ❌ **MISSING** | Not in project root or `public/` |
| `public/` directory | ❌ **MISSING** | Vite default `publicDir` is `public/` — doesn't exist |
| `favicon.svg` | ❌ **MISSING** | Referenced in `index.html:5` but file doesn't exist |
| `og.png` | ❌ **MISSING** | Referenced in `index.html:12` but file doesn't exist |

### 11B. Per-Page SEO

| Item | Status | Detail |
|------|--------|--------|
| Dynamic `<title>` per route | ❌ **MISSING** | Same title on every page. No react-helmet, no document.title |
| Dynamic meta description per route | ❌ **MISSING** | Hardcoded single description in index.html |
| OpenGraph per route | ❌ **MISSING** | Hardcoded single OG tags |
| Canonical URL per route | ❌ **MISSING** | Always `https://somasurya.com` regardless of page |
| JSON-LD structured data | ⚠️ PRESENT | `SoftwareApplication` schema — could be richer |
| `brand.ts` meta tags | ❌ UNUSED | `brand.meta.title` and `brand.meta.description` defined but never wired to HTML |

### 11C. SSR Status

| Item | Status |
|------|--------|
| Server-side rendering | ❌ **NONE** — fully client-side SPA |
| Google visibility without JS | ❌ Google sees empty shell |
| Content pages SEO value | ❌ Zero — Landing, About, FAQ, Terms invisible to crawlers |

---

## 12. FINAL REPORT

### Score Summary

| Category | Score | Grade |
|----------|-------|-------|
| 1. Language System | 3/10 | ❌ FAIL |
| 2. Multi-Currency | 5/10 | ⚠️ WARN |
| 3. Registration | 2/10 | ❌ FAIL |
| 4. Typography & Layout | 6/10 | ⚠️ WARN |
| 5. Forms | 5/10 | ⚠️ WARN |
| 6. Navigation | 7/10 | ⚠️ WARN |
| 7. Astrology Accuracy | 8/10 | ✅ PASS |
| 8. Dashboard | 6/10 | ⚠️ WARN |
| 9. Design | 7/10 | ⚠️ WARN |
| 10. Accessibility | 5/10 | ⚠️ WARN |
| 11. SEO | 2/10 | ❌ FAIL |
| **OVERALL** | **5.1/10** | ⚠️ **NOT PRODUCTION READY** |

### Bugs Found — Sorted by Severity

| # | Severity | Bug | File | Line |
|---|----------|-----|------|------|
| 1 | 🔴 CRITICAL | LoginPage has empty catch block — users get NO error feedback on failed login | `LoginPage.tsx` | 28 |
| 2 | 🔴 CRITICAL | Admin reports route linked but not defined — will 404 | `App.tsx` + `AdminLayout.tsx` | — |
| 3 | 🔴 CRITICAL | Missing `public/` directory — favicon, OG image, robots.txt, sitemap all 404 | `frontend/` | — |
| 4 | 🔴 CRITICAL | All Terms/Privacy legal content hardcoded in English — not translatable | `TermsPage.tsx` | 16-25 |
| 5 | 🔴 CRITICAL | Zero RTL CSS — Arabic users will see broken layout | `globals.css` | entire file |
| 6 | HIGH | 20+ missing translation keys render as raw key text | Multiple files | — |
| 7 | HIGH | Language preference not persisted to database | `i18n/store.ts` | — |
| 8 | HIGH | No Settings Language section | `SettingsPage.tsx` | — |
| 9 | HIGH | No per-route title/metadata (no react-helmet) | `App.tsx` | — |
| 10 | HIGH | CompatibilityPage BirthPlaceInput missing error prop | `CompatibilityPage.tsx` | 86, 97 |
| 11 | MEDIUM | Registration is single-step — no birth details | `RegisterPage.tsx` | — |
| 12 | MEDIUM | Exchange rates hardcoded — will go stale | `pricing.ts` | 50-62 |
| 13 | MEDIUM | No escape key or focus trap in overlays | `Navbar.tsx`, `DashboardLayout.tsx` | — |
| 14 | MEDIUM | `text-[9px]` too small for production | `DashboardHome.tsx` | 118, 123, 128 |
| 15 | MEDIUM | No responsive "This Month" horoscope tab | `DashboardHome.tsx` | — |
| 16 | LOW | `brand.ts` meta tags unused | `brand.ts` | 9-10 |
| 17 | LOW | Google Fonts render-blocking via CSS `@import` | `globals.css` | 1 |

### Files Requiring Changes

| Area | Files |
|------|-------|
| Language System | `LanguageSwitcher.tsx`, `SettingsPage.tsx`, `store.ts`, `translations.ts`, `Navbar.tsx`, `globals.css` |
| Multi-Currency | `Navbar.tsx`, `SettingsPage.tsx`, `pricing.ts`, `payment.ts` |
| Registration | `RegisterPage.tsx` (full rewrite to multi-step) |
| Forms | `LoginPage.tsx`, `CompatibilityPage.tsx`, all forms (add react-hook-form + Zod) |
| Navigation | `App.tsx`, `AdminLayout.tsx` |
| SEO | Create `public/` dir with: `favicon.svg`, `og.png`, `robots.txt`, `sitemap.xml`; add react-helmet-async |
| Accessibility | `Navbar.tsx`, `DashboardLayout.tsx` (Escape key, focus trap, aria-current) |
| Dashboard | `DashboardHome.tsx` (add This Month, Birth Chart Summary, Recent Reports, Saved Reports) |
| Design | `globals.css` (remove duplicate glass-card), fix 9px text |

### Production Readiness Verdict

```
  🟢 PASS (8-10):   Astrology Accuracy
  🟡 WARN (5-7):    Navigation, Design, Dashboard, Typography, Multi-Currency, Forms, Accessibility
  🔴 FAIL (0-4):    Language System, Registration Experience, SEO
  ─────────────────────────────────────────────
  OVERALL: 5.1/10 — NOT PRODUCTION READY
```

### Top 5 Blockers (Fix Before Launch)

1. **Create `public/` directory** with favicon, OG image, robots.txt, sitemap.xml — 4 404s on every page load
2. **Fix LoginPage empty catch block** — users currently get zero feedback on failed login
3. **Add react-helmet-async** for per-route titles and meta tags
4. **Add missing translation keys** — 20+ keys show raw text in non-English languages
5. **Fix RTL CSS** — Arabic layout is currently broken; add Tailwind `rtl:` variants

### Deferred (Post-Launch)

- Multi-step registration flow (nice-to-have, current single-step works)
- SSR / SSG (major architectural change)
- Real-time currency exchange rate API (hardcoded rates acceptable for launch)
- Swiss Ephemeris integration (current pure JS is accurate enough)
- PWA manifest / service worker
