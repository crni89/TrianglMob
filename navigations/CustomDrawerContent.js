import {DrawerContentScrollView, DrawerItem, DrawerItemList} from "@react-navigation/drawer";
import {Image, Text, View} from "react-native";
import logo from "../assets/images/logo.png";
import Ionicons from "react-native-vector-icons/Ionicons";
import React from "react";
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function CustomDrawerContent({ user, ...props }) {
    const { setUser, setProfile } = useContext(AuthContext);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['token', 'user', 'profile']);
        setUser(null);
        setProfile(null);
        props.navigation.replace('Login');
    };
    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#112E50' }}>
            <View style={{ padding: 6, alignItems: 'center', backgroundColor: '#112E50' }}>
                <Image source={logo} style={{ width: 120, height: 40, resizeMode: 'contain', marginBottom: 20 }} />
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{user.name}</Text>
            </View>
            <DrawerItemList {...props} />
            <DrawerItem
                label="Odjava"
                labelStyle={{ color: '#fff' }}
                icon={({ size }) => <Ionicons name="log-out" size={size} color="#fff" />}
                onPress={handleLogout}
            />
        </DrawerContentScrollView>
    );
}
