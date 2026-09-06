import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';

export default function ReceivingScreen({ navigation }) {
  const { incomingGift, sendGift } = useBreath();

  function breatheBack() {
    sendGift(incomingGift.name);
    navigation.navigate('Sent', { name: incomingGift.name });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{incomingGift.name}</Text>
        <Text style={styles.message}>{incomingGift.message}</Text>
        <Text style={styles.timestamp}>{incomingGift.timestamp}</Text>
        <Text style={styles.reassure}>no reply needed</Text>

        <View style={{ flex: 1 }} />

        <View style={styles.row}>
          <Pressable style={styles.outlined} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.outlinedLabel}>just smile</Text>
          </Pressable>
          <Pressable style={styles.outlined} onPress={breatheBack}>
            <Text style={styles.outlinedLabel}>breathe one back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ee' },
  content: { flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 30, paddingBottom: 32 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface, marginBottom: 20 },
  name: { fontFamily: fonts.heading, fontSize: 19, color: colors.text, marginBottom: 8 },
  message: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 6 },
  timestamp: { fontFamily: fonts.body, fontSize: 12, color: colors.textFaint, marginBottom: 18 },
  reassure: { fontFamily: fonts.bodyItalic, fontSize: 13.5, color: colors.accentDeep },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  outlined: { flex: 1, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  outlinedLabel: { fontFamily: fonts.heading, fontSize: 13, color: colors.text },
});
