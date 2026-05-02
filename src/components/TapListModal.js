import React, { useState } from 'react'; // Don't forget to import useState
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TapListModal } from '../components/TapListModal';
import uncommonData from '../../data/uncommon-pair-menu.json';

const BreweryDetailScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Existing Taproom Hours and Info */}
      
      <TouchableOpacity 
        style={styles.yellowButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>📝 VIEW TAP LIST</Text>
      </TouchableOpacity>

      {/* The Modal "Overlay" */}
      <TapListModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        beers={uncommonData.beers} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  yellowButton: {
    backgroundColor: '#FFD700', // Matches the button in image_98405e.png
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
  }
});