import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "./firebase"; // Firebase configuration
import { collection, doc, getDocs, query, where, addDoc } from "firebase/firestore";
import { t } from "./translation/i18n";

interface ResultResponse {
  character: string;
  confidence: number;
  image_base64: string;
}

export default function Result() {
  const insets = useSafeAreaInsets();
  const { character, confidence, image_base64, photo_take } = useLocalSearchParams();
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Shrikhand: Shrikhand_400Regular });

  const [backgroundColor, setBackgroundColor] = useState("#000");
  const [newResponse, setNewResponse] = useState<ResultResponse | null>(null);
  const [showConfirm, setShowConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parseFloat(confidence as string) > 0.9999) {
      setBackgroundColor("green");
      setShowConfirm(false);
    }
  }, [confidence]);

  if (!fontsLoaded) return null;

  const handleValidation = async (isTrue: boolean) => {
    setLoading(true);
    try {
      const currentCharacter = newResponse?.character || character;

      // Vérification de la connexion utilisateur
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Non connecté", "Vous devez être connecté pour valider ce cosplay.");
        return;
      }

      const capitalizeFirstLetter = (str: String) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };    

      // Étape 1 : Vérifier si le personnage existe dans la collection `cosplaydex`
      const cosplaydexRef = collection(firestore, "cosplaydex");
      const q = query(cosplaydexRef, where("name", "==", capitalizeFirstLetter(currentCharacter as String)));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Étape 2 : Ajouter un document à la collection `user_cosplaydex`
        const cosplaydexId = querySnapshot.docs[0].id;
        const userCosplaydexRef = collection(firestore, "user_cosplaydex");

        await addDoc(userCosplaydexRef, {
          user_id: user.uid,
          cosplaydex_id: cosplaydexId,
          added_at: new Date().toISOString(),
        });

        Alert.alert("Succès", "Cosplay ajouté à votre liste !");
      } else {
        Alert.alert("Non trouvé", "Le personnage n'existe pas dans la base de données.");
      }

      if (isTrue) {
        setBackgroundColor("green");
        setShowConfirm(false);
      } else {
        setBackgroundColor("red");
        setShowConfirm(false);
      }
    } catch (error) {
      console.error("Validation error:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  const renderCharacterInfo = () => {
    const data = newResponse || { character, confidence, image_base64 };
    return (
      <>
        {data.image_base64 && (
          <Image
            source={{ uri: `data:image/png;base64,${data.image_base64}` }}
            style={styles.characterImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.characterText}>{data.character}</Text>
        <Text style={styles.confidenceText}>
          {`${t("messages.sureAt")} ${(parseFloat(data.confidence as unknown as string) * 100).toFixed(2)}%`}
        </Text>
      </>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
      {renderCharacterInfo()}
      {showConfirm && (
        <View style={styles.confirm}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <>
              <Text style={styles.confirmText}>{t("messages.isResponseCorrect")}</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => handleValidation(true)}
                >
                  <Ionicons name="thumbs-up-outline" size={40} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => handleValidation(false)}
                >
                  <Ionicons name="thumbs-down-outline" size={40} color="#000" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push("/")}
      >
        <Ionicons
          name="add-outline"
          style={styles.closeIcon}
          size={40}
          color="#FFF"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  characterText: {
    fontFamily: "Shrikhand",
    fontSize: 40,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  confidenceText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  characterImage: {
    width: 150,
    height: 150,
    borderRadius: 30,
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  closeIcon: {
    transform: [{ rotate: "45deg" }],
  },
  confirm: {
    width: "90%",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#FFF",
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "600",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 20,
  },
  confirmButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
