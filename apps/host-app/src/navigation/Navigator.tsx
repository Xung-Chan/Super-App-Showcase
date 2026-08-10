import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/MainScreen';
import { MiniAppScreenA } from '../screens/MiniAppScreenA';
import { RootStackParamList } from './navigation-type';
import { MiniAppScreenB } from '../screens/MiniAppScreenB';

export const AppNavigator = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Host App' }}
        />

        <Stack.Screen
          name="MiniAppA"
          component={MiniAppScreenA}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MiniAppB"
          component={MiniAppScreenB}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
