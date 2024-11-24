import React, { useState, useEffect } from "react";
import { 
    Text, 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Switch, 
    Alert, 
    Animated, 
    Dimensions 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMenu } from './MenuProvider';
import SlideMenu from './components/SlideMenu';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MENU_WIDTH = SCREEN_WIDTH * 0.7; // 70% de la largeur de l'écran

export default function SettingsPage() {
    const insets = useSafeAreaInsets();
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [geolocationEnabled, setGeolocationEnabled] = useState(false);
    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        // Notifications
        const { status: notificationStatus } = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(notificationStatus === "granted");

        // Caméra
        const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
        setCameraEnabled(cameraStatus === "granted");

        // Géolocalisation
        const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
        setGeolocationEnabled(locationStatus === "granted");
    };

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const { status } = await Notifications.requestPermissionsAsync();
            setNotificationsEnabled(status === "granted");
        } else {
            Alert.alert("Info", "Vous ne pouvez pas désactiver les notifications depuis l'application.");
        }
    };

    const toggleCameraPermission = async () => {
        if (!cameraEnabled) {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setCameraEnabled(status === "granted");
        } else {
            Alert.alert("Info", "Pour désactiver l'accès à la caméra, veuillez le faire depuis les paramètres système.");
        }
    };

    const toggleGeolocationPermission = async () => {
        if (!geolocationEnabled) {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setGeolocationEnabled(status === "granted");
        } else {
            Alert.alert("Info", "Pour désactiver l'accès à la géolocalisation, veuillez le faire depuis les paramètres système.");
        }
    };

    const handleLogout = () => {
        Alert.alert("Déconnexion", "Vous avez été déconnecté.");
    };

    const handleDeleteData = () => {
        Alert.alert(
            "Supprimer les données",
            "Êtes-vous sûr de vouloir supprimer toutes vos données ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", onPress: () => Alert.alert("Données supprimées.") },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Supprimer le compte",
            "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement votre compte ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", onPress: () => Alert.alert("Compte supprimé.") },
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Menu Slide */}
            <SlideMenu 
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                slideAnim={slideAnim}
            />

            {/* Contenu principal avec animation */}
            <Animated.View 
                style={[
                    styles.mainContent, 
                    { transform: [{ translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, MENU_WIDTH], // Déplacement complet
                    }) }] }
                ]}
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="menu-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Paramètres</Text>
                    <View style={{ width: 30 }} />
                </View>

                {/* Section des autorisations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Autorisations</Text>
                    <View style={styles.row}>
                        <Text style={styles.rowText}>Notifications</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowText}>Caméra</Text>
                        <Switch
                            value={cameraEnabled}
                            onValueChange={toggleCameraPermission}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowText}>Géolocalisation</Text>
                        <Switch
                            value={geolocationEnabled}
                            onValueChange={toggleGeolocationPermission}
                        />
                    </View>
                </View>

                {/* Section de gestion du compte */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gestion du compte</Text>
                    <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Se déconnecter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteData}>
                        <Text style={styles.buttonText}>Supprimer toutes les données</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
                        <Text style={styles.buttonText}>Supprimer le compte</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    mainContent: {
        flex: 1,
        backgroundColor: "#000",
        paddingHorizontal: 20,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        fontFamily: "Shrikhand",
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#444",
    },
    rowText: {
        fontSize: 16,
        color: "#fff",
    },
    button: {
        backgroundColor: "#444",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 50, // Arrondir les boutons
        marginVertical: 10,
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
    },
    dangerButton: {
        backgroundColor: "#d9534f",
    },
});
