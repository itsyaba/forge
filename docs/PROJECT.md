# FORGE — Workout Planner & Tracker

> Expo (Expo Go compatible) mobile app for people who want to work out but don't know
> what a workout looks like. The app tells them what to do, shows them how, and tracks
> their progress.

Status: v1 in development · Written 2026-11-08

---

## 1. Why this exists

The target user is a **beginner**. They want to train but don't know:

- which exercises work which muscle,
- what a single workout looks like (how many exercises, sets, reps, rest),
- how to perform a movement,
- whether they're making progress.

FORGE answers all four. It **decides for them by default** (recommended splits, exercises,
sets/reps/rest) but **never locks them in**: every recommendation can be edited.

### Success looks like

- A first-time user goes from install → doing their first set in under 2 minutes.
- During a workout they never have to wonder "what now?" — the screen always shows the
  current exercise, how to do it, which set they're on, and how long to rest.
- When they come back next week they see their past workouts, their streak, and the
  weights going up.

### Non-goals (v1)

- Accounts, login, cloud sync, social features.
- Nutrition / calorie tracking, wearables, Apple Health / Google Fit.
- Cardio/run tracking with GPS.
- AI coaching / chat.

### Anti-goals (would make this a failure even if it "works")

- Feeling intimidating or "for experts" — jargon without explanation, walls of numbers.
- Making a beginner type a lot before they can start.
- Losing logged workouts.
- Requiring a development build — **it must run in Expo Go**.

---

## 2. Decisions from the owner (the "what")

These came from the product owner during brainstorming:

1. **Onboarding** asks: gender, weight, free days to work out, and whether they go to a gym.
2. **Home** shows muscle groups (abs, glutes, chest, biceps, …) **and** recommended
   splits/groups of muscles built from the onboarding answers.
3. **Pick a muscle → list of exercises** for that muscle; user selects the ones they want.
4. **Start/Next → plan screen** listing chosen exercises with **recommended sets/reps**,
   all editable.
5. **During the workout**: animated demo of the exercise ("GIF"), **set counter**, and
   **rest timer**.
6. **Tracking**: past workouts and progress — **streaks** and **weights**.
7. **Visual style "A — Bold & loud"**: near-black background, neon-lime accent, big
   condensed poster-style uppercase headings. Gym energy.

## 3. Builder's calls (decided by Claude, owner can override)

Marked so the owner can review them.

| # | Call | Reasoning |
|---|------|-----------|
| C1 | App name **FORGE** (placeholder) | Short, fits the bold poster style. Rename in `app.json`. |
| C2 | **Local-only storage** (on device), no backend | Owner didn't ask for accounts; keeps v1 shippable in Expo Go. |
| C3 | Onboarding also asks **name, experience (never / a bit / regular), goal (build muscle / get stronger / lose fat / general fitness), units (kg/lb)**, and for home users **what equipment they own** | Needed to make sensible set/rep recommendations and filter exercises. All have defaults; skippable feel. |
| C4 | Free days are picked as **weekdays** (Mon–Sun chips), not just a number | Gives both "days per week" and a schedule, so Home can say *today's* workout. |
| C5 | Exercise data from **free-exercise-db** (Unlicense / public domain), bundled as JSON | 873 exercises with muscles, equipment, level, instructions and start/end photos. |
| C6 | "GIF" = **crossfading the 2 photos** (start/end position) of each exercise in a loop | The dataset has 2 frames per exercise; looping them reads like a GIF. Licensed GIF libraries require paid API keys. Images load from GitHub and are disk-cached by `expo-image`; first view needs internet. |
| C7 | Dataset filtered to strength/plyometrics/powerlifting, **no "expert" level**, no foam-roll/stretching | Beginner audience. |
| C8 | **Gender** only influences *which split is suggested first* (e.g. a glute & legs focused split ranks higher for women) — all splits always available | Owner asked for gender-based suggestions; avoid hiding options. |
| C9 | **Weight (body)** is used for a bodyweight-progress chart and an estimated calories figure on the workout summary | Owner listed weight in onboarding; this gives it a purpose. |
| C10 | **Streak = weekly streak**: consecutive weeks where you hit your weekly target days. The current week doesn't break the streak until it's over | Daily streaks punish rest days, which beginners need. |
| C11 | **Progressive overload hint**: when planning an exercise you've done before, sets prefill with last weight; if you hit all target reps last time, suggest +2.5 kg / +5 lb | This is what makes "weights going up" happen for a beginner. |
| C12 | 4 tabs: **Train · History · Progress · Profile** | Matches the three jobs: plan/do, look back, see progress, plus settings. |
| C13 | No reanimated/gesture libs in v1; RN `Animated` is enough | Fewer moving parts. |

---

## 4. User flows

### 4.1 Onboarding (first launch only)

One question per screen, huge type, progress bar, big lime "NEXT" button.

1. Name ("What should we call you?")
2. Gender: Male · Female · Prefer not to say
3. Body weight + unit toggle (kg / lb)
4. Experience: Never trained · A little · Regularly
5. Goal: Build muscle · Get stronger · Lose fat · General fitness
6. Free days: weekday chips (Mon … Sun). At least 1.
7. Where do you train: Gym · Home
8. (Home only) Equipment you have: None (bodyweight) · Dumbbells · Resistance bands · Kettlebell · Pull-up bar
9. "Your plan is ready" → shows the top suggested split → enter app.

All answers editable later in Profile.

### 4.2 Train (Home tab)

- Header: "LET'S TRAIN, {NAME}" + this-week strip (Mon–Sun dots: planned / done / today).
- **Today card** (if today is a planned day): the next day of the active split, e.g.
  "DAY 2 · LOWER BODY" → tap → plan screen prefilled.
- **Suggested splits** (horizontal cards): generated from days/week, goal, gender, gym/home.
  Tap → split detail (days and their muscle groups) → "Use this split" sets it as active,
  or tap a day to start it now.
- **Muscle groups** list (big uppercase rows with counts): Chest, Back, Shoulders, Biceps,
  Triceps, Abs, Glutes, Quads, Hamstrings, Calves.

### 4.3 Muscle → exercise picker

- Header: muscle name. List of exercises available to the user (equipment-filtered).
  Recommended ones first, marked "TOP PICK". Each row: thumbnail, name, equipment, level.
- Tap row body → exercise detail sheet (animated demo, instructions, muscles).
- Tap check → select. Sticky bottom button "NEXT (3)".
- User can add from more than one muscle: the selection persists in a draft workout;
  the plan screen has "+ ADD EXERCISE".

### 4.4 Plan screen (review before starting)

- List of chosen exercises. Each expands to its sets: rows of `reps × weight`.
- Recommended values prefilled (see §6). Edit with steppers / numeric inputs.
- Add / remove set, remove exercise, add exercise, rest time per exercise.
- "START WORKOUT".

### 4.5 Active workout

- Top: "1 / 3 · GLUTES", elapsed time, ✕ (finish/discard).
- Exercise name (huge), animated demo, "HOW TO" toggle for instructions.
- Set progress bars. Current set: reps & weight steppers (prefilled from plan).
- "SET DONE" → logs the set → **rest timer** starts (big lime countdown, +15s, SKIP).
  Haptic + vibration when rest ends. Timer is timestamp-based so it survives
  backgrounding.
- After last set → next exercise. After last exercise → summary.
- Screen kept awake during workout.
- Workout in progress survives app restart (persisted).

### 4.6 Summary

Duration, sets done, total volume, est. calories, **PRs** (new best weight per exercise),
streak status. "SAVE" (already saved; this just closes) → History.

### 4.7 History tab

Past workouts, newest first, grouped by week. Row: date, title (e.g. "GLUTES" or split
day name), duration, sets, volume. Tap → detail with every set. Delete workout.

### 4.8 Progress tab

- **Weekly streak** (big number) + best streak.
- Totals: workouts, sets, volume.
- **Last 12 weeks heatmap** (workout days).
- **Exercise progress**: pick an exercise you've logged → line chart of best weight per
  session + PR.
- **Body weight**: line chart + "LOG WEIGHT".

### 4.9 Profile tab

Edit onboarding answers, units, active split, reset all data.

---

## 5. Data

### 5.1 Exercise catalogue (static, bundled)

`src/data/exercises.json` generated by `scripts/build-exercises.mjs` from free-exercise-db.

```ts
type Exercise = {
  id: string;               // "Barbell_Hip_Thrust"
  name: string;
  equipment: Equipment;     // "barbell" | "dumbbell" | "body only" | ...
  level: 'beginner' | 'intermediate';
  mechanic: 'compound' | 'isolation' | null;
  primary: Muscle[];        // dataset muscles
  secondary: Muscle[];
  instructions: string[];
  images: string[];         // relative paths; base URL prepended at runtime
};
```

### 5.2 App muscle groups → dataset muscles

| Group | Dataset muscles |
|---|---|
| Chest | chest |
| Back | lats, middle back, lower back, traps |
| Shoulders | shoulders |
| Biceps | biceps |
| Triceps | triceps |
| Abs | abdominals |
| Glutes | glutes (primary) + compound moves with glutes as secondary (squats, lunges, RDLs) |
| Quads | quadriceps |
| Hamstrings | hamstrings |
| Calves | calves |

Each group has a curated **top picks** list (well-known beginner-friendly moves) in
`src/data/groups.ts`; the picker shows those first, and the recommender only draws from them.

### 5.3 Equipment filter

- Gym: everything except `foam roll`, `other`.
- Home: `body only` + `null` always; plus `dumbbell`, `bands`, `kettlebells` per owned
  equipment; pull-up bar unlocks `Pullups`, `Chin-Up`.

### 5.4 Persisted user state

```ts
Profile { name, gender, bodyWeight, unit: 'kg'|'lb', experience, goal,
          days: number[] /*0=Mon..6=Sun*/, location: 'gym'|'home',
          equipment: HomeEquipment[], activeSplitId?, splitDayIndex, createdAt }

PlannedSet   { reps: number; weight: number }           // weight in profile unit
PlannedExercise { exerciseId; sets: PlannedSet[]; restSec: number }
DraftWorkout { title; exercises: PlannedExercise[]; source: {type:'muscle'|'split', id} }

LoggedSet    { reps; weight; done: boolean; completedAt?: number }
ActiveWorkout { id; title; startedAt; exercises: {exerciseId; restSec; sets: LoggedSet[]}[];
                cursor: {ex: number; set: number}; restEndsAt?: number }

Workout (history) { id; title; startedAt; endedAt; exercises: same as Active (done sets only); }

BodyWeightEntry { date: string /*YYYY-MM-DD*/; weight: number }
```

Stored with **zustand + persist** over `expo-sqlite/kv-store` (key-value on SQLite,
works in Expo Go). Stores: `profile`, `workouts` (history + body weight), `session`
(draft + active workout). *Future:* if history gets large, migrate history to real
SQLite tables.

---

## 6. Recommendation rules

### 6.1 Sets / reps / rest

| Goal | Compound | Isolation | Rest (compound / isolation) |
|---|---|---|---|
| Build muscle | 3 × 10 | 3 × 12 | 90s / 60s |
| Get stronger | 4 × 6 | 3 × 10 | 150s / 90s |
| Lose fat | 3 × 12 | 3 × 15 | 60s / 45s |
| General fitness | 3 × 10 | 3 × 12 | 75s / 60s |

- Experience "Never trained": max 3 sets, reps +2 (lighter, more practice), rest +15s.
- Bodyweight exercises: weight 0, reps as above (planks etc. treated as reps = seconds is
  out of scope; they show as reps).
- Starting weight: last logged weight for that exercise, else 0 (user enters it).
- Progressive overload (C11): if every set last session hit target reps → +2.5 kg / +5 lb
  (not for bodyweight).

### 6.2 Exercises per workout

- Single-muscle workout (from picker): what the user chose.
- Split day: for each muscle group in the day, take N top picks available with the user's
  equipment (N = 2 for big groups, 1 for small; total 4–6 exercises), compound first.

### 6.3 Splits

| Days/week | Suggested (order) |
|---|---|
| 1–2 | Full Body A/B |
| 3 | Full Body A/B/C · Glutes & Legs focus (3 day) · Push/Pull/Legs |
| 4 | Upper/Lower ×2 · Glutes & Legs focus (4 day) · Full Body ×4 |
| 5 | Upper/Lower/Push/Pull/Legs · PPL + Upper/Lower |
| 6–7 | Push/Pull/Legs ×2 |

Female → Glutes & Legs focus moves to first position (C8). Days of a split map onto the
user's chosen weekdays in order. "Today's workout" = active split day for today's weekday;
otherwise "Rest day — or pick a muscle".

---

## 7. Visual system (Style A)

| Token | Value |
|---|---|
| bg | `#0B0B0B` |
| surface | `#151515` |
| surfaceHigh | `#1F1F1F` |
| border | `#262626` |
| text | `#F2F2F2` |
| muted | `#8A8A8A` |
| accent (lime) | `#D4FF3A` |
| onAccent | `#0B0B0B` |
| danger | `#FF5A4E` |

- Display font **Anton** (uppercase headings, numbers, buttons).
- Body font **Archivo** (400/600/800).
- Primary buttons: lime pill, black Anton text. Cards: surface with 16–20 radius.
- Lime is reserved for "go/current/done" — don't paint everything lime.
- Icons: Ionicons via `@expo/vector-icons`.
- Haptics on: select, set done, rest over, finish.

---

## 8. Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 58, React Native 0.88, React 19.3, TypeScript |
| Runtime target | **Expo Go** (no custom native code) |
| Navigation | Expo Router (file-based, `src/app/`), JS Tabs + Stack |
| State | zustand + persist |
| Storage | expo-sqlite/kv-store |
| Images | expo-image (disk cache) |
| Fonts | @expo-google-fonts/anton, @expo-google-fonts/archivo |
| Feedback | expo-haptics, expo-keep-awake |
| Charts | react-native-svg, hand-rolled line/heatmap |
| Tests | jest-expo for pure logic (`src/lib`) |

### Folder layout

```
src/
  app/                    # routes only
    _layout.tsx           # fonts, theme, onboarding gate
    onboarding.tsx
    (tabs)/_layout.tsx, index.tsx, history.tsx, progress.tsx, profile.tsx
    muscle/[id].tsx       # exercise picker
    exercise/[id].tsx     # exercise detail (modal)
    split/[id].tsx        # split detail
    plan.tsx              # review & edit draft
    workout.tsx           # active workout
    summary/[id].tsx
    history/[id].tsx
  components/             # UI kit (Button, Text, Card, Stepper, ExerciseDemo, charts…)
  data/                   # exercises.json, groups.ts, splits.ts
  lib/                    # pure logic: recommend.ts, splits.ts, stats.ts, dates.ts, units.ts
  store/                  # zustand stores
  theme.ts
scripts/build-exercises.mjs
```

---

## 9. Build order

1. Scaffold, deps, theme, fonts, router skeleton, tabs.
2. Exercise data script + groups + equipment filter.
3. Stores + onboarding.
4. Pure logic (recommendations, splits, streaks, stats) with unit tests.
5. Train tab, muscle picker, exercise detail, split detail.
6. Plan screen.
7. Active workout + rest timer + summary.
8. History, Progress (charts), Profile.
9. Typecheck, lint, tests, `expo-doctor`, run in Expo Go.

## 10. Later (not v1)

- Accounts & cloud backup, export/import.
- Real GIF/video demos (licensed library), offline image pack.
- Time-based exercises (planks in seconds), supersets, warm-up sets.
- Reminders/notifications on planned days.
- Body measurements, photos.
- Custom exercises.

## 11. Status (v1 build, 2026-11-08)

Steps 1–8 of the build order are done. Checks: `npm run typecheck` 0 errors, `npx eslint src` 0 problems, `npm test` 23/23, `expo-doctor` 20/20, and `expo export` bundles for Android and iOS.

Walked through end to end in the web preview, running in the emulator's Chrome:
- onboarding
- suggested split
- muscle picker
- plan with recommended sets/reps
- active workout: demo, set counter, rest timer, weight carry-forward, "up next"
- finish and summary
- History, Progress (heatmap, strength, body weight) and Profile

Not yet run inside Expo Go 58 on a device.

### Known limitations / notes for the next builder
- **Images need internet the first time.** They load from the jsDelivr CDN (`cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main`), fall back to raw.githubusercontent.com on error, and are then disk-cached by expo-image. The demo shows a spinner while loading and a tap-to-retry state if both hosts fail. The plan screen prefetches every photo in the workout so the active workout screen is instant.
- **Some groups need gear at home.** Home users with no equipment have no bodyweight biceps moves, and no calves options without a pull-up bar. The picker shows a "Needs some gear" empty state that links to Profile.
- **The Glutes list is long (~98 moves).** It includes plyometric drills through the `secondaryCompound` rule. Top picks are pinned first, so this is cosmetic; a future trim is fine.
- **The rest timer is foreground-only.** No notification fires when the app is backgrounded; the timer catches up on return because it is timestamp-based.
- **There is no unit conversion.** Switching kg/lb in Profile only relabels; logged numbers are not converted.
- **Web preview only:** `storage.web.ts` swaps SQLite for localStorage, and `Alert` button dialogs (end-workout X menu, delete, reset) do nothing on react-native-web. Native is the target; web is just for quick visual checks.
- **The Train tab shows a "Today · Done" card** once a workout has been logged today. It still offers the next split day as a secondary button.
