/**
 * @format
 *
 * index.js — Bootstrap entry point.
 *
 * Separated from App.tsx to create an async boundary required by
 * Module Federation. This ensures the Federation Runtime is fully
 * initialized before any shared modules are loaded.
 *
 * AppRegistry.registerComponent is called ONLY when running as a
 * standalone dev app (caller === 'main'). When loaded as a federated
 * remote inside Host App, this file is NOT the entry — Host App
 * imports mini_app_a/App directly via Module Federation.
 */

import { Script, ScriptManager } from '@callstack/repack/client';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

ScriptManager.shared.addResolver((scriptId, caller) => {
  if (caller === 'main') {
    // Standalone dev mode: resolve all scripts from local dev server
    AppRegistry.registerComponent(appName, () => App);

    return {
      url: Script.getDevServerURL(scriptId),
      cache: false,
    };
  }

  // When running inside Host App as a federated remote,
  // Host App's ScriptManager resolver handles script resolution.
});
