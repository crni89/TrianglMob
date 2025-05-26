import React, { useEffect, useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';

export default function TeacherPayoutsScreen({ route }) {
    const { user, profile } = route.params;
    const teacherId = profile?.id ?? user?.teacher?.id;

    const [payouts, setPayouts] = useState([]);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadPayouts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/teacher/${teacherId}/payouts`);
            setPayouts(res.data.payouts);
            setTotalPayouts(parseFloat(res.data.total_payouts));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [teacherId]);

    useEffect(() => {
        loadPayouts();
    }, [loadPayouts]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPayouts();
        setRefreshing(false);
    }, [loadPayouts]);

    const renderItem = ({ item }) => (
        <LinearGradient
            colors={['#FFFFFF', '#FFF7E6']}
            style={tw`p-4 rounded-lg mb-3 shadow border-l-4 border-orange-500 flex-row justify-between items-center`}
        >
            <View>
                <Text style={tw`text-base font-semibold text-gray-800`}>{item.description}</Text>
                <Text style={tw`text-sm text-gray-600 mt-1`}>Datum: {item.date.split('T')[0]}</Text>
            </View>
            <View style={tw`items-end`}>
                <Text style={tw`text-lg font-bold text-orange-500`}>+{parseFloat(item.amount).toFixed(2)} RSD</Text>
            </View>
        </LinearGradient>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-100`}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            {/* Ukupno isplaćeno */}
            <View style={tw`p-4 bg-orange-200 mb-2 rounded-lg shadow flex-row justify-between items-center`}>
                <Text style={tw`text-base font-semibold text-gray-800`}>Ukupno isplaćeno:</Text>
                <Text style={tw`text-lg font-bold text-orange-500`}>{totalPayouts.toFixed(2)} RSD</Text>
            </View>

            <FlatList
                contentContainerStyle={tw`p-4`}
                data={payouts}
                keyExtractor={item => String(item.id)}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <Text style={tw`text-center text-gray-500 mt-10`}>Nema isplata za prikaz.</Text>
                }
            />
        </SafeAreaView>
    );
}
