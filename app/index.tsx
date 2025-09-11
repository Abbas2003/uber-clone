import { useAuth } from "@clerk/clerk-expo";
import { Redirect, router } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

const Home = () => {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.replace("/(root)/(tabs)/home");
      } else {
        router.replace("/(auth)/welcome");
      }
    }
  }, [isLoaded, isSignedIn]);

  // Show loader while checking auth state
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null; // Nothing because we are redirecting
};

export default Home;