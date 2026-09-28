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
const FederatedMiniAppA = React.lazy(async () => {
  const USE_REMOTE_CDN = true; // Bật cờ này để ép tải từ GitHub Pages ngay khi dev

  const mini_app_a_port = 8082;
  const mini_app_a_url =
    __DEV__ && !USE_REMOTE_CDN
      ? `http://localhost:${mini_app_a_port}/${Platform.OS}/mf-manifest.json`
      : `https://${GITHUB_USER_OR_ORG}.github.io/${GITHUB_REPO_NAME}/mini_app_a/${Platform.OS}/mf-manifest.json`;
  //https://xung-chan.github.io/mini-app-a/android/mf-manifest.json
  console.log(mini_app_a_url);
  registerRemotes([
    {
      name: 'mini_app_a',
      entry: mini_app_a_url,
    },
  ]);

  return loadRemote('mini_app_a/App') as Promise<{
    default: React.ComponentType<any>;
  }>;
});

export function MiniAppScreenA() {
  return (
    <ErrorBoundary
      FallbackComponent={MiniAppErrorFallback}
      onError={(error, errorInfo) => {
        console.log('Error in MiniApp: ', error);
        console.log('Error Info: ', errorInfo);
      }}
    >
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedMiniAppA />
      </React.Suspense>
    </ErrorBoundary>
  );
}
