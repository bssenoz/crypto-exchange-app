import React from 'react';
import { ActivityIndicator } from 'react-native';
import CoinDetailsScreen from '../screens/CoinDetailsScreen';
import { createStackNavigator } from '@react-navigation/stack';
import AppStackBottomTabs from './AppStackBottomTabs';
import FavouriteListProvider from '../Contexts/FavouriteListContext';
import { useFonts } from 'expo-font'
import {windowHeight, windowWidth} from '../utils/Dimensions'

const Stack = createStackNavigator();


const AppStack = () => {
  let [fontsLoaded] = useFonts({
    'JumperPERSONALUSEONLY-Bold': require('../assets/fonts/JumperPERSONALUSEONLY-Bold.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Thin': require('../assets/fonts/Roboto-Thin.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size={windowWidth/5} color="#faf602" style={{marginTop: windowHeight/2.5}}/>
  }

  return (
    <FavouriteListProvider>
      <Stack.Navigator
        initialRouteName='Root'
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={"Root"} component={AppStackBottomTabs} />
        <Stack.Screen name={"CoinDetailsScreen"} component={CoinDetailsScreen} />
      </Stack.Navigator>
    </FavouriteListProvider>
  )
}

export default AppStack
