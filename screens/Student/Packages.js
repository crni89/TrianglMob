import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl
} from 'react-native';
import tw from 'twrnc';
import api from '../../api';
import LoaderComponent from '../Loader';

export default function PaketiScreen() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const getCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/courses`);
            setCourses(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        getCourses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        getCourses();
    };

    const formatFormat = (format) => {
        if (format === 'group') return 'Grupni čas';
        if (format === 'individual') return 'Individualni čas';
        return '';
    };

    const formatType = (type) => {
        if (type === 'regular') return 'Redovna nastava';
        if (type === 'preparatory') return 'Pripremna nastava';
        if (type === 'language') return 'Jezicki kurs';
        if (type === 'other') return 'Ostalo';
        return '';
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View style={styles.loaderWrapper}>
                    <LoaderComponent />
                </View>
            ) : (
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {courses.map((item) => {
                        const novaCena = item.discount_percent !== null
                            ? Math.round(item.price * ((100 - item.discount_percent) / 100))
                            : null;

                        return (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.courseName}>{item.name}</Text>
                                    {item.discount_percent !== null ? (
                                        <View style={styles.priceBlock}>
                                            <Text style={styles.oldPrice}>{item.price} RSD</Text>
                                            <Text style={styles.newPrice}>{novaCena} RSD</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.price}>{item.price} RSD</Text>
                                    )}
                                </View>
                                <Text style={styles.format}>Format časa: {formatFormat(item.format)}</Text>
                                <Text style={styles.type}>Tip časa: {formatType(item.type)}</Text>
                                <Text style={styles.description}>Opis: {item.description}</Text>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    loaderWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    courseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    priceBlock: {
        alignItems: 'flex-end',
    },
    oldPrice: {
        fontSize: 13,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    newPrice: {
        fontSize: 15,
        color: '#FF8C00',
        fontWeight: 'bold',
    },
    price: {
        fontSize: 15,
        color: '#FF8C00',
        fontWeight: 'bold',
    },
    format: {
        fontSize: 13,
        color: '#444',
        marginBottom: 2,
    },
    type: {
        fontSize: 13,
        color: '#444',
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
        marginTop: 4,
    },
});
