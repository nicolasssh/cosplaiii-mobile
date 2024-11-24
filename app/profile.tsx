import React, { useState, useEffect } from "react";
import { 
    Text, 
    View, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    Animated, 
    Dimensions, 
    Alert 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMenu } from './MenuProvider';
import SlideMenu from './components/SlideMenu';
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { auth, firestore } from "./firebase"; // Importez Firebase
import { updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

SplashScreen.preventAutoHideAsync();

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ProfilePage() {
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();
    const insets = useSafeAreaInsets();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    const mainViewTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCREEN_WIDTH * 0.7],
    });

    useEffect(() => {
        const hideSplashScreen = async () => {
            if (fontsLoaded) await SplashScreen.hideAsync();
        };
        hideSplashScreen();
    }, [fontsLoaded]);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                // Récupérer les données utilisateur depuis Firestore
                const userDocRef = doc(firestore, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUsername(userData.username || "Utilisateur");
                    setEmail(user.email || "");
                } else {
                    console.error("Document utilisateur non trouvé.");
                }
            }
        };

        fetchUserData();
    }, []);

    if (!fontsLoaded) return null;

    const handleUpdateEmail = async () => {
        try {
            if (!email) {
                Alert.alert("Erreur", "Veuillez entrer une adresse e-mail valide.");
                return;
            }
            const user = auth.currentUser;
            if (user) {
                await updateEmail(user, email);
                Alert.alert("Succès", "Votre adresse e-mail a été mise à jour !");
            }
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    const handleUpdatePassword = async () => {
        try {
            if (!newPassword) {
                Alert.alert("Erreur", "Veuillez entrer un nouveau mot de passe.");
                return;
            }
            const user = auth.currentUser;
            if (user) {
                await updatePassword(user, newPassword);
                Alert.alert("Succès", "Votre mot de passe a été mis à jour !");
            }
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    const handleUpdateUsername = async () => {
        try {
            if (!username) {
                Alert.alert("Erreur", "Veuillez entrer un nom d'utilisateur valide.");
                return;
            }
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(firestore, "users", user.uid);
                await updateDoc(userDocRef, { username });
                Alert.alert("Succès", "Votre nom d'utilisateur a été mis à jour !");
            }
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Animated.View 
                style={[
                    styles.container, 
                    { paddingTop: insets.top, transform: [{ translateX: mainViewTranslateX }] }
                ]}
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="menu-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.header}>{username}</Text>
                    <View style={{ width: 30 }} />
                </View>

                {/* Formulaire pour modifier les données */}
                <View style={styles.formContainer}>
                    <Text style={{ color: "#FFF", fontWeight: 700 }}>Modifier votre compte</Text>
                    {/* Modifier le nom d'utilisateur */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'utilisateur"
                            placeholderTextColor="#aaa"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
                            <Text style={styles.buttonText}>Modifier</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modifier l'email */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="E-mail"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
                            <Text style={styles.buttonText}>Modifier</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modifier le mot de passe */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nouveau mot de passe"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
                            <Text style={styles.buttonText}>Modifier</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <StatusBar style="light" />
            </Animated.View>

            <SlideMenu 
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                slideAnim={slideAnim}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        fontFamily: "Shrikhand",
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        color: "#fff",
    },
    usernameContainer: {
        marginBottom: 30,
        alignItems: "center",
    },
    username: {
        fontFamily: "Shrikhand",
        fontSize: 30,
        color: "#fff",
    },
    formContainer: {
        marginBottom: 30,
        gap: 20,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        borderRadius: 50,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
    },
    input: {
        color: "#fff",
        fontSize: 16,
        flex: 1,
    },
    button: {
        backgroundColor: "#444",
        borderRadius: 50,
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
    },
});
