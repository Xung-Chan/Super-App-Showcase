import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/MainScreen';
import { MiniAppScreenA } from '../screens/MiniAppScreenA';
import { MiniAppScreenB } from '../screens/MiniAppScreenB';
import { RootStackParamList } from './navigation-type';
import { RemoteAppScreen } from '../screens/RemoteAppScreen';
import { linkingConfig } from './deeplink/deeplinkHandler';

export const AppNavigator = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <NavigationContainer linking={linkingConfig} fallback={undefined}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Host App' }}
        />

        <Stack.Screen
          name="RemoteApp"
          component={RemoteAppScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
