import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";

export default function ErrorPage() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Shrikhand: Shrikhand_400Regular });

  if (!fontsLoaded) return null;

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Connection Error</Text>
        <Text style={styles.message}>
          Unable to connect to the server. Please check your connection or try again.
        </Text>
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#000',
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
    marginBottom: 30,
    color: '#fff',
    opacity: 0.8,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
