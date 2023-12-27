import { createContext, useState, useEffect, useRef } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Alert } from 'react-native';
import { getDetailedCoinDataAPI } from "../services/api";
import * as Notifications from "expo-notifications";
import CustomAlert from '../components/Alert';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoginError, setLoginError] = useState(null);
  const [isRegisterError, setRegisterError] = useState(null);

  onAuthStateChanged(auth, (user) => {
    setUser(user);
  });

  const addAdmin = async () => {
    try {
      const adminEmail = 'admin@gmail.com';

      const adminRef = doc(db, 'users', adminEmail);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        const adminPassword = 'admin123';
        const adminPhone = '';
        const adminMoney = 0;

        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        await signOut(auth);
        if (userCredential.user) {
          const userRef = doc(db, 'users', userCredential.user.email);
          await setDoc(userRef, {
            phone: adminPhone,
            coin: [],
            money: adminMoney,
            isAdmin: true,
            favourites: []
          });
        }
      }
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    setUser(user);
    addAdmin();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserInfo(userData)
          }
        } catch (error) {
          Alert.alert('Fetch user data error');
        }
      }
    };
    const sendNotification = (title, body, coinId) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: { coinId: coinId },
        },
        trigger: null,
      });
    };

    const fetchCoinPrice = async () => {
      const userRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userInfo = userDoc.data();
        setUserInfo(userInfo)
        if (userInfo.order.length > 0) {
          console.log("orrrr")
          for (var i = 0; i < userInfo.order.length; i++) {
            const response = await getDetailedCoinDataAPI(userInfo.order[i].name);
            const result = await response.json();
            const id = userInfo.order[i].id
            const name = userInfo.order[i].name;
            const price = result.data.market_data.price[0].price_latest.toFixed(2);
            const isIncrease = userInfo.order[i].isIncrease;
            const target = userInfo.order[i].target;

            let shouldSendNotification = false;
            let increase = false;

            if (isIncrease && price > target) {
              shouldSendNotification = true;
              increase = true;
            }

            if (!isIncrease && price < target) {
              shouldSendNotification = true;
            }

            if (shouldSendNotification) {
              const userRef = doc(db, 'users', user.email);
              const updatedOrder = userInfo.order.filter((item) => item.id !== id);

              await setDoc(userRef, { ...userInfo, order: updatedOrder });
              setUserInfo(userInfo)
              sendNotification(
                increase
                  ? `${name.toUpperCase()} Fiyatı Yükseldi!`
                  : `${name.toUpperCase()} Fiyatı Düştü!`,
                `Yeni Fiyatı: ${price}`,
                name
              );
            }
          }

        }
      }


    };

    const priceCheckInterval = setInterval(() => fetchCoinPrice(), 10000);

    return () => clearInterval(priceCheckInterval);

    fetchUserData();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: async (email, password) => {
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (e) {
            console.log(e);
            setLoginError(true);
          }
        },
        register: async (email, password, phone) => {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (userCredential.user) {
              await setDoc(doc(db, "users", email), {
                favourites: [],
                money: 0,
                coin: [],
                isAdmin: false,
                phone: phone,
                order: []
              });

            } else {
              Alert.alert("User not created.");
            }
          } catch (e) {
            setRegisterError(true)
          }
        },

        logout: async () => {
          try {
            await signOut(auth);
          } catch (e) {
            Alert.alert(e);
          }
        },
      }}
    >
      {children}
      <CustomAlert
        isVisible={isLoginError}
        title="Hatalı Giriş!"
        message="Kullanıcı adı ve mailinizi kontrol ediniz."
        onConfirm={() => {
          setLoginError(false);
        }}
      />

      <CustomAlert
        isVisible={isRegisterError}
        title="Hesap Oluşturulamadı!"
        message="Lütfen geçerli bir email yazınız."
        onConfirm={() => {
          setRegisterError(false);
        }}
      />
    </AuthContext.Provider>
  );
};