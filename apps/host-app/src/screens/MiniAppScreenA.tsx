// import { ErrorBoundary } from "react-error-boundary";
import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';
import React from "react";
import { Platform } from "react-native";
import { LoadingScreen } from "../components/LoadingScreen";
import { MiniAppErrorFallback } from "../components/MiniAppErrorFallback";
import ErrorBoundary from "../components/ErrorBoundary";

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


export function MiniAppScreenA() {
  return (
    <ErrorBoundary FallbackComponent={MiniAppErrorFallback} onError={(error, errorInfo) => {
      console.log("Error in MiniApp: ", error);
      console.log("Error Info: ", errorInfo);
    }}>
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedMiniAppA />
      </React.Suspense>
    </ErrorBoundary>
  );
}

