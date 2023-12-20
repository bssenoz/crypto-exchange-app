import { StyleSheet, Text, View, Image} from 'react-native'
import React from 'react'

import { FONTS, COLOR, COLORS } from '../constants'

const TabIcon = ({focused, icon, iconStyle, label}) => {
  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <Image 
        source={icon}
        resizeMode="contain"
        style={{
          width: 25,
          height: 25,
          tintColor: focused ? COLORS.secondary : COLORS.white,
          ...iconStyle
        }}
      />
      <Text
      style={{
        color: focused ? COLORS.secondary : COLORS.white,
        marginTop: 5
      }}
      >
        {label}
      </Text>
    </View>
  )
}

export default TabIcon

const styles = StyleSheet.create({})