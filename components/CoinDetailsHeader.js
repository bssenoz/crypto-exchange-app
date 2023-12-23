import { StyleSheet, Text, View, Image, Modal, TextInput, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFavouriteList } from "../Contexts/FavouriteListContext";
import { AuthContext } from "../navigation/AuthProvider";
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import { useFavouriteList } from "../Contexts/FavouriteListContext";

const CoinDetailsHeader = (props) => {
  const { image, name, coinId, marketCapRank } = props;
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [notificationValue, setNotificationValue] = useState("");
  const [isIncrease, setIncrease] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "users", user.email);
        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
          const updatedUserData = docSnapshot.data();
          setUserData(updatedUserData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();

    return () => { };
  }, [user]);

  const { favouriteCoinIds, storeFavouriteCoinId, removeFavouriteCoinId } =
    useFavouriteList();

  const chechIfCoinIsFavourite = () =>
    favouriteCoinIds.some((coinIdValue) => coinIdValue === coinId);

  const handleFavouriteListCoin = () => {
    if (chechIfCoinIsFavourite()) {
      return removeFavouriteCoinId(coinId);
    }
    return storeFavouriteCoinId(coinId);
  };

  const handleNotification = async () => {
    await storeOrderInDatabase(coinId, notificationValue, isIncrease);
    toggleModal();
  };

  const storeOrderInDatabase = async (coinId, targetValue, isIncrease) => {
    try {
      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData && Array.isArray(userData.order)) {
          const newOrder = {
            id: coinId,
            target: targetValue,
            isIncrease: isIncrease,
          };

          const updatedUserData = {
            ...userData,
            order: [...userData.order, newOrder],
          };

          await setDoc(docRef, updatedUserData, { merge: true });

        } else {
          console.error("userData or userData.order is not valid:", userData);
        }
      } else {
        console.error("Document does not exist");
      }
    } catch (error) {
      console.error("Error storing order in database:", error);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <Ionicons
        name="chevron-back"
        size={32}
        color="#faf602"
        onPress={() => navigation.goBack()}
      />
      <View style={styles.coinContainer}>
        <Image source={{ uri: image }} style={{ width: 25, height: 25 }} />
        <Text style={styles.coinTitle}>{name}</Text>
        <View style={styles.rankContainer}>
          <Text style={styles.coinRank}>#{marketCapRank}</Text>
        </View>
      </View>

      <FontAwesome name="bell" size={20} color="#18c68b" onPress={toggleModal} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Alarm Kur</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={(text) => setNotificationValue(text)}
                value={notificationValue}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.increaseButton]}
                onPress={() => setIncrease(true)}
              >
                <Text style={styles.buttonText}>Yükselince</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.decreaseButton]}
                onPress={() => setIncrease(false)}
              >
                <Text style={styles.buttonText}>Düşünce</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleNotification}
            >
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {chechIfCoinIsFavourite() ? (
        <MaterialIcons
          name="favorite"
          size={32}
          color="#ff0000"
          onPress={() => handleFavouriteListCoin()}
        />
      ) : (
        <MaterialIcons
          name="favorite-border"
          size={32}
          color="#ff0000"
          onPress={() => handleFavouriteListCoin()}
        />
      )}
    </View>
  );
};

export default CoinDetailsHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinTitle: {
    color: "#faf602",
    fontWeight: "bold",
    marginHorizontal: 10,
    fontSize: 25,
  },
  rankContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coinRank: {
    color: "#0b0d11",
    fontWeight: "bold",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: 200,
    borderRadius: 3,
    flex: 1,
  },
  icon: {
    marginHorizontal: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#0b0d11",
  },
  iconContainer: {
    flexDirection: 'row',
    paddingBottom: 22
  },
  button: {
    backgroundColor: "#18c68b",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  increaseButton: {
    marginRight: 5,
  },
  decreaseButton: {
    marginLeft: 5,
  },
});
