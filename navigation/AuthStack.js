import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import OnboardingScreen from '../screens/OnboardingScreen'
import LoginScreen from '../screens/LoginScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import SignupScreen from '../screens/SignupScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  let routeName;

  useEffect( () => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if(value == null) {
        AsyncStorage.setItem('alreadyLaunched','true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if(isFirstLaunch == null) {
    return null;
  } else if (isFirstLaunch == true) {
    routeName = 'Onboarding';
  } else {
    routeName = 'Login';
  }

  return(
    <Stack.Navigator initialRouteName={routeName}>
        <Stack.Screen
        name='Onboarding'
        component={OnboardingScreen}
        options={{header: () => null}}
        />
        <Stack.Screen
        name='Login'
        component={LoginScreen}
        options={{header: () => null}}
        />
        <Stack.Screen
        name='Signup'
        component={SignupScreen}
        options={({navigation}) => ({
          title: '',
          headerTintColor: '#18c68b',
          headerStyle: {
            backgroundColor: '#0b0d11',
            elevation: 0,
          }
        })}
        />
    </Stack.Navigator>
  )
}

export default AuthStack;