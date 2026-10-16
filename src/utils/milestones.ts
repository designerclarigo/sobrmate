import { Habit, Milestone } from '../data/types';
import { standardMilestones } from '../data/initialData';

export interface CalculatedMilestone extends Milestone {
  achieved: boolean;
  unlockedAtDate?: Date;
  achievedDateFormatted?: string;
  achievedRelative?: string;
  expectedDateObj?: Date;
  expectedDateFormatted?: string;
  daysRemaining: number;
  hoursRemaining: number;
  remainingFormatted: string;
  progressPercent: number; // 0 to 100
  isNext: boolean;
}

export interface HabitMilestonesAnalysis {
  habit: Habit;
  elapsedDays: number;
  currentStreakDays: number;
  totalMilestones: number;
  unlockedCount: number;
  upcomingCount: number;
  percentUnlocked: number;
  unlocked: CalculatedMilestone[];
  upcoming: CalculatedMilestone[];
  nextMilestone: CalculatedMilestone | null;
}

/**
 * Format date nicely e.g. "Oct 18, 2026"
 */
export function formatMilestoneDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate human-relative distance for achieved dates
 */
export function formatAchievedRelative(achievedDate: Date, now: Date): string {
  const diffMs = now.getTime() - achievedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Format remaining time for upcoming milestones
 */
export function formatRemainingTime(daysRemaining: number, hoursRemaining: number): string {
  if (daysRemaining <= 0) {
    if (hoursRemaining <= 1) return 'In less than an hour';
    return `In ${hoursRemaining} hours`;
  }
  if (daysRemaining === 1) return 'Tomorrow';
  if (daysRemaining < 7) return `In ${daysRemaining} days`;
  if (daysRemaining < 14) return 'In ~1 week';
  if (daysRemaining < 30) {
    const weeks = Math.round(daysRemaining / 7);
    return `In ${weeks} weeks`;
  }
  if (daysRemaining < 60) return 'In ~1 month';
  const months = Math.round(daysRemaining / 30);
  return `In ~${months} months`;
}

/**
 * Automatically calculate all milestones from the tracker's start date
 */
export function calculateMilestonesForHabit(
  habit: Habit,
  now: Date = new Date()
): HabitMilestonesAnalysis {
  const quitTime = new Date(habit.quitDate).getTime();
  const nowTime = now.getTime();
  const elapsedMs = Math.max(0, nowTime - quitTime);
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const currentStreakDays = Math.floor(elapsedDays);

  const unlocked: CalculatedMilestone[] = [];
  const upcoming: CalculatedMilestone[] = [];

  let foundNext = false;
  let nextMilestone: CalculatedMilestone | null = null;

  for (const m of standardMilestones) {
    const targetMs = m.targetDays * 24 * 60 * 60 * 1000;
    const targetTimestamp = quitTime + targetMs;
    const isUnlocked = nowTime >= targetTimestamp;

    // Milestone progress calculation (0 to 100)
    const progressPercent = Math.min(100, Math.max(0, (elapsedDays / m.targetDays) * 100));

    if (isUnlocked) {
      const unlockedDateObj = new Date(targetTimestamp);
      const calculated: CalculatedMilestone = {
        ...m,
        achieved: true,
        unlockedAt: unlockedDateObj.toISOString(),
        unlockedAtDate: unlockedDateObj,
        achievedDateFormatted: formatMilestoneDate(unlockedDateObj),
        achievedRelative: formatAchievedRelative(unlockedDateObj, now),
        daysRemaining: 0,
        hoursRemaining: 0,
        remainingFormatted: 'Unlocked',
        progressPercent: 100,
        isNext: false,
      };
      unlocked.push(calculated);
    } else {
      const expectedDateObj = new Date(targetTimestamp);
      const remainingMs = Math.max(0, targetTimestamp - nowTime);
      const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.max(
        1,
        Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      );

      const isNext = !foundNext;
      if (isNext) {
        foundNext = true;
      }

      const calculated: CalculatedMilestone = {
        ...m,
        achieved: false,
        expectedDate: expectedDateObj.toISOString(),
        expectedDateObj,
        expectedDateFormatted: formatMilestoneDate(expectedDateObj),
        daysRemaining,
        hoursRemaining,
        remainingFormatted: formatRemainingTime(daysRemaining, hoursRemaining),
        progressPercent: Math.round(progressPercent),
        isNext,
      };

      if (isNext) {
        nextMilestone = calculated;
      }

      upcoming.push(calculated);
    }
  }

  // Sort unlocked in descending order of achievement (most recent first) or ascending
  // Ascending order is natural for milestone progression, but can also be viewed as progressive path
  const totalMilestones = standardMilestones.length;
  const unlockedCount = unlocked.length;
  const upcomingCount = upcoming.length;
  const percentUnlocked = totalMilestones > 0 ? Math.round((unlockedCount / totalMilestones) * 100) : 0;

  return {
    habit,
    elapsedDays,
    currentStreakDays,
    totalMilestones,
    unlockedCount,
    upcomingCount,
    percentUnlocked,
    unlocked,
    upcoming,
    nextMilestone,
  };
}
