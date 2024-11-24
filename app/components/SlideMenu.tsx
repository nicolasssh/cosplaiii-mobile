import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Animated, 
    Dimensions, 
    TouchableOpacity 
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { RelativePathString, useRouter } from "expo-router";
import { MenuItem } from './types';
import { useUser } from "./UserContext";
import { auth } from "../firebase"; // Importez votre instance Firebase Auth

interface SlideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    slideAnim: Animated.Value;
}

const MENU_WIDTH = Dimensions.get('window').width * 0.7;

const SlideMenu: React.FC<SlideMenuProps> = ({ isOpen, onClose, slideAnim }) => {
    const router = useRouter();
    const { user } = useUser(); // Obtenez l'utilisateur depuis le contexte

    const isLoggedIn = !!user; // Détermine si un utilisateur est connecté

    const menuItems: MenuItem[] = [
        { title: 'Accueil', icon: 'home-outline', route: '/' },
        { title: 'Cosplaydex', icon: 'apps-outline', route: '/cosplaydex' },
        { title: 'Communauté', icon: 'earth-outline', route: '/community' },
        { title: 'Paramètres', icon: 'settings-outline', route: '/settings' },
    ];

    const translateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-MENU_WIDTH, 0],
    });

    const handleLogout = async () => {
        try {
            await auth.signOut(); // Déconnexion Firebase
            onClose();
            router.push('/login'); // Redirige vers la page de connexion
        } catch (error: any) {
            console.error("Erreur lors de la déconnexion :", error.message);
        }
    };

    return (
        <Animated.View 
            style={[
                styles.menuContainer,
                {
                    transform: [{ translateX }],
                    display: isOpen ? 'flex' : 'none',
                }
            ]}
        >
            <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            
            {/* Menu principal */}
            {menuItems.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => {
                        onClose();
                        router.push(item.route as RelativePathString);
                    }}
                >
                    <Ionicons name={item.icon as any} size={24} color="#fff" style={styles.menuIcon} />
                    <Text style={styles.menuText}>{item.title}</Text>
                </TouchableOpacity>
            ))}

            {/* Gestion des boutons conditionnels */}
            <View style={styles.separator} />
            {isLoggedIn ? (
                <>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            onClose();
                            router.push('/profile' as RelativePathString);
                        }}
                    >
                        <Ionicons name="person-outline" size={24} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Profil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Se déconnecter</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            onClose();
                            router.push('/login' as RelativePathString);
                        }}
                    >
                        <Ionicons name="log-in-outline" size={24} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Connexion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            onClose();
                            router.push('/signup' as RelativePathString);
                        }}
                    >
                        <Ionicons name="person-add-outline" size={24} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Créer un compte</Text>
                    </TouchableOpacity>
                </>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: MENU_WIDTH,
        backgroundColor: '#000',
        padding: 20,
        zIndex: 1000,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 40,
    },
    menuTitle: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Shrikhand',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    menuIcon: {
        marginRight: 15,
    },
    menuText: {
        color: '#fff',
        fontSize: 16,
    },
    separator: {
        borderBottomColor: '#444',
        borderBottomWidth: 1,
        marginVertical: 15,
    },
});

export default SlideMenu;
