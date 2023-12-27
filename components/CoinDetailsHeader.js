import { StyleSheet, Text, View, Image, Modal, TextInput, TouchableOpacity, TouchableHighlight, Pressable } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Ionicons, FontAwesome, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFavouriteList } from "../Contexts/FavouriteListContext";
import { AuthContext } from "../navigation/AuthProvider";
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const CoinDetailsHeader = (props) => {
  const { image, name, coinId, marketCapRank } = props;
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [notificationValue, setNotificationValue] = useState("");


  const [isIncrease, setIncrease] = useState(null);
  const [isPressed, setIsPressed] = useState(true);


  const sliceName = (name) => {
    if (name && name.length > 10) {
      return `${name.substring(0, 10)}..`;
    }
    return name;
  };

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
      return removeFavouriteCoinId(coinId, name);
    }
    return storeFavouriteCoinId(coinId, name);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
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

  const handlePressIn = () => {
    setIsPressed(true);
    setIncrease(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    setIncrease(false);
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
        <Image source={{ uri: image }} style={{ width: 25, height: 25, borderRadius: 15 }} />
        <Text style={styles.coinTitle}>{sliceName(name)}</Text>
        <View style={styles.rankContainer}>
          <Text style={styles.coinRank}>#{marketCapRank}</Text>
        </View>
      </View>

      <FontAwesome name="bell" style={{ left: 8 }} size={25} color="#faf602" onPress={toggleModal} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity onPress={toggleModal} style={{ alignSelf: 'flex-start' }}>
              <AntDesign name="close" size={35} color="#14181b" />
            </TouchableOpacity>
            <View style={styles.modalHeader}>

              <Text style={styles.modalText}>Alarm Kur</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Fiyat Giriniz..."
                onChangeText={(text) => setNotificationValue(text)}
                value={notificationValue}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.button,
                  styles.increaseButton,

                  { backgroundColor: isPressed ? '#0fd900' : '#97e391' }
                ]}
                onPressIn={handlePressIn}
              >
                <Text style={styles.buttonText}>Yüksek</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.decreaseButton,
                  { backgroundColor: isPressed ? '#fa8e8e' : '#ff0000' }

                ]}
                onPressIn={handlePressOut}
              >
                <Text style={styles.buttonText}>Düşük</Text>
              </Pressable>
            </View>
            <TouchableOpacity
              style={styles.buttonSave}
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
    padding: 10,
    backgroundColor: "#2c353b",
    borderRadius: 20,

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
    backgroundColor: 'white'

  },
  modalText: {
    marginBottom: 20,
    fontSize: 25,
    fontWeight: "bold",
    color: "#14181b",
  },
  iconContainer: {
    flexDirection: 'row',
    paddingBottom: 22
  },
  buttonSave: {
    backgroundColor: "#faf602",
    padding: 10,
    borderRadius: 5,
    marginTop: 50,
    width: 150,

  },
  buttonText: {
    color: '#14181b',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  increaseButton: {
    marginRight: 10,
    backgroundColor: "#00bd0a",
    padding: 10,
    width: 150,
    borderRadius: 5,
    marginTop: 20,

  },
  decreaseButton: {
    backgroundColor: "#d90404",
    padding: 10,
    width: 150,
    borderRadius: 5,
    marginTop: 20,
  },
  activeButtonIncrease: {
    backgroundColor: 'red',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,

  },
});
