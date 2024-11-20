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

SplashScreen.preventAutoHideAsync();

export default function Camera() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [type, setType] = useState<CameraType>("back");
    const [flashMode, setFlashMode] = useState<FlashMode>("off");
    const [zoom, setZoom] = useState(0);
    const insets = useSafeAreaInsets();
    const cameraRef = useRef<CameraView>(null);
    const [lastTap, setLastTap] = useState<number | null>(null);

    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

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
            setType(prevType => prevType === "back" ? "front" : "back");
        }
        setLastTap(now);
    };

    const handlePinchGesture = ({ nativeEvent }: any) => {
        const scale = nativeEvent.scale;
        const newZoom = Math.min(Math.max(zoom + (scale - 1) / 200, 0), 1);
        setZoom(newZoom);
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

            // J'ai commenté car c'est en erreur à voir le problème
            // router.push(`/preview?photoUri=${encodeURIComponent(photo.uri)}`);
        } catch (error) {
            console.error("Erreur lors de la capture :", error);
            Alert.alert("Erreur", "Impossible de capturer la photo.");
        }
    };

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
                            onTouchEnd={handleDoubleTap}
                            autofocus="on"
                        >
                            <StatusBar style="light" />
                        </CameraView>
                    </View>
                </PinchGestureHandler>
                <Ionicons
                    name="camera-reverse-outline"
                    size={30}
                    color="#fff"
                    style={styles.switchIcon}
                    onPress={() => setType(prevType => prevType === "back" ? "front" : "back")}
                />
                <TouchableOpacity style={styles.circle} onPress={takePicture} />
                <Ionicons
                    name={flashMode === "off" ? "flash-off-outline" : "flash-outline"}
                    size={30}
                    color="#fff"
                    style={styles.flashIcon}
                    onPress={() => setFlashMode(prev => prev === "off" ? "on" : "off")}
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
        elevation: 5,
    },
});
