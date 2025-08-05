import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export const AuthContext = createContext({
    user: null,
    profile: null,
    setUser: () => {},
    setProfile: () => {},
    isLoading: true,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const userDataJson = await AsyncStorage.getItem('user');
                const profileDataJson = await AsyncStorage.getItem('profile');

                if (token && userDataJson) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setUser(JSON.parse(userDataJson));
                    if (profileDataJson) {
                        setProfile(JSON.parse(profileDataJson));
                    }
                }
            } catch (err) {
                console.error('Greška pri učitavanju korisnika iz AsyncStorage:', err);
                await AsyncStorage.multiRemove(['token', 'user', 'profile']);
                setUser(null);
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, setUser, setProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}