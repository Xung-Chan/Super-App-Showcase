
import { SuperButton } from '@superapp/shared-ui';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ErrorBoundary from './components/ErrorBoundary';
import React from 'react';
import SplashScreen from './components/SplashScreen';


// const MiniAppAScreen = React.lazy(() => import('mini_app_a/App'))

function App() {
  const isDarkMode = useColorScheme() === 'dark';


  return (
    <ErrorBoundary name={'Test'}>
      <React.Suspense fallback={<SplashScreen />}>

        <View style={styles.container}>
          <SuperButton title={'Navigate to Mini App A'} onPress={function () { }}>
          </SuperButton>

        </View>
      </React.Suspense>

    </ErrorBoundary>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  },
});

export default App;
