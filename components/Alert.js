import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from 'react-native-modal';

const Alert = ({ isVisible = false, title, message, onConfirm }) => {
  return (
    <Modal isVisible={isVisible} style={styles.modal}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmButtonText}>Tamam</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#faf602',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  confirmButtonText: {
    color: '#14181b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default Alert;