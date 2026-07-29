/**
 * @format
 */

import { Script, ScriptManager } from '@callstack/repack/client';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

ScriptManager.shared.addResolver((scriptId, caller) => {
  if (caller === 'main') {
    return {
      url: Script.getDevServerURL(scriptId),
      cache: false,
    };
  }
});

AppRegistry.registerComponent(appName, () => App);
