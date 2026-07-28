import React from 'react';
import { View, Text } from 'react-native';

export default function MainScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#e6ffe6', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'green' }}>Xin chào từ Mini App A! 👋</Text>
    </View>
  );
}
// Lưu ý: Bắt buộc phải export default