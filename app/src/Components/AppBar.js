import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AppBar = ({ title, openDrawer }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#43d7ec', // Same color as the continue button
    height: 60,
    paddingHorizontal: 15,
  },
  menuButton: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 24,
    color: '#fff',
  },
  headerText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AppBar;

