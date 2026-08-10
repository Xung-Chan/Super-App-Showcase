/**
 * @format
 *
 * bootstrap.js — Actual app initialization code.
 * Separated from index.js to create an async boundary required by
 * Module Federation. This ensures the Federation Runtime is fully
 * initialized before any shared modules (e.g. @react-navigation) are loaded.
 */

import { Script, ScriptManager } from '@callstack/repack/client';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  console.log("scriptId: ", scriptId)
  console.log("caller: ", caller)
  if (scriptId === 'mini_app_a' || caller === 'mini_app_a') {
    return;
  }
  if (scriptId === 'mini_app_b' || caller === 'mini_app_b') {
    return;
  }

  if (__DEV__) {
    return {
      url: Script.getDevServerURL(scriptId),
      cache: false,
    };
  }

  return {
    url: Script.getRemoteURL(`https://your-cdn.example.com/${scriptId}`),
  };
});

AppRegistry.registerComponent(appName, () => App);
