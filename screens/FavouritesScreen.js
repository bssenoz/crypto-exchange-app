import { StyleSheet, Text, View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import CoinItemFavourite from '../components/CoinItemFavourite';
import { useFavouriteList } from '../Contexts/FavouriteListContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDetailedCoinDataAPI } from "../services/api";
import { useFocusEffect } from '@react-navigation/native';

const FavouritesScreen = () => {
  const { favouriteCoinIds } = useFavouriteList();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isArrayEmpty, setIsArrayEmpty] = useState(false);
  const [coins, setCoins] = useState(null);

  const fetchFavouriteCoins = async () => {
    setLoading(true);
    setIsArrayEmpty(false);

    const coinDataArray = [];
    
    if (favouriteCoinIds.length === 0) {
      setIsArrayEmpty(true);
      setLoading(false);
    } else {
      try {
        for (let i = 0; i < favouriteCoinIds.length; i++) {
          const fetchedCoinsData = await getDetailedCoinDataAPI(favouriteCoinIds[i]);
          const result = await fetchedCoinsData.json();

          coinDataArray.push({
            coinPrice: result.data.market_data.price[0].price_latest.toFixed(3),
            coinName: result.data.name,
            coinSymbol: result.data.symbol,
            coinLogo: result.data.logo,
            coinID: result.data.id,
            price_change_24h: result.data.market_data.price[0].price_change_percentage_24h.toFixed(3)
          });
        }

        setCoins(coinDataArray);
      } catch (error) {
        setIsArrayEmpty(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefreshFav = async () => {
    setRefreshing(true);
    await fetchFavouriteCoins();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavouriteCoins();

      const intervalId = setInterval(() => {
        fetchFavouriteCoins();
      }, 30000);

      return () => {
        clearInterval(intervalId);
      };
    }, [favouriteCoinIds])
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <MaterialCommunityIcons name="playlist-star" size={25} color="#faf602" />
          <Text style={{ fontFamily: 'Roboto-Regular', color: '#faf602', fontSize: 25, letterSpacing: 1, paddingHorizontal: 20, paddingBottom: 10 }}>Favori Coinler</Text>
        </View>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#faf602" />
          <Text style={{ color: '#faf602', fontSize: 18, marginTop: 10 }}>Yükleniyor...</Text>
        </View>
      ) : (
        <>
          {isArrayEmpty ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fafaaa', fontSize: 18, fontWeight: 'bold' }}>Favori Coin Listeniz Boş</Text>
            </View>
          ) : (
            <FlatList
              data={coins}
              renderItem={({ item }) => <CoinItemFavourite coinDataArray={item} />}
              refreshControl={
                <RefreshControl refreshing={refreshing} tintColor="white" onRefresh={handleRefreshFav} />
              }
              keyExtractor={(item) => item.coinID.toString()}
            />
          )}
        </>
      )}
    </View>
  );
};

export default FavouritesScreen;

const styles = StyleSheet.create({});
