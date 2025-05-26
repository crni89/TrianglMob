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
import DropDownPicker from 'react-native-dropdown-picker';

const gradeOptions = [
    { label: 'Prvi razred – osnovna škola', value: 'prvi_os' },
    { label: 'Drugi razred – osnovna škola', value: 'drugi_os' },
    { label: 'Treći razred – osnovna škola', value: 'treci_os' },
    { label: 'Četvrti razred – osnovna škola', value: 'cetvrti_os' },
    { label: 'Peti razred – osnovna škola', value: 'peti_os' },
    { label: 'Šesti razred – osnovna škola', value: 'sesti_os' },
    { label: 'Sedmi razred – osnovna škola', value: 'sedmi_os' },
    { label: 'Osmi razred – osnovna škola', value: 'osmi_os' },
    { label: 'Prvi razred – srednja škola', value: 'prvi_ss' },
    { label: 'Drugi razred – srednja škola', value: 'drugi_ss' },
    { label: 'Treći razred – srednja škola', value: 'treci_ss' },
    { label: 'Četvrti razred – srednja škola', value: 'cetvrti_ss' },
    { label: 'Fakultet', value: 'fax' },

];

export default function StudentProfileScreen({ navigation, route }) {
    const user = route.params.user;
    const student = user.student;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        parent_name: student.parent_name,
        jmbg: student.jmbg,
        phone: student.phone,
        primary_school: student.primary_school,
        grade: student.grade,
    });
    const [refreshing, setRefreshing] = useState(false);

    // dropdown picker state
    const [gradeOpen, setGradeOpen] = useState(false);
    const [gradeItems, setGradeItems] = useState(gradeOptions);

    // Sync formData.grade with dropdown
    useEffect(() => {
        setGradeValue(formData.grade);
    }, [formData.grade]);

    const [gradeValue, setGradeValue] = useState(formData.grade);

    useEffect(() => {
        setFormData(fd => ({ ...fd, grade: gradeValue }));
    }, [gradeValue]);

    // Fetch latest student data
    const fetchStudentData = async () => {
        setRefreshing(true);
        try {
            const res = await api.get(`/student/${student.id}`);
            const s = res.data;
            setFormData({
                parent_name: s.parent_name,
                jmbg: s.jmbg,
                phone: s.phone,
                primary_school: s.primary_school,
                grade: s.grade,
            });
            setGradeValue(s.grade);
        } catch (error) {
            console.error(error);
            Alert.alert('Greška', 'Nije uspelo učitavanje podataka.');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    const handleUpdate = async () => {
        try {
            await api.put(`/student/${student.id}`, formData);
            Alert.alert('Uspešno', 'Podaci su uspešno ažurirani.');
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Greška', 'Došlo je do greške prilikom ažuriranja podataka.');
        }
    };

    const handleCancel = () => {
        fetchStudentData();
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
                    value={value}
                    onChangeText={text => setFormData({ ...formData, [key]: text })}
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStudentData} />}
            >
                <View style={styles.card}>
                    {/* Static Birth & Enrollment Dates */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldLabel}>
                            <MaterialIcons name="cake" size={20} color="#555" />
                            <Text style={styles.labelText}>Datum rođenja</Text>
                        </View>
                        <Text style={styles.valueText}>
                            {Moment(student.birth_date).format('DD.MM.YYYY.')}
                        </Text>
                    </View>
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldLabel}>
                            <MaterialIcons name="calendar-today" size={20} color="#555" />
                            <Text style={styles.labelText}>Datum upisa</Text>
                        </View>
                        <Text style={styles.valueText}>
                            {Moment(student.created_at).format('DD.MM.YYYY.')}
                        </Text>
                    </View>

                    {/* Editable Fields */}
                    {renderField(
                        <MaterialIcons name="person-outline" size={20} color="#555" />,
                        'Ime roditelja',
                        formData.parent_name,
                        'parent_name'
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
                    {renderField(
                        <MaterialIcons name="school" size={20} color="#555" />,
                        'Osnovna škola',
                        formData.primary_school,
                        'primary_school'
                    )}

                    {/* Grade Dropdown */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldLabel}>
                            <FontAwesome5 name="chalkboard-teacher" size={20} color="#555" />
                            <Text style={styles.labelText}>Razred</Text>
                        </View>
                        {isEditing ? (
                            <DropDownPicker
                                listMode="MODAL"
                                open={gradeOpen}
                                value={gradeValue}
                                items={gradeItems}
                                setOpen={setGradeOpen}
                                setValue={setGradeValue}
                                setItems={setGradeItems}
                                placeholder="Izaberi razred"

                                /* 1. Modal preko celog ekrana, ali podržava transparent pozadinu */
                                modalProps={{
                                    animationType: 'fade',
                                    presentationStyle: 'overFullScreen'
                                }}

                                /* 2. Stil za kontejner modala (pozadina + centriranje sadržaja) */
                                modalContentContainerStyle={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'flex',
                                }}

                                /* 3. Stil za samu listu stavki unutar modaļa */
                                dropDownContainerStyle={{
                                    width: '80%',
                                    maxHeight: 250,
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                }}

                                style={{
                                    borderRadius: 8,
                                }}
                            />
                        ) : (
                            <Text style={styles.valueText}>
                                {gradeItems.find(i => i.value === formData.grade)?.label || '—'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.buttonRow}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                                    <Text style={styles.buttonText}>Sačuvaj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.cancelText}>Odustani</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
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
    dropdown: {
        backgroundColor: '#fafafa',
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
    },
    dropdownContainer: {
        backgroundColor: '#fafafa',
        borderColor: '#ddd',
        borderRadius: 8,
        marginTop: 4,
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
