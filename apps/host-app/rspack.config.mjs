import * as Repack from '@callstack/repack';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../..');

const appName = 'host_app';
const devServerPort = 8081;

const remotes = {
  mini_app_a: 8082,
  mini_app_b: 8083,
};

const sharedSingleton = {
  singleton: true,
  eager: true,
  requiredVersion: false,
};

function getRemote(remoteName, port, platform) {
  const envKey = `${remoteName.toUpperCase()}_REMOTE`;
  const envUrlKey = `${remoteName.toUpperCase()}_REMOTE_URL`;
  const fallbackUrl = `http://localhost:${port}/${platform}/${remoteName}.container.bundle`;
  const remote = process.env[envKey] ?? process.env[envUrlKey] ?? fallbackUrl;

  return remote.includes('@') ? remote : `${remoteName}@${remote}`;
}

export default (env = {}) => {
  const {
    mode = 'development',
    context = __dirname,
    entry = './index.js',
    platform = 'android',
    minimize = mode === 'production',
  } = env;

  return {
    mode,
    context,
    entry,
    devServer: {
      port: devServerPort,
    },
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(__dirname, 'build', 'generated', platform),
      filename: 'index.bundle',
      chunkFilename: '[name].chunk.bundle',
    },
    resolve: {
      ...Repack.getResolveOptions(platform),
      alias: {
        '@superapp/shared-ui': path.join(workspaceRoot, 'packages/shared-ui'),
      },
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          include: [
            __dirname,
            path.join(workspaceRoot, 'packages'),
            path.join(workspaceRoot, 'node_modules/react-native'),
            path.join(workspaceRoot, 'node_modules/@react-native'),
            path.join(workspaceRoot, 'node_modules/@react-native-community'),
            path.join(workspaceRoot, 'node_modules/react-native-safe-area-context'),
            path.join(workspaceRoot, 'node_modules/@callstack/repack'),
          ],
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              cacheDirectory: true,
              configFile: path.join(__dirname, 'babel.config.js'),
            },
          },
        },
        {
          test: Repack.getAssetExtensionsRegExp(),
          use: {
            loader: '@callstack/repack/assets-loader',
            options: {
              platform,
            },
          },
        },
      ],
    },
    optimization: {
      minimize,
      chunkIds: 'named',
    },
    plugins: [
      new Repack.RepackPlugin({
        platform,
      }),
      new Repack.plugins.ModuleFederationPluginV1({
        name: appName,
        remotes: Object.fromEntries(
          Object.entries(remotes).map(([remoteName, port]) => [
            remoteName,
            getRemote(remoteName, port, platform),
          ])
        ),
        shared: {
          react: sharedSingleton,
          'react-native': sharedSingleton,
          'react-native-safe-area-context': sharedSingleton,
          '@react-native/new-app-screen': sharedSingleton,
          '@superapp/shared-ui': sharedSingleton,
        },
      }),
    ],
  };
};
