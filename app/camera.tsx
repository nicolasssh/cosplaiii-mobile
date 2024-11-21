import React, { useState, useCallback, useRef, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, Animated } from "react-native";
import { CameraView, CameraType, useCameraPermissions, FlashMode } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

SplashScreen.preventAutoHideAsync();

const translations = {
  en: { 
    "Drag up to show gallery" : "Drag up to show gallery"
   },
  fr: { 
    "Drag up to show gallery" : "Faites glisser pour afficher la galerie"
   },
  it: { 
    "Drag up to show gallery" : "Trascina per mostrare la galleria"
   },
  es: { 
    "Drag up to show gallery" : "Desliza para mostrar la galería"
   },
  pt: { 
    "Drag up to show gallery" :  "Arraste para mostrar a galeria"
   },
  de: { 
    "Drag up to show gallery" : "Zum Anzeigen der Galerie ziehen"
  },
};
const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? 'en';

i18n.enableFallback = true;

export default function Camera() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [type, setType] = useState<CameraType>("back");
    const [flashMode, setFlashMode] = useState<FlashMode>("off");
    const [zoom, setZoom] = useState(0);
    const insets = useSafeAreaInsets();
    const cameraRef = useRef<CameraView>(null);
    const [lastTap, setLastTap] = useState<number | null>(null);
    const [opacityAnim] = useState(new Animated.Value(0)); // Animation de l'opacité

    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        // Ajoute un délai de 0.8s avant l'apparition
        const delayTimeout = setTimeout(() => {
            // Animation d'apparition
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200, // Durée de 0.2s
                useNativeDriver: true,
            }).start();

            // Cache le texte après 3 secondes
            const hideTextTimeout = setTimeout(() => {
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200, // Animation de disparition
                    useNativeDriver: true,
                }).start();
            }, 3000);

            return () => clearTimeout(hideTextTimeout);
        }, 800); // Délai avant l'apparition

        return () => clearTimeout(delayTimeout);
    }, [opacityAnim]);

    if (!permission || !permission.granted) {
        const getPermission = async () => {
            const cameraPermission = await requestPermission();
            if (!cameraPermission.granted) {
                Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour utiliser l'application.");
            }
        };
        getPermission();
        return null;
    }

    if (!fontsLoaded) return null;

    const handleDoubleTap = () => {
        const now = Date.now();
        if (lastTap && now - lastTap < 300) {
            setType(prevType => (prevType === "back" ? "front" : "back"));
        }
        setLastTap(now);
    };

    const handlePinchGesture = ({ nativeEvent }: any) => {
        const scale = nativeEvent.scale;
        const newZoom = Math.min(Math.max(zoom + (scale - 1) / 200, 0), 1);
        setZoom(newZoom);
    };

    const handleDrag = ({ nativeEvent }: any) => {
        if (nativeEvent.translationY < -100) {
            // Si l'utilisateur scrolle vers le haut
            chooseFromGallery();
        }
    };

    const takePicture = async () => {
        if (!cameraRef.current) {
            Alert.alert("Erreur", "Caméra non prête.");
            return;
        }

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
            });

            router.push(`/preview?photoUri=${encodeURIComponent(photo?.uri as string)}`);
        } catch (error) {
            console.error("Erreur lors de la capture :", error);
            Alert.alert("Erreur", "Impossible de capturer la photo.");
        }
    };

    const chooseFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const photoUri = result.assets[0].uri;
            router.push(`/preview?photoUri=${encodeURIComponent(photoUri)}`);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler onGestureEvent={handleDrag}>
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <Text style={styles.header}>cosplaiiii.</Text>
                    <View style={{ flex: 1 }}>
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            facing={type}
                            flash={flashMode}
                            zoom={zoom}
                            onTouchEnd={handleDoubleTap}
                            autofocus="on"
                        >
                            <StatusBar style="light" />
                        </CameraView>
                    </View>
                    <Ionicons
                        name={flashMode === "off" ? "flash-off-outline" : "flash-outline"}
                        size={30}
                        color="#fff"
                        style={styles.flashIcon}
                        onPress={() => setFlashMode(prev => (prev === "off" ? "on" : "off"))}
                    />
                    <Ionicons
                        name="camera-reverse-outline"
                        size={30}
                        color="#fff"
                        style={styles.switchIcon}
                        onPress={() => setType(prevType => (prevType === "back" ? "front" : "back"))}
                    />
                    <TouchableOpacity style={styles.galleryIcon} onPress={chooseFromGallery}>
                        <Ionicons name="image-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circle} onPress={takePicture} />

                    {/* Texte Drag Up avec animation */}
                    <Animated.View style={[styles.dragTextContainer, { opacity: opacityAnim }]}>
                        <Ionicons name="chevron-up-outline" size={30} color="#fff" />
                        <Text style={styles.dragText}>{i18n.t("Drag up to show gallery")}</Text>
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
    header: {
        fontFamily: "Shrikhand",
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
    flashIcon: {
        position: "absolute",
        top: 150,
        left: 40,
    },
    switchIcon: {
        position: "absolute",
        bottom: 40,
        right: 40,
    },
    galleryIcon: {
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
        elevation: 5,
    },
    dragTextContainer: {
        position: "absolute",
        bottom: 130,
        alignSelf: "center",
        alignItems: "center",
    },
    dragText: {
        color: "#fff",
        fontSize: 16,
        marginTop: 5,
    },
});
