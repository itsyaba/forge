import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { Body, Button, Display, Row, Screen, Stat } from '@/components/ui';
import { WorkoutSets } from '@/components/WorkoutSets';
import { formatDate, formatDuration } from '@/lib/dates';
import { setCount, workoutVolume } from '@/lib/stats';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { colors } from '@/theme';

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = useHistory((s) => s.workouts.find((x) => x.id === id));
  const unit = useProfile((s) => s.profile!.unit);
  if (!w) return null;

  const remove = () =>
    Alert.alert('Delete workout?', 'This removes it from your history and stats.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          useHistory.getState().deleteWorkout(w.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen edges={['bottom']}>
      <View>
        <Body color={colors.muted}>{formatDate(w.startedAt)}</Body>
        <Display size={44}>{w.title}</Display>
      </View>
      <Row>
        <Stat value={formatDuration(w.endedAt - w.startedAt)} label="Time" />
        <Stat value={setCount(w)} label="Sets" />
        <Stat value={Math.round(workoutVolume(w)).toLocaleString()} label={`Volume ${unit}`} />
      </Row>
      <WorkoutSets exercises={w.exercises} unit={unit} />
      <Button title="Delete workout" variant="danger" small icon="trash-outline" onPress={remove} />
    </Screen>
  );
}
