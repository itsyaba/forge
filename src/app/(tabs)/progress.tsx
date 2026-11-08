import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Heatmap, LineChart } from '@/components/charts';
import { ExerciseThumb } from '@/components/ExerciseDemo';
import { Body, Button, Display, Row, Screen, success, tap } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/catalog';
import { addDays, dayKey, startOfWeek, WEEKDAY_SHORT, weekdayOf } from '@/lib/dates';
import { WEIGHT_STEP } from '@/lib/recommend';
import { exerciseSeries, loggedExerciseIds, setCount, weeklyStreak, workoutDays, workoutVolume } from '@/lib/stats';
import type { Weekday } from '@/lib/types';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { colors, fonts, radius, space } from '@/theme';

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;
/** Accepts a timestamp or a local `YYYY-MM-DD` day key. */
const shortDate = (d: number | string) => {
  const date = typeof d === 'number' ? new Date(d) : new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
const round1 = (n: number) => Math.round(n * 10) / 10;

type DayState = 'done' | 'planned' | 'missed' | 'rest';

/** This week's seven days, Monday first. */
function weekDays(planned: Weekday[], trained: Set<string>, now = new Date()) {
  const start = startOfWeek(now);
  const today = weekdayOf(now);
  return WEEKDAY_SHORT.map((label, i) => {
    const isPlanned = planned.includes(i as Weekday);
    const state: DayState = trained.has(dayKey(addDays(start, i)))
      ? 'done'
      : !isPlanned
        ? 'rest'
        : i < today
          ? 'missed'
          : 'planned';
    return { label, state, today: i === today };
  });
}

export default function Progress() {
  const workouts = useHistory((s) => s.workouts);
  const bodyWeights = useHistory((s) => s.bodyWeights);
  const profile = useProfile((s) => s.profile)!;
  const unit = profile.unit;
  const target = Math.max(1, profile.days.length);

  const trained = useMemo(() => workoutDays(workouts), [workouts]);
  const streak = useMemo(() => weeklyStreak(workouts, target), [workouts, target]);
  const week = useMemo(() => weekDays(profile.days, trained), [profile.days, trained]);
  const totals = useMemo(
    () => ({
      sets: workouts.reduce((n, w) => n + setCount(w), 0),
      volume: Math.round(workouts.reduce((n, w) => n + workoutVolume(w), 0)),
      since: workouts.length ? Math.min(...workouts.map((w) => w.startedAt)) : 0,
    }),
    [workouts],
  );

  const lifts = useMemo(
    () =>
      loggedExerciseIds(workouts)
        .map((id) => {
          const series = exerciseSeries(workouts, id).filter((p) => p.best > 0);
          if (!series.length || !EXERCISE_BY_ID[id]) return null;
          const best = Math.max(...series.map((p) => p.best));
          return { id, series, best, first: series[0].best, last: series[series.length - 1].at };
        })
        .filter((x): x is NonNullable<typeof x> => !!x)
        .sort((a, b) => b.last - a.last),
    [workouts],
  );
  const [openLift, setOpenLift] = useState<string | null>(null);
  const [showAllLifts, setShowAllLifts] = useState(false);
  const openId = openLift && lifts.some((l) => l.id === openLift) ? openLift : lifts[0]?.id;

  const currentWeight = bodyWeights.length ? bodyWeights[bodyWeights.length - 1].weight : profile.bodyWeight;
  const weightChange = bodyWeights.length > 1 ? round1(currentWeight - bodyWeights[0].weight) : null;
  const [bwText, setBwText] = useState('');
  const logWeight = () => {
    const n = parseFloat(bwText.replace(',', '.'));
    if (!(n > 20 && n < 700)) return;
    useHistory.getState().logBodyWeight(n);
    useProfile.getState().update({ bodyWeight: n });
    setBwText('');
    success();
  };

  // ── headline for the week: a sentence, not a scoreboard
  const left = target - streak.thisWeek;
  const headline =
    streak.thisWeek >= target
      ? ['Week', 'crushed.']
      : streak.thisWeek === 0
        ? [`${target} to go`, 'this week.']
        : [`${streak.thisWeek} down.`, `${left} to go.`];
  const streakLine =
    streak.current > 0
      ? `${streak.current}-week streak${streak.best > streak.current ? ` · best ${streak.best}` : ''}`
      : streak.best > 0
        ? `Hit ${target} this week to start a new streak · best ${streak.best}`
        : `Hit ${target} this week to start your streak`;

  return (
    <Screen>
      <Display size={48}>Progress</Display>

      {/* ── This week */}
      <View style={{ backgroundColor: colors.accent, borderRadius: radius.lg, padding: space.xl, gap: space.xl }}>
        <View>
          {headline.map((line) => (
            <Display key={line} size={52} color={colors.onAccent} style={{ lineHeight: 54 }}>
              {line}
            </Display>
          ))}
          {streak.thisWeek > target ? (
            <Body weight="semi" color={colors.onAccent} style={{ marginTop: space.xs }}>
              {streak.thisWeek} workouts. Everything past {target} is a bonus.
            </Body>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`${streak.thisWeek} of ${target} workouts done this week`}>
          {week.map((d, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  alignSelf: 'stretch',
                  height: 72,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: d.state === 'done' ? colors.onAccent : 'transparent',
                  borderWidth: d.state === 'planned' || d.state === 'missed' ? 2 : 0,
                  borderStyle: d.state === 'missed' ? 'dashed' : 'solid',
                  borderColor: d.state === 'missed' ? 'rgba(11,11,11,0.3)' : colors.onAccent,
                }}
              >
                {d.state === 'done' ? <Ionicons name="checkmark" size={22} color={colors.accent} /> : null}
                {d.state === 'rest' ? <View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: 'rgba(11,11,11,0.2)' }} /> : null}
              </View>
              <Body size={12} weight={d.today ? 'bold' : 'semi'} color={d.today ? colors.onAccent : 'rgba(11,11,11,0.6)'}>
                {d.today ? 'Today' : d.label}
              </Body>
            </View>
          ))}
        </View>

        <Row style={{ borderTopWidth: 1, borderTopColor: 'rgba(11,11,11,0.15)', paddingTop: space.lg }}>
          <Ionicons name="flame" size={18} color={colors.onAccent} />
          <Body weight="semi" color={colors.onAccent} style={{ flex: 1 }}>
            {streakLine}
          </Body>
        </Row>
      </View>

      {/* ── All-time tally */}
      {workouts.length ? (
        <View style={{ paddingTop: space.lg }}>
          <TallyLine value={workouts.length} word={workouts.length === 1 ? 'workout' : 'workouts'} />
          <TallyLine value={totals.sets} word={totals.sets === 1 ? 'set' : 'sets'} />
          <TallyLine value={totals.volume} word={`${unit} moved`} />
          <Body size={13} color={colors.muted} style={{ marginTop: space.sm }}>
            Since {shortDate(totals.since)}. Every set counts.
          </Body>
        </View>
      ) : (
        <Body color={colors.muted} style={{ paddingTop: space.sm }}>
          Finish your first workout and your totals start counting here.
        </Body>
      )}

      {/* ── Getting stronger */}
      <Section title="Getting stronger" aside={lifts.length ? plural(lifts.length, 'lift') : undefined}>
        {lifts.length ? (
          <View>
            {(showAllLifts ? lifts : lifts.slice(0, 5)).map((l) => {
              const ex = EXERCISE_BY_ID[l.id];
              const open = l.id === openId;
              const delta = round1(l.best - l.first);
              const sessions = l.series.length;
              return (
                <View key={l.id} style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    onPress={() => {
                      tap();
                      setOpenLift(l.id);
                    }}
                    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, opacity: pressed ? 0.7 : 1 })}
                  >
                    <ExerciseThumb exercise={ex} size={44} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Body weight="semi" numberOfLines={1}>
                        {ex.name}
                      </Body>
                      <Body size={12} color={colors.muted} numberOfLines={1}>
                        {sessions > 1
                          ? `${plural(sessions, 'session')} · started at ${l.first} ${unit}`
                          : `1 session · next time try ${l.best + WEIGHT_STEP[unit]} ${unit}`}
                      </Body>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Row gap={4} style={{ alignItems: 'baseline' }}>
                        <Display size={28}>{l.best}</Display>
                        <Body size={12} color={colors.muted}>
                          {unit}
                        </Body>
                      </Row>
                      {delta > 0 ? (
                        <Body size={12} weight="bold" color={colors.accent}>
                          +{delta} {unit}
                        </Body>
                      ) : null}
                    </View>
                  </Pressable>
                  {open && sessions > 1 ? (
                    <View style={{ paddingBottom: space.lg }}>
                      <LineChart values={l.series.map((p) => p.best)} suffix={` ${unit}`} height={140} />
                    </View>
                  ) : null}
                </View>
              );
            })}
            {lifts.length > 5 ? (
              <Button
                title={showAllLifts ? 'Show fewer' : `Show all ${lifts.length}`}
                variant="ghost"
                small
                style={{ alignSelf: 'flex-start', marginTop: space.md }}
                onPress={() => setShowAllLifts(!showAllLifts)}
              />
            ) : null}
          </View>
        ) : (
          <Body color={colors.muted}>
            Log a set with weight and it shows up here, with how much you’ve added since day one.
          </Body>
        )}
      </Section>

      {/* ── Consistency */}
      <Section title="Last 12 weeks" aside={trained.size ? plural(trained.size, 'day') + ' trained' : undefined}>
        <Heatmap days={trained} />
      </Section>

      {/* ── Body weight */}
      <Section title="Body weight">
        <View>
          <Row gap={6} style={{ alignItems: 'baseline' }}>
            <Display size={56}>{currentWeight}</Display>
            <Display size={24} color={colors.muted}>
              {unit}
            </Display>
          </Row>
          <Body size={13} color={colors.muted}>
            {weightChange === null
              ? 'Log it once a week to see your trend.'
              : weightChange === 0
                ? `No change since ${shortDate(bodyWeights[0].date)}.`
                : `${weightChange > 0 ? '+' : '−'}${Math.abs(weightChange)} ${unit} since ${shortDate(bodyWeights[0].date)}`}
          </Body>
        </View>
        {bodyWeights.length > 1 ? <LineChart values={bodyWeights.map((b) => b.weight)} suffix={` ${unit}`} height={120} /> : null}
        <Row>
          <TextInput
            value={bwText}
            onChangeText={setBwText}
            onSubmitEditing={logWeight}
            keyboardType="decimal-pad"
            placeholder={`Today’s weight (${unit})`}
            placeholderTextColor={colors.muted}
            accessibilityLabel="Today’s body weight"
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: fonts.bodySemi,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
              borderRadius: radius.pill,
              paddingHorizontal: 18,
              paddingVertical: 12,
            }}
          />
          <Button title="Log" small onPress={logWeight} disabled={!bwText.trim()} />
        </Row>
      </Section>
    </Screen>
  );
}

function TallyLine({ value, word }: { value: number; word: string }) {
  return (
    <Display size={44} style={{ lineHeight: 50 }} numberOfLines={1} adjustsFontSizeToFit>
      <Display size={44} color={colors.accent}>
        {value.toLocaleString()}
      </Display>{' '}
      {word}
    </Display>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: space.xl, paddingTop: space.xl, borderTopWidth: 1, borderTopColor: colors.border, gap: space.lg }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Display size={30}>{title}</Display>
        {aside ? (
          <Body size={13} color={colors.muted}>
            {aside}
          </Body>
        ) : null}
      </Row>
      {children}
    </View>
  );
}
