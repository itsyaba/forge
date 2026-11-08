import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { Body, Button, Card, Chip, Display, IconButton, Label, Option, ProgressBars, Row, Screen, success } from '@/components/ui';
import { WEEKDAY_NAMES } from '@/lib/dates';
import { suggestSplits } from '@/lib/splits';
import type { Experience, Gender, Goal, HomeEquipment, Location, Unit, Weekday } from '@/lib/types';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { colors, fonts, radius } from '@/theme';

type Answers = {
  name: string;
  gender: Gender | null;
  bodyWeight: string;
  unit: Unit;
  experience: Experience | null;
  goal: Goal | null;
  days: Weekday[];
  location: Location | null;
  equipment: HomeEquipment[];
};

type Step = 'name' | 'gender' | 'weight' | 'experience' | 'goal' | 'days' | 'location' | 'equipment' | 'ready';

export default function Onboarding() {
  const [a, setA] = useState<Answers>({
    name: '',
    gender: null,
    bodyWeight: '',
    unit: 'kg',
    experience: null,
    goal: null,
    days: [0, 2, 4],
    location: null,
    equipment: [],
  });
  const set = (patch: Partial<Answers>) => setA((p) => ({ ...p, ...patch }));

  const steps: Step[] = useMemo(
    () => ['name', 'gender', 'weight', 'experience', 'goal', 'days', 'location', ...(a.location === 'home' ? (['equipment'] as Step[]) : []), 'ready'],
    [a.location],
  );
  const [i, setI] = useState(0);
  const step = steps[i];

  const weightNum = parseFloat(a.bodyWeight.replace(',', '.'));
  const canNext: Record<Step, boolean> = {
    name: a.name.trim().length > 0,
    gender: !!a.gender,
    weight: weightNum > 20 && weightNum < 700,
    experience: !!a.experience,
    goal: !!a.goal,
    days: a.days.length > 0,
    location: !!a.location,
    equipment: true,
    ready: true,
  };

  const split = suggestSplits({ days: a.days, gender: a.gender ?? 'other' })[0];

  const finish = () => {
    useProfile.getState().setProfile({
      name: a.name.trim(),
      gender: a.gender!,
      bodyWeight: weightNum,
      unit: a.unit,
      experience: a.experience!,
      goal: a.goal!,
      days: [...a.days].sort(),
      location: a.location!,
      equipment: a.equipment,
      activeSplitId: split.id,
      splitDayIndex: 0,
      createdAt: Date.now(),
    });
    useHistory.getState().logBodyWeight(weightNum);
    success();
    router.replace('/');
  };

  const next = () => (step === 'ready' ? finish() : setI((n) => Math.min(n + 1, steps.length - 1)));

  const toggleDay = (d: Weekday) =>
    set({ days: a.days.includes(d) ? a.days.filter((x) => x !== d) : [...a.days, d] });
  const toggleEquip = (e: HomeEquipment) =>
    set({ equipment: a.equipment.includes(e) ? a.equipment.filter((x) => x !== e) : [...a.equipment, e] });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        edges={['top', 'bottom']}
        footer={<Button title={step === 'ready' ? "Let's go" : 'Next'} onPress={next} disabled={!canNext[step]} />}
      >
        <Row style={{ minHeight: 40 }}>
          {i > 0 ? <IconButton name="arrow-back" label="Back" onPress={() => setI(i - 1)} /> : null}
          <View style={{ flex: 1 }}>
            <ProgressBars total={steps.length} done={i + 1} />
          </View>
        </Row>

        {step === 'name' && (
          <>
            <Display size={48}>
              Welcome to <Display size={48} color={colors.accent}>Forge</Display>
            </Display>
            <Body color={colors.muted}>We’ll build your workouts for you. First, what should we call you?</Body>
            <TextInput
              autoFocus
              value={a.name}
              onChangeText={(name) => set({ name })}
              placeholder="Your name"
              placeholderTextColor={colors.faint}
              returnKeyType="next"
              onSubmitEditing={() => canNext.name && next()}
              style={inputStyle}
            />
          </>
        )}

        {step === 'gender' && (
          <>
            <Display size={42}>Hey {a.name.trim()}, you are…</Display>
            <Body color={colors.muted}>Helps us pick the splits we suggest first. You’ll always see all of them.</Body>
            <Option label="Male" selected={a.gender === 'male'} onPress={() => set({ gender: 'male' })} />
            <Option label="Female" selected={a.gender === 'female'} onPress={() => set({ gender: 'female' })} />
            <Option label="Prefer not to say" selected={a.gender === 'other'} onPress={() => set({ gender: 'other' })} />
          </>
        )}

        {step === 'weight' && (
          <>
            <Display size={42}>How much do you weigh?</Display>
            <Body color={colors.muted}>Used to track your body weight over time and estimate calories.</Body>
            <Row>
              <Chip label="kg" selected={a.unit === 'kg'} onPress={() => set({ unit: 'kg' })} />
              <Chip label="lb" selected={a.unit === 'lb'} onPress={() => set({ unit: 'lb' })} />
            </Row>
            <Row>
              <TextInput
                autoFocus
                value={a.bodyWeight}
                onChangeText={(bodyWeight) => set({ bodyWeight: bodyWeight.replace(/[^0-9.,]/g, '') })}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.faint}
                style={[inputStyle, { flex: 1, minWidth: 0, fontSize: 64 }]}
              />
              <Display size={32} color={colors.muted}>
                {a.unit}
              </Display>
            </Row>
          </>
        )}

        {step === 'experience' && (
          <>
            <Display size={42}>Have you trained before?</Display>
            <Option label="Never" hint="Totally new. We'll keep it simple." selected={a.experience === 'never'} onPress={() => set({ experience: 'never' })} />
            <Option label="A little" hint="Tried it, never stuck with it." selected={a.experience === 'some'} onPress={() => set({ experience: 'some' })} />
            <Option label="Regularly" hint="I know my way around." selected={a.experience === 'regular'} onPress={() => set({ experience: 'regular' })} />
          </>
        )}

        {step === 'goal' && (
          <>
            <Display size={42}>What’s your main goal?</Display>
            <Body color={colors.muted}>This sets your recommended sets, reps and rest.</Body>
            <Option label="Build muscle" hint="Look bigger and more toned" selected={a.goal === 'muscle'} onPress={() => set({ goal: 'muscle' })} />
            <Option label="Get stronger" hint="Lift heavier things" selected={a.goal === 'strength'} onPress={() => set({ goal: 'strength' })} />
            <Option label="Lose fat" hint="Faster pace, shorter rests" selected={a.goal === 'fatloss'} onPress={() => set({ goal: 'fatloss' })} />
            <Option label="General fitness" hint="Feel good, move better" selected={a.goal === 'general'} onPress={() => set({ goal: 'general' })} />
          </>
        )}

        {step === 'days' && (
          <>
            <Display size={42}>Which days are you free?</Display>
            <Body color={colors.muted}>Pick the days you can work out. {a.days.length} day{a.days.length === 1 ? '' : 's'} a week.</Body>
            <Row style={{ flexWrap: 'wrap' }}>
              {WEEKDAY_NAMES.map((d, idx) => (
                <Chip key={d} label={d} selected={a.days.includes(idx as Weekday)} onPress={() => toggleDay(idx as Weekday)} />
              ))}
            </Row>
          </>
        )}

        {step === 'location' && (
          <>
            <Display size={42}>Where will you train?</Display>
            <Option label="At the gym" hint="Machines, cables, barbells and dumbbells" selected={a.location === 'gym'} onPress={() => set({ location: 'gym' })} />
            <Option label="At home" hint="Bodyweight and whatever gear you have" selected={a.location === 'home'} onPress={() => set({ location: 'home' })} />
          </>
        )}

        {step === 'equipment' && (
          <>
            <Display size={42}>What do you have at home?</Display>
            <Body color={colors.muted}>Pick all that apply. Nothing? No problem: bodyweight works.</Body>
            <Option label="Dumbbells" selected={a.equipment.includes('dumbbells')} onPress={() => toggleEquip('dumbbells')} />
            <Option label="Resistance bands" selected={a.equipment.includes('bands')} onPress={() => toggleEquip('bands')} />
            <Option label="Kettlebell" selected={a.equipment.includes('kettlebell')} onPress={() => toggleEquip('kettlebell')} />
            <Option label="Pull-up bar" selected={a.equipment.includes('pullupbar')} onPress={() => toggleEquip('pullupbar')} />
          </>
        )}

        {step === 'ready' && (
          <>
            <Display size={48}>
              Your plan is <Display size={48} color={colors.accent}>ready</Display>
            </Display>
            <Body color={colors.muted}>Based on your answers we suggest:</Body>
            <Card accent>
              <Display size={30} color={colors.onAccent}>
                {split.name}
              </Display>
              <Body color={colors.onAccent} weight="semi">
                {split.days.length} days · {a.location === 'gym' ? 'Gym' : 'Home'}
              </Body>
              <Body color={colors.onAccent}>{split.blurb}</Body>
            </Card>
            <View style={{ gap: 8 }}>
              {split.days.map((d, idx) => (
                <Row key={idx}>
                  <Label color={colors.accent}>Day {idx + 1}</Label>
                  <Body weight="semi">{d.name}</Body>
                </Row>
              ))}
            </View>
            <Body color={colors.muted} size={13}>
              You can switch splits or just pick a muscle any time.
            </Body>
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  fontFamily: fonts.display,
  fontSize: 40,
  color: colors.text,
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  paddingHorizontal: 18,
  paddingVertical: 14,
  textTransform: 'uppercase' as const,
};
