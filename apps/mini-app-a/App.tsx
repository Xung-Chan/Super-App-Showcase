/**
 * MiniAppA — Federated entry point.
 *
 * Exposed via Module Federation as `mini_app_a/App`.
 *
 * Rules for federated mini-apps:
 *  - NO NavigationContainer   → Host App owns the top-level navigator.
 *  - NO SafeAreaProvider      → Host App already provides it.
 *  - NO AppRegistry           → Done in index.js (standalone dev only).
 *  - Export a plain Stack.Navigator so Host App can nest it as a screen.
 */

import AppContainer from './src/core/navigation/AppNavigation';

export default AppContainer;
