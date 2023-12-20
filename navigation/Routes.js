import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { auth } from "../firebase";
import {AuthContext} from "./AuthProvider";
import { StyleSheet, View, StatusBar} from "react-native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { onAuthStateChanged } from "firebase/auth";


const Routes = () => {

  const {user, setUser} = useContext(AuthContext);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if(initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  if(initializing) return null;

  return (
    <NavigationContainer theme={{
      colors: {
        background: '#0b0d11'
      }
    }}>
      <View style={styles.container}>
        {user ? <AppStack/> : <AuthStack/> }
        <StatusBar barStyle={'light-content'} backgroundColor="#0b0d11"/>
      </View>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0d11',
    paddingTop: 8
  }
})

export default Routes