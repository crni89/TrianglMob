import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Modal,
    TouchableOpacity,
    Pressable,
    RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';

const FILTER_LABELS = {
    '': 'Svi kursevi',
    regular: 'Redovna nastava',
    preparatory: 'Pripremna nastava',
    other: 'Ostalo',
};

const PAYMENT_TYPE = {
    'cash': "gotovina",
    'card': "kartica"
}

export default function PaymentsScreen({ navigation, route }) {
    const student = route.params.profile;
    const [enrollments, setEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const studentId = student.id;

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const applyFilter = () => {
        setActiveFilter(selectedType);
        setFilterModalVisible(false);
        setFilteredEnrollments(
            selectedType
                ? enrollments.filter(e => e.course?.type === selectedType)
                : enrollments
        );
    };

    const fetchEnrollments = async () => {
        try {
            const res = await api.get(`/student/${studentId}/payments`);
            const data = res.data.enrollments || [];
            setEnrollments(data);
            setFilteredEnrollments(
                activeFilter
                    ? data.filter(e => e.course?.type === activeFilter)
                    : data
            );
        } catch (err) {
            console.error('Greška pri učitavanju podataka:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchEnrollments();
        setRefreshing(false);
    };

    // Summary calculations based on actual payments
    const totalCost = filteredEnrollments.reduce(
        (sum, e) => sum + parseFloat(e.price),
        0
    );
    const totalPaid = filteredEnrollments.reduce(
        (sum, e) => {
            const paid = e.payments?.reduce(
                (s, p) => s + parseFloat(p.amount),
                0
            );
            return sum + paid;
        },
        0
    );
    const totalDebt = totalCost - totalPaid;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Summary */}
                <LinearGradient
                    colors={['#4e6a8a', '#4e6a8a', '#4e6a8a']}
                    style={styles.summaryContainer}
                >
                    <View style={styles.summaryRow}>
                        <Ionicons name="pricetag-outline" size={24} color="#fff" />
                        <Text style={styles.summaryText}>Stanje</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Cena svih paketa:</Text>
                        <Text style={styles.summaryValue}>
                            {totalCost.toFixed(2)} RSD
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Ukupno uplaćeno:</Text>
                        <Text style={styles.summaryValue}>
                            {totalPaid.toFixed(2)} RSD
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Ukupno dugovanje:</Text>
                        <Text style={[styles.summaryValue, styles.debtValue]}>
                            {totalDebt.toFixed(2)} RSD
                        </Text>
                    </View>
                </LinearGradient>

                {/* Filter Button */}
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons
                        name="filter-outline"
                        size={18}
                        color="#fff"
                        style={styles.filterIcon}
                    />
                    <Text style={styles.filterButtonText}>
                        {activeFilter
                            ? `Filter: ${FILTER_LABELS[activeFilter]}`
                            : 'Filtriraj'}
                    </Text>
                </TouchableOpacity>

                {/* Enrollments List */}
                {filteredEnrollments.length === 0 ? (
                    <Text style={styles.noPayments}>
                        Nema podataka za prikaz.
                    </Text>
                ) : (
                    filteredEnrollments.map(item => {
                        const paid = item.payments?.reduce(
                            (s, p) => s + parseFloat(p.amount),
                            0
                        );
                        const debt = parseFloat(item.price) - paid;
                        return (
                            <LinearGradient
                                key={item.id}
                                colors={['#ececec', '#ececec']}
                                style={styles.cardGradient}
                            >
                                <View style={styles.cardHeader}>
                                    <Ionicons
                                        name="book-outline"
                                        size={20}
                                        color="#112E50"
                                    />
                                    <Text style={styles.course}>
                                        {item.course?.name}
                                    </Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.detail}>
                                        Cena: {parseFloat(item.price).toFixed(2)} RSD
                                    </Text>
                                    <Text style={styles.detail}>
                                        Uplaćeno: {paid.toFixed(2)} RSD
                                    </Text>
                                </View>

                                {/* Individual Payments */}
                                {item.payments && item.payments.length > 0 ? (
                                    item.payments.map(p => (
                                        <View
                                            key={p.id}
                                            style={styles.paymentRow}
                                        >
                                            <Text style={styles.paymentDate}>
                                                {p.payment_date.split(' ')[0]}
                                            </Text>
                                            <Text style={styles.paymentType}>
                                                {PAYMENT_TYPE[p.type]}
                                            </Text>
                                            <Text
                                                style={styles.paymentAmount}
                                            >
                                                +{parseFloat(p.amount).toFixed(2)} RSD
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noPaymentText}>
                                        Nema uplate za ovaj kurs
                                    </Text>
                                )}

                                <View style={styles.cardFooter}>
                                    <Text
                                        style={[styles.amount, styles.debtValue]}
                                    >
                                        Dug: {debt.toFixed(2)} RSD
                                    </Text>
                                </View>
                            </LinearGradient>
                        );
                    })
                )}
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Izaberi tip kursa:
                        </Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedType}
                                onValueChange={val =>
                                    setSelectedType(val)
                                }
                                style={styles.picker}
                            >
                                <Picker.Item
                                    label="Svi kursevi"
                                    value=""
                                />
                                <Picker.Item
                                    label="Redovna nastava"
                                    value="regular"
                                />
                                <Picker.Item
                                    label="Pripremna nastava"
                                    value="preparatory"
                                />
                                <Picker.Item label="Ostalo" value="other" />
                            </Picker>
                        </View>
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={styles.modalBtn}
                                onPress={applyFilter}
                            >
                                <Text style={styles.modalBtnText}>
                                    Primeni
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.modalBtn,
                                    styles.cancelBtn,
                                ]}
                                onPress={() =>
                                    setFilterModalVisible(false)
                                }
                            >
                                <Text style={styles.modalBtnText}>
                                    Otkaži
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 16, paddingBottom: 32 },
    summaryContainer: { borderRadius: 12, padding: 16, marginBottom: 20 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    summaryText: { color: '#fff', fontSize: 16, marginLeft: 8, flex: 1 },
    summaryValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
    debtValue: { color: '#fa0c24' },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#112E50', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
    filterIcon: { marginRight: 6 },
    filterButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    noPayments: { textAlign: 'center', color: '#888', marginTop: 40 },
    cardGradient: { borderRadius: 12, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    course: { fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#112E50' },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    detail: { fontSize: 14, color: '#555' },
    paymentRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    paymentDate: { flex: 1, fontSize: 14, color: '#333' },
    paymentType: { flex: 1, fontSize: 14, color: '#333', textAlign: 'center' },
    paymentAmount: { flex: 1, fontSize: 14, color: 'green', textAlign: 'right' },
    noPaymentText: { fontSize: 14, color: '#888', marginBottom: 8 },
    cardFooter: { alignItems: 'flex-end', marginTop: 8 },
    amount: { fontSize: 16, fontWeight: '700', color: '#112E50' },
    modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', width: '85%', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', marginBottom: 24 },
    picker: { height: 150, width: '100%' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    modalBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#112E50', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    cancelBtn: { backgroundColor: '#888' },
    modalBtnText: { color: '#fff', fontWeight: '600' },
});
