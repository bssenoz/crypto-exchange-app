import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { useNavigation } from '@react-navigation/native';
import { Foundation } from '@expo/vector-icons';
import { fetchData } from '../services/api';

const SearchScreen = () => {

    const [allCoins, setAllCoins] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const fetchAllCoins = async () => {
        if (loading) {
            return;
        }
        setLoading(true);
        const fetchedCoinsData = await fetchData();
        const result = await fetchedCoinsData.json();
        setAllCoins(result.data.items);

        setLoading(false);
    }

    useEffect(() => {
        fetchAllCoins();
    }, [])
    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Foundation name="page-search" size={25} color="#faf602" />
                <Text style={{ fontFamily: 'Roboto-Regular', color: '#faf602', fontSize: 30, letterSpacing: 1, paddingHorizontal: 10, paddingBottom: 10 }}>Coin Ara</Text>
            </View>
            <SearchableDropdown
                items={allCoins}
                onItemSelect={(item) => navigation.navigate("CoinDetailsScreen", { coinId: item.id })}
                containerStyle={styles.dropdownContainer}
                itemStyle={styles.item}
                itemTextStyle={{ color: '#caffea' }}
                resetValue={false}
                placeholder={"Coin Ara..."}
                placeholderTextColor="#caffea"
                textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: {
                        padding: 12,
                        borderWidth: 1.5,
                        borderColor: "#faf602",
                        borderRadius: 10,
                        backgroundColor: '#14181b',
                        color: '#caffea'
                    }
                }}
            />
        </View>
    )
}

export default SearchScreen;

const styles = StyleSheet.create({
    dropdownContainer: {
        width: "100%",
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    item: {
        padding: 10,
        marginTop: 2,
        backgroundColor: '#1e1e1e',
        borderWidth: 1,
        borderColor: '#364540',
        borderRadius: 5
    },
})