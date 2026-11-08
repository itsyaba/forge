import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { Body, Display, Screen, tap } from '@/components/ui';
import { GROUPS } from '@/data/groups';
import { colors } from '@/theme';

export default function AddExercise() {
  return (
    <Screen edges={['bottom']}>
      <Body color={colors.muted}>Which muscle?</Body>
      {GROUPS.map((g) => (
        <Pressable
          key={g.id}
          accessibilityRole="button"
          onPress={() => {
            tap();
            router.push({ pathname: '/muscle/[id]', params: { id: g.id, mode: 'add' } });
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Display size={26}>{g.name}</Display>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </Pressable>
      ))}
    </Screen>
  );
}
