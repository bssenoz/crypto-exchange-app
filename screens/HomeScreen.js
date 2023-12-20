import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text, 
    FlatList,
    RefreshControl
} from 'react-native';

import CoinItem from '../components/CoinItem';
import { FontAwesome5 } from '@expo/vector-icons';
import { fetchData } from "../api";


const HomeScreen = () => {
    const [coins, setCoins] = useState([]);

    const fetchCoins = async () => {
        
        try {
            const fetchedCoinsData = await fetchData();
            const result = await fetchedCoinsData.json();
            setCoins(result.data.items);
        } catch (error) {
            console.error("error fetchCoins:", error);
        }
    }
    
    const refetchCoins = async () => {
        try {
            const fetchedCoinsData = await fetchData();
            const result = await fetchedCoinsData.json();
            setCoins(result.data.items);
        } catch (error) {
            console.error("error refetchCoins:", error);
        } 
    }
    
    useEffect(() => {
        fetchCoins();
        
        const intervalId = setInterval(() => {
            fetchCoins();
        }, 130000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <View style={{ alignItems: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                <FontAwesome5 name="coins" size={25} color="#faf602" />            
                <Text style={{alignItems: 'center' ,fontFamily: 'Roboto-Regular', fontWeight: '500', color: '#faf602', fontSize: 25, letterSpacing: 1, paddingHorizontal: 20, paddingBottom: 10}}>Crypto Exchange
</Text>
            </View>
            <FlatList 
                data={coins} 
                renderItem={({item}) => <CoinItem marketCoin={item} />}
                onEndReached={() => fetchCoins()}
            />
        </View>
    )
}

export default HomeScreen;
