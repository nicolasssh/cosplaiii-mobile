import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { Ionicons } from "@expo/vector-icons";

interface ResultResponse {
  character: string;
  confidence: number;
  image_base64: string;
}

export default function Result() {
  const insets = useSafeAreaInsets();
  const { character, confidence, image_base64, photo_take } = useLocalSearchParams();
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Shrikhand: Shrikhand_400Regular });

  const [backgroundColor, setBackgroundColor] = useState("#000");
  const [newResponse, setNewResponse] = useState<ResultResponse | null>(null);
  const [showConfirm, setShowConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parseFloat(confidence as string) > 0.9999) {
      setBackgroundColor("green");
      setShowConfirm(false);
    }
  }, [confidence]);

  if (!fontsLoaded) return null;

  const handleValidation = async (isTrue: boolean) => {
    setLoading(true);
    try {
      const currentCharacter = newResponse?.character || character;
      const formData = new FormData();
      formData.append("file", {
        uri: photo_take as string,
        name: "image.jpg",
        type: "image/jpeg",
      } as unknown as Blob);

      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      const response = await fetch(
          `${API_URL}/recognize/validate?name=${currentCharacter}&is_true=${isTrue}`,
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
      );

      if (!response.ok) throw new Error("API Error");

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
      console.error("Validation error:", error);
      Alert.alert("Error", "An error occurred during validation.");
    } finally {
      setLoading(false);
    }
  };

  const renderCharacterInfo = () => {
    const data = newResponse || { character, confidence, image_base64 };
    return (
        <>
          {data.image_base64 && (
              <Image
                  source={{ uri: `data:image/png;base64,${data.image_base64}` }}
                  style={styles.characterImage}
                  resizeMode="cover"
              />
          )}
          <Text style={styles.characterText}>{data.character}</Text>
          <Text style={styles.confidenceText}>
            {`sure at ${(parseFloat(data.confidence as unknown as string) * 100).toFixed(2)}%`}
          </Text>
        </>
    );
  };

  return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
        {renderCharacterInfo()}
        {showConfirm && (
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
        )}
        <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.push("/")}
        >
          <Ionicons
              name="add-outline"
              style={styles.closeIcon}
              size={40}
              color="#FFF"
          />
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
    textAlign: "center",
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
    position: "absolute",
    bottom: 40,
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
