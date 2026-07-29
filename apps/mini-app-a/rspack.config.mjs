import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    uniqueName: 'mini_app_a',
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
      name: 'mini_app_a',
      filename: "mini_app_a.container.bundle",
      dts: false,
      exposes: {
        './App': './App',
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
        '@react-native/new-app-screen': {
          singleton: true,
          eager: false,
          requiredVersion: false
        },
        // '@react-navigation/native': {
        //   singleton: true,
        //   eager: false,
        //   requiredVersion: false
        // },
        // '@react-navigation/native-stack': {
        //   singleton: true,
        //   eager: false,
        //   requiredVersion: false
        // },
      },
    }),
  ],
}));
