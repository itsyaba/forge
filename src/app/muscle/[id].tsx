import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseThumb } from '@/components/ExerciseDemo';
import { Body, Button, Display, Label, tap } from '@/components/ui';
import { exercisesForGroup } from '@/data/catalog';
import { GROUP_BY_ID } from '@/data/groups';
import { muscleDraft, plannedFor } from '@/lib/draft';
import type { GroupId } from '@/lib/types';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { useSession } from '@/store/session';
import { colors, radius, space } from '@/theme';

export default function MusclePicker() {
  const { id, mode } = useLocalSearchParams<{ id: GroupId; mode?: 'add' }>();
  const group = GROUP_BY_ID[id];
  const profile = useProfile((s) => s.profile)!;
  const [selected, setSelected] = useState<string[]>([]);
  const list = useMemo(
    () => exercisesForGroup(id, { location: profile.location, equipment: profile.equipment }),
    [id, profile.location, profile.equipment],
  );

  if (!group) return null;

  const toggle = (exId: string) =>
    setSelected((s) => (s.includes(exId) ? s.filter((x) => x !== exId) : [...s, exId]));

  const next = () => {
    const history = useHistory.getState().workouts;
    if (mode === 'add') {
      useSession.getState().appendDraftExercises(plannedFor(profile, history, selected));
      router.dismissTo('/plan');
    } else {
      useSession.getState().setDraft(muscleDraft(profile, history, id, selected));
      router.push('/plan');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <Stack.Screen options={{ title: '' }} />
      <FlatList
        data={list}
        keyExtractor={(item) => item.exercise.id}
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.sm, paddingBottom: space.lg }}
        ListHeaderComponent={
          <View style={{ gap: 4, marginBottom: space.md }}>
            <Display size={52}>{group.name}</Display>
            <Body color={colors.muted}>
              Pick the exercises you want to do. Tap a name to see how it’s done.
            </Body>
          </View>
        }
        renderItem={({ item: { exercise: ex, topPick } }) => {
          const on = selected.includes(ex.id);
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.sm,
                borderRadius: radius.md,
                backgroundColor: on ? '#1a1f0a' : colors.surface,
                borderWidth: 1.5,
                borderColor: on ? colors.accent : 'transparent',
              }}
            >
              <Pressable
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md }}
                onPress={() => router.push(`/exercise/${ex.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`How to do ${ex.name}`}
              >
                <ExerciseThumb exercise={ex} />
                <View style={{ flex: 1, gap: 2 }}>
                  {topPick ? <Label color={colors.accent}>Top pick</Label> : null}
                  <Body weight="semi" numberOfLines={2}>
                    {ex.name}
                  </Body>
                  <Body size={12} color={colors.muted}>
                    {ex.equipment} · {ex.level}
                  </Body>
                </View>
              </Pressable>
              <Pressable
                hitSlop={12}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`Select ${ex.name}`}
                onPress={() => {
                  tap();
                  toggle(ex.id);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: on ? colors.accent : colors.faint,
                  backgroundColor: on ? colors.accent : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 4,
                }}
              >
                {on ? <Ionicons name="checkmark" size={20} color={colors.onAccent} /> : <Ionicons name="add" size={20} color={colors.muted} />}
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ gap: space.md, paddingTop: space.lg }}>
            <Display size={24}>Needs some gear</Display>
            <Body color={colors.muted}>
              There are no {group.name.toLowerCase()} exercises for bodyweight only. Add dumbbells, bands or a pull-up bar in
              Profile to unlock them.
            </Body>
            <Button title="Open profile" variant="ghost" small style={{ alignSelf: 'flex-start' }} onPress={() => router.navigate('/profile')} />
          </View>
        }
      />
      <View style={{ padding: space.lg, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
        {selected.length ? (
          <Button title={`${mode === 'add' ? 'Add' : 'Next'} (${selected.length})`} icon="arrow-forward" onPress={next} />
        ) : (
          <Body color={colors.muted} style={{ textAlign: 'center', paddingVertical: 14 }}>
            Tap + to add exercises
          </Body>
        )}
      </View>
    </SafeAreaView>
  );
}
