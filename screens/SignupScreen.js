import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useContext, useState } from "react";
import FormButton from "../components/FormButton";
import FormInput from "../components/FormInput";
import SocialButton from "../components/SocialButton";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../navigation/AuthProvider";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [phone, setPhone] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  const { register } = useContext(AuthContext);

  const handleSignUp = () => {      
    if (password === confirmPassword) {
      register(email, password, phone);
      
    } else {
      Alert.alert("Error", "Password and repeat password do not match!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingBottom: 20 }}>
        <FontAwesome5 name="user-plus" size={100} color="#18c68b" />
      </View>
      <FormInput
        iconName="email"
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Enter e-mail..."
      />
           
       <FormInput
        iconName="phone"
        labelValue={phone}
        onChangeText={(userPhone) => setPhone(userPhone)}
        placeholderText="Enter phone..."
      />
      <FormInput
        iconName="vpn-key"
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Enter password..."
        secureTextEntry={true}
      />
      <FormInput
        iconName="vpn-key"
        labelValue={confirmPassword}
        onChangeText={(userPassword) => setConfirmPassword(userPassword)}
        placeholderText="Repeat password..."
        secureTextEntry={true}
      />

      <TouchableOpacity
        style={styles.registerButtonContainer}
        onPress={() => handleSignUp()}
      >
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              color: "#14181b",
              fontSize: 22,
              fontWeight: "bold",
              paddingEnd: 15,
            }}
          >
            Register
          </Text>
          <FontAwesome name="sign-in" size={30} color="#14181b" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ color: "#18c68b", fontWeight: "bold" }}>
          Already have an account? Sign in now!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  signupButton: {
    padding: 10,
    fontSize: 20,
  },
  text: {
    fontSize: 25,
    fontWeight: "bold",
    paddingBottom: 50,
  },
  registerButtonContainer: {
    backgroundColor: "#18c68b",
    height: 60,
    width: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});
