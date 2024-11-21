import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const LAUNCH_KEY = 'hasLaunched';

export default function Index() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem(LAUNCH_KEY);
      setIsFirstLaunch(hasLaunched === null);
    } catch (error) {
      console.error('Launch check error:', error);
      setIsFirstLaunch(true);
    }
  };

  if (isFirstLaunch === null) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
    );
  }

  return <Redirect href={isFirstLaunch ? "/onboarding" : "/camera"} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
