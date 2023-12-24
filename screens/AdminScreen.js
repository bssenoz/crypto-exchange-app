import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import { db } from '../firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import CustomAlert from '../components/Alert';

const AdminScreen = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isDeleteSuccessModalVisible, setDeleteSuccessModalVisible] = useState(false);
  const [isDeleteErrorModalVisible, setDeleteErrorModalVisible] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), where('isAdmin', '==', false));
        const usersSnapshot = await getDocs(q);
        console.log("fetch:", usersSnapshot)

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
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
      setDeleteSuccessModalVisible(true);
    } catch (error) {
      setDeleteErrorModalVisible(true);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>User List:</Text>
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.userItem}>
              <Text style={styles.subtitle}>{index + 1}</Text>
              <Text style={styles.subtitle}>{item.id}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>

              <CustomAlert
                isVisible={isDeleteSuccessModalVisible}
                title="Başarılı"
                message="Kullanıcı başarıyla silindi."
                onConfirm={() => {
                  setDeleteSuccessModalVisible(false);
                }}
              />

              <CustomAlert
                isVisible={isDeleteErrorModalVisible}
                title="Hata"
                message="Kullanıcı silinirken bir hata oluştu."
                onConfirm={() => {
                  setDeleteErrorModalVisible(false);
                }}
              />
            </View>
          )}
        />
      ) : (
        <Text style={styles.notUser}>No registered users</Text>
      )}
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
    marginBottom: 10,
    color: "white"
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "white",
  },
  notUser: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "white",
    textAlign: "center",
    marginTop: 200
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});
