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
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', // Slightly darker for better contrast
    justifyContent: 'center', 
    padding: 20 
  },
  content: { 
    backgroundColor: '#1A1A1A', // Dark Slate from your original screenshot
    borderRadius: 12, 
    padding: 20, 
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#A5ACAF' // Panthers Silver border
  },
  title: { 
    color: '#0085CA', // Panthers Blue
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center'
  },
  beerName: { 
    color: '#0085CA', // Panthers Blue for the primary info
    fontSize: 18, 
    fontWeight: '700' 
  },
  abv: { 
    color: '#A5ACAF', // Panthers Silver for secondary info
    fontSize: 14,
    fontWeight: '600'
  }
});