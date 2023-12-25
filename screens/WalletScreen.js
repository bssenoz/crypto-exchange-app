import React, { useContext, useEffect, useState } from "react";
import { FlatList, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { AuthContext } from "../navigation/AuthProvider";
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from 'react-native-modal';
import { getDetailedCoinDataAPI } from "../services/api";
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/Alert';
import { Alert } from 'react-native';

const WalletScreen = () => {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [addedMoney, setAddedMoney] = useState('');
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [sellAmount, setSellAmount] = useState('');

  const [selectedCoinName, setSelectedCoinName] = useState('');
  const [selectedCoinPrice, setSelectedCoinPrice] = useState('')
  const [selectedCoinPiece, setSelectedCoinPiece] = useState('')

  const [isSellSuccessModalVisible, setSellSuccessModalVisible] = useState(false);
  const [isBuySuccessModalVisible, setBuySuccessModalVisible] = useState(false);
  const [isBuyInsufficientModalVisible, setBuyInsufficientModalVisible] = useState(false);
  const [isSellInsufficientModalVisible, setSellInsufficientModalVisible] = useState(false);

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, "users", user.email);

      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        const updatedUserData = docSnapshot.data();
        setUserData(updatedUserData);
      });

      return () => unsubscribe();
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı verilerini getirme sırasında bir hata oluştu.');
    }
  };

  const getDetailedCoin = async () => {
    try {
      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserData(userData);

        const updatedCoins = [];

        for (var i = 0; i < userData.coin.length; i++) {
          const fetchedCoinsData = await getDetailedCoinDataAPI(userData.coin[i].id);
          const result = await fetchedCoinsData.json();
          const updatedCoin = {
            ...userData.coin[i],
            current_price: (result.data.market_data.price[0].price_latest * userData.coin[i].piece).toFixed(3),
          };

          updatedCoins.push(updatedCoin);
        }

        const userRef = doc(db, "users", user.email);
        await updateDoc(userRef, { coin: updatedCoins });

        setUserData({ ...userData, coin: updatedCoins });
      } else {
        Alert.alert('Hata', 'Kullanıcı bulunamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Veri çekme sırasında bir hata oluştu.');
    }
  };

  const calculatePortfolioValue = () => {
    if (!userData || !userData.coin) {
      return 0;
    }

    let portfolioValue = 0;

    for (const coin of userData.coin) {
      portfolioValue += parseFloat(coin.current_price || 0);
    }

    return portfolioValue.toFixed(3);
  };

  useEffect(() => {
    fetchUserData();

    const fetchDataInterval = setInterval(() => {
      getDetailedCoin();
    }, 30000);

    return () => {
      clearInterval(fetchDataInterval);
    };
  }, [user]);

  const handleSellCoin = async (coinName, coinPrice) => {
    try {
      await fetchUserData();

      setSelectedCoinName(coinName);
      setSelectedCoinPrice(coinPrice);
      setSellModalVisible(true);

    } catch (error) {
      Alert.alert('Hata', 'Satış işlemi sırasında bir hata oluştu.');
    }
  };

  const handleBuyCoin = async (coinName, coinPrice, coinPiece) => {
    setSelectedCoinName(coinName);
    setSelectedCoinPrice(coinPrice);
    setSelectedCoinPiece(coinPiece)
    setBuyModalVisible(true);
  };

  const handleConfirmSell = async () => {
    try {
      const sellAmountFloat = parseFloat(sellAmount.replace(',', '.'));

      if (sellAmountFloat <= 0) {
        Alert.alert('Hata', 'Geçerli bir miktar girin.');
        return;
      }

      const selectedCoin = userData.coin.find((coin) => coin.name === selectedCoinName);
      if (!selectedCoin || selectedCoin.piece < sellAmountFloat) {
        setSellInsufficientModalVisible(true);
        return;
      }

      const updatedCoins = userData.coin.map((c) => {
        if (c.name === selectedCoinName) {
          const updatedPiece = c.piece - sellAmountFloat;
          const updatedCurrentPrice = (selectedCoin.current_price - (sellAmountFloat * selectedCoin.price) / c.piece).toFixed(3);

          if (updatedPiece <= 0) {
            return null;
          }

          return {
            ...c,
            piece: updatedPiece,
            current_price: updatedCurrentPrice,
          };
        }
        return c;
      }).filter(Boolean);

      const updatedUserData = {
        ...userData,
        coin: updatedCoins,
        money: parseFloat(userData.money) + ((sellAmountFloat * selectedCoin.current_price) / selectedCoin.piece),
      };

      const docRef = doc(db, "users", user.email);
      await updateDoc(docRef, { coin: updatedUserData.coin, money: updatedUserData.money });

      setUserData(updatedUserData);
      setSellModalVisible(false);
      setSellAmount('');
      setSellSuccessModalVisible(true);
    } catch (error) {
      console.log(error)
      Alert.alert('Hata', 'Satış işlemi sırasında bir hata oluştu.');
    }
  };

  const handleConfirmBuy = async () => {
    try {
      const coinPrice = parseFloat(selectedCoinPrice);
      const purchasedAmount = parseFloat(buyAmount.replace(',', '.'));
      const totalCost = coinPrice / (selectedCoinPiece / purchasedAmount);

      if (userData.money < totalCost) {
        setBuyInsufficientModalVisible(true);
        return;
      }

      const updatedCoins = userData.coin.map((c) => {
        if (c.name === selectedCoinName) {
          return {
            ...c,
            piece: c.piece + purchasedAmount,
            price: (coinPrice * (c.piece + purchasedAmount)).toFixed(3),
            current_price: (coinPrice * (c.piece + purchasedAmount)).toFixed(3)
          };
        }
        return c;
      });

      const updatedUserData = {
        ...userData,
        coin: updatedCoins,
      };

      setUserData(updatedUserData);
      updatedUserData.money = parseFloat(updatedUserData.money) - parseFloat(totalCost);

      const docRef = doc(db, "users", user.email);
      await updateDoc(docRef, { coin: updatedUserData.coin, money: updatedUserData.money });

      setBuySuccessModalVisible(true);
    } catch (error) {

    }
  };

  const handleAddMoney = async () => {
    try {
      const updatedMoney = parseFloat(userData?.money || 0) + parseFloat(addedMoney);
      const userRef = doc(db, 'users', user.email);
      await updateDoc(userRef, { money: updatedMoney });

      setUserData({ ...userData, money: updatedMoney });

      setModalVisible(false);
      setAddedMoney('');
    } catch (error) {
      Alert.alert('Hata', 'Para ekleme sırasında bir hata oluştu.');
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const sliceName = (name) => {
    if (name && name.length > 8) {
      return `${name.substring(0, 8)}..`;
    }
    return name;
  };

  const renderCoinItem = ({ item }) => {
    const priceDifference = (item.current_price - item.price).toFixed(3);

    let textColor;
    if (priceDifference < 0) {
      textColor = '#ff0000';
    } else if (priceDifference > 0) {
      textColor = '#0fd900';
    } else {
      textColor = 'white';
    }

    return (
      <View style={styles.coinContainer}>
        <View style={styles.coinInfo}>
          <Text style={styles.coinText}>{sliceName(item.name)}</Text>
          <Text style={styles.coinText}>{item.piece}</Text>
          <Text style={styles.coinText}>${item.current_price}</Text>
          <Text style={[styles.coinText, { color: textColor }]}>${priceDifference}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buyButton]} onPress={() => handleBuyCoin(item.name, item.price, item.piece)}>
            <Text style={styles.buyButtonText}>AL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.sellButton]} onPress={() => handleSellCoin(item.name, item.price)}>
            <Text style={styles.sellButtonText}>SAT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}><Ionicons name="wallet-outline" style={{ fontSize: 30 }} /> ${(userData?.money || 0).toFixed(3)}</Text>
        <TouchableOpacity style={styles.addMoneyButton} onPress={toggleModal}>
          <Text style={styles.addMoneyButtonText}>Para Ekle</Text>
        </TouchableOpacity>

        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Para Ekle</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Eklemek istediğiniz miktarı girin"
              value={addedMoney}
              onChangeText={(text) => setAddedMoney(text)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddMoney}
              >
                <Text style={styles.buttonText}>Ekle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={toggleModal}
              >
                <Text style={styles.buttonTextCancel} onPress={() => {
                  toggleModal();
                  setAddedMoney('');
                }}>İptal</Text>

              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
      <Text style={styles.title}><Ionicons name="cash-outline" style={{ fontSize: 30 }} />  ${calculatePortfolioValue()}</Text>
      <FlatList
        data={userData && userData.coin ? userData.coin : []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCoinItem}
        ListHeaderComponent={() => (
          <View style={styles.container}>
            <Text style={styles.coinTitle}>Portföyüm</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.container}>
            {userData && userData.coin && userData.coin.length === 0 ? (
              <Text style={styles.coinTitle2}>Portföy Boş</Text>
            ) : (
              <Text style={styles.coinTitle2}>Yükleniyor...</Text>
            )}
          </View>
        )}
      />

      <Modal isVisible={buyModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Coin Al</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Almak istediğiniz miktarı girin"
            value={buyAmount}
            onChangeText={(text) => setBuyAmount(text)}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleConfirmBuy}
            >
              <Text style={styles.buttonText}>Al</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setBuyModalVisible(false);
                setBuyAmount('');
              }}
            >
              <Text style={styles.buttonTextCancel}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal isVisible={sellModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Coin Sat</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Satmak istediğiniz miktarı girin"
            value={sellAmount}
            onChangeText={(text) => setSellAmount(text)}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleConfirmSell}
            >
              <Text style={styles.buttonText}>Sat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSellModalVisible(false);
                setSellAmount('');
              }}
            >
              <Text style={styles.buttonTextCancel}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlert
        isVisible={isSellSuccessModalVisible}
        title="Başarılı"
        message="Coin satışı başarıyla gerçekleşti."
        onConfirm={() => {
          setSellSuccessModalVisible(false);
        }}
      />

      <CustomAlert
        isVisible={isBuySuccessModalVisible}
        title="Başarılı"
        message="Coin satın alma işlemi başarıyla gerçekleşti."
        onConfirm={() => {
          setBuySuccessModalVisible(false);
        }}
      />

      <CustomAlert
        isVisible={isBuyInsufficientModalVisible}
        title="Yetersiz Bakiye!"
        message="Yetersiz bakiye nedeniyle alım işlemi gerçekleştirilemedi."
        onConfirm={() => {
          setBuyInsufficientModalVisible(false);
        }}
      />

      <CustomAlert
        isVisible={isSellInsufficientModalVisible}
        title="Yetersiz Bakiye!"
        message="Yetersiz coin miktarı nedeniyle satış işlemi gerçekleştirilemedi."
        onConfirm={() => {
          setSellInsufficientModalVisible(false);
        }}
      />
    </View>
  );
};

export default WalletScreen;

const TITLE = {
  fontSize: 24,
  fontWeight: 'bold',
  color: 'white',
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    ...TITLE
  },
  coinTitle: {
    ...TITLE,
    textAlign: 'center'
  },
  coinTitle2: {
    ...TITLE,
    textAlign: 'center',
    color: '#fafaaa',
    marginTop: 120,
    fontSize: 20,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  coinText: {
    fontSize: 18,
    color: 'white',
    marginHorizontal: 10,
  },
  sellButton: {
    backgroundColor: 'green',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  sellButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  addMoneyButton: {
    backgroundColor: '#faf602',
    paddingVertical: 10,
    paddingHorizontal: 18,
    top: 20,
    right: 18,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  addMoneyButtonText: {
    color: '#14181b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  addButton: {
    backgroundColor: '#00bd0a',
    paddingTop: 10,
    paddingLeft: 40,
    paddingRight: 40,
    borderRadius: 8,
  },
  cancelButton: {
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  buttonTextCancel: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  coinContainer: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    paddingVertical: 10,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  sellButton: {
    backgroundColor: '#d90404',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 2,
    alignItems: 'center',
  },
  sellButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  buyButton: {
    backgroundColor: '#0fd900',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 2,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});