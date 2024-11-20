import React from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { Ionicons } from "@expo/vector-icons";

export default function Result() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { character, confidence, image_base64 } = params;

  // Charger la police Shrikhand
  const [fontsLoaded] = useFonts({
    Shrikhand: Shrikhand_400Regular,
  });

  if (!fontsLoaded) {
    return null; // Affichez un écran de chargement si nécessaire
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {image_base64 && (
        <Image
          source={{ uri: `data:image/png;base64,${image_base64}`}}
          style={styles.characterImage}
          resizeMode="cover"
        />
      )}
      <Text style={styles.characterText}>{character}</Text>
      <Text style={styles.confidenceText}>
        {`sure at ${(parseFloat(confidence) * 100).toFixed(2)}%`}
      </Text>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.push("/")}>
        <Ionicons name="add-outline" style={styles.closeIcon} size={40} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  characterText: {
    fontFamily: "Shrikhand", // Utilise la police Shrikhand
    fontSize: 40,
    color: "#fff",
    marginBottom: 0,
  },
  confidenceText: {
    fontSize: 16,
    color: "#fff",
  },
  characterImage: {
    width: 150, // Largeur de l'image
    height: 150, // Hauteur de l'image
    borderRadius: 30, // Bords arrondis
    marginBottom: 20, // Espacement entre l'image et le texte
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    position: "absolute",
    bottom: 40,
  },
  closeIcon: {
    transform: [{ rotate: "45deg" }],
  }
});
