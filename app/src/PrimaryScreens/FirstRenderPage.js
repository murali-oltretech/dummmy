import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';

const FirstRenderPage = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleContinue = () => {
    if (selectedOption === 'paid') {
      navigation.navigate('Registration'); // Navigate to the Registration screen
    } else if (selectedOption === null) {
      Alert.alert("Error", "Please choose any service.");
    } else {
      navigation.navigate('NavScreen'); // Navigate to the new screen with icons
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <ImageBackground source={require('../image/FirstRenderBackgroud.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
      <View style={styles.secondaryContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.optionButton,
            selectedOption === 'free' && styles.selectedButton
          ]}
          onPress={() => handleOptionSelect('free')}
        >
          <Text style={styles.buttonText}>Continue as Free</Text>
          <View style={selectedOption === 'free' ? styles.radioSelected : styles.radioUnselected} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.optionButton,
            selectedOption === 'paid' && styles.selectedButton
          ]}
          onPress={() => handleOptionSelect('paid')}
        >
          <Text style={styles.buttonText}>$4 / year</Text>
          <View style={selectedOption === 'paid' ? styles.radioSelected : styles.radioUnselected} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.continueButton]} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account?  <Text style={styles.loginLink}>Login</Text></Text>
        </TouchableOpacity>
      </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  secondaryContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 380
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 13,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // For Android
  },
  optionButton: {
    backgroundColor: 'white', // Ice blue color
  },
  continueButton: {
    backgroundColor: '#0077B6', // Thick sky blue color
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  continueButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    width: '100%',
  },
  radioUnselected: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: 'transparent',
  },
  radioSelected: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: '#0077B6',
  },
  selectedButton: {
    backgroundColor: 'white', // Slightly different color to indicate selection
  },
  link: {
    marginTop: 10,
    textAlign: 'center',
    color: 'black',
  },
  loginLink: {
   
    color: 'blue',
  },
});

export default FirstRenderPage;

