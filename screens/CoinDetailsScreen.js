import { Dimensions, StyleSheet, View, Text, TextInput, Image, ActivityIndicator} from 'react-native'
import React, { useState, useEffect } from 'react'
import CoinDetailsHeader from '../components/CoinDetailsHeader';
import { LineChart } from 'react-native-wagmi-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { getDetailedCoinDataAPI, getCoin365DayPricesAPI, getCoin24HaurPricesAPI, getCoin60MinutePricesAPI } from "../api";
//import { getCoinMarketChart } from '../services/requests';


const CoinDetailsScreen = () => {
    const [coinPrice, setCoinPrice] = useState(null);
    const [coinName, setCoinName] = useState(null);
    const [coinSymbol, setCoinSymbol] = useState(null);
    const [coinLogo, setCoinLogo] = useState(null);
    const [coinID, setCoinID] = useState(null);
    const [coinRank, setCoinRank] = useState(null);
    const [coinValue, setCoinValue] = useState("1");
    const [usdValue, setUsdValue] = useState();

    
    
    const [coin365Days, setCoin365Days] = useState(null);
    const [coin24Hours, setCoin24Hours] = useState(null);
    const [coin60Minutes, setCoin60Minutes] = useState(null);


    const route = useRoute();
    const {params: {coinId}} = route;
    
    

    const fetchCoinData = async() => {
      
      
      const fetchedCoinDataAPI = await getDetailedCoinDataAPI(coinId);
      const result = await fetchedCoinDataAPI.json();

      //365 günlük veriler
      const fetched365DayPricesData = await getCoin365DayPricesAPI(coinId);
      const result365DayPrices = await fetched365DayPricesData.json();
      setCoin365Days(result365DayPrices.data.market_chart);

      //24 saatlik fiyatlar
      const fetched24HaurPricesData = await getCoin24HaurPricesAPI(coinId);
      const result24HaurPrices = await fetched24HaurPricesData.json();
      setCoin24Hours(result24HaurPrices.data.market_chart);


      //60 dakikalık fiyatlar
      const fetched60MinutePricesData = await getCoin60MinutePricesAPI(coinId);
      const result60MinutePrices = await fetched60MinutePricesData.json();
      setCoin60Minutes(result60MinutePrices.data.market_chart);


      const resultCoinPrice = result.data.market_data.price;
      const resultCoinName = result.data.name;
      const resultCoinSymbol = result.data.symbol;
      const resultCoinLogo = result.data.logo;
      const resultCoinID = result.data.id;
      const resultCoinRank = result.data.rank;

      setCoinRank(resultCoinRank);
      setCoinID(resultCoinID);
      setCoinPrice(resultCoinPrice);
      setCoinName(resultCoinName);
      setCoinSymbol(resultCoinSymbol);
      setCoinLogo(resultCoinLogo);
      setUsdValue(resultCoinPrice[0].price_latest.toFixed(2).toString());

      
      
      

      
    }

    useEffect(() => {
      fetchCoinData();
      const intervalId = setInterval(() => {
        fetchCoinData();
    }, 20000);

    return () => clearInterval(intervalId);
    }, [])

    if(!coinPrice || !coin365Days) {
       return <ActivityIndicator style={{flex:1, justifyContent:'center', alignContent:'center'}} size="large" />
     }

     
     const data365Days = coin365Days.map( (price) => ({ timestamp: price.timestamp, value: price.price }));
     data365Days.reverse();
     data365Days.pop();
    
     const data24Haurs = coin24Hours.map( (price) => ({ timestamp: price.timestamp, value: price.price }));
     data24Haurs.reverse();
     data24Haurs.pop();
     
     const data60Minutes = coin60Minutes.map((price) => ({ timestamp: price.timestamp, value: price.price }));
     data60Minutes.reverse();
     data60Minutes.pop();
    
     

     const percentageColor = coinPrice[0].price_change_percentage_24h < 0 ? "#d90404" : "#00bd0a" || 'white';
     const screenWidth = Dimensions.get("window").width;

     

     const changeCoinValue = (value) => {
       setCoinValue(value);
       const floatValue = parseFloat(value.replace(',','.')) || 0
       setUsdValue((floatValue * coinPrice[0].price_latest.toFixed(2)).toString())
     }

     const changeUsdValue = (value) => {
       setUsdValue(value)
       const floatValue = parseFloat(value.replace(',','.')) || 0
       setCoinValue((floatValue / coinPrice[0].price_latest.toFixed(2)).toString())
     }

   return (
     <View>
       <LineChart.Provider data={data365Days}>
           <CoinDetailsHeader image={coinLogo} name={coinName} marketCapRank={coinRank} coinId={coinID}/> 
           <View style={{padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
             <View>
               <Text style={styles.text} >Güncel Fiyat</Text>
               <Text style={styles.currentPrice}>${coinPrice[0].price_latest.toFixed(2)}</Text>
             </View>
             <View style={{backgroundColor: percentageColor, padding: 10, borderRadius: 10}}>
               <Text style={styles.text}>{(coinPrice[0].price_change_percentage_24h*100).toFixed(2)}%</Text>
             </View>
           </View>
           
           <GestureHandlerRootView style={{marginTop: 20}}>
             <LineChart height={screenWidth/2} width={screenWidth} >
               <LineChart.Path color={percentageColor}>
                 <LineChart.Gradient />
               </LineChart.Path>
               <LineChart.CursorCrosshair color={percentageColor}>
                 <LineChart.Tooltip>
                   <LineChart.PriceText 
                     precision={6}
                     style={{
                       backgroundColor: percentageColor,
                       borderRadius: 4,
                       color: 'white',
                       fontSize: 12,
                       padding: 2,
                       }}
                   />
                 </LineChart.Tooltip>
                 <LineChart.Tooltip position="bottom">
                   <LineChart.DatetimeText 
                     style={{
                       backgroundColor: percentageColor,
                       borderRadius: 4,
                       color: 'white',
                       fontSize: 12,
                       padding: 2,
                       }}
                   />
                 </LineChart.Tooltip>
               </LineChart.CursorCrosshair>
             </LineChart>
           </GestureHandlerRootView>
          
           <View style={styles.converterContainer}>
             <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
               <Image source={{uri: coinLogo}} style={{width:25, height: 25, marginEnd: 5}}/>
               <Text style={{color:'white'}}>{coinSymbol}</Text>
               <TextInput 
                 style={styles.input} 
                 value={coinValue}
                 keyboardType='numeric'
                 onChangeText={changeCoinValue}
               />
             </View>
             <View>
               <MaterialIcons name="compare-arrows" size={25} color="white" style={{marginEnd: 5}}/>
             </View>
             <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
               <FontAwesome name="usd" size={25} color="#18c68b" style={{marginEnd: 5}}/>
               <Text style={{color:'white'}}>USD</Text>
               <TextInput 
                 style={styles.input} 
                 value={usdValue}
                 keyboardType='numeric'
                 onChangeText={changeUsdValue}
               />
             </View>
           </View>
       </LineChart.Provider>
     </View>
   )
}

export default CoinDetailsScreen

const styles = StyleSheet.create({
  converterContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#323b42',
    padding: 15,
    borderRadius: 10,
    marginTop:20
  },
  text: {
    color: 'white', 
    fontSize: 18,
    fontWeight: '500'
  },
  currentPrice: {
    color: 'white', 
    fontSize: 32, 
    fontWeight: '500'
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    padding: 0,
    fontSize: 16,
    color: 'white'
  },
  graph:{
    backgroundColor: '#323b42',
  }
})