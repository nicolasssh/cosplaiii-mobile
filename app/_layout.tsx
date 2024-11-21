import { Stack, useRouter, usePathname } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import axios from "axios"; // Librairie pour effectuer des requêtes HTTP

// Empêcher le splash screen de disparaître immédiatement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Shrikhand: Shrikhand_400Regular,
  });

  const router = useRouter(); // Utilisé pour rediriger l'utilisateur
  const pathname = usePathname(); // Récupère la route actuelle
  const [isApiHealthy, setIsApiHealthy] = useState(true); // État pour savoir si l'API est fonctionnelle

  const checkApiStatus = useCallback(async () => {
    try {
      const response = await axios.get("http://192.168.1.50:8000/docs"); // Remplace par ton URL d'API
      if (response.status === 200) {
        setIsApiHealthy(true);
      } else {
        throw new Error("API non fonctionnelle");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'API :", error);
      setIsApiHealthy(false);
      router.push("/error"); // Redirige vers la page d'erreur
    }
  }, [router]);

  useEffect(() => {
    const performCheck = async () => {
      await checkApiStatus(); // Vérifie l'API à chaque changement de route
    };

    performCheck();
  }, [pathname, checkApiStatus]); // Réexécute quand la route change

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // Masquer le splash screen une fois que les polices sont prêtes
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
        <Stack.Screen name="error" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
