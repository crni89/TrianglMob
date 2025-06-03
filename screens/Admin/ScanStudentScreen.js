import React, { useState, useRef, useEffect } from "react";
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

    // Čim se komponenta mount-uje, tražimo dozvolu ako je nemamo
    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission, requestPermission]);

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

        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch {
            Alert.alert("Greška", "Neispravan format QR koda.");
            isProcessing.current = false;
            return;
        }

        const teacher_id = parsed.teacher_id != null ? parseInt(parsed.teacher_id, 10) : null;
        const student_id = parsed.student_id != null ? parseInt(parsed.student_id, 10) : null;
        const body = {
            class_session_id: classSessionId,
            status: "present",
        };

        if (teacher_id) {
            body.teacher_id = teacher_id;
        } else if (student_id) {
            body.student_id = student_id;
        } else {
            Alert.alert("Greška", "QR kod ne sadrži ni teacher_id ni student_id.");
            isProcessing.current = false;
            return;
        }

        api
            .post("/attendance/change-attendance-status", body)
            .then(() => {
                const who = teacher_id ? "Nastavnik" : "Učenik";
                const name = parsed.teacher_name || parsed.student_name;
                Alert.alert("Uspeh", `${who} ${name} zabeležen.`);
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    Alert.alert("Greška", "Entitet nije prijavljen za ovaj čas.");
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

            {/* Flip dugme */}
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
