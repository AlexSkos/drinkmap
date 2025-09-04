// App.tsx
import "react-native-gesture-handler";
import 'react-native-reanimated';
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./src/screens/SplashScreen";
import MenuScreen from "./src/screens/MenuScreen";
import MapScreen from "./src/screens/MapScreen";
import ReportScreen from "./src/screens/ReportScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ContactScreen from "./src/screens/ContactScreen";
import SupportScreen from "./src/screens/SupportScreen";

import { LanguageProvider } from "./src/i18n/LanguageContext";

// Экспортируем тип для экранов — на него ссылаются экраны через `import type { RootStackParamList } from "../../App"`
export type RootStackParamList = {
  Splash: undefined;
  Menu: undefined;
  Map: undefined;
  Report: undefined;
  History: undefined;
  Contact: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <LanguageProvider>
       <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}















