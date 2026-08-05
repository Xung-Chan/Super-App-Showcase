import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MiniAppHeaderProps {
  title: string;
  onBack?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export const MiniAppHeader = ({
  title,
  onBack,
  backgroundColor = '#006E2E',
  textColor = '#FFFFFF',
}: MiniAppHeaderProps) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.getParent()?.goBack();
    }
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={styles.headerContent}>
        {/* Left button: Back */}
        <TouchableOpacity
          onPress={handleBack}
          style={styles.actionButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>

        {/* Left-aligned Title */}
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    zIndex: 10,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
    marginLeft: 4,
    marginRight: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
