import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useGlobalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useDerivedValue, 
  withSpring, 
  withTiming, 
  interpolate 
} from "react-native-reanimated";

export default function Preview() {
  const insets = useSafeAreaInsets();
  const glob = useGlobalSearchParams();
  const local = useLocalSearchParams();
  const router = useRouter();
  const photoUri = glob.photoUri ? glob.photoUri : local.photoUri;

  const translateY = useSharedValue(0);
  const buttonOffset = useDerivedValue(() => translateY.value * 0.5); // Réduction du mouvement des boutons
  const textOffset = useDerivedValue(() => translateY.value * 0.5);
  const imageOffset = useDerivedValue(() => translateY.value); // Animation pour l'image
  const iconOpacity = useDerivedValue(() => interpolate(translateY.value, [0, 50], [0, 1])); // Animation d'opacité
  const chevronOpacity = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const showIcon = setTimeout(() => {
      chevronOpacity.value = withTiming(1, { duration: 200 });
    }, 800);

    const hideIcon = setTimeout(() => {
      chevronOpacity.value = withTiming(0, { duration: 200 });
    }, 3800);

    return () => {
      clearTimeout(showIcon);
      clearTimeout(hideIcon);
    };
  }, []);

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

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: imageOffset.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonOffset.value }],
  }));

  const hintAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chevronOpacity.value,
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(chevronOpacity.value, [0, 1], [0, 10]),
      },
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ translateY: textOffset.value * 0.5 }],
  }));

  const handleFindInformation = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: photoUri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      const response = await fetch("http://192.168.1.50:8000/recognize", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'appel API");
      }

      const result = await response.json();

      router.push({
        pathname: "/result",
        params: {
          character: result.character,
          confidence: result.confidence.toString(),
          image_base64: result.image_base64,
          photo_take: photoUri,
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
      Alert.alert("Erreur", "Impossible de traiter l'image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <PanGestureHandler
        onGestureEvent={(event) => handleGesture(event.nativeEvent)}
        onEnded={handleGestureEnd}
      >
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <Animated.View style={[styles.hintContainer, hintAnimatedStyle]}>
            <Text style={styles.hintText}>Drag down to cancel</Text>
            <Animated.View style={chevronAnimatedStyle}>
              <Ionicons name="chevron-down-outline" size={30} color="#fff" />
            </Animated.View>
          </Animated.View>
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <Ionicons name="trash-outline" size={30} color="#fff" />
          </Animated.View>
          <Animated.Image
            source={{ uri: photoUri }}
            style={[styles.image, imageAnimatedStyle]}
            resizeMode="cover"
          />
          <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
            <TouchableOpacity style={styles.deleteButton} onPress={() => router.push("/")}>
              <Ionicons name="add-outline" size={30} color="#fff" style={styles.deleteIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={handleFindInformation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Text style={styles.confirmText}>Find informations</Text>
                  <Ionicons name="sparkles-outline" size={20} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30
  },
  hintContainer: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 50,
  },
  hintText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
  },
  iconContainer: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    zIndex: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    position: "absolute",
    bottom: 40,
    marginLeft: '5%'
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
  confirmText: {
    marginRight: 20,
    fontSize: 16,
    fontWeight: 600
  }
});
