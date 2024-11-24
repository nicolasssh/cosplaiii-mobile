import React, { useState, useEffect, useCallback } from "react";
import { 
    Text, 
    View, 
    StyleSheet, 
    Animated, 
    Dimensions, 
    TouchableOpacity,
    ImageBackground,
    FlatList 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from 'expo-blur';
import { auth, firestore } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SlideMenu from './components/SlideMenu';
import { useMenu } from './MenuProvider';

SplashScreen.preventAutoHideAsync();

interface Character {
    name: string;
    image_base64: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 10;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_MARGIN * 4)) / 2;
const CARD_HEIGHT = CARD_WIDTH * 16 / 9;

export default function Cosplaydex() {
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userCosplaydexNames, setUserCosplaydexNames] = useState<string[]>([]);
    const [unlockedCount, setUnlockedCount] = useState<number>(0); // Nouvel état pour les cartes uniques débloquées

    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    useEffect(() => {
        fetchCharacters();

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setIsLoggedIn(!!user);
            if (user) {
                await fetchUserCosplaydex(user.uid);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        // Mettre à jour le nombre de cartes débloquées uniques
        const uniqueUnlocked = new Set(userCosplaydexNames).size;
        setUnlockedCount(uniqueUnlocked);

        // Mettre à jour la progression
        const totalCharacters = characters.length;
        if (totalCharacters > 0) {
            setProgress((uniqueUnlocked / totalCharacters) * 100);
        }
    }, [userCosplaydexNames, characters]);

    const mainViewTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCREEN_WIDTH * 0.7],
    });

    const fetchCharacters = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/recognize/characters`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const data = await response.json();
            setCharacters(data);
        } catch (error) {
            console.error('Error fetching characters:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCosplaydex = async (userId: string) => {
        try {
            const userCosplaydexRef = collection(firestore, "user_cosplaydex");
            const q = query(userCosplaydexRef, where("user_id", "==", userId));
            const querySnapshot = await getDocs(q);

            const cosplaydexNames: string[] = [];
            for (const docSnap of querySnapshot.docs) {
                const data = docSnap.data();
                const cosplaydexRef = collection(firestore, "cosplaydex");
                const cosplaydexQuery = query(cosplaydexRef, where("__name__", "==", data.cosplaydex_id));
                const cosplaydexSnap = await getDocs(cosplaydexQuery);

                cosplaydexSnap.forEach((snap) => {
                    const cosplayData = snap.data();
                    cosplaydexNames.push(cosplayData.name.toLowerCase());
                });
            }

            setUserCosplaydexNames(cosplaydexNames);
        } catch (error) {
            console.error("Error fetching user cosplaydex:", error);
        }
    };

    useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    const renderCharacterCard = ({ item }: { item: Character }) => {
        // Calcul des occurrences pour ce personnage
        const occurrences = userCosplaydexNames.filter(
            (name) => name === item.name.toLowerCase()
        ).length;
    
        // Déterminer si ce personnage est débloqué
        const isUnlocked = occurrences > 0;
    
        // Ajuster l'opacité de l'image
        const imageOpacity = isUnlocked ? 1 : 0.2;
    
        return (
            <View style={styles.cardContainer}>
                <ImageBackground
                    source={{ uri: `data:image/jpeg;base64,${item.image_base64}` }}
                    style={[styles.cardBackground, { opacity: imageOpacity }]}
                    imageStyle={styles.cardImage}
                >
                    {/* Afficher un badge avec les occurrences si débloqué */}
                    {isUnlocked && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{occurrences}</Text>
                        </View>
                    )}
                    <View style={styles.cardOverlay}>
                        <Text style={styles.characterName}>{item.name}</Text>
                    </View>
                </ImageBackground>
            </View>
        );
    };
    

    return (
        <View style={{ flex: 1 }}>
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
                    <Text style={styles.header}>Cosplaydex</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progress, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{unlockedCount}/{characters.length} débloqués</Text>
                </View>

                <FlatList
                    data={characters}
                    renderItem={renderCharacterCard}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                    onEndReachedThreshold={0.1}
                    ListEmptyComponent={
                        !loading ? (
                            <Text style={styles.emptyText}>Aucun personnage trouvé</Text>
                        ) : null
                    }
                />

                <StatusBar style="light" />
            </Animated.View>
            
            {!isLoggedIn && (
                <BlurView intensity={80} style={styles.blurView}>
                    <Text style={styles.blurText}>
                        Vous devez être connecté pour accéder au Cosplaydex.
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                </BlurView>
            )}

            <SlideMenu 
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                slideAnim={slideAnim}
                isLoggedIn={isLoggedIn}
            />
        </View>
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
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    progressBar: {
        flex: 1,
        height: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        overflow: 'hidden',
        marginRight: 10,
    },
    progress: {
        height: '100%',
        backgroundColor: '#fff',
    },
    progressText: {
        color: '#fff',
        fontSize: 14,
    },
    gridContainer: {
        padding: CARD_MARGIN,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        margin: CARD_MARGIN,
        borderRadius: 15,
        overflow: 'hidden',
    },
    cardBackground: {
        width: '100%',
        height: '100%',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: 10,
    },
    characterName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Shrikhand',
        textTransform: 'capitalize',
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'white',
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    badgeText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    blurText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
