import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import { getSharedDependencies } from '@superapp/shared-deps';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

const GITHUB_REPO_NAME = 'Super-App-Showcase';
const GITHUB_USER_OR_ORG = 'xung-chan';

export default Repack.defineRspackConfig(env => {
  const publicPath = env.dev
    ? `http://localhost:8083/${env.platform}/`
    : `https://${GITHUB_USER_OR_ORG}.github.io/${GITHUB_REPO_NAME}/mini_app_b/${env.platform}/`;

  return {
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions(env.platform, {
        enablePackageExports: true,
        preferNativePlatform: true,
      }),
    },
    output: {
      uniqueName: 'mini_app_b',
      clean: true,
      path: path.resolve(__dirname, `dist/${env.platform}`),
      publicPath,
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
      name: 'mini_app_b',
      filename: "mini_app_b.container.bundle",
      dts: false,
      exposes: {
        './App': './App',
      },
      shared: getSharedDependencies({ eager: false })
    }),
  ],
};
});
