import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { Ionicons } from "@expo/vector-icons";

export default function Result() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { character, confidence, image_base64, photo_take } = params;

  const [backgroundColor, setBackgroundColor] = useState("#000");
  const [newResponse, setNewResponse] = useState(null);
  const [showConfirm, setShowConfirm] = useState(true);
  const [loading, setLoading] = useState(false); // État pour le spinner de chargement

  // Charger la police Shrikhand
  const [fontsLoaded] = useFonts({
    Shrikhand: Shrikhand_400Regular,
  });

  useEffect(() => {
    // Si la confidence est supérieure à 0.99, cacher le bloc de confirmation
    if (parseFloat(confidence) > 0.9999) {
      setBackgroundColor("green"); // Changer le fond en vert
      setShowConfirm(false);
    }
  }, [confidence]);

  if (!fontsLoaded) {
    return null; // Affichez un écran de chargement si nécessaire
  }

  const handleValidation = async (isTrue) => {
    setLoading(true); // Activer le spinner
    try {
      const currentCharacter = newResponse?.character || character;

      const formData = new FormData();
      formData.append("file", {
        uri: photo_take,
        name: "image.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(
        `http://192.168.1.50:8000/recognize/validate?name=${currentCharacter}&is_true=${isTrue}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'appel API");
      }

      const result = await response.json();

      if (isTrue) {
        setBackgroundColor("green");
        setShowConfirm(false);
      } else if (result.character) {
        setNewResponse(result);
      } else {
        setBackgroundColor("red");
        setShowConfirm(false);
      }
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la validation.");
    } finally {
      setLoading(false); // Désactiver le spinner
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
      {newResponse ? (
        <>
          {newResponse.image_base64 && (
            <Image
              source={{ uri: `data:image/png;base64,${newResponse.image_base64}` }}
              style={styles.characterImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.characterText}>{newResponse.character}</Text>
          <Text style={styles.confidenceText}>
            {`sure at ${(parseFloat(newResponse.confidence) * 100).toFixed(2)}%`}
          </Text>
        </>
      ) : (
        <>
          {image_base64 && (
            <Image
              source={{ uri: `data:image/png;base64,${image_base64}` }}
              style={styles.characterImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.characterText}>{character}</Text>
          <Text style={styles.confidenceText}>
            {`sure at ${(parseFloat(confidence) * 100).toFixed(2)}%`}
          </Text>
        </>
      )}
      {showConfirm ? (
        <View style={styles.confirm}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <>
              <Text style={styles.confirmText}>Is this response correct?</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => handleValidation(true)}
                >
                  <Ionicons name="thumbs-up-outline" size={40} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => handleValidation(false)}
                >
                  <Ionicons name="thumbs-down-outline" size={40} color="#000" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : null}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.push("/")}>
        <Ionicons name="add-outline" style={styles.closeIcon} size={40} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  characterText: {
    fontFamily: "Shrikhand",
    fontSize: 40,
    color: "#fff",
    marginBottom: 10,
  },
  confidenceText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  characterImage: {
    width: 150,
    height: 150,
    borderRadius: 30,
    marginBottom: 20,
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
  },
  confirm: {
    width: "90%",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#FFF",
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "600",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 20,
  },
  confirmButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
