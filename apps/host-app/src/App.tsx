import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/Navigator';
import { useFreeRasp } from 'freerasp-react-native';
import { useSecurityDevice } from './hooks/useSecurityDevice';
import { testDeeplink } from './testDeeplink';



function App() {
  // useSecurityDevice()
  testDeeplink()
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}


export default App;
