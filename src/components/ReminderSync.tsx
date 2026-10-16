import { useEffect,useRef } from 'react';
import { useRecoveryStore } from '../data/store';
import { notificationService } from '../utils/notifications';
export function ReminderSync({enabled=true}:{enabled?:boolean}) {
  const queue=useRef<Promise<unknown>>(Promise.resolve());
  const { settings, activeHabit, updateSettings,isLoading } = useRecoveryStore();
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      if(cancelled||isLoading)return;
      if(!enabled||!settings.notificationsEnabled){await notificationService.cancelAllNotifications();return;}
      if(settings.dailyReminderEnabled){const scheduled=await notificationService.scheduleDailyPledgeReminder(settings.reminderTime,activeHabit?.title,'reflection');if(!scheduled&&!cancelled)await updateSettings({notificationsEnabled:false});}
      else await notificationService.cancelReminder('reflection');
      if(settings.pledgeReminderEnabled){const scheduled=await notificationService.scheduleDailyPledgeReminder(settings.pledgeReminderTime||'08:00',activeHabit?.title,'pledge');if(!scheduled&&!cancelled)await updateSettings({notificationsEnabled:false});}
      else await notificationService.cancelReminder('pledge');
    };
    queue.current=queue.current.catch(()=>undefined).then(sync).catch(() => { if (!cancelled) void updateSettings({ notificationsEnabled: false }).catch(() => undefined); });
    return () => { cancelled = true; };
  }, [enabled,isLoading,settings.notificationsEnabled, settings.dailyReminderEnabled, settings.pledgeReminderEnabled, settings.reminderTime, settings.pledgeReminderTime, activeHabit?.title]);
  return null;
}
