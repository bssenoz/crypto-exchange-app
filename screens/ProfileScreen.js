import React, { useContext, useEffect, useState } from "react";
import Modal from "react-native-modal";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, } from "react-native";
import { AuthContext } from "../navigation/AuthProvider";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';


const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  const storageRef = ref(storage, user.email);
  const [image, setImage] = useState(null);

  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const takeImageFromCamera = async () => {

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {

      const img = await fetch(result.assets[0].uri);
      const bytes = await img.blob();

      await uploadBytes(storageRef, bytes);
    }
    showProfilePic();
  };

  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    console.log(result);

    if (!result.canceled) {

      const img = await fetch(result.assets[0].uri);
      const bytes = await img.blob();

      await uploadBytes(storageRef, bytes);
    }
    showProfilePic();
  };

  const showProfilePic = () => {
    getDownloadURL(ref(storage, user.email))
      .then((url) => {

        setImage(url);
      })
      .catch((e) => {
        setImage(null);
        console.log(e);
      });
  };

  useEffect(() => {
    showProfilePic();
    fetchUser();
  }, [user]);

  const fetchUser = async () => {
    try {
      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserData(userData);
      } else {
        console.log("User data not found");
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updatePhoneNumber = async () => {
    try {
      const docRef = doc(db, "users", user.email);
      await updateDoc(docRef, {
        phone: newPhoneNumber,
      });
      console.log("Phone number updated successfully!");

      setIsEditingPhoneNumber(false);
      fetchUser();
    } catch (error) {
      console.error('Error updating phone number:', error);
    }
  };

  return (
    <ScrollView>
      <View style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Feather name="user" size={30} color="#faf602" />
          <Text
            style={{
              alignItems: 'center',
              fontWeight: '500',
              fontFamily: "Roboto-Regular",
              color: "#faf602",
              fontSize: 30,
              letterSpacing: 1,
              paddingHorizontal: 20,
              paddingBottom: 10,
            }}
          >
            Profil
          </Text>
        </View>
      </View>
      <View>
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          {image === null ? (
            <View
              style={{
                height: 100,
                width: 100,
                backgroundColor: "#6d897e",
                borderRadius: 100,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10
              }}
            >
              <AntDesign name="questioncircle" size={40} color="#14181b" />
            </View>
          ) : (
            <Image source={{ uri: image }} style={styles.profilePicContainer} />
          )}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialIcons name="email" size={24} color="#6d897e" />
        <Text style={styles.text}>{user.email}</Text>
      </View>
      <View style={{ paddingTop: 15, paddingLeft: 15 }}>
        <Text
          style={{
            fontFamily: "Roboto-Regular",
            color: "#fafaaa",
            fontSize: 18,
            textAlign: "center",
            marginTop: 25
          }}
        >
          Profil Resmini Değiştir
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          padding: 15,
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={styles.changePictureContainer}
          onPress={() => pickImage()}
        >
          <View style={{ padding: 20 }}>
            <AntDesign name="folderopen" style={styles.changeImage} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 25
              }}
            >
              <Text
                style={{ color: "#6d897e", fontSize: 18, fontWeight: "bold" }}
              >
                Dosyalar
              </Text>
              <AntDesign name="arrowright" size={30} color="#fafaaa" />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changePictureContainer}
          onPress={() => takeImageFromCamera()}
        >
          <View style={{ padding: 20 }}>
            <AntDesign name="camerao" style={styles.changeImage} />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 25

              }}
            >
              <Text
                style={{ color: "#6d897e", fontSize: 18, fontWeight: "bold" }}
              >
                Kamera
              </Text>
              <AntDesign name="arrowright" size={30} color="#fafaaa" />
            </View>
          </View>
        </TouchableOpacity>
      </View>



      <View style={{ paddingTop: 15, paddingLeft: 15, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={{ fontFamily: "Roboto-Regular", color: "#fafaaa", fontSize: 18, marginTop: 6 }}>
          Telefon No: {userData ? userData.phone || "Mevcut Değil" : "Loading..."}
        </Text>

        <View style={{ marginRight: 15 }}>
          {!isEditingPhoneNumber ? (
            <TouchableOpacity onPress={() => setIsEditingPhoneNumber(true)}>
              <View style={styles.updateButton}>
                <Text style={{ color: '#14181b', fontSize: 16, fontWeight: "bold" }}>Güncelle</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleModal}>
              <View style={styles.updateButton}>
                <Text style={{ color: '#14181b', fontSize: 16, fontWeight: "bold" }}>Güncelle</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

      </View>



      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={toggleModal} style={{ alignSelf: 'flex-start' }}>
              <AntDesign name="close" size={30} color="#faf602" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası"
            placeholderTextColor="#777a7a"
            value={newPhoneNumber}
            onChangeText={(text) => setNewPhoneNumber(text)}
          />
          <TouchableOpacity
            style={styles.saveButtonContainer}
            onPress={() => {
              updatePhoneNumber();
              toggleModal();
            }}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </Modal>


      <TouchableOpacity
        style={styles.logoutButtonContainer}
        onPress={() => logout()}
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
            Çıkış
          </Text>
          <MaterialIcons name="logout" size={30} color="#14181b" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafd",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 20,
    color: "#6d897e",
    paddingStart: 8,
  },
  profilePicContainer: {
    height: 100,
    width: 100,
    borderRadius: 100,
  },
  changePictureContainer: {
    height: 140,
    width: "47%",
    backgroundColor: "#14181b",
    borderRadius: 10,
  },
  logoutButtonContainer: {
    backgroundColor: "#faf602",
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 70
  },
  input: {
    color: 'white',
    fontSize: 30,
    marginBottom: 50,
    marginTop: 20
  },
  saveButtonContainer: {
    backgroundColor: '#faf602',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#14181b',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: "bold"
  },
  updateButton: {
    backgroundColor: '#faf602',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#14181b',
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  changeImage: {
    textAlign: "center",
    fontSize: 40,
    color: "#faf602"
  },

});
