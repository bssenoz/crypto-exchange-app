import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import CoinItem from '../components/CoinItem';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { fetchData } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from "../navigation/AuthProvider";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AntDesign } from "@expo/vector-icons";

const HomeScreen = () => {
    const { user } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [coins, setCoins] = useState([]);
    const [order, setOrder] = useState([])
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

    const fetchUserData = async () => {
        try {
            const docRef = doc(db, "users", user.email);

            const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
                const updatedUserData = docSnapshot.data();
                setUserData(updatedUserData);
                setOrder(updatedUserData.order)
            });

            return () => unsubscribe();
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

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

    const truncateText = (text, maxLength = 9) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        } else {
            return text;
        }
    };

    const handleCancelAlarm = async (alarmId) => {
        try {
            const docRef = doc(db, "users", user.email);
            const updatedOrder = order.filter(item => item.id !== alarmId);

            await updateDoc(docRef, {
                order: updatedOrder,
            });

            toggleModal();
        } catch (error) {
            console.error("Error canceling alarm:", error);
        }
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

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
                <FontAwesome name="bell" style={{ left: 10 }} size={20} color="#faf602" onPress={toggleModal} />

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={toggleModal}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TouchableOpacity onPress={toggleModal} style={{ alignSelf: 'flex-start' }}>
                                <AntDesign name="close" size={30} style={{ marginTop: 10, marginLeft: 10 }} />
                            </TouchableOpacity>
                            <Text style={styles.textHeader}>ALARMLAR</Text>
                            {order.length > 0 ? (
                                <FlatList
                                    style={styles.alarmList}
                                    data={order}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.userItem}>
                                            <Text style={styles.text}>{index + 1}.</Text>
                                            <Text style={styles.text}>{truncateText(item.name).toUpperCase()}</Text>
                                            <Text style={styles.text}>{item.isIncrease ? 'Artış' : 'Azalış'}</Text>
                                            <Text style={styles.text}>{item.target}</Text>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={toggleModal}
                                            >
                                                <Text style={styles.buttonText} onPress={() => handleCancelAlarm(item.id)}>İptal</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            ) : (
                                <View style={styles.noAlarmContainer}>
                                    <Text style={styles.noAlarmText}>Alarm Yok</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>
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

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
        elevation: 5,
        alignSelf: 'center',
        minWidth: 300,
        maxHeight: '60%',
        maxWidth: '90%'
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '90%',
    },
    text: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        fontSize: 16,
        marginRight: 10,
    },
    textHeader: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        marginRight: 10,
        fontWeight: 'bold'
    },
    deleteButton: {
        backgroundColor: '#ff6262',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noAlarmContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    noAlarmText: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        fontSize: 16,
        marginTop: 20,
    },
    alarmList: {
        flex: 1,
        width: '100%',
        marginLeft: 30
    },
});