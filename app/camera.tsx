// Camera.tsx
import React, { useState, useCallback, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, Animated, Dimensions } from "react-native";
import { CameraView, CameraType, useCameraPermissions, FlashMode } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import {
    GestureHandlerRootView,
    PinchGestureHandler,
    PinchGestureHandlerGestureEvent
} from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import SlideMenu from './components/SlideMenu';
import { useMenu } from './MenuProvider';

SplashScreen.preventAutoHideAsync();

interface PhotoAsset {
  uri: string;
  width: number;
  height: number;
}

export default function Camera() {
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [type, setType] = useState<CameraType>("back");
    const [flashMode, setFlashMode] = useState<FlashMode>("off");
    const [zoom, setZoom] = useState<number>(0);
    const insets = useSafeAreaInsets();
    const cameraRef = useRef<CameraView>(null);
    const [lastTap, setLastTap] = useState<number | null>(null);

    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    const mainViewTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Dimensions.get('window').width * 0.7],
    });

    useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!permission?.granted) {
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

    const handlePinchGesture = ({ nativeEvent }: PinchGestureHandlerGestureEvent) => {
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
            <PinchGestureHandler onGestureEvent={handlePinchGesture}>
                <Animated.View 
                    style={[
                        styles.container, 
                        { 
                            paddingTop: insets.top,
                            transform: [{ translateX: mainViewTranslateX }]
                        }
                    ]}
                >
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={toggleMenu}>
                            <Ionicons name="menu-outline" size={30} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.header}>cosplaiiii.</Text>
                        <View style={{ width: 30 }} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            type={type}
                            flashMode={flashMode}
                            zoom={zoom}
                            onTouchEnd={handleDoubleTap}
                            enableAutoFocus={true}
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
                </Animated.View>
            </PinchGestureHandler>
            
            <SlideMenu 
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                slideAnim={slideAnim}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    header: {
        fontFamily: "Shrikhand",
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        color: "#fff",
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
});