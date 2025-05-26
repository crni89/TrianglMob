import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import tw from 'twrnc';
import api from '../../api';

export default function SessionStudentsScreen({ navigation, route }) {
    const { sessionId } = route.params;
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/classSession/${sessionId}/attendances`);
                setList(res.data.original);

            } catch (err) {
                Alert.alert('Greška', err.response?.data?.message || 'Ne mogu da učitam učenike');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [sessionId]);

    const renderItem = ({ item }) => {
        const confirmed = item.confirmation_status === 'confirmed';
        const name = item.full_name || 'Nepoznato ime';
        return (
            <View style={tw`flex-row items-center justify-between p-4 bg-white rounded-lg shadow mb-2`}>
                <Text style={tw`text-gray-800 text-base`}>{name}</Text>
                <Text style={tw`${confirmed ? 'text-green-600' : 'text-red-600'} text-xl`}>{confirmed ? '✅' : '✖️'}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            {/* Zaglavlje sa naslovom i dugmetom X */}
            <View style={tw`flex-row items-center justify-between px-4 py-3 bg-[#112E50]`}>
                <Text style={tw`text-white text-lg font-bold`}>Učenici</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={tw`text-white text-2xl`}>✕</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={tw`p-4`}
                    data={list}
                    keyExtractor={i => String(i.id)}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={tw`text-center text-gray-500 mt-10`}>Nema učenika za prikaz.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}
