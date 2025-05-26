import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import tw from "twrnc";
import api from "../../api";

export default function ScanStudentScreen({ navigation, route }) {
    const { classSessionId } = route.params;
    const [facing, setFacing] = useState("back");
    const [permission, requestPermission] = useCameraPermissions();
    const isProcessing = useRef(false);

    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={tw`text-center pb-8 text-lg font-semibold`}>
                    Potrebna je dozvola za kameru
                </Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionText}>Dozvoli</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }) => {
        if (isProcessing.current) return;
        isProcessing.current = true;
        const studentId = data;

        api
            .post("/attendance/change-attendance-status", {
                class_session_id: classSessionId,
                student_id: studentId,
                status: "present",
            })
            .then(() => Alert.alert("Uspeh", `Student ${studentId} zabeležen.`))
            .catch((err) => {
                if (err.response?.status === 404) {
                    Alert.alert("Greška", "Učenik nije prijavljen za ovaj čas.");
                } else {
                    Alert.alert("Greška", err.response?.data?.message || "Neuspeh prilikom slanja.");
                }
            })
            .finally(() =>
                setTimeout(() => {
                    isProcessing.current = false;
                }, 3000)
            );
    };

    const toggleCameraFacing = () => {
        setFacing((f) => (f === "back" ? "front" : "back"));
    };

    return (
        <View style={styles.container}>
            {/* Kamera */}
            <CameraView
                style={styles.camera}
                facing={facing}
                onBarcodeScanned={handleBarCodeScanned}
            />

            {/* Flip dugme apsolutno pozicionirano preko kamere */}
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                    <Text style={styles.flipText}>Flip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    camera: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 32,
    },
    flipButton: {
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    flipText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    permissionBtn: tw`flex justify-center items-center mt-4`,
    permissionText: tw`text-center rounded-full p-3 text-lg font-semibold shadow-md text-white bg-blue-500 w-1/3`,
});
