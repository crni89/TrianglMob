import { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import FormTextField from "../components/FormTextField";
import axios from "axios";
import * as Device from "expo-device";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import Entypo from "@expo/vector-icons/Entypo";
import api from "../api";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleRegister = () => {
    if (!email || !password || !firstName || !lastName || !name) {
      setError("Please fill in all fields.");
    } else {
      setLoading(true);
      api.post("/register", {
          email: email,
          password: password,
          name: name,
          firstName: firstName,
          lastName: lastName,
          deviceName: Device.modelName,
        })
        .then(() => {
          setLoading(false);
          navigation.navigate("Login");
        })
        .catch((e) => {
          setLoading(false);
          setError(e.response?.data?.message || "An error occurred.");
        });
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <LinearGradient
          colors={["#c7b699", "#c7b699", "#c7b699"]}
          style={tw`flex-1 justify-center px-6`}
        >
          {/* Naslov */}
          <View style={tw`items-center mb-8`}>
            <Entypo name="add-user" size={50} color="black" />
            <Text style={tw`text-white text-3xl font-bold mt-4`}>
              Create Account
            </Text>
          </View>

          {/* Forma za unos */}
          <View style={tw`bg-white p-6 rounded-2xl shadow-lg`}>
            {/* Email */}
            <FormTextField
              label="Email:"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              style={styles.input}
            />
            {/* Password */}
            <FormTextField
              label="Password:"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={styles.input}
            />
            {/* Username */}
            <FormTextField
              label="Username:"
              value={name}
              onChangeText={(text) => setName(text)}
              style={styles.input}
            />
            {/* First Name */}
            <FormTextField
              label="First Name:"
              value={firstName}
              onChangeText={(text) => setFirstName(text)}
              style={styles.input}
            />
            {/* Last Name */}
            <FormTextField
              label="Last Name:"
              value={lastName}
              onChangeText={(text) => setLastName(text)}
              style={styles.input}
            />

            {/* Error Message */}
            {error && (
              <Text style={tw`text-red-500 text-center font-semibold mt-2`}>
                {error}
              </Text>
            )}

            {/* Dugme za registraciju */}
            {loading ? (
              <ActivityIndicator size="large" color="#3b5998" />
            ) : (
              <TouchableOpacity
                style={tw`bg-orange-600 py-3 rounded-xl mt-4`}
                onPress={handleRegister}
              >
                <Text style={tw`text-white text-center text-lg font-bold`}>
                  Register
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Link za prijavu */}
          <View style={tw`mt-6 flex-row justify-center`}>
            <Text style={tw`text-white`}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={tw`text-black-300 ml-2 font-semibold`}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
});
