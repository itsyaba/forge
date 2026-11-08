import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { addDays, dayKey, startOfWeek, WEEKDAY_SHORT } from '@/lib/dates';
import { colors } from '@/theme';
import { Body, Label, Row } from './ui';

/** Minimal line chart: lime line, dots, min/max labels. */
export function LineChart({
  values,
  height = 160,
  suffix = '',
}: {
  values: number[];
  height?: number;
  suffix?: string;
}) {
  const [width, setWidth] = useState(0);
  const pad = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (values.length === 1 ? (width - pad * 2) / 2 : (i * (width - pad * 2)) / (values.length - 1));
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');

  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Low {min}{suffix}</Label>
        <Label color={colors.accent}>High {max}{suffix}</Label>
      </Row>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            {[0.25, 0.5, 0.75].map((f) => (
              <Line key={f} x1={0} x2={width} y1={height * f} y2={height * f} stroke={colors.border} strokeWidth={1} />
            ))}
            <Path d={d} stroke={colors.accent} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {values.map((v, i) => (
              <Circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 5 : 3} fill={colors.accent} />
            ))}
          </Svg>
        ) : null}
      </View>
    </View>
  );
}

/** GitHub-style grid of the last `weeks` weeks; rows are weekdays Mon–Sun. */
export function Heatmap({
  days,
  weeks = 12,
  since,
  now = new Date(),
}: {
  days: Set<string>;
  weeks?: number;
  /** account start; earlier days render as small dots, not empty squares */
  since?: number;
  now?: Date;
}) {
  const [width, setWidth] = useState(0);
  const labelW = 18;
  const gap = 4;
  const cell = width ? Math.min(22, (width - labelW - gap * weeks) / weeks) : 0;
  const first = addDays(startOfWeek(now), -7 * (weeks - 1));
  const today = dayKey(now);
  const sinceKey = since ? dayKey(since) : '';
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {cell > 0 ? (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: labelW, gap }}>
            {WEEKDAY_SHORT.map((d, i) => (
              <Body key={i} size={11} color={colors.muted} style={{ height: cell, lineHeight: cell }}>
                {i % 2 === 0 ? d : ''}
              </Body>
            ))}
          </View>
          <Svg width={(cell + gap) * weeks} height={(cell + gap) * 7}>
            {Array.from({ length: weeks }, (_, w) =>
              Array.from({ length: 7 }, (_, d) => {
                const date = addDays(first, w * 7 + d);
                const k = dayKey(date);
                const future = date > now && k !== today;
                if (k < sinceKey && !days.has(k)) {
                  return (
                    <Rect key={k} x={w * (cell + gap) + gap + cell / 2 - 1.5} y={d * (cell + gap) + cell / 2 - 1.5} width={3} height={3} rx={1.5} fill={colors.faint} />
                  );
                }
                return (
                  <Rect
                    key={k}
                    x={w * (cell + gap) + gap}
                    y={d * (cell + gap)}
                    width={cell}
                    height={cell}
                    rx={4}
                    fill={days.has(k) ? colors.accent : future ? 'transparent' : colors.surfaceHigh}
                    stroke={k === today ? colors.accent : 'none'}
                    strokeWidth={k === today ? 1.5 : 0}
                  />
                );
              }),
            )}
          </Svg>
        </View>
      ) : null}
    </View>
  );
}
