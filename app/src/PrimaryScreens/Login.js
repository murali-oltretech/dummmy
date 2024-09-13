import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Snackbar } from 'react-native-paper'; // Import Snackbar from react-native-paper
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../ConfigurationComponents/apiConfig'; // Adjust path as needed

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false); // State to control Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // State to control Snackbar message

  const passwordRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};

    if (email == ''){
      newErrors.email = 'Email is required';
    }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if(password== ''){
      newErrors.password = 'Password is required';
    }else  if (password.length < 8 || password.length > 15) {
      newErrors.password = 'Password must be between 8 and 15 characters';
    }

    

   

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      const userData = {
        email: email.toLowerCase(),
        password,
      };

      try {
        const response = await axios.post(`${API_URL}/api/login`, userData);

        // Show success message in Snackbar
        setSnackbarMessage('Logged in successfully');
        setSnackbarVisible(true);

        // Store email in AsyncStorage as token
        await AsyncStorage.setItem('userToken', email.toLowerCase());

        // Navigate to the Home screen after a short delay
        setTimeout(() => {
          setSnackbarVisible(false);
          navigation.navigate('Home');
        }, 1500); // Adjust the delay as needed
      } catch (error) {
        if (error.response) {
          // Check for specific error messages from the backend
          if (error.response.status === 401) {
            if (error.response.data === 'Email not registered') {
              setErrors({ apiError: 'Email not registered. Please try again.' });
            } else if (error.response.data === 'Invalid password') {
              setErrors({ apiError: 'Incorrect password. Please try again.' });
            } else {
              setErrors({ apiError: 'Login failed. Please try again.' });
            }
          } else {
            setErrors({ apiError: 'An unexpected error occurred. Please try again.' });
          }
        } else {
          setErrors({ apiError: 'Unable to connect to the server. Please check your network connection.' });
        }
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.header}>Login</Text>

        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current.focus()}
        />

        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          ref={passwordRef}
          returnKeyType="done"
        />

        {errors.apiError && <Text style={styles.errorText}>{errors.apiError}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.link}>Don't have an account?  <Text style={styles.registerLink}>Register</Text></Text>
        </TouchableOpacity>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500} // Duration the Snackbar is visible
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#43d7ec',
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 35,
    marginBottom: 30,
    textAlign: 'center',
    color: '#003366', // Dark Blue color
    fontWeight: 'bold',
    textShadowColor: '#A9A9A9', // Light gray shadow for a subtle effect
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5, // Softens the shadow edges
    fontFamily: 'Arial', // Change font family if needed
    letterSpacing: 1.5, // Adds space between letters
    transform: [{ rotate: '1deg' }], // Slightly rotate for a unique look
    // Apply a gradient background effect (requires react-native-linear-gradient)
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0077B6',
    padding: 15,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: 'black',
  },
  registerLink: {
    color: 'blue',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default Login;
























// import React, { useState, useRef } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// import axios from 'axios';
// import API_URL from '../ConfigurationComponents/apiConfig'; // Adjust path as needed

// const Login = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errors, setErrors] = useState({});

//   const passwordRef = useRef(null);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = 'Invalid email address.';
//     }

//     if (password.length < 8 || password.length > 15) {
//       newErrors.password = 'Password must be between 8 and 15 characters.';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleLogin = async () => {
//     if (validateForm()) {
//       const userData = {
//         email: email.toLowerCase(),
//         password,
//       };

//       try {
//         const response = await axios.post(`${API_URL}/api/login`, userData);
//         navigation.navigate('Home'); // Navigate to a home screen or another appropriate screen
//       } catch (error) {
//         setErrors({ apiError: 'Login failed. Please try again.' });
//       }
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.scrollViewContent}>
//       <View style={styles.container}>
//         <Text style={styles.header}>Login</Text>

//         {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           returnKeyType="next"
//           onSubmitEditing={() => passwordRef.current.focus()}
//         />

//         {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           ref={passwordRef}
//           returnKeyType="done"
//         />

//         {errors.apiError && <Text style={styles.errorText}>{errors.apiError}</Text>}

//         <TouchableOpacity style={styles.button} onPress={handleLogin}>
//           <Text style={styles.buttonText}>Login</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
//           <Text style={styles.link}>Don't have an account? <Text style={styles.registerLink}>Register</Text></Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   scrollViewContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingVertical: 20,
//   },
//   container: {
//     paddingHorizontal: 20,
//   },
//   header: {
//     fontSize: 35,
//     marginBottom: 30,
//     textAlign: 'center',
//     color: '#808080',
//     fontWeight: 'bold',
//   },
//   input: {
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 12,
//     marginBottom: 5,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     backgroundColor: '#B0E0E6',
//     shadowColor: 'black',
//     shadowOffset: { width: 2, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//     marginBottom: 15,
//   },
//   button: {
//     backgroundColor: '#00BFFF',
//     padding: 15,
//     borderRadius: 13,
//     alignItems: 'center',
//     marginTop: 20,
//     shadowColor: 'black',
//     shadowOffset: { width: 2, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   link: {
//     marginTop: 15,
//     textAlign: 'center',
//     color: '#A9A9A9',
//   },
//   registerLink: {
//     color: '#00BFFF',
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//   },
// });

// export default Login;









