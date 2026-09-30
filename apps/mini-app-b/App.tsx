import { createContext, useContext, useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ThemeProvider>

      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const handleStartEkyc = async () => {
    // const input: VerifyCccdInput = {
    //   cccd: '0123456789',
    // };
  };
  return (
    // <View style={styles.container}>
    //   <Button onPress={handleStartEkyc} title="Start eKYC" />
    // </View>
    <ProfileCard />
  );
}


export default App;


interface ThemeInterface {
  isDarkMode: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    primary: string;
  };
  toggleTheme: () => void;
}

// 1. Tạo Context
const ThemeContext = createContext<ThemeInterface | null>(null);

// 2. Tạo Provider
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const value = useMemo(() => ({
    isDarkMode,
    colors: {
      background: isDarkMode ? '#121212' : '#F0F2F5',
      card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      text: isDarkMode ? '#E0E0E0' : '#1C1E21',
      primary: isDarkMode ? '#BB86FC' : '#0066FF',
    },
    toggleTheme,
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Tạo Custom Hook
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme phải nằm trong ThemeProvider');
  return context;
};

// 4. Component Con sử dụng Context
const ProfileCard = () => {
  const { isDarkMode, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Demo React Native Context
        </Text>
        <Text style={[styles.subText, { color: colors.text }]}>
          Giao diện đang ở chế độ: {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Chuyển Đổi Theme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    marginBottom: 24,
    opacity: 0.8,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
});