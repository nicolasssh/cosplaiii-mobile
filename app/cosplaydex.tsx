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
import SlideMenu from './components/SlideMenu';
import { useMenu } from './MenuProvider';

SplashScreen.preventAutoHideAsync();

interface Character {
    name: string;
    image_base64: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 10;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_MARGIN * 4)) / 2; // 2 colonnes avec marges
const CARD_HEIGHT = CARD_WIDTH * 16 / 9; // Ratio d'écran de téléphone standard (16:9)

export default function Cosplaydex() {
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0); // Progrès affiché (0/total)

    const [fontsLoaded] = useFonts({
        Shrikhand: Shrikhand_400Regular,
    });

    useEffect(() => {
        fetchCharacters();
    }, []);

    const mainViewTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Dimensions.get('window').width * 0.7],
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
            setProgress(0); // Initialiser à 0
        } catch (error) {
            console.error('Error fetching characters:', error);
        } finally {
            setLoading(false);
        }
    };

    useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    const renderCharacterCard = ({ item }: { item: Character }) => (
        <View style={styles.cardContainer}>
            <ImageBackground
                source={{ uri: `data:image/jpeg;base64,${item.image_base64}` }}
                style={styles.cardBackground}
                imageStyle={styles.cardImage}
            >
                <View style={styles.cardOverlay}>
                    <Text style={styles.characterName}>{item.name}</Text>
                </View>
            </ImageBackground>
        </View>
    );

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
                    <Text style={styles.header}>cosplaydex</Text>
                    <View style={{ width: 30 }} />
                </View>

                {/* Barre de progression sous le titre */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progress, { width: `${(progress / characters.length) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}/{characters.length}</Text>
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
        filter: 'grayscale(100%)', // Note: This only works on web
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
        padding: 10,
    },
    characterName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily : 'Shrikhand',
        textTransform: 'capitalize',
    },
    emptyText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});
