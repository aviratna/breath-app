# Firebase backend

Project: `breath-17213` (Firestore in asia-southeast1, anonymous sign-in).

- `firestore.rules`: security rules. To deploy, paste them into Firebase console →
  Firestore Database → Rules → **Publish**.
- `rules.test.mjs`: checks what the rules allow and deny, run against the local emulator
  (needs Java): `npm install --legacy-peer-deps && npm run test:rules`
