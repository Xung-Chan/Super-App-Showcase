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

const GITHUB_REPO_NAME = 'Super-App-Showcase';
const GITHUB_USER_OR_ORG = 'xung-chan';

const FederatedMiniAppB = React.lazy(async () => {
  const USE_REMOTE_CDN = true; // Bật cờ này để ép tải từ GitHub Pages ngay khi dev
  const mini_app_b_port = 8083;
  const mini_app_b_url = __DEV__ && !USE_REMOTE_CDN
    ? `http://localhost:${mini_app_b_port}/${Platform.OS}/mf-manifest.json`
    : `https://${GITHUB_USER_OR_ORG}.github.io/${GITHUB_REPO_NAME}/mini_app_b/${Platform.OS}/mf-manifest.json`;

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
