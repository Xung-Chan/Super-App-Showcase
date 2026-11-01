import Config from 'react-native-config';

const isUseDevelopMode = (mode: 'develop' | 'production') => {
  if (!__DEV__) {
    return false;
  }
  if (mode === 'develop') {
    return true;
  }
  return false;
};

export interface RemoteAppConfig {
  name: string;
  displayName: string;
  port: number;
  isUseDevelopMode?: boolean;
}

export const REMOTE_APPS: Record<string, RemoteAppConfig> = {
  mini_a: {
    name: 'mini_app_a',
    displayName: 'App A',
    port: 8082,
    isUseDevelopMode: isUseDevelopMode('develop'),
  },
  mini_b: {
    name: 'mini_app_b',
    displayName: 'App B',
    port: 8083,
    isUseDevelopMode: isUseDevelopMode('production'),
  },
};
