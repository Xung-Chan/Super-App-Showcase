import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PostDetailScreen } from '../../features/post-detail/presentation/screens/PostDetailScreen';
import { PostManagementScreen } from '../../features/post-management/presentation/screens/PostManagementScreen';
import { RootStackParamList } from './navigation-types';

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
