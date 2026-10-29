import Config from "react-native-config";

export const IS_PRODUCTION_BUILD = Config.APP_ENV

const resolveRemoteMode = (mode: string | undefined) => {
  if (mode) {
    return mode === "production"
  }
  return false
}

export interface RemoteAppConfig {
  name: string;
  displayName: string;
  port: number;
  useRemoteCDN?: boolean;
}

export const REMOTE_APPS: Record<string, RemoteAppConfig> = {
  mini_a: {
    name: 'mini_app_a',
    displayName: 'App A',
    port: 8082,
    useRemoteCDN: resolveRemoteMode(IS_PRODUCTION_BUILD),
  },
  mini_b: {
    name: 'mini_app_b',
    displayName: 'App B',
    port: 8083,
    useRemoteCDN: resolveRemoteMode(IS_PRODUCTION_BUILD),
  },
};