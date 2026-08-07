import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ErrorBoundary } from "react-error-boundary";
import { RootStackParamList } from "../navigation/navigation-type";
import { ActivityIndicator, StyleSheet, Text, View, Platform } from "react-native";
import React from "react";
import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';
import { LoadingScreen } from "../components/LoadingScreen";
import { MiniAppErrorFallback } from "../components/MiniAppErrorFallback";

const FederatedMiniAppA = React.lazy(async () => {
  const mini_app_a_port = 8082;
  const mini_app_a_url = __DEV__
    ? `http://localhost:${mini_app_a_port}/${Platform.OS}/mf-manifest.json`
    : `https://your-cdn.example.com/mini_app_a/${Platform.OS}/mf-manifest.json`;

  registerRemotes([
    {
      name: 'mini_app_a',
      entry: mini_app_a_url,
    },
  ]);

  return loadRemote('mini_app_a/App') as Promise<{ default: React.ComponentType<any> }>;
});


export function MiniAppScreenA({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'MiniAppA'>) {
  return (
    <ErrorBoundary fallback={<MiniAppErrorFallback />}>
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedMiniAppA />
      </React.Suspense>
    </ErrorBoundary>
  );
}

