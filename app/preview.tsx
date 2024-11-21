import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/recognize`;
const DRAG_THRESHOLD = 300;
const CHEVRON_ANIMATION_DELAY = 800;
const CHEVRON_HIDE_DELAY = 3800;

const translations = {
  en: { 
    "Find informations" : "Find informations",
    "Drag down to cancel" : "Drag down to cancel"
   },
  fr: { 
    "Find informations" : "Trouver des informations",
    "Drag down to cancel" : "Faites glisser pour annuler"
   },
  it: { 
    "Find informations" : "Trova informazioni",
    "Drag down to cancel" : "Trascina per annullare"
   },
  es: { 
    "Find informations" : "Encontrar información",
    "Drag down to cancel" : "Desliza para cancelar"
   },
  pt: { 
    "Find informations" : "Encontrar informações",
    "Drag down to cancel" : "Arraste para cancelar"
   },
  de: { 
    "Find informations" : "Informationen finden",
    "Drag down to cancel" : "Zum Abbrechen ziehen"
  },
};
const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? 'en';

i18n.enableFallback = true;

interface ApiResponse {
  character: string;
  confidence: number;
  image_base64: string;
}

export default function Preview() {
  const insets = useSafeAreaInsets();
  const { photoUri } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const translateY = useSharedValue(0);
  const buttonOffset = useDerivedValue(() => translateY.value * 0.5);
  const textOffset = useDerivedValue(() => translateY.value * 0.5);
  const imageOffset = useDerivedValue(() => translateY.value);
  const iconOpacity = useDerivedValue(() =>
      interpolate(translateY.value, [0, 50], [0, 1])
  );
  const chevronOpacity = useSharedValue(0);

  useEffect(() => {
    const showChevron = setTimeout(() => {
      chevronOpacity.value = withTiming(1, { duration: 200 });
    }, CHEVRON_ANIMATION_DELAY);

    const hideChevron = setTimeout(() => {
      chevronOpacity.value = withTiming(0, { duration: 200 });
    }, CHEVRON_HIDE_DELAY);

    return () => {
      clearTimeout(showChevron);
      clearTimeout(hideChevron);
    };
  }, []);

  if (!photoUri) return null;

  const animatedStyles = {
    image: useAnimatedStyle(() => ({
      transform: [{ translateY: imageOffset.value }],
    })),
    button: useAnimatedStyle(() => ({
      transform: [{ translateY: buttonOffset.value }],
    })),
    hint: useAnimatedStyle(() => ({
      opacity: chevronOpacity.value,
    })),
    chevron: useAnimatedStyle(() => ({
      transform: [{
        translateY: interpolate(chevronOpacity.value, [0, 1], [0, 10]),
      }],
    })),
    icon: useAnimatedStyle(() => ({
      opacity: iconOpacity.value,
      transform: [{ translateY: textOffset.value * 0.5 }],
    })),
  };

  const handleGesture = ({ translationY }: { translationY: number }) => {
    translateY.value = Math.max(0, translationY);
  };

  const handleGestureEnd = () => {
    if (translateY.value > DRAG_THRESHOLD) {
      router.push("/");
    } else {
      translateY.value = withSpring(0);
    }
  };

  const handleFindInformation = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: photoUri,
        name: "image.jpg",
        type: "image/jpeg",
      } as unknown as Blob);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.ok) throw new Error("API Error");

      const result: ApiResponse = await response.json();

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
      console.error("API Error:", error);
      Alert.alert("Error", "Unable to process the image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <GestureHandlerRootView style={styles.root}>
        <PanGestureHandler
            onGestureEvent={(event) => handleGesture(event.nativeEvent)}
            onEnded={handleGestureEnd}
        >
          <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Animated.View style={[styles.hintContainer, animatedStyles.hint]}>
              <Text style={styles.hintText}>{i18n.t("Drag down to cancel")}</Text>
              <Animated.View style={animatedStyles.chevron}>
                <Ionicons name="chevron-down-outline" size={30} color="#fff" />
              </Animated.View>
            </Animated.View>

            <Animated.View style={[styles.iconContainer, animatedStyles.icon]}>
              <Ionicons name="trash-outline" size={30} color="#fff" />
            </Animated.View>

            <Animated.Image
                source={{ uri: photoUri as string }}
                style={[styles.image, animatedStyles.image]}
                resizeMode="cover"
            />

            <Animated.View style={[styles.buttonContainer, animatedStyles.button]}>
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
                      <Text style={styles.confirmText}>{i18n.t("Find informations")}</Text>
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
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
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
    marginLeft: '5%',
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
    fontWeight: "600",
  },
});
