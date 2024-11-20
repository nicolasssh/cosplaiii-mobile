import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const slides = [
  {
    title: "Take a picture",
    emoji: "📸",
    text: "Take a picture of your favorite cosplay",
  },
  {
    title: "Ask for infos",
    emoji: "🤔",
    text: "Ask for information about the cosplay",
  },
  {
    title: "Get a response",
    emoji: "🎉",
    text: "Get the character of the cosplay",
  },
];

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const [_, requestPermission] = useCameraPermissions();

  const handleCameraPermission = async () => {
    if (currentIndex === 0) {
      const { status } = await requestPermission();
      if (status !== "granted") return;
    }
    handleNextSlide();
  };

  const handleNextSlide = async () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await AsyncStorage.setItem("hasLaunched", "true");
      router.replace("/camera");
    }
  };

  return (
      <View style={styles.container}>
        <View style={[styles.slide, { width, height: height * 0.7 }]}>
          <Text style={styles.emoji}>{slides[currentIndex].emoji}</Text>
          <Text style={styles.title}>{slides[currentIndex].title}</Text>
          <Text style={styles.text}>{slides[currentIndex].text}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCameraPermission}>
          <Text style={styles.buttonText}>
            {currentIndex < slides.length - 1 ? "Next" : "Confirm"}
          </Text>
          {currentIndex < slides.length - 1 && (
              <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
          )}
        </TouchableOpacity>
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
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e90ff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 10,
  },
});
