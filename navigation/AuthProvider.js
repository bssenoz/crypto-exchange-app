import { createContext, useState, useEffect, useRef } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged  } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

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
            coin: [
              { name: "TRX", piece: 3, price: 100 },
              { name: "BNB", piece: 4, price: 150 }
            ],
            money: adminMoney,
            isAdmin: true,
            favourites: []
          });
         }
      }
    } catch (error) {
      console.error('Add admin error:', error);
      Alert.alert('Error', `${error.message}`);
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
          console.log("userdoc: ", userDoc.data())
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserInfo(userData)
      
            console.log("user: ", userInfo)
          }
        } catch (error) {
          console.error('Fetch user data error:', error);
        }
      }
    };
  
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
            Alert.alert('Error', `${e}`);
          }
        },
        register: async (email, password, phone) => {
          try {
            console.log("phone: ", phone);
        
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
            if (userCredential.user) {
              await setDoc(doc(db, "users", email), {
                favourites: [],
                money: 0,
                coin: [{ name: "ONT", piece: "2", price: "200" }],
                isAdmin: false,
                phone: phone
              });
        
              console.log("User data saved successfully.");
              

            } else {
              console.error("User not created.");
            }
          } catch (e) {
            console.error(e);
            Alert.alert('Error', `${e}`);
          }
        },
        
        logout: async () => {
          try {
            await signOut(auth);
          } catch (e) {
            console.log(e);
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};