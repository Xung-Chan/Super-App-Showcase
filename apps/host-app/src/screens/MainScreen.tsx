import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/navigation-type';
import { startEkyc } from '@superapp/ekyc-core';

export function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const isDarkMode = useColorScheme() === 'dark';
  const handleStartEkyc = async () => {
    try {
      console.log('Starting eKYC...');

      // const input: VerifyCccdInput = {
      //   cccd: '0123456789',
      // };
      const result = await startEkyc();
      console.log('eKYC result:', result.message);
      Alert.alert('Success', `eKYC completed: ${result.message}`);
    } catch (error: any) {
      console.error('eKYC error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to start eKYC. Please try again.',
      );
    }
  };
  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.container}>
        <Text style={styles.title}>Host </Text>

        <Button
          title="Open JSONPlaceholder Mini-App"
          onPress={() => navigation.navigate('MiniAppA')}
        />
        <Button
          title="Start eKYC Register on Host App"
          onPress={handleStartEkyc}
        />
        <Button
          title="Open eKYC Mini App"
          onPress={() => navigation.navigate('MiniAppB')}
        />
      </View>
    </>
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
