import { StyleSheet, Text, View, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import CoinDetails from "../assets/crypto.json";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../navigation/AuthProvider";
import { useFavouriteList } from "../Contexts/FavouriteListContext";

const CoinDetailsHeader = (props) => {
  const { image, name, coinId, marketCapRank } = props;
  const navigation = useNavigation();

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
    padding:10
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
});
