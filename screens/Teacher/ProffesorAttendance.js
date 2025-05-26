import React from "react";
import { SafeAreaView, View, Text } from "react-native";
import tw from "twrnc";
// import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import QRScanner from "./QRScanner";

export default function ProfessorAttendance() {
    const handleScan = (data) => {
        console.log("Skeniran QR kod:", data);
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <LinearGradient colors={['#ed7d37', '#F59E0B']}
                style={tw`p-4 rounded-b-3xl items-center justify-center`}>
                <Text style={tw`text-white text-xl font-bold`}>Skeniraj prisustvo djaka</Text>
            </LinearGradient>
            <QRScanner onScan={handleScan} />
            {/* <QRCode value="Professor123" color='#ed7d37' size={300} /> */}
        </SafeAreaView>
    );
}

// import React from "react";
// import { View, Text } from "react-native";
// import QRScanner from "./QRScanner";

// const ProfessorAttendance = () => {
//   const handleScan = (data) => {
//     console.log("Skeniran QR kod:", data);
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <Text style={{ textAlign: "center", marginVertical: 10 }}>
//         Skener QR koda
//       </Text>
//       <QRScanner onScan={handleScan} />
//     </View>
//   );
// };

// export default ProfessorAttendance;
