import {
  startEkyc,
  VerifyCccdInput,
  VerifyCccdResult,
} from '@superapp/ekyc-core';
import {
  Button,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const handleStartEkyc = async () => {
    // const input: VerifyCccdInput = {
    //   cccd: '0123456789',
    // };
    const result: VerifyCccdResult = await startEkyc();
    console.log(result.message);
  };
  return (
    <View style={styles.container}>
      <Button onPress={handleStartEkyc} title="Start eKYC" />
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
});

export default App;
