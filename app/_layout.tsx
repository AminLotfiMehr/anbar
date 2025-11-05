// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { trpc, createTRPCClient } from "@/lib/trpc";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "بازگشت" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: true }} />
      <Stack.Screen name="count" options={{ headerShown: true }} />
      <Stack.Screen name="outflow" options={{ headerShown: true }} />
      <Stack.Screen name="products" options={{ headerShown: true }} />
      <Stack.Screen name="transactions" options={{ headerShown: true }} />
      <Stack.Screen name="upload" options={{ headerShown: true }} />
      <Stack.Screen name="export" options={{ headerShown: true }} />
      <Stack.Screen name="settings" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [trpcClient] = useState(() => createTRPCClient());

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <AuthProvider>
            <GestureHandlerRootView>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AuthProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
