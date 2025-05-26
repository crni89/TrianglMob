import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import tw from "twrnc";
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QRScanner() {
  const [facing, setFacing] = useState("back");
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const isProcessing = useRef(false); // Sprečava dupli sken

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={tw`text-center pb-8 text-lg font-semibold`}>Potrebna je dozvola za pokretanje kamere</Text>
        <TouchableOpacity style={tw`flex justify-center items-center`} onPress={() => requestPermission()}>
            <Text style={tw`text-center rounded-full p-3 text-lg font-semibold shadow-md text-white bg-blue-500 w-1/3`}>Dozvoli</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleBarCodeScanned({ data }) {
    if (isProcessing.current) return; // Ako je već u obradi, ignoriše novi sken

    isProcessing.current = true; // Blokira dodatne skenove dok se ne obradi
    console.log("BarCode data : " + data); // Loguje samo jednom

    setScanned(true);
    setIsCameraActive(false); // Gasi kameru
    Alert.alert("QR Kod skeniran", `Podaci: ${data}`, [
      { text: "OK", onPress: () => (isProcessing.current = false) }, // Resetujemo blokadu nakon alert-a
    ]);
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function restartCamera() {
    setScanned(false);
    setIsCameraActive(true);
    isProcessing.current = false; // Resetuje blokadu
  }

  return (
    <View style={styles.container}>
      {isCameraActive ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.message}>QR Kod je skeniran</Text>
          <Button title="Pokreni kameru ponovo" onPress={restartCamera} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 18,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
