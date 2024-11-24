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

// Firebase imports
import { auth, firestore } from './firebase'; // Votre fichier Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { router } from "expo-router";

SplashScreen.preventAutoHideAsync();

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function SignupPage() {
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();
    const insets = useSafeAreaInsets();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
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

    if (!fontsLoaded) return null;

    // Fonction pour enregistrer les utilisateurs dans Firestore
    const saveUserToFirestore = async (user: any, username: string) => {
        const userDocRef = doc(firestore, "users", user.uid);

        // Ajouter les informations de l'utilisateur dans Firestore
        await setDoc(userDocRef, {
            username: username || "Utilisateur inconnu",
            email: user.email || "email inconnu",
            createdAt: new Date().toISOString(),
        });
    };

    // Création de compte avec e-mail
    const handleSignupWithEmail = async () => {
        if (!username) {
            Alert.alert("Erreur", "Veuillez entrer un nom d'utilisateur.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Enregistrer dans Firestore
            await saveUserToFirestore(user, username);

            router.push("/");
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
                    <Text style={styles.header}>Créer un compte</Text>
                    <View style={{ width: 30 }} />
                </View>

                {/* Formulaire de création de compte */}
                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'utilisateur"
                            placeholderTextColor="#aaa"
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="E-mail"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                    <View style={[styles.inputContainer, styles.passwordContainer]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                            <Ionicons
                                name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.inputContainer, styles.passwordContainer]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmer le mot de passe"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!confirmPasswordVisible}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                            <Ionicons
                                name={confirmPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleSignupWithEmail}>
                        <Text style={styles.buttonText}>Créer un compte</Text>
                    </TouchableOpacity>
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
    formContainer: {
        marginBottom: 30,
        paddingBottom: 30,
        borderBottomWidth: 1,
        gap: 20,
        borderBottomColor: "#333",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        height: 50, // Hauteur uniforme
        backgroundColor: "#333",
        borderRadius: 50,
    },
    input: {
        color: "#fff",
        fontSize: 16,
        flex: 1,
    },
    passwordContainer: {
        justifyContent: "space-between",
    },
    button: {
        backgroundColor: "#444",
        paddingVertical: 15,
        borderRadius: 50,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});
