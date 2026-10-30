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
import { IS_PRODUCTION_BUILD } from '../constants/remoteAppList';

export function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const isDarkMode = useColorScheme() === 'dark';
  console.log("IS_PRODUCTION_BUILD", IS_PRODUCTION_BUILD)
  const addressText = 'Đường Số 6/14 Đ. Phạm Hùng, Khu, Chánh Hưng, Hồ Chí Minh, Việt Nam'
  const encodedAddress = encodeURIComponent(addressText);
  
  // URL điều hướng chuẩn của Google Maps
  // travelmode có thể là: driving (lái xe), walking, bicycling, transit
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
  console.log("encodedAddress",encodedAddress)
  console.log("googleMapsUrl",googleMapsUrl)
  const openMap = async () => {
    try {
      const supported = await Linking.canOpenURL(googleMapsUrl);
      if (supported) {
        await Linking.openURL(googleMapsUrl);
      } else {
        Alert.alert('Lỗi', 'Không thể mở bản đồ trên thiết bị này.');
      }
    } catch (error) {
      console.error('Lỗi khi mở Google Maps:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi mở ứng dụng bản đồ.');
    }
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.container}>
        <Text style={styles.title}>Host App</Text>

        <Button
          title='open map'
          onPress={openMap}
        />
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
