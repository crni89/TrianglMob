import React from "react";
import { SafeAreaView, View, Text, ScrollView, Image } from "react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import moment from "moment";


// Mock podaci o časovima i ocenama
const casoviData = [
  { id: 1, predmet: "Matematika", datum: "2025-01-15", brojUcenika: 20 },
  { id: 2, predmet: "Fizika", datum: "2025-01-18", brojUcenika: 15 },
];

const oceneData = [
  { id: 1, komentar: "Profesor odlično objašnjava", ocena: 5 },
  { id: 2, komentar: "Treba više praktičnih primera", ocena: 4 },
];

export default function TeacherHome({route}) {
    const teacher = route.params.teacher;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Zaglavlje sa imenom profesora */}
      <LinearGradient  colors={['#ed7d37', '#F59E0B']}
       style={tw`h-30 rounded-b-3xl items-center justify-center`}>
        <Image source={require("../../assets/images/logo.png")} style={tw`w-20 h-10 `} resizeMode="contain" />
        <Text style={tw`text-white text-xl font-bold mt-2`}>Dobrodošli, {teacher.full_name}!</Text>
      </LinearGradient>

      <ScrollView style={tw`px-4 mt-4`}>
        {/* Lični podaci */}
        <View style={tw`bg-gray-100 p-4 rounded-xl shadow-lg mb-6`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>Lični podaci</Text>
          <Text style={tw`text-gray-700`}>Ime: {teacher.full_name}</Text>
          <Text style={tw`text-gray-700`}>Datum rođenja: {moment( teacher.birth_date).format('DD.MM.YYYY.')}</Text>
          <Text style={tw`text-gray-700`}>Godine radnog staža: {teacher.year_exp}</Text>
        </View>

        {/* Evidencija časova */}
        <View style={tw`bg-gray-100 p-4 rounded-xl shadow-lg mb-6`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>Održani časovi</Text>
          {casoviData.map((cas) => (
            <View key={cas.id} style={tw`mt-2`}>
              <Text style={tw`text-gray-700`}>{cas.predmet} ({cas.datum}) - {cas.brojUcenika} učenika</Text>
            </View>
          ))}
        </View>

        {/* Anonimne ocene i revizije */}
        <View style={tw`bg-white p-4 rounded-xl shadow-lg mb-6`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>Rezultati anketa</Text>
          {oceneData.map((ocena) => (
            <View key={ocena.id} style={tw`mt-2`}>
              <Text style={tw`text-gray-700`}>Ocena: {ocena.ocena}⭐</Text>
              <Text style={tw`text-gray-600 italic`}>“{ocena.komentar}”</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
