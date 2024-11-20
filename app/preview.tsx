import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Alert, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useGlobalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export default function Preview() {
  const insets = useSafeAreaInsets();
  const glob = useGlobalSearchParams();
  const local = useLocalSearchParams();
  const router = useRouter();
  const photoUri = glob.photoUri ? glob.photoUri : local.photoUri;

  const translateY = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(false); // État pour le loading spinner

  if (!photoUri) {
    return null;
  }

  const handleGesture = ({ translationY }: any) => {
    translateY.value = translationY > 0 ? translationY : 0;
  };

  const handleGestureEnd = () => {
    if (translateY.value > 300) {
      router.push("/");
    } else {
      translateY.value = withSpring(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleFindInformation = async () => {
    setIsLoading(true); // Activer le spinner
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: photoUri, // URI de l'image
        name: "image.jpg", // Nom du fichier
        type: "image/jpeg", // Type MIME
      });

      const response = await fetch("http://192.168.1.158:8000/recognize", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'appel API");
      }

      const result = await response.json(); // Résultat de l'API

      console.log(result);

      // Redirection vers la page Result
      router.push({
        pathname: "/result",
        params: {
          character: result.character,
          confidence: result.confidence.toString(),
          image_base64: result.image_base64,
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
      Alert.alert("Erreur", "Impossible de traiter l'image");
    } finally {
      setIsLoading(false); // Désactiver le spinner
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000', }}>
      <PanGestureHandler
        onGestureEvent={(event) => handleGesture(event.nativeEvent)}
        onEnded={handleGestureEnd}
      >
        <Animated.View
          style={[
            styles.container,
            animatedStyle,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.deleteButton} onPress={() => router.push("/")}>
              <Ionicons name="add-outline" size={30} color="#fff" style={styles.deleteIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={handleFindInformation}
              disabled={isLoading} // Désactive le bouton pendant le chargement
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Text style={styles.infoText}>Find informations</Text>
                  <Ionicons name="sparkles-outline" size={20} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    position: "absolute",
    bottom: 40,
  },
  deleteButton: {
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
  deleteIcon: {
    transform: [{ rotate: "45deg" }],
  },
  infoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginLeft: 20,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 20,
  },
});
