import React, { useEffect, useState, useCallback } from "react";
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, LocaleConfig } from "react-native-calendars";
import Moment from "moment";
import api from "../../api";

// Lokalizacija kalendara
LocaleConfig.locales["sr"] = {
    monthNames: [
        "Januar","Februar","Mart","April","Maj","Jun","Jul","Avgust","Septembar","Oktobar","Novembar","Decembar"
    ],
    monthNamesShort: ["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],
    dayNames: ["nedelja","ponedeljak","utorak","sreda","četvrtak","petak","subota"],
    dayNamesShort: ["ned","pon","uto","sre","čet","pet","sub"],
    today: "Danas",
};
LocaleConfig.defaultLocale = "sr";

const FILTER_LABELS = {
    '': 'Svi',
    regular: 'Redovna',
    preparatory: 'Pripremna',
    other: 'Ostalo',
};

export default function Schedule({ navigation, route }) {
    const { user, profile } = route.params;
    const studentId = profile?.id ?? user?.student?.id;

    const [attendances, setAttendances] = useState([]);
    const [scheduleMap, setScheduleMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(Moment().format("YYYY-MM-DD"));
    const [filterType, setFilterType] = useState('');

    const loadAttendances = useCallback(async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const res = await api.get(`/student/${studentId}/attendances`);
            setAttendances(res.data.attendances || []);
        } catch (err) {
            console.error(err);
            Alert.alert("Greška", err.response?.data?.message || "Neuspešno učitavanje termina.");
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAttendances();
        setRefreshing(false);
    }, [loadAttendances]);

    useEffect(() => { loadAttendances(); }, [loadAttendances]);

    useEffect(() => {
        const normalized = attendances
            .filter(a => a.class_session)
            .filter(a => filterType === '' || a.class_session.course.type === filterType)
            .map(a => ({
                attendance_id: a.id,
                class_session_id: a.class_session_id,
                confirmation_status: a.confirmation_status,
                date: a.class_session.date.split("T")[0],
                start_time: a.class_session.start_time,
                end_time: a.class_session.end_time,
                course: a.class_session.course,
            }));

        const map = {};
        normalized.forEach(s => {
            if (!map[s.date]) map[s.date] = [];
            map[s.date].push(s);
        });
        setScheduleMap(map);
    }, [attendances, filterType]);

    const markedDates = {};
    Object.entries(scheduleMap).forEach(([day, list]) => {
        if (list.length) markedDates[day] = { marked: true, dotColor: "#112E50" };
    });
    if (selectedDate) {
        markedDates[selectedDate] = {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: "#112E50",
        };
    }

    const handleChangeStatus = async (sessionId, newStatus, sessionDate) => {
        if (!studentId) return;

        const today = Moment().format("YYYY-MM-DD");
        if (newStatus === 'cancelled' && sessionDate === today) {
            Alert.alert("Zabrana", "Čas koji je zakazan za danas ne može se otkazati.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/attendance/change-confirmation-status", {
                class_session_id: sessionId,
                student_id: studentId,
                status: newStatus
            });
            Alert.alert(newStatus === 'confirmed' ? 'Potvrđeno' : 'Otkazano');
            setTimeout(loadAttendances, 500);
        } catch (err) {
            console.error(err);
            Alert.alert("Greška", err.response?.data?.message || "Došlo je do greške.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            <View style={tw`flex-row justify-around py-2 bg-white`}>
                {Object.entries(FILTER_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setFilterType(key)}
                        style={tw`
                            px-5 py-5 rounded-1
                            ${filterType === key ? 'bg-[#FFA500]' : 'bg-gray-200'}
                        `}
                    >
                        <Text style={tw`${filterType === key ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={tw`mt-4 mx-4 bg-white rounded-xl shadow`}>
                <Calendar
                    onDayPress={day => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    theme={{
                        todayTextColor: "#112E50",
                        selectedDayBackgroundColor: "#112E50",
                        arrowColor: "#112E50",
                    }}
                    monthFormat="MMMM"
                    firstDay={1}
                />
            </View>

            <ScrollView
                style={tw`mt-4 px-4`}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#112E50" style={tw`mt-10`} />
                ) : (
                    <>
                        <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                            Časovi za {Moment(selectedDate).format("DD.MM.YYYY")}
                        </Text>
                        {(scheduleMap[selectedDate] || []).map(c => {
                            const isConfirmed = c.confirmation_status === 'confirmed';
                            return (
                                <View key={c.class_session_id} style={tw`bg-white mb-4 rounded-xl p-4 flex-row items-center shadow`}>
                                    <View style={tw`w-1 h-full bg-[#112E50] rounded-l-xl mr-3`} />
                                    <View style={tw`flex-1`}>
                                        <Text style={tw`font-bold text-gray-800`}>{c.course.name}</Text>
                                        <Text style={tw`text-gray-600`}>{c.start_time}–{c.end_time}</Text>
                                    </View>
                                    <View style={tw`flex-row gap-2`}>
                                        {isConfirmed ? (
                                            <>
                                                <TouchableOpacity
                                                    style={tw`px-3 py-1 bg-gray-600 rounded`}
                                                    onPress={() => handleChangeStatus(c.class_session_id, 'cancelled', c.date)}
                                                >
                                                    <Text style={tw`text-white`}>Otkaži</Text>
                                                </TouchableOpacity>
                                                <View style={tw`px-3 py-1 bg-orange-500 rounded`}>
                                                    <Text style={tw`text-white`}>Potvrđeno</Text>
                                                </View>
                                            </>
                                        ) : (
                                            <TouchableOpacity
                                                style={tw`px-3 py-1 bg-[#112E50] rounded`}
                                                onPress={() => handleChangeStatus(c.class_session_id, 'confirmed', c.date)}
                                            >
                                                <Text style={tw`text-white`}>Potvrdi</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                        {!(scheduleMap[selectedDate] || []).length && (
                            <Text style={tw`text-center text-gray-500 mt-10`}>Nema termina za prikaz.</Text>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
