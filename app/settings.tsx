import React, { useState, useEffect } from "react";
import { 
    Text, 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Switch, 
    Alert, 
    Animated, 
    Dimensions, 
    TextInput 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMenu } from './MenuProvider';
import SlideMenu from './components/SlideMenu';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { auth, firestore } from "./firebase"; // Importez Firebase auth et Firestore
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MENU_WIDTH = SCREEN_WIDTH * 0.7;

export default function SettingsPage() {
    const insets = useSafeAreaInsets();
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [geolocationEnabled, setGeolocationEnabled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState(""); // État pour le mot de passe
    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    useEffect(() => {
        checkPermissions();

        // Vérifiez si l'utilisateur est connecté
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user);
        });

        return unsubscribe;
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

    const handleDeleteAccount = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Erreur", "Aucun utilisateur n'est connecté.");
            return;
        }

        if (!password) {
            Alert.alert("Erreur", "Veuillez entrer votre mot de passe pour continuer.");
            return;
        }

        Alert.alert(
            "Supprimer le compte",
            "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement votre compte ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    onPress: async () => {
                        try {
                            // Réauthentification
                            const credential = EmailAuthProvider.credential(user.email!, password);
                            await reauthenticateWithCredential(user, credential);

                            // Supprimer les données utilisateur dans Firestore
                            const userId = user.uid;
                            const userCollections = ["user_cosplaydex", "other_user_collection"]; // Ajoutez ici les collections liées à l'utilisateur

                            for (const collectionName of userCollections) {
                                const colRef = collection(firestore, collectionName);
                                const q = query(colRef, where("user_id", "==", userId));
                                const querySnapshot = await getDocs(q);

                                for (const docSnap of querySnapshot.docs) {
                                    await deleteDoc(docSnap.ref);
                                }
                            }

                            // Supprimer le document principal de l'utilisateur (exemple : collection "users")
                            const userDocRef = doc(firestore, "users", userId);
                            await deleteDoc(userDocRef);

                            // Supprimer l'utilisateur dans Firebase Auth
                            await deleteUser(user);

                            // Déconnecter l'utilisateur
                            auth.signOut();

                            Alert.alert("Succès", "Votre compte a été supprimé avec succès.");
                        } catch (error: any) {
                            console.error("Erreur lors de la suppression du compte:", error);
                            if (error.code === "auth/wrong-password") {
                                Alert.alert("Erreur", "Mot de passe incorrect. Veuillez réessayer.");
                            } else {
                                Alert.alert("Erreur", "Une erreur est survenue lors de la suppression du compte.");
                            }
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <SlideMenu 
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                slideAnim={slideAnim}
            />

            <Animated.View 
                style={[
                    styles.mainContent, 
                    { transform: [{ translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, MENU_WIDTH],
                    }) }] }
                ]}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="menu-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Paramètres</Text>
                    <View style={{ width: 30 }} />
                </View>

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

                {isLoggedIn && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gestion du compte</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Entrez votre mot de passe"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
                            <Text style={styles.buttonText}>Supprimer le compte</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
        borderRadius: 50,
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
    input: {
        backgroundColor: "#333",
        color: "#fff",
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 20,
        fontSize: 16,
    },
});
