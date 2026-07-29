import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MINI_APP_PORT = 8082;

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default Repack.defineRspackConfig((env) => ({
  context: __dirname,
  entry: './index.js',
  resolve: {
    ...Repack.getResolveOptions(env.platform, {
      enablePackageExports: true,
      preferNativePlatform: true,
    }),
  },
  output: {
    uniqueName: 'host_app',
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin(),

    new Repack.plugins.ModuleFederationPluginV2({
      name: 'host_app',
      dts: false,
      remotes: {
        mini_app_a: `mini_app_a@http://localhost:${MINI_APP_PORT}/${env.platform}/mf-manifest.json`,
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
        },
        'react-native': {
          singleton: true,
          eager: true,
        },
        'react-native-safe-area-context': {
          singleton: true,
          eager: true,
        },
      },
    }),
  ],
}));
