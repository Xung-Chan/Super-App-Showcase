import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type RootStackParamList = {
  Home: undefined;
  MiniApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const FederatedMiniApp = React.lazy(() => import('mini_app_a/App'));

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Host App' }}
          />

          <Stack.Screen
            name="MiniApp"
            component={MiniAppScreen}
            options={{ title: 'Mini App' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      <View style={styles.container}>
        <Text style={styles.title}>Host App</Text>

        <Button
          title="Go to Mini App"
          onPress={() => navigation.navigate('MiniApp')}
        />
      </View>
    </>
  );
}

function MiniAppScreen() {
  return (
    <ErrorBoundary fallback={<MiniAppErrorFallback />}>
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedMiniApp />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text>Loading mini app...</Text>
    </View>
  );
}

function MiniAppErrorFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Mini app unavailable</Text>

      <Text style={styles.errorMessage}>
        Make sure the mini app development server is running and that the
        host can access its federation manifest.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  errorMessage: {
    textAlign: 'center',
  },
});

export default App;