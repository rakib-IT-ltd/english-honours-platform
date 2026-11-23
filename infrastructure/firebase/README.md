# Firebase

- `firebase.json` configures the **Firebase Auth Emulator** (port 9099) for local development and
  Codespaces: sign-up and sign-in work with no Firebase account, no keys and no internet service.
  Start it with `npx firebase-tools@14 emulators:start --only auth --project demo-ehp --config infrastructure/firebase/firebase.json`
  (`scripts/codespaces-dev.sh` does this for you). Emulator accounts are temporary.
- For real use, create a Firebase project, enable **Email/Password** sign-in, and set
  `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (web, public values) and
  `FIREBASE_PROJECT_ID` plus platform credentials on the API (server). Never commit service-account
  keys.
