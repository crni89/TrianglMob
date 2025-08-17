import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
} from 'react-native';
import api from '../../api';

export default function RateTeacherScreen({ navigation, route }) {
    const teacher = route.params.profile;
    const teacherId = teacher.id;

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [rating, setRating] = useState('0');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get(`/teacher/${teacherId}/students`);
            setStudents(res.data)
            // const enrollments = res.data.enrollments || [];
            // const unique = enrollments
            //     .flatMap(e => e.course?.teachers || [])
            //     .reduce((acc, t) => {
            //         if (!acc.find(x => x.id === t.id)) acc.push(t);
            //         return acc;
            //     }, []);
            // setTeachers(unique);
        } catch (err) {
            console.error(err);
            Alert.alert('Greška', 'Nešto je pošlo naopako prilikom učitavanja profesora.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    const handleSubmit = async () => {
        if (!selectedStudent) {
            Alert.alert('Upozorenje', 'Izaberite profesora.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/studentReview`, {
                teacher_id: teacherId,
                student_id: selectedStudent,
                rating: parseInt(rating, 10),
                comment: comment.trim(),
            });
            Alert.alert('Uspeh', 'Hvala na oceni!');
            // navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Greška', 'Neuspešno slanje ocene.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const studentName = students.find(t => t.id === selectedStudent)?.name;

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.label}>Student:</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTeacherModal(true)}
            >
                <Text style={styles.dropdownButtonText}>
                    {studentName || 'Izaberi studenta'}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={showTeacherModal}
                transparent
                animationType="slide"
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <ScrollView>
                            {students.map(s => (
                                <Pressable
                                    key={s.id}
                                    style={styles.option}
                                    onPress={() => {
                                        setSelectedStudent(s.id);
                                        setShowTeacherModal(false);
                                    }}
                                >
                                    <Text
                                        style={
                                            s.id === selectedStudent
                                                ? styles.selectedOptionText
                                                : styles.optionText
                                        }
                                    >
                                        {s.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowTeacherModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Zatvori</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Text style={styles.label}>Ocena (1-5):</Text>
            <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity
                        key={n}
                        onPress={() => setRating(String(n))}
                    >
                        <Text style={[
                            styles.star,
                            n <= parseInt(rating) && styles.filledStar
                        ]}>
                            ★
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Komentar:</Text>
            <TextInput
                style={styles.input}
                multiline
                placeholder="Ostavite komentar..."
                value={comment}
                onChangeText={setComment}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={submitting}
            >
                <Text style={styles.buttonText}>
                    {submitting ? 'Šaljem...' : 'Pošalji ocenu'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '600', marginTop: 12 },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
    },
    dropdownButtonText: { fontSize: 14, color: '#333' },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        width: '80%',
        maxHeight: '60%',
        borderRadius: 8,
        padding: 16,
    },
    option: { paddingVertical: 12 },
    optionText: { fontSize: 14, color: '#333' },
    selectedOptionText: { fontSize: 14, color: '#112E50', fontWeight: '600' },
    closeButton: { marginTop: 12, alignItems: 'center' },
    closeButtonText: { color: '#112E50', fontSize: 16 },
    ratingRow: { flexDirection: 'row', marginTop: 8 },
    star: { fontSize: 32, color: '#ccc', marginHorizontal: 4 },
    filledStar: { color: '#f5a623' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 4,
        padding: 8,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#112E50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
