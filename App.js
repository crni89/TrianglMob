import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/Login';
import Register from './screens/Register';
import FirstLogin from './screens/FirstLogin';
import { AuthProvider } from './context/AuthContext';

import StudentQRCode from './screens/Student/StudentQRCode';
import TeacherQRCode from "./screens/Teacher/TeacherQRCode";

import RoleBasedNavigator from "./navigations/RoleBasedNavigator";
import SessionStudentsScreen from "./screens/Teacher/SessionStudentScreen";

const RootStack = createNativeStackNavigator();

export default function App() {
    return (
               <AuthProvider>
                  <NavigationContainer>
            <SafeAreaProvider>
                <RootStack.Navigator
                    initialRouteName="Login"
                    screenOptions={{ headerShown: false }}
                >
                    <RootStack.Screen name="Login" component={LoginScreen} />
                    <RootStack.Screen name="Register" component={Register} />
                    <RootStack.Screen name="FirstLogin" component={FirstLogin} />
                    <RootStack.Screen name="Dashboard" component={RoleBasedNavigator} />
                    <RootStack.Screen name="SessionStudents" component={SessionStudentsScreen} options={{ title: 'Učenici' }}
                    />
                    <RootStack.Screen name="StudentQRCode" component={StudentQRCode} options={{ title: 'QR Code' }}
                    />
                    <RootStack.Screen name="TeacherQRCode" component={TeacherQRCode} options={{ title: 'QR Code' }}
                    />
                </RootStack.Navigator>
            </SafeAreaProvider>
                 </NavigationContainer>
   </AuthProvider>
);
}
