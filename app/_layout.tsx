import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";

// Empêcher le splash screen de disparaître immédiatement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Shrikhand: Shrikhand_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // Masquer le splash screen une fois que les polices sont chargées
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Conserver le splash screen pendant le chargement
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="preview" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
