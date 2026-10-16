import { useTheme, useThemedStyles } from '../../design-system/theme';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, colors, spacing, radii, shadows } from '../../design-system';
import { useRecoveryClock } from '../../utils/recoveryClock';
import { calculateCleanTime } from '../../data/recovery';

interface LiveCleanTimerProps {
  quitDateISO: string;
  accentColor?: string;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

const computeTimeParts = (quitDateISO: string): TimeParts => {
  const quitTime = new Date(quitDateISO).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - quitTime);
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
};

export const LiveCleanTimer: React.FC<LiveCleanTimerProps> = ({
  quitDateISO,
  accentColor = colors.accent.primary,
}) => {
  const styles = useThemedStyles(baseStyles);

  const tick = useRecoveryClock('second');
  const timeParts = calculateCleanTime(quitDateISO, new Date(tick || Date.now()));

  const pad = (n: number) => n.toString().padStart(2, '0');

  const units = [
    { value: timeParts.days.toString(), label: 'DAYS', fullLabel: 'Days Clean' },
    { value: pad(timeParts.hours), label: 'HOURS', fullLabel: 'Hours' },
    { value: pad(timeParts.minutes), label: 'MINUTES', fullLabel: 'Minutes' },
    { value: pad(timeParts.seconds), label: 'SECONDS', fullLabel: 'Seconds' },
  ];

  return (
    <View style={styles.container}>
      {/* Live Status Header */}
      <View style={styles.headerRow}>
        <View style={styles.liveBadge}>
          <View style={[styles.pulseDot, { backgroundColor: accentColor }]} />
          <Text variant="subcaption" color="secondary" weight="500" style={styles.liveText}>
            TIME SINCE START
          </Text>
        </View>

        <Text variant="caption" color="tertiary" tabular>
          Live Continuous
        </Text>
      </View>

      {/* 4 Unit Cards */}
      <View style={styles.unitsGrid}>
        {units.map((unit, idx) => (
          <View key={unit.label} style={styles.unitCard}>
            <View style={styles.numberBox}>
              <Text
                variant="title1"
                color="primary"
                serif
                weight="400"
                tabular
                style={styles.unitNumber}
              >
                {unit.value}
              </Text>
            </View>
            <Text
              variant="subcaption"
              color="tertiary"
              weight="500"
              style={styles.unitLabel}
            >
              {unit.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveText: {
    letterSpacing: 0.8,
  },
  unitsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  unitCard: {
    flex: 1,
    backgroundColor: colors.background.subtle,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26, 24, 22, 0.04)',
  },
  numberBox: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitNumber: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  unitLabel: {
    letterSpacing: 0.8,
    marginTop: 4,
    fontSize: 13,
  },
});
