import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";

export default function ErrorPage() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Shrikhand: Shrikhand_400Regular,
  });

  const retry = () => {
    router.replace("/"); // Retourne à la page d'accueil pour réessayer
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Error</Text>
      <Text style={styles.message}>
        Unable to connect to the server. Please check your connection or try again.
      </Text>
      <Button title="Retry" onPress={retry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#000'
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#fff',
    fontFamily: 'Shrikhand',
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: '#fff'
  },
});
