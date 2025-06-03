// front/screens/FirstLogin.js

import React, { useState, useContext } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import api from '../api';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from '../context/AuthContext';

const COLORS = {
    white: '#FFFFFF',
    orange: '#FF8C00',
    navy: '#112E50',
    lightGray: '#F4F4F4',
    placeholder: '#B0B0B0',
    accent: '#EDEDED',
};

export default function FirstLoginScreen() {
    const navigation = useNavigation();
    const { user } = useRoute().params;

    const [parentName, setParentName] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [phone, setPhone] = useState('');
    const [primarySchool, setPrimarySchool] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gradeValue, setGradeValue] = useState('');
    const [loading, setLoading] = useState(false);
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

    const [gradeOpen, setGradeOpen] = useState(false);
    const [gradeItems, setGradeItems] = useState(gradeOptions);


    const { setUser, setProfile } = useContext(AuthContext);

    const handleComplete = async () => {
        if (!parentName || !parentPhone || !phone || !primarySchool || !birthDate) {
            Alert.alert('Upozorenje', 'Sva polja su obavezna.');
            return;
        }

        setLoading(true);
        try {
            // Kreiraj ili ažuriraj student profil
            const postResp = await api.post('/student', {
                user_id: user.id,
                parent_name: parentName,
                parent_phone: parentPhone,
                phone,
                grade: gradeValue,
                primary_school: primarySchool,
                birth_date: birthDate,
                device_name: user.current_device || 'default_device',
            });

            // Izvuci ID novokreiranog studenta iz odgovora
            const createdStudent = postResp.data;
            const studentId = createdStudent.id;
            if (!studentId) throw new Error('Student ID nije vraćen iz odgovora.');

            // Dohvati profil studenta koristeći novi ID
            const { data: profile } = await api.get(`/student/${studentId}`);
            setUser(user);
            setProfile(profile);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
            });
            // navigation.replace('StudentHome', { user, profile });
        } catch (err) {
            console.error(err);
            Alert.alert('Greška', err.response?.data?.message || err.message || 'Došlo je do greške.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header without background, clean design */}
            <View style={styles.headerContainer}>
                <MaterialIcons name="emoji-people" size={48} color={COLORS.navy} />
                <Text style={styles.headerTitle}>Dobrodošli</Text>
                <Text style={styles.headerSubtitle}>{user.name}</Text>
            </View>
            <View style={styles.accentLine} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ime roditelja *</Text>
                        <TextInput
                            value={parentName}
                            onChangeText={setParentName}
                            placeholder="Unesite ime roditelja"
                            placeholderTextColor={COLORS.placeholder}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefon roditelja</Text>
                        <TextInput
                            value={parentPhone}
                            onChangeText={setParentPhone}
                            placeholder="Unesite broj telefona roditelja"
                            placeholderTextColor={COLORS.placeholder}
                            keyboardType="phone-pad"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefon *</Text>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Unesite broj telefona"
                            placeholderTextColor={COLORS.placeholder}
                            keyboardType="phone-pad"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Škola *</Text>
                        <TextInput
                            value={primarySchool}
                            onChangeText={setPrimarySchool}
                            placeholder="Naziv škole"
                            placeholderTextColor={COLORS.placeholder}
                            style={styles.input}
                        />
                    </View>

                    {/* Grade Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Razred</Text>
                        <DropDownPicker
                            listMode="MODAL"
                            open={gradeOpen}
                            value={gradeValue}
                            items={gradeItems}
                            setOpen={setGradeOpen}
                            setValue={setGradeValue}
                            setItems={setGradeItems}
                            placeholder="Izaberite razred"

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

                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Datum rođenja *</Text>
                        <TextInput
                            value={birthDate}
                            onChangeText={setBirthDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={COLORS.placeholder}
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleComplete}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Sačekajte...' : 'Sačuvaj'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: COLORS.white },
    headerContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        color: COLORS.navy,
        fontSize: 22,
        fontWeight: '700',
        marginTop: 8,
    },
    headerSubtitle: {
        color: COLORS.navy,
        fontSize: 16,
        marginTop: 4,
        opacity: 0.7,
    },
    accentLine: {
        height: 4,
        backgroundColor: COLORS.orange,
        marginHorizontal: 40,
        borderRadius: 2,
    },
    form: { padding: 24 },
    inputGroup: { marginBottom: 18 },
    label: {
        color: COLORS.navy,
        marginBottom: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.navy,
    },
    button: {
        backgroundColor: COLORS.orange,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
});
