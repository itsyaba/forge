import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { SectionList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Body, Button, Card, Display, Empty, Label, Row } from '@/components/ui';
import { formatDate, formatDuration, startOfWeek, weekKey } from '@/lib/dates';
import { setCount, workoutVolume } from '@/lib/stats';
import type { Workout } from '@/lib/types';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { colors, space } from '@/theme';

function weekTitle(ts: number) {
  const thisWeek = weekKey(Date.now());
  const k = weekKey(ts);
  if (k === thisWeek) return 'This week';
  if (k === weekKey(Date.now() - 7 * 86_400_000)) return 'Last week';
  return `Week of ${startOfWeek(new Date(ts)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export default function History() {
  const workouts = useHistory((s) => s.workouts);
  const unit = useProfile((s) => s.profile!.unit);

  const sections = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => b.startedAt - a.startedAt);
    const map = new Map<string, { title: string; data: Workout[] }>();
    for (const w of sorted) {
      const k = weekKey(w.startedAt);
      if (!map.has(k)) map.set(k, { title: weekTitle(w.startedAt), data: [] });
      map.get(k)!.data.push(w);
    }
    return [...map.values()];
  }, [workouts]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(w) => w.id}
        contentContainerStyle={{ padding: space.lg, gap: space.sm, paddingBottom: space.xxl }}
        ListHeaderComponent={<Display size={48}>History</Display>}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Label style={{ marginTop: space.lg, marginBottom: space.xs }}>
            {section.title} · {section.data.length} workout{section.data.length === 1 ? '' : 's'}
          </Label>
        )}
        renderItem={({ item: w }) => (
          <Card onPress={() => router.push(`/history/${w.id}`)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Body size={12} color={colors.muted}>
                  {formatDate(w.startedAt)}
                </Body>
                <Display size={24}>{w.title}</Display>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Row>
            <Row gap={space.lg}>
              <Body size={13} color={colors.muted}>
                ⏱ {formatDuration(w.endedAt - w.startedAt)}
              </Body>
              <Body size={13} color={colors.muted}>
                {setCount(w)} sets
              </Body>
              <Body size={13} color={colors.muted}>
                {Math.round(workoutVolume(w)).toLocaleString()} {unit}
              </Body>
            </Row>
          </Card>
        )}
        ListEmptyComponent={
          <Empty
            title="No workouts yet"
            body="Your finished workouts will show up here."
            action={<Button title="Start training" small onPress={() => router.navigate('/')} />}
          />
        }
      />
    </SafeAreaView>
  );
}
