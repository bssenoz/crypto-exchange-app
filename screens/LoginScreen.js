import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import FormInput from "../components/FormInput";
import { AuthContext } from "../navigation/AuthProvider";
import { FontAwesome, FontAwesome5,FontAwesomeIcon } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const { login } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 55 }}>
        <FontAwesome5 name="user" size={140} color="#faf602" solid />
      </View>

      <FormInput
        iconName="email"
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="E-mail giriniz..."
      />
      <FormInput
        iconName="vpn-key"
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Şifre giriniz..."
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
            Giriş Yap
          </Text>
          <FontAwesome name="sign-in" size={30} color="#14181b" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={{ color: "#fafaaa", fontWeight: "bold", marginTop: 8  }}>
          Hesabın yok mu? Şimdi hesap oluştur!
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
    paddingTop: 80,
    paddingHorizontal: 10,
    backgroundColor: '#14181b'
  },
  signupButton: {
    padding: 10,
    fontSize: 20,
  },
  signinButtonContainer: {
    backgroundColor: "#faf602",
    height: 60,
    width: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 170,
  },
});
