import { useRouter } from 'expo-router';
import { useRecoveryStore } from '../../src/data/store';
import { CheckInModalSheet } from '../../src/components/checkin/CheckInModalSheet';
import { getLocalDateString } from '../../src/utils/date';
import { Redirect } from 'expo-router';
export default function CheckInScreen() {
  const { activeHabit, currentTime, checkIns, recordCheckIn } = useRecoveryStore('day');
  const router = useRouter();
  const date = getLocalDateString(currentTime);
  if (!activeHabit) return <Redirect href="/habit/new" />;
  return <CheckInModalSheet visible onClose={() => router.back()} habit={activeHabit} dateStr={date}
    existingCheckIn={checkIns.find(c => c.habitId === activeHabit.id && c.date === date)}
    onSave={async (id, status, notes, consumption,quantity) => { await recordCheckIn(id, status, status === 'struggled' ? 3 : status === 'relapsed' ? 5 : 1, notes, date, consumption,quantity); }} />;
}
