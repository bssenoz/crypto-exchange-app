import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import { db } from '../firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { FontAwesome5 } from "@expo/vector-icons";
import CustomAlert from '../components/Alert';

const AdminScreen = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isDelete, setDelete] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, 'users'), where('isAdmin', '==', false));
        const usersSnapshot = await getDocs(q);

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));

      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      setModalVisible(!isModalVisible);
      setDelete(true);
    } catch (error) {
      console.error('Kullanıcı silinirken bir hata oluştu:', error);
      Alert.alert('Hata', 'Kullanıcı silinirken bir hata oluştu.');
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 10, alignItems: 'center' }}>
        <FontAwesome5 name="user" size={40} color="#faf602" solid />
      </View>
      <Text style={styles.title}>Yönetici Kontrol Paneli</Text>
      <Text style={styles.subtitle}>Kullanıcı Listesi:</Text>


      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#faf602" />
          <Text style={{ color: '#faf602', fontSize: 18, marginTop: 10 }}>Yükleniyor...</Text>
        </View>
      ) : (
        <>

          {users.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.notUser}>Kayıtlı Kullanıcı Bulunamadı!</Text>

            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={styles.userItem} >
                  <Text style={styles.text}>{index + 1}.</Text>
                  <Text style={styles.text}>{item.id}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={toggleModal}
                  >
                    <Text style={styles.buttonText}>Sil</Text>
                  </TouchableOpacity>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={toggleModal}
                  >
                    <View style={styles.centeredView}>
                      <View style={styles.modalView}>
                        <Text style={styles.modalText}>Kullanıcının Silinmesini Onaylıyor Musunuz ?</Text>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item.id)}
                          >
                            <Text style={styles.buttonText}>Hesabı Sil</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cancelButton}
                          >
                            <Text style={styles.buttonText}>İptal</Text>
                          </TouchableOpacity>

                        </View>
                      </View>
                    </View>
                  </Modal>
                </View>
              )}
            />
          )}
        </>
      )
      }

      < CustomAlert
        isVisible={isDelete}
        title="Kullanıcı Silindi!"
        message="Kullanıcı Başarıyla Silindi."
        onConfirm={() => {
          setDelete(false);
        }}
      />
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: "#faf602",
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "white",
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "white",
  },
  notUser: {
    fontSize: 18,
    color: "#fafaaa",
    textAlign: "center",
    textAlignVertical: "center"
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'green',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 15
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#14181b",
    textAlign: "center"
  },
  buttonText: {
    color: 'white',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 25,
  },
});