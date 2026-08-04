import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation-types';
import { PostDetailScreen } from '@post/presentation/screens/PostDetailScreen';
import { PostManagementScreen } from '@post/presentation/screens/PostManagementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContainer = () => {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PostManagementScreen" component={PostManagementScreen} />
      <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />

    </Stack.Navigator>
  )
}
export default AppContainer;
