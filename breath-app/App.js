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

import { BreathProvider, useBreath } from './src/state/BreathContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SentScreen from './src/screens/SentScreen';
import LockScreenPreview from './src/screens/LockScreenPreview';
import ReceivingScreen from './src/screens/ReceivingScreen';
import ShareCardScreen from './src/screens/ShareCardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NameScreen from './src/screens/NameScreen';
import ConnectScreen from './src/screens/ConnectScreen';

const Stack = createNativeStackNavigator();

function Root() {
  const { ready, hasOnboarded, me } = useBreath();
  if (!ready) return <Loading />;
  const initial = !hasOnboarded ? 'Onboarding' : me ? 'Home' : 'Name';
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initial}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Sent" component={SentScreen} />
        <Stack.Screen name="LockScreen" component={LockScreenPreview} />
        <Stack.Screen name="Receiving" component={ReceivingScreen} />
        <Stack.Screen name="ShareCard" component={ShareCardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="Connect" component={ConnectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
    SourceSerif4_600SemiBold,
  });

  if (!fontsLoaded) return <Loading />;

  return (
    <BreathProvider>
      <Root />
    </BreathProvider>
  );
}
