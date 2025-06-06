import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Moment from 'moment';
import tw from 'twrnc';
import api from '../../api';

export default function TeacherProfileScreen({ navigation, route }) {
    const user = route.params.user;
    const teacher = user.teacher;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        jmbg: teacher.jmbg,
        phone: teacher.phone,
        year_exp: teacher.year_exp
    });
    const [refreshing, setRefreshing] = useState(false);

    // Fetch latest student data
    const fetchStudentData = async () => {
        setRefreshing(true);
        try {
            const res = await api.get(`/teacher/${teacher.id}`);
            const t = res.data;
            setFormData({
                jmbg: t.jmbg,
                phone: t.phone,
                year_exp: t.year_exp
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Greška', 'Nije uspelo učitavanje podataka.');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Initial load
        fetchStudentData();
    }, []);

    const handleUpdate = async () => {
        try {
            await api.put(`/teacher/${teacher.id}`, formData);
            Alert.alert('Uspešno', 'Podaci su uspešno ažurirani.');
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Greška', 'Došlo je do greške prilikom ažuriranja podataka.');
        }
    };

    const handleCancel = () => {
        fetchStudentData(); // reset to latest
        setIsEditing(false);
    };

    const renderField = (icon, label, value, key) => (
        <View style={styles.fieldContainer} key={key}>
            <View style={styles.fieldLabel}>
                {icon}
                <Text style={styles.labelText}>{label}</Text>
            </View>
            {isEditing ? (
                <TextInput
                    style={styles.inputFancy}
                    value={String(value)}
                    onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                    keyboardType="numeric"
                />
            ) : (
                <Text style={styles.valueText}>{value}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            <LinearGradient colors={['#f7934d', '#f1553f']} style={styles.header}>
                <Text style={styles.headerText}>{user.name}</Text>
            </LinearGradient>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchStudentData} />
                }
            >
                <View style={styles.card}>
                    {/* Static Birth & Enrollment Dates */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldLabel}>
                            <MaterialIcons name="cake" size={20} color="#555" />
                            <Text style={styles.labelText}>Datum rođenja</Text>
                        </View>
                        <Text style={styles.valueText}>
                            {Moment(teacher.birth_date).format('DD.MM.YYYY.')}
                        </Text>
                    </View>
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldLabel}>
                            <MaterialIcons name="calendar-today" size={20} color="#555" />
                            <Text style={styles.labelText}>Datum upisa</Text>
                        </View>
                        <Text style={styles.valueText}>
                            {Moment(teacher.created_at).format('DD.MM.YYYY.')}
                        </Text>
                    </View>

                    {renderField(
                        <MaterialIcons name="person-outline" size={20} color="#555" />,
                        'Broj godina iskustva',
                        formData.year_exp,
                        'year_exp'
                    )}
                    {renderField(
                        <FontAwesome5 name="id-card" size={20} color="#555" />,
                        'JMBG',
                        formData.jmbg,
                        'jmbg'
                    )}
                    {renderField(
                        <MaterialIcons name="phone-android" size={20} color="#555" />,
                        'Telefon',
                        formData.phone,
                        'phone'
                    )}

                    <View style={styles.buttonRow}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleUpdate}
                                >
                                    <Text style={styles.buttonText}>Sačuvaj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.cancelText}>Odustani</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={styles.buttonText}>Izmeni podatke</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: 20,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    headerText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
    },
    fieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    labelText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    valueText: {
        fontSize: 16,
        color: '#333',
        paddingLeft: 28,
    },
    inputFancy: {
        backgroundColor: '#fafafa',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    editButton: {
        backgroundColor: '#f7934d',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    saveButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 30,
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 30,
        marginLeft: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
