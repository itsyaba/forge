# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users
Beginners who want to start working out but don’t know what a workout looks like: which exercises hit which muscle, how many sets, reps and how much rest, how to do a movement, or whether they’re improving. They open the app on their phone at the gym or at home, often mid-session, one-handed, between sets.

## Product Purpose
FORGE decides for the user by default (split, exercises, sets/reps/rest, next weight) and never locks them in; every recommendation is editable. Success: install → first set in under two minutes; during a workout they never wonder “what now?”; a week later they see their past workouts, their streak and their weights going up.

## Positioning
A coach that makes the decisions a beginner can’t yet make, built from four onboarding answers (gender, body weight, free days, gym or home), then teaches by doing: demo, set counter and rest timer for every move.

## Operating Context
Used in the gym or at home, often sweaty, between sets, phone in one hand. Progress and History are checked after a workout or at the start of a week. Profile is visited rarely, to change training days, location, equipment, goal or units.

## Capabilities and Constraints
- Must run in Expo Go (SDK 58); no development build and no native modules outside Expo Go.
- All data is local on the device; there are no accounts, sync or backend.
- Tracking: workout history, a weekly streak (weeks hitting the weekly day target; rest days never break it), per-exercise best weight over time, body-weight log, totals, 12-week activity grid, personal records.
- Profile settings: name, gender, body weight, units (kg/lb, no conversion of logged data), experience, goal, training weekdays, gym or home, home equipment, active split, reset all data.
- Exercise photos stream from free-exercise-db (public domain) and need internet on first view.
- Non-goals: nutrition, wearables, GPS cardio, social, AI chat.

## Brand Commitments
- Name FORGE (placeholder, owner may rename).
- Owner-chosen visual style “A — Bold & loud”: near-black ground, neon-lime accent, big condensed uppercase poster type (Anton display, Archivo body). Gym energy.
- Anti-goals: feeling intimidating or “for experts”, jargon or walls of numbers, making a beginner type a lot before they can start, losing logged workouts.

## Evidence on Hand
Real exercise data and photos from free-exercise-db (src/data/exercises.json). There are no testimonials, user counts or ratings; never fabricate them.

## Product Principles
1. Decide by default, never lock in.
2. Always answer “what now?” before showing anything else.
3. Encourage, don’t judge: progress is framed as momentum, never as failure.
4. Numbers must mean something to a beginner, or be explained.
