// Keep this adapter local-only. The SDK 57 package entry point also evaluates
// remote-push auto-registration, which throws in Android Expo Go.
// These SDK submodules are covered by the notification compatibility tests.
type LocalNotifications = Pick<
  typeof import('expo-notifications'),
  | 'getPermissionsAsync'
  | 'requestPermissionsAsync'
  | 'setNotificationHandler'
  | 'setNotificationChannelAsync'
  | 'scheduleNotificationAsync'
  | 'cancelScheduledNotificationAsync'
  | 'AndroidImportance'
  | 'SchedulableTriggerInputTypes'
>;

let pending: Promise<LocalNotifications> | undefined;

export function loadLocalNotifications(): Promise<LocalNotifications> {
  if (!pending) {
    pending = Promise.all([
      import('expo-notifications/build/NotificationPermissions'),
      import('expo-notifications/build/NotificationsHandler'),
      import('expo-notifications/build/setNotificationChannelAsync'),
      import('expo-notifications/build/scheduleNotificationAsync'),
      import('expo-notifications/build/cancelScheduledNotificationAsync'),
      import('expo-notifications/build/NotificationChannelManager.types'),
      import('expo-notifications/build/Notifications.types'),
    ]).then(([permissions, handler, channel, scheduler, cancellation, channelTypes, triggerTypes]) => {
      const api: LocalNotifications = {
        getPermissionsAsync: permissions.getPermissionsAsync,
        requestPermissionsAsync: permissions.requestPermissionsAsync,
        setNotificationHandler: handler.setNotificationHandler,
        setNotificationChannelAsync: channel.setNotificationChannelAsync,
        scheduleNotificationAsync: scheduler.scheduleNotificationAsync,
        cancelScheduledNotificationAsync: cancellation.cancelScheduledNotificationAsync,
        AndroidImportance: channelTypes.AndroidImportance,
        SchedulableTriggerInputTypes: triggerTypes.SchedulableTriggerInputTypes,
      };
      api.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return api;
    }).catch(error => {
      pending = undefined;
      throw error;
    });
  }
  return pending;
}
