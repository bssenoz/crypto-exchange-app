import { Dimensions, StyleSheet, View, Text, TextInput, Image, ActivityIndicator, TouchableOpacity, TouchableHighlight } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import CoinDetailsHeader from '../components/CoinDetailsHeader';
import { LineChart } from 'react-native-wagmi-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { getDetailedCoinDataAPI, getCoin365DayPricesAPI, getCoin24HaurPricesAPI, getCoin60MinutePricesAPI } from "../services/api";
import { AuthContext } from "../navigation/AuthProvider";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CustomAlert from '../components/Alert';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';


const CoinDetailsScreen = () => {
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [selectedButton, setSelectedButton] = useState('Saatlik');
  const [coinPrice, setCoinPrice] = useState(null);
  const [coinName, setCoinName] = useState(null);
  const [coinSymbol, setCoinSymbol] = useState(null);
  const [coinLogo, setCoinLogo] = useState(null);
  const [coinID, setCoinID] = useState(null);
  const [coinRank, setCoinRank] = useState(null);
  const [coinValue, setCoinValue] = useState("1");
  const [usdValue, setUsdValue] = useState();

  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [coin, setCoin] = useState(null);

  const [coin365Days, setCoin365Days] = useState(null);
  const [coin24Hours, setCoin24Hours] = useState(null);
  const [coin60Minutes, setCoin60Minutes] = useState(null);

  const route = useRoute();
  const { params: { coinId } } = route;

  const [isSellSuccessModalVisible, setSellSuccessModalVisible] = useState(false);
  const [isBuySuccessModalVisible, setBuySuccessModalVisible] = useState(false);
  const [isBuyInsufficientModalVisible, setBuyInsufficientModalVisible] = useState(false);
  const [isSellInsufficientModalVisible, setSellInsufficientModalVisible] = useState(false);
  const [isNotFoundCoinModalVisible, setNotFoundCoinModalVisible] = useState(false);

  const fetchCoinData = async () => {
    const fetchedCoinDataAPI = await getDetailedCoinDataAPI(coinId);
    const result = await fetchedCoinDataAPI.json();

    //365 günlük veriler
    const fetched365DayPricesData = await getCoin365DayPricesAPI(coinId);
    const result365DayPrices = await fetched365DayPricesData.json();
    setCoin365Days(result365DayPrices.data.market_chart);

    //24 saatlik fiyatlar
    const fetched24HaurPricesData = await getCoin24HaurPricesAPI(coinId);
    const result24HaurPrices = await fetched24HaurPricesData.json();
    setCoin24Hours(result24HaurPrices.data.market_chart);

    //60 dakikalık fiyatlar
    const fetched60MinutePricesData = await getCoin60MinutePricesAPI(coinId);
    const result60MinutePrices = await fetched60MinutePricesData.json();
    setCoin60Minutes(result60MinutePrices.data.market_chart);

    const resultCoinPrice = result.data.market_data.price;
    const resultCoinName = result.data.name;
    const resultCoinSymbol = result.data.symbol;
    const resultCoinLogo = result.data.logo;
    const resultCoinID = result.data.id;
    const resultCoinRank = result.data.rank;

    setCoin(result);
    setCoinRank(resultCoinRank);
    setCoinID(resultCoinID);
    setCoinPrice(resultCoinPrice);
    setCoinName(resultCoinName);
    setCoinSymbol(resultCoinSymbol);
    setCoinLogo(resultCoinLogo);
    setUsdValue(resultCoinPrice[0].price_latest.toFixed(2).toString());
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchCoinData();
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", user.email);
          const docSnap = await getDoc(docRef);
          const userData = docSnap.data();
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      const intervalId = setInterval(() => {
        fetchCoinData();
      }, 20000);
      fetchUserData();
      return () => clearInterval(intervalId);

    }, [user])
  );

  const handleBuy = async () => {
    if (!coin) {
      Alert.alert("Coin bilgisi yüklenemedi")
      return;
    }

    const purchasedAmount = parseFloat(coinValue.replace(',', '.'));

    if (isNaN(purchasedAmount) || purchasedAmount <= 0) {
      Alert.alert('Geçersiz miktar');
      return;
    }

    const totalCost = parseFloat(purchasedAmount) * coinPrice[0].price_latest.toFixed(2);

    try {
      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);
      const userData = docSnap.data();

      if (!userData) {
        console.log('Kullanıcı verileri yüklenemedi');
        return;
      }

      if (parseFloat(userData.money) < totalCost) {
        setBuyInsufficientModalVisible(true);
        return;
      }

      const existingCoin = userData.coin.find((c) => c.id === coinId);

      if (existingCoin) {
        const updatedCoins = userData.coin.map((c) => {
          if (c.id === coinId) {
            return {
              ...c,
              piece: c.piece + purchasedAmount,
              price: coinPrice[0].price_latest.toFixed(2) * (c.piece + purchasedAmount),
              current_price: coinPrice[0].price_latest.toFixed(2) * (c.piece + purchasedAmount)
            };
          }
          return c;
        });

        const updatedUserData = {
          ...userData,
          coin: updatedCoins,
          money: parseFloat(userData.money) - parseFloat(totalCost)
        };

        setUserData(updatedUserData);

        const docRef = doc(db, "users", user.email);
        await updateDoc(docRef, { coin: updatedUserData.coin, money: updatedUserData.money });
        setBuySuccessModalVisible(true);
      } else {
        const newCoin = {
          id: coinId,
          name: coinName,
          piece: purchasedAmount,
          price: coinPrice[0].price_latest.toFixed(2) * purchasedAmount,
          current_price: coinPrice[0].price_latest.toFixed(2) * purchasedAmount
        };

        const updatedUserData = {
          ...userData,
          coin: [...userData.coin, newCoin],
          money: parseFloat(userData.money) - parseFloat(totalCost)
        };

        setUserData(updatedUserData);

        const docRef = doc(db, "users", user.email);
        await updateDoc(docRef, updatedUserData);
        setBuySuccessModalVisible(true);
      }
    } catch (error) {
      console.error('Kullanıcı verisi getirme hatası:', error);
    }
  };


  const handleSell = async () => {
    if (!coin) {
      Alert.alert('Coin bilgisi yüklenemedi');
      return;
    }

    const coinIndex = userData.coin.findIndex((c) => c.id === coinId);

    if (coinIndex !== -1) {
      const updatedCoins = [...userData.coin];
      const soldAmount = parseFloat(coinValue.replace(',', '.'));

      if (updatedCoins[coinIndex].piece >= soldAmount) {
        updatedCoins[coinIndex].piece -= soldAmount;

        if (updatedCoins[coinIndex].piece === 0) {
          updatedCoins.splice(coinIndex, 1);
        }

        setUserData((prevUserData) => ({
          ...prevUserData,
          coin: updatedCoins,
        }));

        const totalSaleValue = coinPrice[0].price_latest.toFixed(2) * soldAmount;
        const updatedMoney = parseFloat(userData.money) + totalSaleValue;

        try {
          const docRef = doc(db, "users", user.email);
          await updateDoc(docRef, { coin: updatedCoins, money: updatedMoney });
          setSellSuccessModalVisible(true);
        } catch (error) {
          console.error('Update user data error:', error);
        }
      } else {
        setSellInsufficientModalVisible(true);
      }
    } else {
      setNotFoundCoinModalVisible(true);
    }
  };

  if (!coinPrice || !coin365Days) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }} size="large"  color= "#faf602"/>
  }

  const data365Days = coin365Days.map((price) => ({ timestamp: price.timestamp, value: price.price }));
  data365Days.reverse();
  data365Days.pop();

  const data24Hours = coin24Hours.map((price) => ({ timestamp: price.timestamp, value: price.price }));
  data24Hours.reverse();
  data24Hours.pop();

  const data60Minutes = coin60Minutes.map((price) => ({ timestamp: price.timestamp, value: price.price }));
  data60Minutes.reverse();
  data60Minutes.pop();

  const percentageColor = coinPrice[0].price_change_percentage_24h < 0 ? "#d90404" : "#00bd0a" || 'white';
  const screenWidth = Dimensions.get("window").width;

  const changeCoinValue = (value) => {
    setCoinValue(value);
    const floatValue = parseFloat(value.replace(',', '.')) || 0
    setUsdValue((floatValue * coinPrice[0].price_latest.toFixed(2)).toFixed(2).toString())
  }

  const changeUsdValue = (value) => {
    setUsdValue(value)
    const floatValue = parseFloat(value.replace(',', '.')) || 0
    setCoinValue((floatValue / coinPrice[0].price_latest.toFixed(2)).toFixed(2).toString())
  }

  const handleSelectChartData = (selectedData, buttonName) => {
    setSelectedChartData(selectedData);
    setSelectedButton(buttonName);
  };


  return (
    <View>
      <LineChart.Provider data={selectedChartData || data60Minutes}>
        <CoinDetailsHeader image={coinLogo} name={coinName} marketCapRank={coinRank} coinId={coinID} />
        <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.text} >Güncel Fiyat</Text>
            <Text style={styles.currentPrice}>${coinPrice[0].price_latest.toFixed(2)}</Text>
          </View>
          <View style={{ backgroundColor: percentageColor, padding: 10, borderRadius: 10 }}>
            <Text style={styles.text}>{(coinPrice[0].price_change_percentage_24h * 100).toFixed(2)}%</Text>
          </View>
        </View>
        <View style={{ ...styles.buttonDateContainer }}>
          <TouchableHighlight
            style={{
              ...styles.buttonDate,
              backgroundColor: selectedButton === 'Saatlik' ? '#faf602' : '#fafaaa'
            }}
            activeOpacity={0.6}
            underlayColor="#faf602"
            onPress={() => handleSelectChartData(data60Minutes, 'Saatlik')}
          >
            <Text>Saatlik</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              ...styles.buttonDate,
              backgroundColor: selectedButton === 'Günlük' ? '#faf602' : '#fafaaa'
            }}
            activeOpacity={0.6}
            underlayColor="#faf602"
            onPress={() => handleSelectChartData(data24Hours, 'Günlük')}
          >
            <Text>Günlük</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              ...styles.buttonDate,
              backgroundColor: selectedButton === 'Yıllık' ? '#faf602' : '#fafaaa'
            }}
            activeOpacity={0.6}
            underlayColor="#faf602"
            onPress={() => handleSelectChartData(data365Days, 'Yıllık')}
          >
            <Text>Yıllık</Text>
          </TouchableHighlight>
        </View>

        <GestureHandlerRootView style={{ marginTop: 20 }}>
          <LineChart height={screenWidth / 2} width={screenWidth} >
            <LineChart.Path color={percentageColor}>
              <LineChart.Gradient />
            </LineChart.Path>
            <LineChart.CursorCrosshair color={percentageColor}>
              <LineChart.Tooltip>
                <LineChart.PriceText
                  precision={6}
                  style={{
                    backgroundColor: percentageColor,
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 12,
                    padding: 2,
                  }}
                />
              </LineChart.Tooltip>
              <LineChart.Tooltip position="bottom">
                <LineChart.DatetimeText
                  style={{
                    backgroundColor: percentageColor,
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 12,
                    padding: 2,
                  }}
                />
              </LineChart.Tooltip>
            </LineChart.CursorCrosshair>
          </LineChart>
        </GestureHandlerRootView>

        <View style={styles.converterContainer}>
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
            <Image source={{ uri: coinLogo }} style={{ width: 25, height: 25, marginEnd: 5, borderRadius: 20 }} />
            <Text style={{ color: 'white' }}>{coinSymbol}</Text>
            <TextInput
              style={styles.input}
              value={coinValue}
              keyboardType='numeric'
              onChangeText={changeCoinValue}
            />
          </View>
          <View>
            <MaterialIcons name="compare-arrows" size={25} color="white" style={{ marginEnd: 5 }} />
          </View>
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
            <FontAwesome name="usd" size={25} color="#18c68b" style={{ marginEnd: 5 }} />
            <Text style={{ color: 'white' }}>USD</Text>
            <TextInput
              style={styles.input}
              value={usdValue}
              keyboardType='numeric'
              onChangeText={changeUsdValue}
            />
          </View>
        </View>
      </LineChart.Provider>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{ ...styles.button, backgroundColor: '#00bd0a' }}
          onPress={handleBuy}
        >
          <Text style={styles.buttonText}>AL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ ...styles.button, backgroundColor: '#d90404' }}
          onPress={handleSell}
        >
          <Text style={styles.buttonText}>SAT</Text>
        </TouchableOpacity>


      </View>

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
        }} setNotFoundCoinModalVisible
      />

      <CustomAlert
        isVisible={isNotFoundCoinModalVisible}
        title="Coin yok!"
        message="Coin portföyünde bulunamadı."
        onConfirm={() => {
          setNotFoundCoinModalVisible(false);
        }}
      />
    </View>
  )
}

export default CoinDetailsScreen

const styles = StyleSheet.create({
  converterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#323b42',
    padding: 15,
    borderRadius: 10,
    marginTop: 40
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500'
  },
  currentPrice: {
    color: 'white',
    fontSize: 32,
    fontWeight: '500'
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    padding: 0,
    fontSize: 16,
    color: 'white'
  },
  graph: {
    backgroundColor: '#323b42',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonDate: {
    flex: 1,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 20,
  },
})