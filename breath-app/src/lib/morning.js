import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// "Morning breath": one gentle local notification a day, at a time you choose. Off unless
// you switch it on. It is scheduled on the phone itself, so it needs no server.
const ID = 'morning-breath';
const KEY = 'breath/morning';
export const MORNING_DEFAULT = { on: false, hour: 7, minute: 30 };
export const morningSupported = Platform.OS !== 'web';

export async function loadMorning() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...MORNING_DEFAULT, ...JSON.parse(raw) } : MORNING_DEFAULT;
  } catch (e) {
    return MORNING_DEFAULT;
  }
}

// Saves the setting and (re)schedules or cancels the daily notification.
// Returns the setting actually in force: switching on without permission stays off.
export async function saveMorning(next) {
  let setting = next;
  await Notifications.cancelScheduledNotificationAsync(ID).catch(() => {});
  if (setting.on) {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') {
      setting = { ...setting, on: false };
    } else {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('morning', {
          name: 'Morning breath',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      await Notifications.scheduleNotificationAsync({
        identifier: ID,
        content: {
          title: 'Good morning. Who’s on your mind today?',
          body: 'A whole day of breaths ahead. One of them could be theirs.',
          data: { type: 'morning' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: setting.hour,
          minute: setting.minute,
          channelId: 'morning',
        },
      });
    }
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(setting)).catch(() => {});
  return setting;
}

export function formatTime(hour, minute) {
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`;
}
