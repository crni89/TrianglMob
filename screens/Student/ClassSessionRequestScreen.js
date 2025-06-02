import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import api from '../../api';

// Configure Serbian locale for calendar
LocaleConfig.locales['sr'] = {
    monthNames: [
        'Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'
    ],
    monthNamesShort: ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'],
    dayNames: ['Nedelja','Ponedeljak','Utorak','Sreda','Četvrtak','Petak','Subota'],
    dayNamesShort: ['Ned','Pon','Uto','Sre','Čet','Pet','Sub'],
    today: 'Danas'
};
LocaleConfig.defaultLocale = 'sr';

export default function ClassSessionRequestScreen({ navigation, route }) {
    const student = route.params.profile;
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [date, setDate] = useState(new Date());
    const [startHour, setStartHour] = useState(new Date().getHours());
    const [startMinute, setStartMinute] = useState(0);
    const [endHour, setEndHour] = useState((new Date().getHours() + 1) % 24);
    const [endMinute, setEndMinute] = useState(0);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const res = await api.get(`/student/${student.id}/enrollments`);
            const enrollments = res.data.enrollments || [];
            const uniqCourses = [];
            const uniqTeachers = [];
            enrollments.forEach(e => {
                if (e.course && !uniqCourses.some(c => c.id === e.course.id)) {
                    uniqCourses.push(e.course);
                }
                e.course.teachers.forEach(t => {
                    if (!uniqTeachers.some(x => x.id === t.id)) {
                        uniqTeachers.push(t);
                    }
                });
            });
            setCourses(uniqCourses);
            setTeachers(uniqTeachers);
        } catch (err) {
            console.error(err);
            Alert.alert('Greška', 'Neuspešno učitavanje podataka');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCourse || !selectedTeacher) {
            Alert.alert('Upozorenje', 'Izaberite kurs i profesora');
            return;
        }
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        if (end <= start) {
            Alert.alert('Greška', 'Kraj časa mora biti posle početka');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/class-requests', {
                student_id: student.id,
                course_id: selectedCourse,
                teacher_id: selectedTeacher,
                date: date.toISOString().split('T')[0],
                start_time: `${String(startHour).padStart(2,'0')}:${String(startMinute).padStart(2,'0')}`,
                end_time: `${String(endHour).padStart(2,'0')}:${String(endMinute).padStart(2,'0')}`,
                location,
            });
            Alert.alert('Uspeh', 'Zahtev je poslat');
        } catch (err) {
            console.error(err);
            Alert.alert('Greška', 'Neuspešno slanje zahteva');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text>Učitavanje...</Text>
            </View>
        );
    }
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}.${year}`;
    };

    const marked = {};
    marked[date.toISOString().split('T')[0]] = { selected: true, selectedColor: '#4e54c8' };
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
            >
                <Text style={styles.label}>Kurs</Text>
                <View style={styles.dropdown}>
                    {courses.map(c => (
                        <TouchableOpacity
                            key={c.id}
                            style={[styles.option, selectedCourse === c.id && styles.selected]}
                            onPress={() => setSelectedCourse(c.id)}
                        >
                            {/* <Text style={styles.optionText}>{c.name}</Text> */}
                            <Text style={[styles.optionText, selectedCourse === c.id && styles.selected]}>
                                {c.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Profesor</Text>
                <View style={styles.dropdown}>
                    {teachers.map(t => (
                        <TouchableOpacity
                            key={t.id}
                            style={[styles.option, selectedTeacher === t.id && styles.selected]}
                            onPress={() => setSelectedTeacher(t.id)}
                        >
                            {/* <Text style={styles.optionText}>{t.full_name}</Text> */}
                            <Text style={[styles.optionText, selectedTeacher === t.id && styles.selected]}>
                                {t.full_name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Datum</Text>
                {/* <Text style={styles.selectedDateText}>Izabrani datum: {formatDate(date)}</Text> */}
                <Calendar
                    onDayPress={day => setDate(new Date(day.dateString))}
                    markedDates={marked}
                    theme={{ todayTextColor: '#4e54c8', selectedDayBackgroundColor: '#4e54c8' }}
                    renderHeader={(date) => {
                        const d = new Date(date);
                        return (
                        <Text style={{ fontSize: 18, fontWeight: 'semibold' }}>
                            {formatDate(d)}
                        </Text>
                        );
                    }}
                />

                <Text style={styles.label}>Početak časa</Text>
                <View style={styles.timeRow}>
                    <Picker
                        selectedValue={startHour}
                        style={styles.picker}
                        onValueChange={setStartHour}
                    >
                        {hours.map(h => (
                            <Picker.Item key={h} label={String(h).padStart(2,'0')} value={h} />
                        ))}
                    </Picker>
                    <Picker
                        selectedValue={startMinute}
                        style={styles.picker}
                        onValueChange={setStartMinute}
                    >
                        {minutes.map(m => (
                            <Picker.Item key={m} label={String(m).padStart(2,'0')} value={m} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Kraj časa</Text>
                <View style={styles.timeRow}>
                    <Picker
                        selectedValue={endHour}
                        style={styles.picker}
                        onValueChange={setEndHour}
                    >
                        {hours.map(h => (
                            <Picker.Item key={h} label={String(h).padStart(2,'0')} value={h} />
                        ))}
                    </Picker>
                    <Picker
                        selectedValue={endMinute}
                        style={styles.picker}
                        onValueChange={setEndMinute}
                    >
                        {minutes.map(m => (
                            <Picker.Item key={m} label={String(m).padStart(2,'0')} value={m} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Lokacija</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Unesite mesto..."
                    value={location}
                    onChangeText={setLocation}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.buttonText}>{submitting ? 'Šaljem...' : 'Pošalji zahtev'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 12 },
    dropdown: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 0 },
    option: { padding: 8, backgroundColor: '#fff', margin: 4, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
    selected: { backgroundColor: '#4e54c8', borderColor: '#4e54c8', color:"#fff" },
    optionText: { fontSize: 14, color: '#333' },
    timeRow: { flexDirection: 'row', marginTop: 8 },
    picker: { flex: 1, backgroundColor: '#fff' },
    input: { backgroundColor: '#fff', padding: 12, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: '#ddd' },
    button: { backgroundColor: '#4e54c8', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
