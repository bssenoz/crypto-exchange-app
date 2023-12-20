import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AdminScreen from '../screens/AdminScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import WalletScreen from '../screens/WalletScreen';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../navigation/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../firebase";

const Tab = createBottomTabNavigator();

const AppStackBottomTabs = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", user.email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const isAdminFromFirestore = docSnap.data().isAdmin;
          setIsAdmin(isAdminFromFirestore);
        } else {
          setIsAdmin(false);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <Tab.Navigator 
        initialRouteName="Home"
        screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: '#18c68b',
        tabBarInactiveTintColor: '#3d4542',
        tabBarStyle: {
            height: 60,
            backgroundColor: '#14181b',
            borderColor: '#364540',
            borderTopWidth: 0.5,
        } 
    }}>
        <Tab.Screen name={"Home"} component={HomeScreen} options={{
            tabBarIcon: ({focused, color}) => (<Ionicons name="ios-home" size={focused ? 30 : 25} color={color} />)
        }}/>
          {isAdmin && (
        <Tab.Screen name={"Admin"} component={AdminScreen} options={{
            tabBarIcon: ({ focused, color }) => (<Ionicons name="albums-outline" size={focused ? 30 : 25} color={color} />
            ),
          }}
        />
      )}
        <Tab.Screen name={"Search"} component={SearchScreen} options={{
            tabBarIcon: ({focused, color}) => (<FontAwesome name="search" size={focused ? 30 : 25} color={color} />)
        }}/>
        <Tab.Screen name={"Favourites"} component={FavouritesScreen} options={{
            tabBarIcon: ({focused, color}) => (<MaterialIcons name="favorite" size={focused ? 30 : 25} color={color} />)
        }}/>
          <Tab.Screen name={"Wallet"} component={WalletScreen} options={{
            tabBarIcon: ({focused, color}) => (<Ionicons name="wallet-outline" size={focused ? 30 : 25} color={color} />)
        }}/>
        <Tab.Screen name={"Profile"} component={ProfileScreen} options={{
            tabBarIcon: ({focused, color}) => (<FontAwesome name="user" size={focused ? 30 : 25} color={color} />)
        }}/>
    </Tab.Navigator>
  );
}

export default AppStackBottomTabs;
