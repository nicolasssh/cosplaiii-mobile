import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: { 
    title: "Connection Error", 
    message : "Unable to connect to the server. Please check your connection or try again.", 
    button : "Retry" 
  },
  fr: { 
    title: "Erreur de connexion", 
    message : "Impossible de se connecter au serveur. Veuillez vérifier votre connexion ou réessayer.", 
    button : "Réessayer" 
  },
  it: { 
    title: "Errore di connessione", 
    message : "Impossibile connettersi al server. Controlla la tua connessione o riprova.", 
    button : "Riprova" 
  },
  es: { 
    title: "Error de conexión", 
    message : "No se puede conectar al servidor. Verifique su conexión o inténtelo de nuevo.", 
    button : "Reintentar" 
  },
  pt: { 
    title: "Erro de conexão", 
    message : "Não é possível conectar ao servidor. Verifique sua conexão ou tente novamente.", 
    button : "Tentar novamente" 
  },
  de: { 
    title: "Verbindungsfehler", 
    message : "Verbindung zum Server nicht möglich. Bitte überprüfen Sie Ihre Verbindung oder versuchen Sie es erneut.", 
    button : "Wiederholen" 
  },
};
const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? 'en';

i18n.enableFallback = true;

export default function ErrorPage() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Shrikhand: Shrikhand_400Regular });

  if (!fontsLoaded) return null;

  return (
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('title')}</Text>
        <Text style={styles.message}>
          {i18n.t('message')}
        </Text>
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>{i18n.t('button')}</Text>
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
