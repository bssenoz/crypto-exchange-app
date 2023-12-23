import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import CoinItem from '../components/CoinItem';
import { FontAwesome5 } from '@expo/vector-icons';
import { fetchData } from "../api";
import { useFocusEffect } from '@react-navigation/native';


const HomeScreen = () => {

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [coins, setCoins] = useState([]);

    const fetchCoins = async () => {

        if (loading) {
            return;
        }
        setLoading(true);

        const fetchedCoinsData = await fetchData();
        const result = await fetchedCoinsData.json();
        setCoins(result.data.items);

        setLoading(false);
    }

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchCoins();
        setRefreshing(false);
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchCoins();

            const intervalId = setInterval(() => {
                fetchCoins();
            }, 30000);

            return () => {
                clearInterval(intervalId);
            };
        }, [])
    );

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <FontAwesome5 name="coins" size={25} color="#faf602" />
                <Text style={{ alignItems: 'center', fontFamily: 'Roboto-Regular', fontWeight: '500', color: '#faf602', fontSize: 25, letterSpacing: 1, paddingHorizontal: 20, paddingBottom: 10 }}>Kripto Borsası</Text>
            </View>
            <FlatList
                data={coins}
                renderItem={({ item }) => <CoinItem marketCoin={item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        tintColor="white"
                        onRefresh={handleRefresh}
                    />
                }
                onEndReached={() => fetchCoins()}
            />
        </View>
    )
}

export default HomeScreen;
