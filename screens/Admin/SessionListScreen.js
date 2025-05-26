import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Button,
    Alert,
} from "react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api";

export default function SessionListScreen({ navigation }) {
    const [allSessions, setAllSessions] = useState([]);   // sve sesije sa servera
    const [sessions, setSessions] = useState([]);         // ono što se prikazuje
    const [loading, setLoading] = useState(false);        // za inicijalni spinner
    const [refreshing, setRefreshing] = useState(false);  // za pull-to-refresh
    const [date] = useState(() => new Date().toISOString().split("T")[0]);
    const [location, setLocation] = useState("");
    const [teacher, setTeacher] = useState(null);
    const [uniqueLocations, setUniqueLocations] = useState([]);
    const [uniqueTeachers, setUniqueTeachers] = useState([]);
    const [showLocModal, setShowLocModal] = useState(false);
    const [showTeacherModal, setShowTeacherModal] = useState(false);

    // now fetchSessions accepts a flag to skip the big loader
    const fetchSessions = async (skipLoader = false) => {
        if (!skipLoader) setLoading(true);
        try {
            const res = await api.post("/classSessions/filter", { date });
            const items = Array.isArray(res.data.original?.data)
                ? res.data.original.data
                : Array.isArray(res.data)
                    ? res.data
                    : [];
            setAllSessions(items);
            setSessions(items);
        } catch (err) {
            Alert.alert(
                "Greška",
                err.response?.data?.message || "Ne mogu da učitam termine."
            );
            setAllSessions([]);
            setSessions([]);
        } finally {
            if (!skipLoader) setLoading(false);
        }
    };

    // inicijalno učitavanje
    useEffect(() => {
        fetchSessions();
    }, []);

    // pull-to-refresh: samo lista, skipLoader=true
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchSessions(true);
        setRefreshing(false);
    };

    // klijentski filter
    const handleApplyFilter = () => {
        let filtered = allSessions;
        if (location) filtered = filtered.filter(s => s.location === location);
        if (teacher)  filtered = filtered.filter(s => s.teacher?.id === teacher.id);
        setSessions(filtered);
    };

    // clear filter: samo vratimo sve iz memorije
    const handleClearFilter = () => {
        setLocation("");
        setTeacher(null);
        setSessions(allSessions);
    };

    // update jedinstvene liste filtera
    useEffect(() => {
        setUniqueLocations(
            Array.from(new Set(allSessions.map(s => s.location || "Nepoznata")))
                .map(loc => ({ value: loc, label: loc }))
        );
        const map = {};
        allSessions.forEach(s => {
            if (s.teacher?.id) map[s.teacher.id] = s.teacher.full_name;
        });
        setUniqueTeachers(
            Object.entries(map).map(([id, name]) => ({ id: Number(id), full_name: name }))
        );
    }, [allSessions]);

    // inicijalni full-screen spinner
    if (loading && allSessions.length === 0) {
        return (
            <ActivityIndicator
                style={tw`flex-1`}
                size="large"
                color="#FFA500"
            />
        );
    }

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            {/* Filter panel */}
            <LinearGradient
                colors={["#FFA500", "#FF7F50"]}
                style={tw`p-4`}
                start={[0, 0]}
                end={[1, 0]}
            >
                <Text style={tw`text-white text-xl font-bold mb-2`}>
                    Datum: {date}
                </Text>
                <Text style={tw`text-white text-xl font-bold mb-4`}>
                    Filteri
                </Text>

                <View style={tw`flex-row`}>
                    <TouchableOpacity
                        style={tw`flex-1 bg-white rounded-lg px-4 py-2 mr-2`}
                        onPress={() => setShowLocModal(true)}
                    >
                        <Text style={tw`text-gray-700`}>
                            {location || "Izaberi lokaciju"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={tw`flex-1 bg-white rounded-lg px-4 py-2`}
                        onPress={() => setShowTeacherModal(true)}
                    >
                        <Text style={tw`text-gray-700`}>
                            {teacher?.full_name || "Izaberi predavača"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={tw`flex-row mt-4`}>
                    <TouchableOpacity
                        style={tw`flex-1 bg-[#112E50] rounded-lg py-2 flex-row justify-center items-center`}
                        onPress={handleApplyFilter}
                    >
                        <Ionicons name="search" size={18} color="#FFA500" />
                        <Text style={tw`text-white font-semibold ml-2`}>Primeni</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={tw`flex-1 bg-white border border-[#FFA500] rounded-lg py-2`}
                        onPress={handleClearFilter}
                    >
                        <Text style={tw`text-[#FFA500] font-semibold text-center`}>
                            Očisti
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Lista termina sa pull-to-refresh */}
            <FlatList
                contentContainerStyle={tw`p-4`}
                data={sessions}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("ScanStudent", { classSessionId: item.id })
                        }
                        style={tw`mb-4`}
                    >
                        <LinearGradient
                            colors={["#FFF5E1", "#FFE4B5"]}
                            style={tw`rounded-lg p-4 shadow`}
                        >
                            <Text style={tw`text-lg font-bold text-[#112E50]`}>
                                {item.course?.name}
                            </Text>
                            <Text style={tw`text-gray-600 mt-1`}>
                                {item.date} {item.start_time}–{item.end_time}
                            </Text>
                            <View style={tw`flex-row justify-between mt-2`}>
                                <Text style={tw`text-gray-600`}>{item.location}</Text>
                                <Text style={tw`text-gray-600`}>
                                    {item.teacher?.full_name}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    !loading && (
                        <Text style={tw`text-center mt-10 text-gray-500`}>
                            Nema termina za prikaz.
                        </Text>
                    )
                }
            />

            {/* Lokacija modal */}
            <Modal visible={showLocModal} transparent animationType="slide">
                <View style={tw`flex-1 justify-center bg-black bg-opacity-50`}>
                    <View style={tw`bg-white mx-6 p-6 rounded-2xl`}>
                        <Text style={tw`text-xl font-bold mb-4`}>Izaberi lokaciju</Text>
                        <FlatList
                            data={uniqueLocations}
                            keyExtractor={i => i.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={tw`py-2 border-b border-gray-200`}
                                    onPress={() => {
                                        setLocation(item.value);
                                        setShowLocModal(false);
                                    }}
                                >
                                    <Text style={tw`text-gray-800`}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button title="Zatvori" onPress={() => setShowLocModal(false)} />
                    </View>
                </View>
            </Modal>

            {/* Predavač modal */}
            <Modal visible={showTeacherModal} transparent animationType="slide">
                <View style={tw`flex-1 justify-center bg-black bg-opacity-50`}>
                    <View style={tw`bg-white mx-6 p-6 rounded-2xl`}>
                        <Text style={tw`text-xl font-bold mb-4`}>Izaberi predavača</Text>
                        <FlatList
                            data={uniqueTeachers}
                            keyExtractor={i => String(i.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={tw`py-2 border-b border-gray-200`}
                                    onPress={() => {
                                        setTeacher(item);
                                        setShowTeacherModal(false);
                                    }}
                                >
                                    <Text style={tw`text-gray-800`}>{item.full_name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button
                            title="Zatvori"
                            onPress={() => setShowTeacherModal(false)}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
