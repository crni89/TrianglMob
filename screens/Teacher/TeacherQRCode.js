import React from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

export default function TeacherQRCode({ navigation, route }) {
    const { teacher } = route.params;
    const teacherId = String(teacher.id);
    const name = String(teacher.full_name);

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            {/* Wrapper koji drži gradient i X dugme */}
            <View style={tw`relative w-full`}>
                <LinearGradient
                    colors={["#112E50", "#112E50"]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={tw`w-full py-6 px-4 shadow-md`}
                >
                    <Text style={tw`text-center text-2xl font-bold text-white`}>
                        {teacher.full_name}
                    </Text>
                </LinearGradient>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={tw`absolute top-4 right-4 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg`}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="close" size={28} color="#112E50" />
                </TouchableOpacity>
            </View>

            <View style={tw`flex-1 items-center justify-center px-6`}>
                <View style={tw`bg-white p-6 rounded-3xl shadow-xl items-center`}>
                    <View style={tw`bg-gray-100 p-4 rounded-xl mb-4`}>
                        <QRCode
                            value={JSON.stringify({ teacher_id: teacherId, teacher_name: name })}
                            size={250}
                            color="#112E50"
                            backgroundColor="#fff"
                        />
                    </View>
                    <Text style={tw`text-lg font-semibold text-orange-500`}>
                        Skener za potvrdu prisustva
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
