import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function LoadingScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text>Loading mini app...</Text>
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
})