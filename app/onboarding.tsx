import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "./translation/i18n";

interface Slide {
  title: string;
  emoji: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    title: t('actions.takePicture'),
    emoji: "📸",
    text: t('messages.takePictureInfo'),
  },
  {
    title: t('actions.askForInfos'),
    emoji: "🤔",
    text: t('messages.askForInformation'),
  },
  {
    title: t('actions.getResponse'),
    emoji: "🎉",
    text: t('messages.getResponseInfo'),
  },
];

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const [_, requestCameraPermission] = useCameraPermissions();

  const handlePermissionsAndNext = async () => {
    if (currentIndex === 0) {
      const { status } = await requestCameraPermission();
      if (status !== "granted") {
        Alert.alert(
            "Permission Required",
            "Camera access is required to use this app."
        );
        return;
      }
    }

    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await AsyncStorage.setItem("hasLaunched", "true");
      router.replace("/camera");
    }
  };

  const renderSlide = () => (
      <View style={[styles.slide, { width, height: height * 0.7 }]}>
        <Text style={styles.emoji}>{SLIDES[currentIndex].emoji}</Text>
        <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
        <Text style={styles.text}>{SLIDES[currentIndex].text}</Text>
      </View>
  );

  const renderButton = () => (
      <TouchableOpacity style={styles.button} onPress={handlePermissionsAndNext}>
        <Text style={styles.buttonText}>
          {currentIndex < SLIDES.length - 1 ? t("common.next") : t("common.confirm")}
        </Text>
        {currentIndex < SLIDES.length - 1 && (
            <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
        )}
      </TouchableOpacity>
  );

  return (
      <View style={styles.container}>
        {renderSlide()}
        {renderButton()}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e90ff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
});
