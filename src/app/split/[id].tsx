import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Card, Display, Label, Row, Screen, success } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/catalog';
import { GROUP_BY_ID } from '@/data/groups';
import { SPLIT_BY_ID } from '@/data/splits';
import { WEEKDAY_NAMES } from '@/lib/dates';
import { splitDayDraft } from '@/lib/draft';
import { pickExercisesForDay } from '@/lib/recommend';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { useSession } from '@/store/session';
import { colors } from '@/theme';

export default function SplitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const split = SPLIT_BY_ID[id];
  const profile = useProfile((s) => s.profile)!;
  if (!split) return null;

  const isActive = profile.activeSplitId === split.id;
  const nextIdx = isActive ? profile.splitDayIndex % split.days.length : 0;
  const days = [...profile.days].sort((a, b) => a - b);
  const equip = { location: profile.location, equipment: profile.equipment };

  const start = (dayIndex: number) => {
    useSession.getState().setDraft(splitDayDraft(profile, useHistory.getState().workouts, split.id, dayIndex));
    router.push('/plan');
  };

  return (
    <Screen edges={['bottom']}>
      <View style={{ gap: 6 }}>
        {isActive ? <Label color={colors.accent}>Your current split</Label> : <Label>{split.days.length} days a week</Label>}
        <Display size={44}>{split.name}</Display>
        <Body color={colors.muted}>{split.blurb}</Body>
      </View>

      {!isActive ? (
        <Button
          title="Use this split"
          icon="checkmark"
          onPress={() => {
            useProfile.getState().update({ activeSplitId: split.id, splitDayIndex: 0 });
            success();
          }}
        />
      ) : null}

      {split.days.map((d, i) => {
        const exIds = pickExercisesForDay(d.groups, equip);
        const weekday = days.length ? WEEKDAY_NAMES[days[i % days.length]] : null;
        const isNext = isActive && i === nextIdx;
        return (
          <Card key={i} style={{ borderWidth: 1.5, borderColor: isNext ? colors.accent : 'transparent' }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Label color={isNext ? colors.accent : colors.muted}>
                Day {i + 1}
                {weekday ? ` · ${weekday}` : ''}
                {isNext ? ' · Up next' : ''}
              </Label>
            </Row>
            <Display size={28}>{d.name}</Display>
            <Body size={13} color={colors.muted}>
              {d.groups.map((g) => GROUP_BY_ID[g].name).join(' · ')}
            </Body>
            <View style={{ gap: 4, marginVertical: 4 }}>
              {exIds.map((eid) => (
                <Row key={eid}>
                  <Ionicons name="ellipse" size={6} color={colors.accent} />
                  <Body size={14}>{EXERCISE_BY_ID[eid].name}</Body>
                </Row>
              ))}
            </View>
            <Button title="Start this day" icon="play" variant={isNext ? 'primary' : 'dark'} small style={{ alignSelf: 'flex-start' }} onPress={() => start(i)} />
          </Card>
        );
      })}
    </Screen>
  );
}
