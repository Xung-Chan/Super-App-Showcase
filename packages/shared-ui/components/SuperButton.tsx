import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const SuperButton = ({ title, onPress }: { title: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.btn} onPress={onPress} >
        <Text style={styles.text}> {title} </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    btn: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginVertical: 8 },
    text: { color: 'white', fontWeight: 'bold', textAlign: 'center' }
});

