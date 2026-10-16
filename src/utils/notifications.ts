import {localWorkspaceKey} from '../data/workspace';
import { Platform } from 'react-native';
import { loadLocalNotifications } from './localNotifications';
const CHANNEL = localWorkspaceKey('daily-reflections');
const IDENTIFIER = localWorkspaceKey('komorebi-daily-reflection');
const PLEDGE_IDENTIFIER=localWorkspaceKey('komorebi-daily-pledge');
export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const Notifications = await loadLocalNotifications();
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Daily reflections', importance: Notifications.AndroidImportance.DEFAULT,
    });
    let permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted) permissions = await Notifications.requestPermissionsAsync();
    return permissions.granted;
  },
  async checkPermissionStatus(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const Notifications = await loadLocalNotifications();
    return (await Notifications.getPermissionsAsync()).granted;
  },
  async scheduleDailyPledgeReminder(time: string, habitTitle?: string, kind:'reflection'|'pledge'='reflection'): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Enter a time in 24-hour format, such as 21:00.');
    if (!(await this.checkPermissionStatus())) return false;
    const Notifications = await loadLocalNotifications();
    const [hour, minute] = time.split(':').map(Number);
    // A stable identifier replaces the previous reminder without duplicating schedules.
    const identifier=kind==='pledge'?PLEDGE_IDENTIFIER:IDENTIFIER;
    await Notifications.cancelScheduledNotificationAsync(identifier);
    await Notifications.scheduleNotificationAsync({ identifier,
      content: kind==='pledge'?{title:'Your little promise for today',body:habitTitle?`Make a little space for your intention with ${habitTitle}. Open SobrMate to pledge.`:'Pause, breathe, and make your daily pledge.'}:{ title: 'A moment for you', body: habitTitle ? `How was your day with ${habitTitle}? Reflect, breathe, and take the next step.` : 'Pause, reflect, and honor the progress you made today.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
    });
    return true;
  },
  async sendMilestoneNotification(habitTitle: string, milestoneTitle: string, timeLabel: string): Promise<boolean> {
    if (!(await this.checkPermissionStatus())) return false;
    const Notifications = await loadLocalNotifications();
    await Notifications.scheduleNotificationAsync({ content: { title: `${timeLabel} of growth`, body: `${habitTitle}: ${milestoneTitle}. Take a moment to celebrate.` }, trigger: null });
    return true;
  },
  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    const Notifications = await loadLocalNotifications();
    await Promise.all([IDENTIFIER,PLEDGE_IDENTIFIER].map(id=>Notifications.cancelScheduledNotificationAsync(id)));
  },
  async cancelReminder(kind:'reflection'|'pledge'):Promise<void>{
    if (Platform.OS === 'web') return;
    const Notifications = await loadLocalNotifications();
    await Notifications.cancelScheduledNotificationAsync(kind==='pledge'?PLEDGE_IDENTIFIER:IDENTIFIER);
  },
};
