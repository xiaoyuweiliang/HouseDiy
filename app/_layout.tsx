import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a delay
    setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Failed to hide splash screen:', error);
      }
    }, 2000);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="splash"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="welcome"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="feature-intro-1"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="feature-intro-2"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="feature-intro-3"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="feedback"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="main"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="history"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="save-preview"
          options={{ headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
