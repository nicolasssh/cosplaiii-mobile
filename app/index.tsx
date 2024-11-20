import React, { useState, useCallback, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, CameraType, useCameraPermissions, FlashMode } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import { PinchGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [zoom, setZoom] = useState(0); // Gestion du zoom
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null); // Référence à la caméra
  const [lastTap, setLastTap] = useState<number | null>(null);

  // Charger la police Shrikhand
  const [fontsLoaded] = useFonts({
    Shrikhand: Shrikhand_400Regular,
  });

  // Masquer l'écran de chargement une fois les polices chargées
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Gestion du double-clic
  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      setType((prevType) => (prevType === "back" ? "front" : "back"));
    }
    setLastTap(now);
  };

  const handleSwitchCamera = () => {
    setType((prevType) => (prevType === "back" ? "front" : "back"));
  };

  // Gestion du mode de flash
  const toggleFlashMode = () => {
    setFlashMode((prevMode) => {
      if (prevMode === "off") return "on";
      if (prevMode === "on") return "auto";
      return "off";
    });
  };

  // Gestion du zoom avec pincement
  const handlePinchGesture = ({ nativeEvent }: any) => {
    const scale = nativeEvent.scale;
    const newZoom = Math.min(Math.max(zoom + (scale - 1) / 200, 0), 1); // Rendre le zoom plus lent
    setZoom(newZoom);
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert("Erreur", "Caméra non prête.");
      return;
    }
  
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1, // Qualité maximale
      });
      console.log("Photo prise :", photo.uri);
  
      // Naviguez vers la page de prévisualisation en passant l'URI de la photo
      router.push(`/preview?photoUri=${encodeURIComponent(photo.uri)}`);
    } catch (error) {
      console.error("Erreur lors de la capture de la photo :", error);
      Alert.alert("Erreur", "Impossible de capturer la photo.");
    }
  };  

  // Icône pour représenter l'état du flash
  const getFlashIcon = () => {
    if (flashMode === "off") return "flash-off-outline";
    if (flashMode === "on") return "flash-outline";
    return "flash-outline"; // Utilise une icône générique pour "auto"
  };

  if (!fontsLoaded) {
    return null;
  }

  if (!permission) {
    return <View />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>cosplaiiii.</Text>
        <PinchGestureHandler onGestureEvent={handlePinchGesture}>
          <View style={{ flex: 1 }}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={type}
              flash={flashMode}
              zoom={zoom}
              onTouchEnd={handleDoubleTap} // Double clic via événement tactile
              autofocus="on"
            >
              <StatusBar style="light" />
            </CameraView>
          </View>
        </PinchGestureHandler>
        {/* Icône pour inverser la caméra */}
        <Ionicons
          name="camera-reverse-outline"
          size={30}
          color="#fff"
          style={styles.switchIcon}
          onPress={handleSwitchCamera}
        />
        {/* Bouton pour capturer une photo */}
        <TouchableOpacity style={styles.circle} onPress={takePicture}>
        </TouchableOpacity>
        {/* Icône pour gérer le flash */}
        <Ionicons
          name={getFlashIcon()}
          size={30}
          color="#fff"
          style={styles.flashIcon}
          onPress={toggleFlashMode}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    fontFamily: "Shrikhand", // Utilise la police chargée
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginBottom: 10,
  },
  camera: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  switchIcon: {
    position: "absolute",
    bottom: 40,
    right: 40,
  },
  flashIcon: {
    position: "absolute",
    bottom: 40,
    left: 40,
  },
  circle: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Pour les ombres sur Android
  },
});
