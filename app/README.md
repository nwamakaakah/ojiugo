# ọjịugo — mobile app

Expo (SDK 58) + expo-router + Supabase. Screens live in `src/app`, design tokens (seasons × daylight/lamplight) in `src/theme/tokens.ts`.

## Run it

```bash
npm install
npx expo start          # press i (iOS simulator), a (Android) or scan the QR with Expo Go
npx expo start --web    # browser preview
```

Without Supabase keys the app runs in **demo mode**: accounts are saved on the device only and the password-reset code is `123456`.

## Connect Supabase

1. Create a project at supabase.com → Project Settings → API.
2. Make a `.env` file in this folder:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Authentication → Email templates → "Reset password": include `{{ .Token }}` so the email carries the 6-digit code the app asks for.
4. Restart `npx expo start`.

Name and country are stored in the user's `user_metadata`.

## Ship to the stores (EAS)

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p ios --profile production      # needs Apple Developer account ($99/yr)
eas build -p android --profile production  # needs Google Play Console ($25 once)
eas submit -p ios
eas submit -p android
```

- Bundle id / package: `com.ojiugo.app` (change in `app.json` before the first build — it can't change later).
- Google Play personal accounts must run a closed test with 12 testers for 14 days before production.
- Replace `assets/images/icon.png`, `splash-icon.png` and the Android icons with the ọjịugo artwork.

## Built so far

welcome · sign up (with validation) · log in · country picker (sets the season) · loading · reset password → verify code → new password → all set · entries (empty state + tab bar) · me (season + daylight/lamplight switch, sign out — temporary until the Profile designs are built).

Next: quick scribble / diary entry, entries list, flocks, calls, profile, theme picker.
