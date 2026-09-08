# EAS Build setup

`eas.json` and the `build:*`/`submit:*` npm scripts are ready to go. This is what's left to actually run a build — none of it can be done without your own Expo/Apple/Google accounts, so it's on you, but here's the exact sequence.

## 1. One-time account setup

1. Create a free [Expo account](https://expo.dev/signup) if you don't have one.
2. `npx eas login` — log in from this project directory.
3. `npx eas init` — links this project to your Expo account, creates a project on expo.dev, and writes the project ID into `app.json` automatically (an `extra.eas.projectId` field will appear — don't add it by hand, let this command do it).

## 2. Set environment variables for cloud builds

`.env` is gitignored on purpose (it's not supposed to be committed), which means EAS's cloud build servers won't see it. You need to register the two `EXPO_PUBLIC_*` values as **EAS environment variables** instead — these are safe to expose since they're the anon/public Supabase credentials, the same ones already shipped in the app bundle today:

```bash
npx eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://hdczeymspzbnypvuzojx.supabase.co" --environment production --environment preview --environment development
npx eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<your anon key from .env>" --environment production --environment preview --environment development
```

(`SUPABASE_SERVICE_ROLE_KEY` does **not** need to go here — it's only used by local scripts like `db:import-restaurants`, never by the app itself, and should never be added to EAS or committed anywhere.)

You can review/edit these later at [expo.dev](https://expo.dev) under your project's Environment Variables tab, or with `npx eas env:list`.

## 3. Run a build

```bash
npm run build:preview       # internal testing build (installable .apk / ad-hoc .ipa)
npm run build:production    # store-ready build (.aab / .ipa)
```

First run will also prompt you through iOS/Android credentials setup (signing certificates, keystores) — EAS can generate and manage these for you interactively, which is the easiest path if you don't already have your own.

## 4. Submit to the stores

Requires the paid developer accounts first (Apple $99/yr, Google $25 one-time — see the main roadmap). Once you have them:

```bash
npm run submit:ios
npm run submit:android
```

The first run of each will prompt for App Store Connect / Google Play credentials and save them into `eas.json`'s `submit` section for next time.

## What's already configured

- `eas.json` — `development` (dev-client, internal), `preview` (internal APK/ad-hoc), and `production` (store-ready, auto-incrementing build number) profiles.
- `.easignore` — excludes `scripts/`, `supabase/`, and `docs/` from the build upload (dev/admin tooling not needed in the app bundle).
- `app.json` — location permission trimmed to foreground-only (see the earlier fix); icon/splash are still Expo's generic defaults and need your own artwork before a real store submission.
