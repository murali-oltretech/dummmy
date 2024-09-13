import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [folders, setFolders] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSavedImages = async () => {
      try {
        const savedImages = JSON.parse(await AsyncStorage.getItem('savedImages')) || {};
        setFolders(Object.keys(savedImages));
      } catch (error) {
        console.error('Error loading saved images:', error);
      }
    };

    fetchSavedImages();
  }, []);

  const renderFolder = ({ item }) => (
    <TouchableOpacity
      style={styles.folderContainer}
      onPress={() => navigation.navigate('ImageGridScreen', { folderName: item })}
    >
      <View style={styles.folder}>
        <Text style={styles.folderName}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={folders}
        renderItem={renderFolder}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  grid: {
    alignItems: 'center',
  },
  folderContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1, // Keeps folders square
  },
  folder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

