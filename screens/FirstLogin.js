// front/screens/FirstLogin.js

import React, { useState } from 'react';
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from '../api';

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
    const [jmbg, setJmbg] = useState('');
    const [phone, setPhone] = useState('');
    const [primarySchool, setPrimarySchool] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        if (!parentName || !jmbg || !phone || !primarySchool || !birthDate) {
            Alert.alert('Upozorenje', 'Sva polja su obavezna.');
            return;
        }

        setLoading(true);
        try {
            // Kreiraj ili ažuriraj student profil
            const postResp = await api.post('/student', {
                user_id: user.id,
                parent_name: parentName,
                jmbg,
                phone,
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
            navigation.replace('StudentHome', { user, profile });
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
                        <Text style={styles.label}>Ime roditelja</Text>
                        <TextInput
                            value={parentName}
                            onChangeText={setParentName}
                            placeholder="Unesite ime roditelja"
                            placeholderTextColor={COLORS.placeholder}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>JMBG</Text>
                        <TextInput
                            value={jmbg}
                            onChangeText={setJmbg}
                            placeholder="13 cifara"
                            placeholderTextColor={COLORS.placeholder}
                            keyboardType="number-pad"
                            maxLength={13}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefon</Text>
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
                        <Text style={styles.label}>Osnovna škola</Text>
                        <TextInput
                            value={primarySchool}
                            onChangeText={setPrimarySchool}
                            placeholder="Naziv škole"
                            placeholderTextColor={COLORS.placeholder}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Datum rođenja</Text>
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
