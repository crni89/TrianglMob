import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfessorMaterials() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");


    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleUpload = () => {
        if (title && description) {
            alert(`Material "${title}" uploaded successfully!`);
            setTitle("");
            setDescription("");
        } else {
            alert("Please fill in all fields.");
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white px-4`}>
                <LinearGradient colors={['#ed7d37', '#F59E0B']}
                    style={tw`p-4 rounded-b-3xl items-center justify-center`}>
                    <Text style={tw`text-white text-xl font-bold`}>Upload Study Materials</Text>
                </LinearGradient>
                {/* <Text style={tw`text-2xl font-bold my-4 text-center text-gray-800`}>Upload Study Materials</Text> */}

            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={tw`flex justify-center self-center w-4/5 h-screen m-auto`}>
                    <TextInput
                        style={tw`border border-gray-300 p-3 rounded-xl mb-4`}
                        placeholder="Material Title"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <TextInput
                        style={tw`border border-gray-300 p-6 rounded-xl mb-4`}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        scrollEnabled
                    />

                    <TouchableOpacity style={tw`bg-blue-500 p-4 rounded-xl items-center`} onPress={handleUpload}>
                        <Text style={tw`text-white font-bold text-lg`}>Upload Material</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
