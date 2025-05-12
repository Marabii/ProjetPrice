import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Stack,
  router,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QuizProvider } from "@/context/QuizContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Root layout component that wraps the entire app
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <QuizProvider>
        <RootLayoutNav />
      </QuizProvider>
    </AuthProvider>
  );
}

// Navigation component that handles routing based on auth state
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isNavigating, setIsNavigating] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean | null>(null);

  // Check if the quiz has been completed
  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const quizState = await AsyncStorage.getItem("quizState");
        if (quizState) {
          const parsedState = JSON.parse(quizState);
          setQuizCompleted(parsedState.isCompleted);
        } else {
          setQuizCompleted(false);
        }
      } catch (error) {
        console.error("Error checking quiz status:", error);
        setQuizCompleted(false);
      }
    };

    checkQuizStatus();
  }, []);

  // Handle routing based on authentication status and quiz completion
  useEffect(() => {
    if (!navigationState?.key || quizCompleted === null) return;

    const inAuthGroup = segments[0] === "auth";
    const inQuizScreen = segments[0] === "quiz";

    // Use setTimeout to avoid immediate navigation which can cause flickering
    if (!isLoading) {
      setTimeout(() => {
        try {
          if (!isAuthenticated && !inAuthGroup) {
            // Redirect to the auth screen if not authenticated
            setIsNavigating(true);
            router.replace("/auth");
          } else if (isAuthenticated && inAuthGroup) {
            // Redirect to the main app if already authenticated
            setIsNavigating(true);
            router.replace("/(tabs)");
          } else if (isAuthenticated && !quizCompleted && !inQuizScreen) {
            // Redirect to the quiz if authenticated but quiz not completed
            setIsNavigating(true);
            router.replace("/quiz");
          }
        } catch (error) {
          console.error("Navigation error:", error);
          // If navigation fails, try to recover
          setIsNavigating(false);
        }
      }, 100);
    }
  }, [
    isAuthenticated,
    isLoading,
    quizCompleted,
    segments,
    navigationState?.key,
  ]);

  // Update the router methods to show loading indicator during navigation
  useEffect(() => {
    const originalReplace = router.replace;
    router.replace = (href, options) => {
      setIsNavigating(true);
      setTimeout(() => {
        try {
          originalReplace(href, options);
          // Hide loading after a short delay to ensure navigation completes
          setTimeout(() => setIsNavigating(false), 500);
        } catch (error) {
          console.error("Router replace error:", error);
          setIsNavigating(false);
          // Try to recover by forcing the app to the tabs or auth screen
          const hrefStr =
            typeof href === "string" ? href : JSON.stringify(href);
          if (hrefStr.includes("(tabs)")) {
            // If we were trying to go to tabs, just set authenticated to true
            // The navigation guard will handle the rest
          } else if (hrefStr.includes("auth")) {
            // If we were trying to go to auth, just set authenticated to false
            // The navigation guard will handle the rest
          }
        }
      }, 100);
    };

    return () => {
      // Restore original method when component unmounts
      router.replace = originalReplace;
    };
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <LoadingOverlay visible={isNavigating || isLoading} />
    </ThemeProvider>
  );
}
