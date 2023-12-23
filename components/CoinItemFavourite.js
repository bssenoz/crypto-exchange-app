import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CoinItemFavourite = ({ coinDataArray }) => {

  const coinId = coinDataArray.coinID;
  const coinName = coinDataArray.coinName;
  const coinSymbol = coinDataArray.coinSymbol;
  const price = coinDataArray.coinPrice;
  const imageUri = coinDataArray.coinLogo;
  const priceChange24h = coinDataArray.price_change_24h;

  const navigation = useNavigation();


  const percentageColor = priceChange24h < 0 ? "#ff0000" : "#0fd900" || 'white';

  return (
    <Pressable style={styles.containerItem} onPress={() => navigation.navigate("CoinDetailsScreen", { coinId: coinId })}>

      <Image
        style={styles.image}
        source={{ uri: imageUri }}
      />
      <View>
        <Text style={styles.coinNameText}>{coinName} </Text>
        <Text style={styles.coinSymbolText}>{coinSymbol}</Text>
      </View>

      <View style={{ marginLeft: "auto", alignItems: "flex-end" }}>
        <Text style={styles.coinNameText}>${price}</Text>
        <View style={{ flexDirection: "row" }}>
          {<AntDesign
            name={priceChange24h < 0 ? "caretdown" : "caretup"}
            size={15}
            color={percentageColor}
            style={{ alignSelf: "center", marginRight: 5 }}
          />}
          {<Text style={{ color: percentageColor, fontSize: 15 }}>
            {(priceChange24h * 100).toFixed(2)}%
          </Text>}
        </View>
      </View>
    </Pressable>
  )
}

export default CoinItemFavourite

const styles = StyleSheet.create({
  containerItem: {
    flexDirection: "row",
    backgroundColor: '#2c353b',
    borderRadius: 15,
    padding: 11,
    marginHorizontal: 5,
    marginBottom: 8
  },
  image: {
    height: 40,
    width: 40,
    marginRight: 10,
    alignSelf: "center",
    borderRadius: 25

  },
  coinNameText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 3,
  },
  coinSymbolText: {
    color: '#6d897e',
    fontSize: 16,
    fontWeight: 'normal'
  },
  rankContainer: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#18c68b',
    paddingHorizontal: 5,
    borderRadius: 5,
    marginRight: 5,
    marginRight: 12
  },
  rank: {
    fontSize: 22,
    color: '#14181b'
  },
})