import React from 'react';
import { Platform } from 'react-native';
import {
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime';
import { RemoteAppConfig } from '../constants/remoteAppList';
import ErrorBoundary from '../components/ErrorBoundary';
import { MiniAppErrorFallback } from '../components/MiniAppErrorFallback';
import { LoadingScreen } from '../components/LoadingScreen';
import Config from 'react-native-config';

const REMOTE_CDN_URL = Config.REMOTE_CDN_URL

export interface IProp {
  moduleExpose?: string;
  remoteConfig: RemoteAppConfig;
  initialRoute?: string;
  onExitMiniApp?: () => void;
}

// Cache dynamic React.lazy component theo remoteName + moduleExpose
// để tránh re-create component mỗi lần re-render làm mất state và nhấp nháy Suspense fallback
const federatedComponentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
>();

function getOrCreateFederatedComponent(
  remoteConfig: RemoteAppConfig,
  moduleExpose: string
) {
  const cacheKey = `${remoteConfig.name}/${moduleExpose}`;

  if (!federatedComponentCache.has(cacheKey)) {
    const Component = React.lazy(async () => {
      const useDevelopMode = remoteConfig.isUseDevelopMode ?? true;
      const remoteUrl =useDevelopMode ? `http://localhost:${remoteConfig.port}/${Platform.OS}/mf-manifest.json`
          : `${REMOTE_CDN_URL}/${remoteConfig.name}/${Platform.OS}/mf-manifest.json`;

      console.log(`[WrapperRSPack] Register remote '${remoteConfig.name}' from:`, remoteUrl);

      registerRemotes([
        {
          name: remoteConfig.name,
          entry: remoteUrl,
        },
      ]);

      return loadRemote(`${remoteConfig.name}/${moduleExpose}`) as Promise<{
        default: React.ComponentType<any>;
      }>;
    });

    federatedComponentCache.set(cacheKey, Component);
  }

  return federatedComponentCache.get(cacheKey)!;
}

export const WrapperRSPack = ({
  moduleExpose = 'App',
  remoteConfig,
  initialRoute,
  onExitMiniApp,
}: IProp) => {
  if (!remoteConfig) {
    return <MiniAppErrorFallback />;
  }
  const FederatedComponent = React.useMemo(
    () => getOrCreateFederatedComponent(remoteConfig, moduleExpose),
    [remoteConfig, moduleExpose]
  );

  return (
    <ErrorBoundary
      FallbackComponent={MiniAppErrorFallback}
      onError={(error, errorInfo) => {
        console.log(`[WrapperRSPack] Error in MiniApp '${remoteConfig?.name}': `, error);
        console.log('Error Info: ', errorInfo);
      }}
    >
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedComponent
          initialRoute={initialRoute}
          onExitMiniApp={onExitMiniApp}
        />
      </React.Suspense>
    </ErrorBoundary>
  );
};