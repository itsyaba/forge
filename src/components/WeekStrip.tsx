import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { addDays, dayKey, startOfWeek, WEEKDAY_SHORT, weekdayOf } from '@/lib/dates';
import type { Weekday } from '@/lib/types';
import { colors } from '@/theme';
import { Body } from './ui';

/** Mon–Sun dots: lime filled = trained, outlined = planned, ring = today. */
export function WeekStrip({ planned, trained, now = new Date() }: { planned: Weekday[]; trained: Set<string>; now?: Date }) {
  const start = startOfWeek(now);
  const todayIdx = weekdayOf(now);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {WEEKDAY_SHORT.map((label, i) => {
        const done = trained.has(dayKey(addDays(start, i)));
        const isPlanned = planned.includes(i as Weekday);
        const isToday = i === todayIdx;
        return (
          <View key={i} style={{ alignItems: 'center', gap: 6 }}>
            <Body size={12} weight="semi" color={isToday ? colors.accent : colors.muted}>
              {label}
            </Body>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? colors.accent : colors.surface,
                borderWidth: isToday ? 2 : isPlanned && !done ? 1.5 : 0,
                borderColor: isToday ? colors.accent : colors.faint,
              }}
            >
              {done ? (
                <Ionicons name="checkmark" size={18} color={colors.onAccent} />
              ) : isPlanned ? (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.muted }} />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
