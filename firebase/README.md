# Invoice System Firebase Setup

## Firebase Project Setup
1. Go to https://console.firebase.google.com/ and create a new project.
2. Add a web app to your Firebase project and copy the config values.
3. Enable Authentication (Email/Password) in the Firebase Console.
4. Enable Firestore Database in production mode.
5. Download your service account key for admin SDK (for server-side use).

## Environment Variables
- Copy your Firebase config values into `.env.local` and `.env` as shown in the templates.
- Never commit real secrets to version control.

## Firestore Security Rules
- Use the provided `firebase/firestore.rules` file for strict, role-based access control.
- Deploy rules with:
  firebase deploy --only firestore:rules

## Next Steps
- Continue with UI and feature development in Next.js.
- Integrate Firebase Auth and Firestore using the provided config files.
