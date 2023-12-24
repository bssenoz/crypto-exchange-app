import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput } from "react-native";
import React, { useContext, useState } from "react";
import FormInput from "../components/FormInput";
import { AuthContext } from "../navigation/AuthProvider";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [phone, setPhone] = useState();

  const { register } = useContext(AuthContext);

  const handleSignUp = () => {
    if (password === confirmPassword) {
      register(email, password, phone);
    } else {
      Alert.alert("Error", "Şifreler aynı değil. Lütfen kontrol ediniz!");
    }
  };
  const [isValidPhone, setIsValidPhone] = useState(true);

  const handlePhoneChange = (userPhone) => {
    // Bu fonksiyonu telefon numarası formatı kontrolü yapmak için kullanabilirsiniz
    // Bu örnek sadece basit bir kontrol sağlamaktadır, gerçek uygulama senaryonuza göre uyarlamalısınız.
    const phoneRegex = /^\d{10}$/; // Örneğin, 10 haneli bir telefon numarasını kabul ediyoruz.

    if (phoneRegex.test(userPhone)) {
      setIsValidPhone(true);
    } else {
      setIsValidPhone(false);
    }

    onChangeText(userPhone);
  };

  return (

    <View style={styles.container}>




      <View style={{ marginBottom: 40 }}>
        <FontAwesome5 name="user-plus" size={140} color="#faf602" />
      </View>
      <FormInput
        iconName="email"
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="E-mail giriniz..."
      />
      <FormInput
        iconName="phone"
        labelValue={phone}
        onChangeText={(userPhone) => setPhone(userPhone)}
        placeholderText="Telefon numarası giriniz..."
      />
      <FormInput
        iconName="vpn-key"
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Şifre giriniz..."
        secureTextEntry={true}
      />
      <FormInput
        iconName="vpn-key"
        labelValue={confirmPassword}
        onChangeText={(userPassword) => setConfirmPassword(userPassword)}
        placeholderText="Şifreyi tekrar giriniz..."
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
            Kayıt Ol
          </Text>
          <FontAwesome name="sign-in" size={30} color="#14181b" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ color: "#fafaaa", fontWeight: "bold", marginTop: 8 }}>
          Hesabın var mı? Şimdi giriş yap!
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
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#14181b'
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
    backgroundColor: "#faf602",
    height: 60,
    width: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 90,
  },
});
