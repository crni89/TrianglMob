import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Pressable,
} from 'react-native';
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
    cash: 'gotovina',
    card: 'kartica',
};

const FilterButton = ({ label, status, active, onPress }) => (
    <Pressable
        onPress={() => onPress(status)}
        style={[
            styles.filterBtn,
            active === status && styles.filterBtnActive,
        ]}
    >
        <Text
            style={[
                styles.filterBtnText,
                active === status && styles.filterBtnTextActive,
            ]}
        >
            {label}
        </Text>
    </Pressable>
);

export default function PaymentsScreen({ route }) {
    const student = route.params.profile;
    const studentId = student.id;

    const [enrollments, setEnrollments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchEnrollments = async () => {
        try {
            const res = await api.get(`/student/${studentId}/payments`);
            const data = res.data.enrollments || [];
            setEnrollments(data);
            applyFilter(filterStatus, data);
        } catch (err) {
            console.error('Greška pri učitavanju podataka:', err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEnrollments();
    };

    const applyFilter = (status, data = enrollments) => {
        setFilterStatus(status);
        if (status === '') {
            setFiltered(data);
        } else {
            setFiltered(data.filter(e => e.course?.type === status));
        }
    };

    // Summary izračuni
    const totalCost = filtered.reduce((sum, e) => sum + parseFloat(e.price), 0);
    const totalPaid = filtered.reduce((sum, e) => {
        const paid = e.payments?.reduce((s, p) => s + parseFloat(p.amount), 0) || 0;
        return sum + paid;
    }, 0);
    const totalDebt = totalCost - totalPaid;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Summary */}
                <LinearGradient
                    colors={['#4e6a8a', '#4e6a8a']}
                    style={styles.summaryContainer}
                >
                    <View style={styles.summaryRow}>
                        <Ionicons name="pricetag-outline" size={24} color="#fff" />
                        <Text style={styles.summaryText}>Stanje</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Cena svih paketa:</Text>
                        <Text style={styles.summaryValue}>{totalCost.toFixed(2)} RSD</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Ukupno uplaćeno:</Text>
                        <Text style={styles.summaryValue}>{totalPaid.toFixed(2)} RSD</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Ukupno dugovanje:</Text>
                        <Text style={[styles.summaryValue, styles.debtValue]}>
                            {totalDebt.toFixed(2)} RSD
                        </Text>
                    </View>
                </LinearGradient>

                {/* Filter Buttons */}
                <View style={styles.filterWrapper}>
                    {Object.entries(FILTER_LABELS).map(([status, label]) => (
                        <FilterButton
                            key={status}
                            label={label}
                            status={status}
                            active={filterStatus}
                            onPress={applyFilter}
                        />
                    ))}
                </View>

                {/* Enrollment kartice */}
                {filtered.length === 0 ? (
                    <Text style={styles.noData}>Nema podataka za prikaz.</Text>
                ) : (
                    filtered.map(item => {
                        const paid =
                            item.payments?.reduce((s, p) => s + parseFloat(p.amount), 0) || 0;
                        const debt = parseFloat(item.price) - paid;
                        return (
                            <LinearGradient
                                key={item.id}
                                colors={['#ececec', '#ececec']}
                                style={styles.cardGradient}
                            >
                                <View style={styles.cardHeader}>
                                    <Ionicons name="book-outline" size={20} color="#112E50" />
                                    <Text style={styles.course}>{item.course?.name}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.detail}>
                                        Cena: {parseFloat(item.price).toFixed(2)} RSD
                                    </Text>
                                    <Text style={styles.detail}>
                                        Uplaćeno: {paid.toFixed(2)} RSD
                                    </Text>
                                </View>

                                {item.payments && item.payments.length > 0 ? (
                                    item.payments.map(p => (
                                        <View key={p.id} style={styles.paymentRow}>
                                            <Text style={styles.paymentDate}>
                                                {p.payment_date.split(' ')[0]}
                                            </Text>
                                            <Text style={styles.paymentType}>
                                                {PAYMENT_TYPE[p.type]}
                                            </Text>
                                            <Text style={styles.paymentAmount}>
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
                                    <Text style={[styles.amount, styles.debtValue]}>
                                        Dug: {debt.toFixed(2)} RSD
                                    </Text>
                                </View>
                            </LinearGradient>
                        );
                    })
                )}
            </ScrollView>
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

    filterWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    filterBtn: {
        margin: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
    },
    filterBtnActive: {
        backgroundColor: '#4E6A8A',
    },
    filterBtnText: {
        fontSize: 14,
        color: '#4E6A8A',
        fontWeight: '600',
    },
    filterBtnTextActive: {
        color: '#fff',
    },

    cardGradient: { borderRadius: 12, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    course: { fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#112E50' },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detail: { fontSize: 14, color: '#555' },
    paymentRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    paymentDate: { flex: 1, fontSize: 14, color: '#333' },
    paymentType: { flex: 1, fontSize: 14, color: '#333', textAlign: 'center' },
    paymentAmount: { flex: 1, fontSize: 14, color: 'green', textAlign: 'right' },
    noPaymentText: { fontSize: 14, color: '#888', marginBottom: 8 },
    cardFooter: { alignItems: 'flex-end', marginTop: 8 },
    amount: { fontSize: 16, fontWeight: '700', color: '#112E50' },
    noData: { textAlign: 'center', color: '#888', marginTop: 40 },
});
