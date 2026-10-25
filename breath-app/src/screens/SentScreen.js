import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { BreathMark, Icon, PrimaryButton, TextButton } from '../components/ui';

export default function SentScreen({ route, navigation }) {
  const { name } = route.params;
  const { lastGift, previewMode } = useBreath();
  const isPublic = previewMode === 'celebrity';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginTop: 96 }}>
          <BreathMark size={96} strokeWidth={1.6} />
        </View>
        <Text style={[type.h1, styles.center, { marginTop: 36, marginBottom: 14 }]}>You gave {name} a breath.</Text>
        <Text style={[type.body, styles.center, { maxWidth: 300 }]}>
          {isPublic ? 'One person. One breath. Nothing to follow up.' : 'No message, no reply needed. They’ll simply know you were thinking of them.'}
        </Text>

        {lastGift ? (
          <View style={styles.pill} accessibilityLabel={`${lastGift.after} breaths left today`}>
            <Text style={styles.pillNum}>{lastGift.before.toLocaleString()}</Text>
            <Icon name="arrow" size={16} color={colors.stone} />
            <Text style={styles.pillNum}>{lastGift.after.toLocaleString()}</Text>
            <Text style={type.small}>left today</Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />
        <PrimaryButton label="Share this moment" icon="share" onPress={() => navigation.navigate('ShareCard', { name })} style={{ alignSelf: 'stretch' }} />
        <TextButton label="Done" onPress={() => navigation.navigate('Home')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingBottom: 16 },
  center: { textAlign: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 32,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  pillNum: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
});
