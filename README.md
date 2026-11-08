# FORGE

A workout planner and tracker for people who want to train but don’t know what a workout looks like yet.

Tell it your gender, weight, free days and whether you go to a gym. It suggests a split, lets you pick a muscle and its exercises, fills in sets, reps and rest for you, then walks you through the workout with a demo, a set counter and a rest timer. It tracks your history, weekly streak, lifts and body weight.

Built with Expo SDK 58 and Expo Router. It runs in Expo Go, and all data stays on the device.

## Run it

```bash
npm install
npx expo start      # scan the QR code with Expo Go (SDK 58)
```

## Install the APK

Every push to `main` builds an Android APK and publishes it as a [GitHub Release](https://github.com/itsyaba/forge/releases) (`v1.0.<build>`), with the commits since the last release as notes. Download the `.apk` on your phone and open it; Android will ask you to allow installs from your browser. The APK is signed with a debug key, so it is for sideloading, not the Play Store. The workflow is `.github/workflows/release.yml`.

## Scripts

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Jest) |
| `npm run build:exercises` | Rebuild `src/data/exercises.json` from free-exercise-db |

## Docs

[`docs/PROJECT.md`](docs/PROJECT.md) is the full product and technical write-up: goals, flows, data model, recommendation rules, visual system and known limitations.

## Credits

The exercise data and photos come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is in the public domain (Unlicense).
