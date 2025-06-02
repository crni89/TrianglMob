import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    Pressable,
    RefreshControl,
} from 'react-native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../api';

export default function TestsScreen({ route }) {
    const student = route.params.profile;
    const [groupedTests, setGroupedTests] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCourse, setExpandedCourse] = useState(null);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/student/${student.id}/tests`);
            const tests = res.data.tests || [];

            const grouped = tests.reduce((acc, test) => {
                const course = test.course || 'Nepoznat kurs';
                if (!acc[course]) acc[course] = [];
                acc[course].push(test);
                return acc;
            }, {});

            setGroupedTests(grouped);
        } catch (err) {
            console.error(err);
            setGroupedTests({});
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [student.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTests();
    };

    const toggleExpand = (course) => {
        setExpandedCourse(prev => (prev === course ? null : course));
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
                    {Object.keys(groupedTests).length > 0 ? (
                        Object.entries(groupedTests).map(([course, tests]) => (
                            <View key={course} style={tw`mb-6`}>
                                {/* Course Header */}
                                <View style={tw`flex-row justify-between items-center bg-gray-100 px-4 py-2 rounded-lg`}>
                                    <Text style={tw`text-lg font-bold text-gray-700`}>
                                        {course}
                                    </Text>
                                    <Pressable
                                        onPress={() => toggleExpand(course)}
                                        style={tw`flex-row items-center bg-blue-600 px-3 py-1 rounded-full`}
                                    >
                                        <Ionicons name={expandedCourse === course ? "chevron-up" : "chevron-down"} size={18} color="#fff" />
                                        <Text style={tw`text-white ml-1 font-medium`}>
                                            {expandedCourse === course ? 'Sakrij' : 'Prikaži'}
                                        </Text>
                                    </Pressable>
                                </View>

                                {/* Test Cards */}
                                {(expandedCourse === course ? tests : [tests[0]]).map(test => (
                                    <View
                                        key={test.id}
                                        style={tw`mt-3 bg-white p-4 rounded-xl shadow`}
                                    >
                                        {/* Subject & Date Row */}
                                        <View style={tw`flex-row justify-between items-center mb-2`}>
                                            <Text style={tw`font-semibold text-gray-800`}>
                                                Datum: {test.date}
                                            </Text>
                                            <Text style={tw`font-semibold text-gray-800`}>
                                                Poeni: {test.points}
                                            </Text>
                                        </View>

                                        {/* Teacher Row */}
                                        <View style={tw`flex-row items-center`}>
                                            <Ionicons name="person-circle-outline" size={20} color="#112E50" />
                                            <Text style={tw`ml-2 text-sm text-gray-700`}>
                                                {test.teacher?.full_name || 'Nepoznati nastavnik'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        <Text style={tw`text-center text-gray-500 mt-8`}>
                            Nema dostupnih testova.
                        </Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
