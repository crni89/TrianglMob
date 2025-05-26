// screens/Admin/AdminHome.js
import React, {useContext} from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import SessionListScreen from './SessionListScreen';
import ScanStudentScreen from './ScanStudentScreen';
import {AuthContext} from "../../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AdminHome({ route, navigation }) {
    const { user, profile} = useContext(AuthContext);

    return (
        <Stack.Navigator
            initialRouteName="Sessions"
            screenOptions={({ navigation }) => ({
                headerTintColor: '#FFFFFF',
                headerStyle: { backgroundColor: '#112E50' },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => navigation.replace('Login')}
                        style={{ marginRight: 16 }}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                ),
            })}
        >
            <Stack.Screen
                name="Sessions"
                component={SessionListScreen}
                initialParams={{ user }}
                options={{ title: 'Izbor termina' }}
            />
            <Stack.Screen
                name="ScanStudent"
                component={ScanStudentScreen}
                options={{ title: 'Skeniranje studenta' }}
            />
        </Stack.Navigator>
    );
}
