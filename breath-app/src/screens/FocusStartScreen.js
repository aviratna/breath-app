import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { PRICES, useFocus } from '../state/FocusContext';
import { useLiveBreaths } from '../lib/breathClock';
import { Icon, IconButton, PrimaryButton } from '../components/ui';

const minutes = (breaths) => {
  const m = Math.round(breaths / 15);
  return m >= 60 && m % 60 === 0 ? `about ${m / 60} hour${m > 60 ? 's' : ''}` : `about ${m} min`;
};

// Decide what a task is worth, in breaths, before you start it.
export default function FocusStartScreen({ route, navigation }) {
  const { givenToday } = useBreath();
  const focus = useFocus();
  const breathsLeft = useLiveBreaths(givenToday);
  const [title, setTitle] = useState(route.params?.title || '');
  const [price, setPrice] = useState(route.params?.price || 450);
  const [custom, setCustom] = useState(PRICES.includes(route.params?.price || 450) ? '' : String(route.params?.price));
  const [customOn, setCustomOn] = useState(!!custom);

  const chosen = customOn ? parseInt(custom, 10) || 0 : price;
  const ready = title.trim() && chosen >= 15 && chosen <= breathsLeft;

  function begin() {
    focus.start(title, chosen);
    navigation.replace('FocusSession');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>
            <IconButton name="close" label="Close" onPress={() => navigation.goBack()} style={{ marginLeft: -10 }} />
            <Text style={type.small}>{breathsLeft.toLocaleString()} breaths left today</Text>
          </View>

          <Text style={[type.label, { color: colors.tide, marginTop: 18 }]}>Breath for focus</Text>
          <Text accessibilityRole="header" style={styles.h1}>
            What will you spend breaths on?
          </Text>

          <Text style={styles.fieldLabel} nativeID="taskLabel">
            This task
          </Text>
          <TextInput
            accessibilityLabelledBy="taskLabel"
            value={title}
            onChangeText={setTitle}
            placeholder="Write the launch email"
            placeholderTextColor="#8E887F"
            maxLength={60}
            style={styles.input}
            returnKeyType="done"
          />

          <Text style={styles.fieldLabel}>Is it worth…</Text>
          <View style={styles.grid}>
            {PRICES.map((p) => {
              const on = !customOn && price === p;
              return (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${p} breaths, ${minutes(p)}`}
                  onPress={() => {
                    setPrice(p);
                    setCustomOn(false);
                  }}
                  style={[styles.price, on && styles.priceOn]}
                >
                  <Text style={styles.priceNum}>{p}</Text>
                  <Text style={[type.small, on && { color: colors.tideInk }]}>{minutes(p)}</Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: customOn }}
              onPress={() => setCustomOn(true)}
              style={[styles.price, customOn ? styles.priceOn : styles.priceCustom]}
            >
              {customOn ? (
                <TextInput
                  autoFocus
                  accessibilityLabel="Your own number of breaths"
                  value={custom}
                  onChangeText={(t) => setCustom(t.replace(/[^0-9]/g, '').slice(0, 5))}
                  keyboardType="number-pad"
                  placeholder="600"
                  placeholderTextColor="#8E887F"
                  style={[styles.priceNum, { padding: 0, outlineStyle: 'none' }]}
                />
              ) : (
                <Text style={styles.priceOwn}>Your own</Text>
              )}
              <Text style={[type.small, customOn && { color: colors.tideInk }]}>{customOn && chosen ? minutes(chosen) : 'any number'}</Text>
            </Pressable>
          </View>

          <View style={styles.note}>
            <Icon name="info" size={18} color={colors.tide} />
            <Text style={styles.noteText}>
              Focus breaths are the same breaths as the rest of your day. Naming a price helps you ask: is this worth part of my life?
            </Text>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label={ready ? `Begin · ${chosen.toLocaleString()} breaths` : 'Name the task to begin'} disabled={!ready} onPress={begin} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 4, paddingHorizontal: 22, paddingBottom: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { ...type.h1, marginTop: 10 },
  fieldLabel: { fontFamily: fonts.ui, fontSize: 13, color: colors.stone, marginTop: 24, marginBottom: 8 },
  input: { height: 54, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.paper, paddingHorizontal: 16, fontFamily: fonts.ui, fontSize: 16, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  price: { width: '47%', flexGrow: 1, height: 76, borderRadius: 18, borderWidth: 1, borderColor: colors.mist, backgroundColor: colors.paper, paddingHorizontal: 16, justifyContent: 'center', gap: 2 },
  priceOn: { borderWidth: 2, borderColor: colors.tide, backgroundColor: colors.tideMist },
  priceCustom: { borderStyle: 'dashed', borderColor: colors.border, backgroundColor: 'transparent' },
  priceNum: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  priceOwn: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  note: { flexDirection: 'row', gap: 10, marginTop: 22, padding: 14, paddingHorizontal: 16, borderRadius: radius.row, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.mist },
  noteText: { flex: 1, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 20, color: '#45413C' },
  footer: { paddingHorizontal: 22, paddingBottom: 16, paddingTop: 8 },
});
