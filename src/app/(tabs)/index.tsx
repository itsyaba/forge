import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { WeekStrip } from '@/components/WeekStrip';
import { Body, Button, Card, Display, Label, Row, Screen, tap } from '@/components/ui';
import { exercisesForGroup } from '@/data/catalog';
import { GROUP_BY_ID, GROUPS } from '@/data/groups';
import { splitDayDraft } from '@/lib/draft';
import { suggestSplits, todayPlan } from '@/lib/splits';
import { workoutDays, workoutOnDay } from '@/lib/stats';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { useSession } from '@/store/session';
import { colors, space } from '@/theme';

export default function Train() {
  const profile = useProfile((s) => s.profile)!;
  const workouts = useHistory((s) => s.workouts);
  const active = useSession((s) => s.active);

  const trained = useMemo(() => workoutDays(workouts), [workouts]);
  const splits = useMemo(() => suggestSplits(profile), [profile]);
  const today = todayPlan(profile);
  const doneToday = workoutOnDay(workouts);
  const equip = { location: profile.location, equipment: profile.equipment };
  const counts = useMemo(
    () => Object.fromEntries(GROUPS.map((g) => [g.id, exercisesForGroup(g.id, equip).length])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile.location, profile.equipment],
  );

  const startSplitDay = (splitId: string, dayIndex: number) => {
    useSession.getState().setDraft(splitDayDraft(profile, workouts, splitId, dayIndex));
    router.push('/plan');
  };

  return (
    <Screen>
      <View>
        <Display size={44}>Let’s train,</Display>
        <Display size={44} color={colors.accent}>
          {profile.name}
        </Display>
      </View>

      <WeekStrip planned={profile.days} trained={trained} />

      {active ? (
        <Card accent onPress={() => router.push('/workout')}>
          <Label color={colors.onAccent}>Workout in progress</Label>
          <Row style={{ justifyContent: 'space-between' }}>
            <Display size={28} color={colors.onAccent}>
              {active.title}
            </Display>
            <Ionicons name="play-circle" size={36} color={colors.onAccent} />
          </Row>
        </Card>
      ) : doneToday ? (
        <Card onPress={() => router.push(`/history/${doneToday.id}`)} style={{ borderWidth: 1.5, borderColor: colors.accent }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label color={colors.accent}>Today · Done</Label>
            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
          </Row>
          <Display size={30}>{doneToday.title}</Display>
          <Body color={colors.muted}>Nice work. Rest up — or add another session below if you’re feeling it.</Body>
          {today.kind !== 'none' ? (
            <Button
              title={`Also do ${today.split.days[profile.splitDayIndex % today.split.days.length].name}`}
              variant="ghost"
              small
              style={{ alignSelf: 'flex-start' }}
              onPress={() => startSplitDay(today.split.id, profile.splitDayIndex % today.split.days.length)}
            />
          ) : null}
        </Card>
      ) : today.kind === 'train' ? (
        <Card accent onPress={() => router.push(`/split/${today.split.id}`)}>
          <Label color={colors.onAccent}>
            Today · Day {today.dayIndex + 1} of {today.split.name}
          </Label>
          <Display size={34} color={colors.onAccent}>
            {today.day.name}
          </Display>
          <Body color={colors.onAccent} weight="semi">
            {today.day.groups.map((g) => GROUP_BY_ID[g].name).join(' · ')}
          </Body>
          <Button
            title="Start"
            icon="play"
            variant="dark"
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
            small
            onPress={() => startSplitDay(today.split.id, today.dayIndex)}
          />
        </Card>
      ) : today.kind === 'rest' ? (
        <Card>
          <Label>Today</Label>
          <Display size={28}>Rest day</Display>
          <Body color={colors.muted}>
            Recovery is where muscle grows. Feeling good? Pick a muscle below or start your next split day early.
          </Body>
          <Button
            title={`Do ${today.split.days[profile.splitDayIndex % today.split.days.length].name} now`}
            variant="ghost"
            small
            style={{ alignSelf: 'flex-start' }}
            onPress={() => startSplitDay(today.split!.id, profile.splitDayIndex % today.split!.days.length)}
          />
        </Card>
      ) : null}

      <View style={{ gap: space.md }}>
        <Label>Splits for you</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }} style={{ marginHorizontal: -space.lg }}>
          <View style={{ width: space.lg - space.md }} />
          {splits.map((s, idx) => {
            const isActive = s.id === profile.activeSplitId;
            return (
              <Card key={s.id} style={{ width: 230, borderWidth: 1.5, borderColor: isActive ? colors.accent : colors.border }} onPress={() => router.push(`/split/${s.id}`)}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Label color={isActive ? colors.accent : colors.muted}>{isActive ? 'Your split' : idx === 0 ? 'Best match' : `${s.days.length} days`}</Label>
                  <Ionicons name="arrow-forward" size={18} color={colors.muted} />
                </Row>
                <Display size={24}>{s.name}</Display>
                <Body size={13} color={colors.muted} numberOfLines={2}>
                  {s.blurb}
                </Body>
              </Card>
            );
          })}
          <View style={{ width: space.lg - space.md }} />
        </ScrollView>
      </View>

      <View>
        <Label style={{ marginBottom: space.xs }}>Or pick a muscle</Label>
        {GROUPS.map((g) => (
          <Pressable
            key={g.id}
            accessibilityRole="button"
            onPress={() => {
              tap();
              router.push(`/muscle/${g.id}`);
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Display size={30}>{g.name}</Display>
            <Row>
              <Body size={12} color={colors.muted}>
                {counts[g.id]} moves
              </Body>
              <Ionicons name="chevron-forward" size={18} color={colors.accent} />
            </Row>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
