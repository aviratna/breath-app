import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import { View, ActivityIndicator } from 'react-native';

import { BreathProvider } from './src/state/BreathContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SentScreen from './src/screens/SentScreen';
import LockScreenPreview from './src/screens/LockScreenPreview';
import ReceivingScreen from './src/screens/ReceivingScreen';
import ShareCardScreen from './src/screens/ShareCardScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
    SourceSerif4_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <BreathProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Sent" component={SentScreen} />
          <Stack.Screen name="LockScreen" component={LockScreenPreview} />
          <Stack.Screen name="Receiving" component={ReceivingScreen} />
          <Stack.Screen name="ShareCard" component={ShareCardScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BreathProvider>
  );
}
