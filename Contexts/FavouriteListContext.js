import React, { useContext, createContext, useState, useEffect } from "react";
import { getDoc, doc, updateDoc, arrayUnion, arrayRemove, } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../navigation/AuthProvider";
import * as Notifications from "expo-notifications";

const FavouriteListContext = createContext();
export const useFavouriteList = () => useContext(FavouriteListContext);

const FavouriteListProvider = ({ children }) => {
  const [favouriteCoinIds, setFavouriteCoinIds] = useState([]);

  const { user } = useContext(AuthContext);
  const docRef = doc(db, "users", user.email);

  const getFavouriteListData = async () => {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

      const favouriteListIds = docSnap.data().favourites;
      setFavouriteCoinIds(favouriteListIds);
    } 
  };


  useEffect(() => {
    getFavouriteListData();
  }, []);


  const storeFavouriteCoinId = async (coinId, coinName) => {
    await updateDoc(docRef, {
      favourites: arrayUnion(coinId),
    });
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Favoriye Yeni Coin Eklendi!",
        body: coinName.toUpperCase() + " Favoriye Eklendi",
        data: { coinId },
      },
      trigger: null,
    });
    getFavouriteListData();
  };

  const removeFavouriteCoinId = async (coinId, coinName) => {
    await updateDoc(docRef, {
      favourites: arrayRemove(coinId),
    });
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Favori Coin Kaldırıldı!",
        body: coinName.toUpperCase() + " Kaldırıldı",
        data: { coinId },
      },
      trigger: null,
    });
    getFavouriteListData();
  };

  return (
    <FavouriteListContext.Provider
      value={{ favouriteCoinIds, storeFavouriteCoinId, removeFavouriteCoinId }}
    >
      {children}
    </FavouriteListContext.Provider>
  );
};

export default FavouriteListProvider;
