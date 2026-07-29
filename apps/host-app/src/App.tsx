import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SuperButton } from '@superapp/shared-ui';
import { appCatalog } from './catalog';
import { RemoteApp } from './RemoteApp';

// Màn hình Catalog (Trang chủ)
function CatalogScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: 'bold' }}>
        SuperApp Catalog
      </Text>

      {appCatalog.map((app) => (
        <SuperButton
          key={app.id}
          title={`Mở ${app.name}`}
          onPress={() => navigation.navigate('MiniAppContainer', { appId: app.id })}
        />
      ))}
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

// Router chính của Host App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Trang chủ' }} />

        {/* Vỏ bọc dùng chung cho mọi Mini App */}
        <Stack.Screen
          name="MiniAppContainer"
          component={RemoteApp}
          options={({ route }: any) => ({ title: route.params.appId })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
