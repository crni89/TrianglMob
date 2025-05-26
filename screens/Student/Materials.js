import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    Pressable,
    Alert,
    RefreshControl
} from 'react-native';
import tw from 'twrnc';
import * as Clipboard from 'expo-clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../api';

export default function MaterialsScreen({ route }) {
    const student = route.params.profile;
    const [groupedMaterials, setGroupedMaterials] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCourse, setExpandedCourse] = useState(null);

    const fetchMaterials = async () => {
        try {
            const res = await api.get(`/student/${student.id}/materials`);
            const enrollments = res.data?.enrollments || [];

            const grouped = enrollments.reduce((groups, enrollment) => {
                const course = enrollment.course;
                if (!course || !course.materials || course.materials.length === 0) return groups;

                const courseName = course.name || 'Nepoznat kurs';
                if (!groups[courseName]) groups[courseName] = [];

                course.materials.forEach(material => {
                    groups[courseName].push(material);
                });

                return groups;
            }, {});

            setGroupedMaterials(grouped);
        } catch (error) {
            console.error('Greška pri učitavanju materijala:', error);
            setGroupedMaterials({});
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [student.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMaterials();
    };

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
        Alert.alert('Link kopiran', 'Link ka materijalu je kopiran u klipbord.');
    };

    const toggleExpand = (courseName) => {
        setExpandedCourse(prev => (prev === courseName ? null : courseName));
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            {loading ? (
                <ActivityIndicator size="large" color="#F59E0B" style={tw`mt-10`} />
            ) : (
                <ScrollView
                    style={tw`px-4 mt-4`}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {Object.keys(groupedMaterials).length > 0 ? (
                        Object.entries(groupedMaterials).map(([courseName, materials]) => (
                            <View
                                key={courseName}
                                style={tw`${expandedCourse === courseName ? 'bg-orange-100' : ''} mb-6 p-2 rounded-lg`}
                            >
                                <Text style={tw`text-lg font-bold text-gray-700 mb-2`}>Kurs {courseName}</Text>

                                <Pressable
                                    onPress={() => toggleExpand(courseName)}
                                    style={tw`bg-black px-2 py-1 rounded self-start mb-3`}
                                >
                                    <Text style={tw`text-white font-semibold`}>
                                        {expandedCourse === courseName ? 'Sakrij' : 'Vidi sve'}
                                    </Text>
                                </Pressable>

                                {(expandedCourse === courseName ? materials : [materials[0]]).map((material) => (
                                    <View
                                        key={material.id}
                                        style={tw`mb-4 bg-white p-4 rounded-xl shadow-lg`}
                                    >
                                        <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>
                                            {material.title}
                                        </Text>
                                        {material.description && (
                                            <Text style={tw`text-sm text-gray-600 mb-3`}>
                                                {material.description}
                                            </Text>
                                        )}

                                        {material.file_url ? (
                                            <View style={tw`flex-row items-center`}>
                                                <Text
                                                    style={tw`text-blue-600 underline flex-1`}
                                                    numberOfLines={1}
                                                    selectable
                                                >
                                                    {material.file_url}
                                                </Text>
                                                <Pressable
                                                    onPress={() => copyToClipboard(material.file_url)}
                                                    style={tw`ml-2`}
                                                >
                                                    <Ionicons
                                                        name="copy-outline"
                                                        size={20}
                                                        color="#FF8C00"
                                                    />
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <Text style={tw`text-red-500 italic`}>
                                                Link nije dostupan.
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        <Text style={tw`text-center text-gray-500 mt-8`}>
                            Nema dostupnih materijala.
                        </Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
