import React from "react";
import { SafeAreaView, View, Text } from "react-native";
import tw from "twrnc";

// Mock podaci o ocenama i komentarima
const reviewsData = [
  { id: 1, comment: "Excellent professor!", rating: 5 },
  { id: 2, comment: "Needs more real-life examples.", rating: 4 },
  { id: 3, comment: "Very patient and explains well.", rating: 5 },
];

export default function ProfessorReviews() {
  return (
    <SafeAreaView style={tw`flex-1 bg-white px-4`}>
      <Text style={tw`text-2xl font-bold my-4 text-center text-gray-800`}>Student Reviews</Text>

      {reviewsData.map((review) => (
        <View key={review.id} style={tw`bg-gray-100 p-4 rounded-xl shadow-lg mb-4`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>⭐ {review.rating}/5</Text>
          <Text style={tw`text-gray-700 italic mt-1`}>“{review.comment}”</Text>
        </View>
      ))}
    </SafeAreaView>
  );
}
