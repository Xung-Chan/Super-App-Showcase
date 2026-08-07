import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/navigation-type";

export function MiniAppErrorFallback() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleGoBack = () => {
        // Since there is no Login screen, we navigate back to Home
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Image
                    source={require("../assets/error-cloud.png")}
                    style={styles.image}
                    resizeMode="contain"
                />

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Oops!</Text>
                    <Text style={styles.description}>
                        Có lỗi xảy ra phía server{"\n"}
                        Trở về trang đăng nhập
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleGoBack} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Về trang đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        width: '100%',
        maxWidth: 375,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: '#000000',
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#1573ff',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
});