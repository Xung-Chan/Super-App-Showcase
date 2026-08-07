import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ErrorBoundary } from "react-error-boundary";
import { RootStackParamList } from "../navigation/navigation-type";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Federated } from '@callstack/repack/client';




export function MiniAppScreenA({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'MiniAppA'>) {
  return (
    <ErrorBoundary fallback={<MiniAppErrorFallback />}>
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedMiniAppA
        />
      </React.Suspense>
    </ErrorBoundary>
  );
}

// const FederatedMiniAppA = React.lazy(() =>
//   Federated.importModule('mini_app_a', './App')
// );

const FederatedMiniAppA = React.lazy(() => import('mini_app_a/App'));


function MiniAppErrorFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Mini app unavailable</Text>

      <Text style={styles.errorMessage}>
        Make sure the mini app development server is running and that the host
        can access its federation manifest.
      </Text>
    </View>
  );
}


function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text>Loading mini app...</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  errorMessage: {
    textAlign: 'center',
  },
});