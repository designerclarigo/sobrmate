import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

type Service = typeof import('../src/utils/notifications').notificationService;
type Scheduled = { id: string; content: { title: string; body: string }; trigger: { type: string; hour: number; minute: number; channelId: string } };

/** Evaluate the installed SDK's Android JS modules with a simulated native host.
 * The package entry point/remote registration is deliberately unavailable, as
 * it is in the failing Expo Go log. Local SDK behavior is not mocked away.
 */
function androidGoHost(allowPermission = true,workspace:'demo'|'supabase'='supabase') {
  const root = path.resolve(__dirname, '..');
  const cache = new Map<string, { exports: any }>();
  const calls: string[] = [];
  const scheduled: Scheduled[] = [];
  const cancelled: string[] = [];
  let granted = false;
  class NativeError extends Error {}
  const native: Record<string, object> = {
    ExpoNotificationPermissionsModule: {
      getPermissionsAsync: async () => { calls.push('permission'); return { granted }; },
      requestPermissionsAsync: async () => { calls.push('request'); granted = allowPermission; return { granted }; },
    },
    ExpoNotificationChannelManager: {
      setNotificationChannelAsync: async (id: string, input: object) => { calls.push('channel'); return { id, ...input }; },
    },
    ExpoNotificationScheduler: {
      scheduleNotificationAsync: async (id: string, content: Scheduled['content'], trigger: Scheduled['trigger']) => { scheduled.push({ id, content, trigger }); return id; },
      cancelScheduledNotificationAsync: async (id: string) => { cancelled.push(id); },
    },
    ExpoNotificationsHandlerModule: {},
  };
  const core = {
    Platform: { OS: 'android' },
    CodedError: NativeError,
    UnavailabilityError: NativeError,
    uuid: { v4: () => 'native-generated-id' },
    requireNativeModule: (name: string) => {
      if (!native[name]) throw new Error(`Unexpected native module: ${name}`);
      return native[name];
    },
    LegacyEventEmitter: class {
      addListener(event: string) { calls.push(event); return { remove() {} }; }
    },
  };
  function load(filename: string): any {
    if (cache.has(filename)) return cache.get(filename)!.exports;
    const module = { exports: {} as any };
    cache.set(filename, module);
    const localRequire = (specifier: string) => {
      if(specifier==='../auth/runtime')return {authenticationMode:workspace};
      if (specifier === 'react-native') return { Platform: core.Platform };
      if (specifier === 'expo-modules-core') return core;
      if (specifier === 'expo') return { isRunningInExpoGo: () => true, PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' } };
      if (specifier === 'expo-notifications' || /TokenEmitter|PushToken|ServerRegistration/.test(specifier)) {
        throw new Error('Android Expo Go cannot initialize remote push registration.');
      }
      const base = specifier.startsWith('expo-notifications/')
        ? path.join(root, 'node_modules', specifier)
        : specifier.startsWith('.') ? path.resolve(path.dirname(filename), specifier) : null;
      if (!base) throw new Error(`Unexpected dependency: ${specifier}`);
      // Match Metro's Android-first/native resolution, not Node's default.
      const target = ['.android.js', '.native.js', '.js', '.ts'].map(ext => base + ext).find(fs.existsSync);
      if (!target) throw new Error(`Unresolved SDK dependency: ${specifier}`);
      return load(target);
    };
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    try { new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports); }
    catch (error) { cache.delete(filename); throw error; }
    return module.exports;
  }
  const service: Service = load(path.join(root, 'src/utils/notifications.ts')).notificationService;
  return { service, calls, scheduled, cancelled };
}

test('route notification imports are inert and local permission requests avoid Expo Go remote registration', async () => {
  const host = androidGoHost();
  assert.equal(host.calls.length, 0);
  assert.equal(await host.service.requestPermissions(), true);
  assert.ok(host.calls.indexOf('channel') < host.calls.indexOf('request'));
  await host.service.checkPermissionStatus();
  assert.equal(host.calls.filter(name => name === 'onHandleNotification').length, 1);
});

test('Android local pledge and reflection reminders preserve independent times and owned cancellation', async () => {
  const host = androidGoHost();
  await host.service.requestPermissions();
  assert.equal(await host.service.scheduleDailyPledgeReminder('08:30', 'Alcohol', 'pledge'), true);
  assert.equal(await host.service.scheduleDailyPledgeReminder('21:00', 'Alcohol', 'reflection'), true);
  assert.deepEqual(host.scheduled.map(item => [item.id, item.trigger.type, item.trigger.hour, item.trigger.minute]), [
    ['komorebi-daily-pledge', 'daily', 8, 30],
    ['komorebi-daily-reflection', 'daily', 21, 0],
  ]);
  assert.match(host.scheduled[0].content.body, /pledge/);
  assert.match(host.scheduled[1].content.body, /Reflect/);
  await host.service.cancelAllNotifications();
  assert.deepEqual([...new Set(host.cancelled)].sort(), ['komorebi-daily-pledge', 'komorebi-daily-reflection']);
});

test('invalid times and denied permissions cannot create a local reminder', async () => {
  const host = androidGoHost(false);
  await assert.rejects(host.service.scheduleDailyPledgeReminder('25:00'), /24-hour/);
  assert.equal(host.calls.length, 0);
  assert.equal(await host.service.requestPermissions(), false);
  assert.equal(await host.service.scheduleDailyPledgeReminder('08:00'), false);
  assert.deepEqual(host.scheduled, []);
});
test('demo reminders schedule and cancel only demo identifiers',async()=>{
  const host=androidGoHost(true,'demo');await host.service.requestPermissions();await host.service.scheduleDailyPledgeReminder('08:00','Test habit','pledge');await host.service.scheduleDailyPledgeReminder('21:00','Test habit','reflection');await host.service.cancelAllNotifications();
  assert.ok(host.scheduled.every(item=>item.id.startsWith('demo.')&&item.trigger.channelId.startsWith('demo.')));assert.ok(host.cancelled.every(id=>id.startsWith('demo.')));
});
