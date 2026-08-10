// import { ErrorBoundary } from "react-error-boundary";
import {
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime';
import React from 'react';
import { Platform } from 'react-native';
import { LoadingScreen } from '../components/LoadingScreen';
import { MiniAppErrorFallback } from '../components/MiniAppErrorFallback';
import ErrorBoundary from '../components/ErrorBoundary';

const FederatedMiniAppB = React.lazy(async () => {
  const mini_app_b_port = 8083;
  const mini_app_b_url = __DEV__
    ? `http://localhost:${mini_app_b_port}/${Platform.OS}/mf-manifest.json`
    : `http://example.com`;

  registerRemotes([
    {
      name: 'mini_app_b',
      entry: mini_app_b_url,
    },
  ]);

  return loadRemote('mini_app_b/App') as Promise<{
    default: React.ComponentType<any>;
  }>;
});

export function MiniAppScreenB() {
  return (
    <ErrorBoundary
      FallbackComponent={MiniAppErrorFallback}
      onError={(error, errorInfo) => {
        console.log('Error in MiniApp: ', error);
        console.log('Error Info: ', errorInfo);
      }}
    >
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedMiniAppB />
      </React.Suspense>
    </ErrorBoundary>
  );
}
