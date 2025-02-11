import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { I18nextProvider } from "react-i18next";
import i18n from "./src/i18n";
import AuthProvider from "./src/context/AuthContext";

// Importera skärmar (kommer att skapas senare)
import LoginScreen from "./src/screens/LoginScreen";
import TaskListScreen from "./src/screens/TaskListScreen";
import TaskDetailScreen from "./src/screens/TaskDetailScreen";
import PendingTasksScreen from "./src/screens/PendingTasksScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{ title: "Uppgifter" }}
            />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{ title: "Uppgiftsdetaljer" }}
            />
            <Stack.Screen
              name="PendingTasks"
              component={PendingTasksScreen}
              options={{ title: "Väntande uppgifter" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </I18nextProvider>
  );
}
