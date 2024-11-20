import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Slot, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false); // État pour gérer la préparation

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        if (!hasLaunched) {
          await AsyncStorage.setItem("hasLaunched", "true");
          router.replace("/onboarding"); // Rediriger vers onboarding
        } else {
          router.replace("/"); // Rediriger vers la page principale
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la première ouverture :", error);
      } finally {
        setIsReady(true); // Marquer comme prêt après la vérification
      }
    };

    checkFirstLaunch();
  }, [router]);

  if (!isReady) {
    // Retourne un écran de chargement tant que la vérification est en cours
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return <Slot />; // Affiche les pages une fois que tout est prêt
}
