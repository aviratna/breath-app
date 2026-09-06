# Breath

A contemplative mobile app rooted in the Hindu/Vedic and Tibetan Buddhist teaching
that every being is born with a fixed number of breaths.

Two connected parts:
- A passive lock-screen countdown showing the day's remaining breaths.
- **Gift a breath** — spend one of your own remaining breaths to silently let
  someone know you were thinking of them. No thread, no reply expected.
  A separate one-to-one flow lets a verified public figure gift exactly one
  breath to exactly one fan ("one to one, not one to a million").

Built with Expo (React Native). Design system: Broadsheet (Source Serif 4,
paper-white ground, cyan/magenta process-ink accents). See `/design` in the
repo root for the original Claude Design handoff this was built from.

## Run it

    npm install
    npx expo start

Scan the QR code with the Expo Go app (iOS/Android) to run it on your phone,
or press `i` / `a` in the terminal for a simulator.

## Structure

    src/
      theme/tokens.js       design tokens (colors, spacing, fonts)
      state/BreathContext.js  shared app state (count, contacts, gifting)
      components/            PlateNumber, HoldToSendRow
      screens/                the 7 screens (see design/design_handoff_breath/README.md)
