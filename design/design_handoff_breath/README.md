# Handoff: Breath — Gift-a-Breath Mobile App

## Overview
Breath is a contemplative mobile app rooted in the Hindu/Vedic and Tibetan Buddhist teaching that every being is born with a fixed number of breaths. It has two connected parts: a passive lock-screen countdown widget, and a "gift a breath" feature that lets someone spend one of their own remaining breaths to silently let another person know they were thought of — no reply required, no conversation started. A distinct one-to-one flow lets a verified public figure gift exactly one breath to exactly one fan.

Tone: contemplative, warm, never anxiety-inducing. Never competitive (no comparing counts, no streaks, no leaderboards). Every "decline" option (just smile, done, exit preview) gets equal visual weight to the "accept" options.

## About the Design Files
The files in this bundle are **design references created in HTML** (`Breath.dc.html`) — high-fidelity prototypes showing intended look, copy, and interaction, not production code to copy directly. The task is to recreate these designs in the target codebase's environment (native iOS/SwiftUI, native Android/Compose, React Native, or whatever the app already uses) using its established patterns and libraries — or choose the most appropriate framework if none exists yet.

`Breath.dc.html` is interactive — open it in a browser to click through the real flow and confirm exact behavior/copy before building.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are final. Recreate pixel-close using native equivalents (e.g. SwiftUI `Text`/`VStack` instead of the HTML divs), not a WebView embed of the HTML.

## Design System — "Broadsheet"
All visuals follow the attached **Broadsheet** design system (`design-system/` folder: `styles.css` token sheet + component classes, `readme.md` full guide). It's a newsprint-for-the-web aesthetic: near-black Source Serif 4 set on paper white, with cyan and magenta as small, deliberate process-ink accents (no third color mixed into one small component; no dark surfaces except the one deliberate exception below).

Key tokens (see `design-system/styles.css` for the full ramp):
- `--color-bg` `#f3f2f2` (paper), `--color-text` `#201e1d`
- `--color-accent` (cyan) `#0088b0`, tint `--color-accent-100` `#e9f8ff`
- `--color-accent-2` (magenta) `#d6006c`, tint `--color-accent-2-100` `#fff1f4`
- `--color-process-yellow` `#edbb00` (print-treatment only, never UI chrome)
- `--font-heading` / `--font-body`: Source Serif 4 (true italic for quotes/wordmark, never synthesized oblique)
- Radius: 2px (`--radius-md`) small controls, 4-6px large cards — sharp/newsprint, not pill-shaped
- Spacing scale 1.25× density (5/10/15/20/30/40px steps)

**Deliberate exception:** the lock-screen preview uses a dark ground (`#2d2b2b`, the design system's own darkest neutral ramp step) instead of paper. This is the one screen simulating OS-level lock-screen chrome at night; every in-app screen stays on paper per the system's "no dark surfaces" rule.

**Signature treatment used:** the home screen's big breath count uses the system's `.cmyk-num` plate-numeral construction — the digits rendered as three misregistered, multiply-blended color plates (cyan/magenta/yellow) over the paper ground, producing the newsprint mis-registration effect. Reference `design-system/readme.md` → "Components" → `.cmyk-num`, and `design-system/styles.css` for the exact CSS construction (a `.paper` accessibility span + three absolutely-positioned `.plate` spans, each with a small em-scaled offset).

## Screens

### 1. Onboarding (3 steps, dot indicator)
- Step 1: "Breath" italic serif wordmark; headline "Every being is born with a fixed number of breaths."; two paragraphs on the Vedic/Tibetan Buddhist roots and how Breath borrows that practice.
- Step 2: headline "the problem is we think we have time." — the Buddha (verbatim, lowercase as given); tinted callout: "Your count is a contemplative estimate, not a medical or actuarial prediction. It is a device for attention, not a diagnosis."
- Step 3: headline "Say it without saying anything."; two paragraphs introducing gifting as the emotional core — it costs the sender a breath, no thread, no reply expected.
- Full-width dark pill-free (2px radius) button, "Continue" → "Begin" on the last step, advances to Home.
- Background: light gradient `linear-gradient(175deg, #f6f3ee 0%, #ece7de 100%)`.

### 2. Home
- Header: italic "Breath" wordmark left, gear icon (settings) right, both plain inline SVG.
- Big ring: SVG circular progress (day elapsed) around the day's remaining-breath count, rendered with the `.cmyk-num` plate-numeral treatment described above. Label below: "breaths remaining today" (small-caps), then muted "a contemplative estimate, not a prediction".
- "gift a breath" section: instruction "hold a name to send — it costs you one of your own"; a list of contact rows (Mom, Dad, Wife, Sister, Brother, Friend), each with a circular avatar placeholder + name. Rows use a **hold-to-send gesture** (pointerdown starts a ~1s fill animation in cyan tint sweeping left→right behind the row; releasing early cancels and resets; completing the hold sends the gift).
- Footer link: "preview lock screen" (cyan, underlined) — jumps to the Lock Screen preview screen.

### 3. Sent confirmation
- Centered: pulsing cyan circle icon, "You gave {name} a breath.", reassurance line "No reply needed. They'll simply know you were thinking of them."
- Before → after count, small, with an arrow between (e.g. "9,015 → 9,014") — secondary to the message, never a lone large number.
- Primary button "share this moment" → Shareable Card. Secondary equal-weight text link "done" → Home.

### 4. Lock screen widget (preview)
- Dark ground `#2d2b2b` (the one dark-surface exception — simulates OS lock screen). Small "← exit preview" link top-left.
- Mock time/date ("9:41" / "Friday, September 6" — placeholder values, wire to real device time in production).
- Large ambient number: today's remaining breath count (plain — no plate-numeral treatment here, since multiply-blend plates require a light ground). Small-caps label "breaths remaining today" with a single 6px cyan dot that pulses very slowly (5s ease-in-out) beside it — the only animation, no badges, no urgency styling.
- Below: one quiet incoming-gift card (translucent dark surface, hairline border) — avatar + "mom — used one of her breaths thinking of you", tappable → Receiving screen. No unread badge.

### 5. Receiving a gift
- Full-screen, light gradient background. Large avatar, sender name ("Mom"), line "used one of their breaths thinking of you", timestamp ("2 minutes ago").
- Italic reassurance line "no reply needed" in accent color.
- Two **equal-weight** outlined buttons side by side: "just smile" and "breathe one back" — identical styling (same border, same weight) so neither reads as the "correct" choice. "just smile" returns to Home with no further action; "breathe one back" sends a breath back (routes through the Sent-confirmation flow).

### 6. Shareable card (portrait, story-format)
- A 9:16 card (mounted inside the phone canvas at 280px wide in the prototype — export/design at 1080×1920 for real story dimensions) with the same light gradient background as onboarding.
- Sender avatar, line "spent a breath thinking of you", before → after count (small, secondary, with an arrow), small italic "breath" wordmark at the bottom — minimal branding, no other logo elements.
- Below the card: a "save image" action and a "done" link back to Home.

### 7. Celebrity / public-figure flow (distinct persona, reached via the "public figure" preview toggle in this prototype — in production this is the account type of a verified user, not a UI toggle)
- Celebrity Home: "Breath" wordmark with a small verified-badge glyph; tagline "one to one, not one to a million" in magenta.
- "choose one fan" section — same hold-to-send row list, but the copy makes explicit this is a single, one-time, one-to-one gesture ("hold a name — you can give this once"). No multi-select, no broadcast option exists in this screen by construction.
- Celebrity Sent confirmation: "You gave {name} a breath.", "One fan. One breath. No thread to follow up." → share.
- Celebrity Shareable card: same card construction as #6, but the line reads "{Name} gave a fan a breath", and includes the "one to one, not one to a million" tagline in magenta beneath the before/after count.

### 8. Settings
- Back chevron (inline SVG) + "Settings" title.
- "Privacy" section: a plain, unremarkable block list (matches standard messaging-app patterns — no special "mute" language near gifting) — each row shows a name and a Block/Unblock text action in accent/magenta.
- "replay onboarding" text link at the bottom.

## Interactions & Behavior
- **Hold-to-send gesture** (Home contact rows, Celebrity fan rows): `pointerdown` starts a ~900ms fill (33ms tick, +3.3%/tick); the row's background fills left-to-right in a light cyan/magenta tint. `pointerup`/`pointerleave` before completion cancels and resets to 0 instantly. On completion: deduct 1 from the day's remaining-breath count, snapshot before/after values, navigate to the Sent-confirmation screen.
- **Countdown ticking**: the day's remaining-breath count decrements by 1 every 1 second (illustrative pacing for the prototype — production should tick at a battery-reasonable interval, e.g. once a minute or on foreground, and reset at local midnight).
- **Lock-screen pulse dot**: opacity 0.35↔1, scale 0.9↔1, 5s ease-in-out infinite — the only animation on that screen.
- **Onboarding step dots**: filled dark for the current step, 20%-opacity for others.
- No animation exceeds ~1s except the two explicitly slow ambient ones above (pulse dot, and the confirmation icon's slow pulse). The design is deliberately still — no streak counters, no progress badges beyond the single day-ring.

## State Management
State needed: `screen` (current view), `onboardStep` (0–2), `previewMode` ('personal' | 'celebrity' — in production this is the account's verified status, not client state), `dailyBreathsRemaining` (int, ticks down, resets daily), `holdingId` + `holdProgress` (transient gesture state), `sentName` + `snapshotBefore` + `snapshotAfter` (captured at the moment a gift is sent, used by both the Sent-confirmation and Shareable-card screens), `blockedContacts` (list with per-row blocked boolean).

Starting daily count in the prototype: 9,015 (illustrative — production should derive this from a real breathing-rate/day-length estimate, consistent with the "contemplative estimate, not medical prediction" framing used throughout the copy).

## Design Tokens
See `design-system/styles.css` for the authoritative token sheet (colors, ramps, spacing, radius, shadows). Do not hand-roll new colors or spacing values outside that file.

## Assets
No photographic assets. All avatars in the prototype are placeholder image-slots (a drag-and-drop image placeholder component) — production should wire these to real profile photos. All icons (gear, chevron, verified badge) are simple hand-drawn inline SVG in the prototype; production should substitute Phosphor icons (duotone weight) per the design system's icon guidance, or the platform's native icon set.

## Files
- `Breath.dc.html` — the full interactive prototype covering all 8 screens above. Open in a browser to click through.
- `design-system/styles.css` — Broadsheet design tokens and component CSS (source of truth for all colors/type/spacing).
- `design-system/readme.md` — full Broadsheet design system guide, including the `.cmyk-num` plate-numeral construction referenced above.
