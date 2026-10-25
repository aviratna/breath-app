import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Gift notifications, without a server of our own: each phone stores its Expo push token
// in pushTokens/{uid} (readable only by people it is connected to, see firestore.rules),
// and the giver's phone sends the notification through Expo's push service.
// On Android this needs Firebase Cloud Messaging set up for the app; until then every
// step here quietly does nothing.

const CHANNEL = 'breaths';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPush(uid) {
  try {
    if (Platform.OS === 'web' || !Device.isDevice) return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Breaths you receive',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 40],
        lightColor: '#2D6A78',
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') return null;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await setDoc(doc(db, 'pushTokens', uid), { token, updatedAt: serverTimestamp() });
    return token;
  } catch (e) {
    return null; // Notifications aren't set up on this build or device yet.
  }
}

// Best effort: a gift is delivered whether or not the notification is.
export async function notifyGift(toUid, fromName, giftId) {
  try {
    const snap = await getDoc(doc(db, 'pushTokens', toUid));
    if (!snap.exists()) return;
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: snap.data().token,
        title: `${fromName} spent a breath on you`,
        body: 'No reply needed.',
        data: { type: 'gift', giftId },
        channelId: CHANNEL,
        priority: 'default',
      }),
    });
  } catch (e) {
    // Ignore: the gift is already in their inbox.
  }
}

export async function forgetPushToken(uid) {
  await deleteDoc(doc(db, 'pushTokens', uid)).catch(() => {});
}

// Calls `onOpen(giftId)` when someone taps a gift notification (including the one that
// launched the app).
export function onGiftNotificationOpened(onOpen) {
  if (Platform.OS === 'web') return () => {};
  Notifications.getLastNotificationResponseAsync()
    .then((r) => r && r.notification.request.content.data?.type === 'gift' && onOpen(r.notification.request.content.data.giftId))
    .catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const data = r.notification.request.content.data;
    if (data?.type === 'gift') onOpen(data.giftId);
  });
  return () => sub.remove();
}
