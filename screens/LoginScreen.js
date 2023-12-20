import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import FormButton from "../components/FormButton";
import FormInput from "../components/FormInput";
import SocialButton from "../components/SocialButton";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../navigation/AuthProvider";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const { login } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={{ paddingBottom: 15 }}>
        <FontAwesome5 name="user" size={100} color="#18c68b" />
      </View>

      <FormInput
        iconName="email"
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Enter e-mail..."
      />
      <FormInput
        iconName="vpn-key"
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Enter password..."
        secureTextEntry={true}
      />
      <TouchableOpacity
        style={styles.signinButtonContainer}
        onPress={() => login(email, password)}
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
            Sign in
          </Text>
          <FontAwesome name="sign-in" size={30} color="#14181b" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={{ color: "#18c68b", fontWeight: "bold" }}>
          Don't have an account? Sign up now!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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
  signinButtonContainer: {
    backgroundColor: "#18c68b",
    height: 60,
    width: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});
