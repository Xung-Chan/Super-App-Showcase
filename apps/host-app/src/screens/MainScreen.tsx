import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
  Button,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/navigation-type';

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
        <Text style={styles.title}>Host App</Text>

        <Button
          title="Open  Mini-App A"
          onPress={() => navigation.navigate('RemoteApp', { appKey: 'mini_a' })}
        />
        <Button
          title="Open  Mini-App A with deeplink"
          onPress={() => Linking.openURL('superapp://remote-app/mini_a')}
        />
        <Button
          title="Open Mini-App A Post 1 (Deeplink)"
          onPress={() => Linking.openURL('superapp://remote-app/mini_a?path=/post/1')}
        />
        <Button
          title="Open Theme Mini-App B"
          onPress={() => navigation.navigate('RemoteApp', { appKey: 'mini_b' })}
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
