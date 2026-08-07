import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, StatusBar, StyleSheet, Text, useColorScheme, View } from "react-native";
import { RootStackParamList } from "../navigation/navigation-type";

export function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.container}>
        <Text style={styles.title}>Host </Text>

        <Button
          title="Open JSONPlaceholder Mini-App"
          onPress={() => navigation.navigate('MiniAppA')}
        />
        {/* <Button
          title="Go to Mini App B"
          onPress={() => navigation.navigate('MiniAppB')}
        /> */}
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