import { Stack, useRouter, usePathname } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import axios from "axios";
import { MenuProvider } from "./MenuProvider";
import { UserProvider } from "./components/UserContext";

const commonScreenOptions = {
  headerShown: false,
  gestureEnabled: false,
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Shrikhand: Shrikhand_400Regular });
  const [isApiHealthy, setIsApiHealthy] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/docs`;

  const checkApiStatus = useCallback(async () => {
    try {
      const response = await axios.get(API_URL); // Remplace par ton URL d'API
      if (response.status === 200) {
        setIsApiHealthy(true);
      } else {
        throw new Error("API non fonctionnelle");
      }
    } catch (error) {
      console.error("API Health Check Error:", error);
      setIsApiHealthy(false);
      router.push("/error");
    }
  }, [router]);

  useEffect(() => {
    checkApiStatus();
  }, [pathname, checkApiStatus]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
      <UserProvider>
        <MenuProvider>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <Stack>
            <Stack.Screen name="index" options={commonScreenOptions} />
            <Stack.Screen name="camera" options={commonScreenOptions} />
            <Stack.Screen name="onboarding" options={commonScreenOptions} />
            <Stack.Screen name="preview" options={commonScreenOptions} />
            <Stack.Screen name="result" options={commonScreenOptions} />
            <Stack.Screen name="error" options={commonScreenOptions} />
            <Stack.Screen name="cosplaydex" options={commonScreenOptions} />
            <Stack.Screen name="settings" options={commonScreenOptions} />
            <Stack.Screen name="login" options={commonScreenOptions} />
            <Stack.Screen name="signup" options={commonScreenOptions} />
            <Stack.Screen name="profile" options={commonScreenOptions} />
          </Stack>
        </GestureHandlerRootView>
      </MenuProvider>
      </UserProvider>
  );
}
