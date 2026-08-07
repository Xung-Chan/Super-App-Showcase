import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/Navigator';


// const FederatedMiniAppA = React.lazy(() => import('mini_app_a/App'));
// const FederatedMiniAppB = React.lazy(() => import('mini_app_b/App'));

function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}


export default App;
