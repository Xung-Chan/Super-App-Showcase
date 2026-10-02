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
    useRemoteCDN: false,
  },
  mini_b: {
    name: 'mini_app_b',
    displayName: 'App B',
    port: 8083,
    useRemoteCDN: true,
  },
};