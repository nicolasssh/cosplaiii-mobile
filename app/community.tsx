import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    Animated,
    Dimensions,
    Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMenu } from "./MenuProvider";
import SlideMenu from "./components/SlideMenu";
import {
    collection,
    addDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    getDoc,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    where,
    deleteDoc
} from "firebase/firestore";
import { auth, firestore } from "./firebase";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MENU_WIDTH = SCREEN_WIDTH * 0.7;

interface Post {
    id: string;
    username: string;
    content: string;
    image: string | null;
    timestamp: Timestamp;
    likes?: string[]; // Liste des utilisateurs qui ont liké
    userId: string; // ID de l'utilisateur
}

export default function CommunityPage() {
    const insets = useSafeAreaInsets();
    const { isMenuOpen, toggleMenu, slideAnim } = useMenu();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    const mainViewTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, MENU_WIDTH],
    });

    const fetchPosts = async () => {
        try {
            const postsRef = collection(firestore, "posts");
            const q = query(postsRef, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedPosts: Post[] = [];
    
            for (const docSnap of querySnapshot.docs) {
                const postData = docSnap.data();
    
                // Validation des données de base
                if (!postData || typeof postData !== "object") {
                    console.warn(`Post invalide: ${docSnap.id}`);
                    continue;
                }
    
                // Vérifiez et nettoyez les champs requis
                const userId = postData.userId || "Utilisateur inconnu";
                const content = postData.content || "";
                const image = postData.image || null;
                const timestamp = postData.timestamp?.toDate() || new Date();
                const likes = Array.isArray(postData.likes) ? postData.likes : [];
    
                // Récupérez le nom d'utilisateur
                let username = "Utilisateur inconnu";
                try {
                    const userDoc = await getDoc(doc(firestore, "users", userId));
                    if (userDoc.exists()) {
                        username = userDoc.data()?.username || "Utilisateur inconnu";
                    }
                } catch (error) {
                    console.warn(`Erreur lors de la récupération de l'utilisateur: ${userId}`, error);
                }
    
                // Ajoutez le post valide au tableau
                fetchedPosts.push({
                    id: docSnap.id,
                    username,
                    content,
                    image,
                    timestamp,
                    likes,
                    userId
                });
            }
    
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            Alert.alert("Erreur", "Impossible de charger les posts.");
        }
    };        

    const handleAddPost = async () => {
        if (!newPost.trim() && !selectedImage) {
            Alert.alert("Erreur", "Veuillez entrer du texte ou sélectionner une image.");
            return;
        }
    
        setLoading(true);
    
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Erreur", "Vous devez être connecté pour publier un post.");
                return;
            }
    
            let imageUrl = null;
    
            if (selectedImage) {
                const formData = new FormData();
                formData.append("image", {
                    uri: selectedImage,
                    name: "image.jpg",
                    type: "image/jpeg",
                });
    
                const uploadResponse = await fetch("https://api.imgur.com/3/upload", {
                    method: "POST",
                    headers: {
                        Authorization: "Client-ID b682e3c85481c06",
                    },
                    body: formData,
                });
    
                if (!uploadResponse.ok) {
                    throw new Error("Erreur lors du téléchargement de l'image sur Imgur.");
                }
    
                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.data.link;
            }
    
            const post = {
                userId: user.uid, // Stocke l'ID utilisateur
                content: newPost.trim(),
                image: imageUrl,
                timestamp: Timestamp.fromDate(new Date()),
                likes: [],
            };
    
            const postsRef = collection(firestore, "posts");
            await addDoc(postsRef, post);
    
            setNewPost("");
            setSelectedImage(null);
            fetchPosts();
        } catch (error) {
            console.error("Error adding post:", error);
            Alert.alert("Erreur", "Impossible de publier le post.");
        } finally {
            setLoading(false);
        }
    };    

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Erreur", "Permission refusée pour accéder à la galerie.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const toggleLike = async (postId: string, likes: string[]) => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Erreur", "Vous devez être connecté pour liker un post.");
            return;
        }

        const postRef = doc(firestore, "posts", postId);

        if (likes.includes(user.uid)) {
            // Supprimer le like
            await updateDoc(postRef, {
                likes: arrayRemove(user.uid),
            });
        } else {
            // Ajouter un like
            await updateDoc(postRef, {
                likes: arrayUnion(user.uid),
            });
        }

        fetchPosts(); // Mettre à jour les posts
    };

    const formatPostDate = (timestamp: Date): string => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? "s" : ""}`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `il y a ${days} jour${days > 1 ? "s" : ""}`;
        } else {
            return `le ${timestamp.toLocaleDateString("fr-FR")}`;
        }
    };

    const handleDeletePost = async (postId: string, postUserId: string) => {
        const user = auth.currentUser;
    
        if (!user) {
            Alert.alert("Erreur", "Vous devez être connecté pour supprimer un post.");
            return;
        }
    
        if (user.uid !== postUserId) {
            Alert.alert("Erreur", "Vous ne pouvez supprimer que vos propres posts.");
            return;
        }
    
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const postRef = doc(firestore, "posts", postId);
                            await deleteDoc(postRef);
                            fetchPosts(); // Met à jour la liste des posts
                            Alert.alert("Succès", "Le post a été supprimé.");
                        } catch (error) {
                            console.error("Error deleting post:", error);
                            Alert.alert("Erreur", "Impossible de supprimer le post.");
                        }
                    },
                },
            ]
        );
    };       

    useEffect(() => {
        fetchPosts();
    }, []);

    const renderPost = ({ item }: { item: Post }) => {
        const user = auth.currentUser;
        const isLiked = user && item.likes?.includes(user.uid);
        const likeCount = item.likes?.length || 0;

        return (
            <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.timestamp}> • {formatPostDate(item.timestamp)}</Text>
                </View>
                <Text style={styles.postContent}>{item.content}</Text>
                {item.image && (
                    <TouchableOpacity onPress={() => setFullscreenImage(item.image)}>
                        <Image source={{ uri: item.image }} style={styles.postImage} />
                    </TouchableOpacity>
                )}
                <View style={styles.postFooter}>
                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => toggleLike(item.id, item.likes || [])}
                    >
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? "red" : "#fff"}
                        />
                    </TouchableOpacity>
                    <Text style={styles.likeCount}>{likeCount} like{likeCount > 1 ? "s" : ""}</Text>

                    {auth.currentUser && auth.currentUser?.uid === item.userId && (
                        <TouchableOpacity style={{ marginLeft: "auto" }} onPress={() => handleDeletePost(item.id, item.userId)}>
                            <Ionicons name="trash-outline" size={24} color="#fff" style={{ marginLeft: "auto" }} />
                        </TouchableOpacity>
                    )}

                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.mainContent,
                    {
                        transform: [{ translateX: mainViewTranslateX }],
                        paddingTop: insets.top,
                    },
                ]}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="menu-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Communauté</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View style={styles.newPostContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Quoi de neuf ?"
                        placeholderTextColor="#aaa"
                        value={newPost}
                        onChangeText={setNewPost}
                        multiline
                    />
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                    )}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                            <Ionicons name="image-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleAddPost}>
                            <Ionicons name="send-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </Animated.View>

            <SlideMenu
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                slideAnim={slideAnim}
            />

            {fullscreenImage && (
                <Modal transparent={true}>
                    <View style={styles.fullscreenContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setFullscreenImage(null)}
                        >
                            <Ionicons name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        <Image source={{ uri: fullscreenImage }} style={styles.fullscreenImage} />
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    mainContent: { flex: 1, paddingHorizontal: 20 },
    headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    header: { fontSize: 24, fontWeight: "bold", color: "#fff", fontFamily: "Shrikhand" },
    newPostContainer: { marginBottom: 20, backgroundColor: "#333", borderRadius: 10, padding: 15 },
    textInput: { backgroundColor: "#333", color: "#fff", borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 10 },
    actions: { flexDirection: "row", justifyContent: "space-between" },
    actionButton: { backgroundColor: "#444", padding: 10, borderRadius: 50 },
    selectedImage: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
    postContainer: { backgroundColor: "#222", borderRadius: 10, padding: 15, marginBottom: 15 },
    postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    username: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    timestamp: { color: "#aaa", fontSize: 14, marginLeft: 5 },
    postContent: { color: "#fff", fontSize: 14, marginBottom: 10 },
    postImage: { width: "100%", height: 200, borderRadius: 10 },
    listContent: { paddingBottom: 20 },
    postFooter: { flexDirection: "row", alignItems: "center", marginTop: 10 },
    likeButton: { marginRight: 10 },
    likeCount: { color: "#fff", fontSize: 14 },
    fullscreenContainer: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.9)", justifyContent: "center", alignItems: "center" },
    closeButton: { position: "absolute", top: 60, right: 20, zIndex: 1 },
    fullscreenImage: { width: "90%", height: "70%", resizeMode: "contain" },
});
