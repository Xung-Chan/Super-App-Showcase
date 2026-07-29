import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const mini_app_a_port = 8082
const mini_app_b_port = 8083
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
        mini_app_a: `mini_app_a@http://localhost:${mini_app_a_port}/${env.platform}/mf-manifest.json`,
        mini_app_b: `mini_app_b@http://localhost:${mini_app_b_port}/${env.platform}/mf-manifest.json`,
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
        // '@react-navigation/native': {
        //   singleton: true,
        //   eager: false,
        // },
        // '@react-navigation/core': {
        //   singleton: true,
        //   eager: false,
        // },
      },
    }),
  ],
}));
