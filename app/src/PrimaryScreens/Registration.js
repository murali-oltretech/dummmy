import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import API_URL from '../ConfigurationComponents/apiConfig';

const Registration = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});

  const lastNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};

    if (firstName.trim() === '') {
      newErrors.firstName = 'First Name is required';
    }

    if (lastName.trim() === '') {
      newErrors.lastName = 'Last Name is required';
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address.';
    }

    if (password.length < 8 || password.length > 15) {
      newErrors.password = 'Password must be between 8 and 15 characters.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      const userData = {
        firstName,
        lastName,
        phoneNumber,
        email: email.toLowerCase(),
        password,
      };

      try {
        const response = await axios.post(`${API_URL}/api/register`, userData);
        navigation.navigate('Login');
      } catch (error) {
        setErrors({ apiError: 'Registration failed. Please try again.' });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.header}>Registration</Text>

        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current.focus()}
        />

        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          ref={lastNameRef}
          returnKeyType="next"
          onSubmitEditing={() => phoneNumberRef.current.focus()}
        />

        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          maxLength={10}
          ref={phoneNumberRef}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current.focus()}
        />

        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          ref={emailRef}
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
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current.focus()}
        />

        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          ref={confirmPasswordRef}
          returnKeyType="done"
        />

        {errors.apiError && <Text style={styles.errorText}>{errors.apiError}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account?  <Text style={styles.loginLink}>Login</Text></Text>
        </TouchableOpacity>
      </View>
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
  // header: {
  //   fontSize: 35,
  //   marginBottom: 30,
  //   textAlign: 'center',
  //   color: '#003366',
  //   fontWeight: 'bold',
  // },
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
    borderColor: '#ddd',//D3D3D3
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
  loginLink: {
    
    color: 'blue',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default Registration;




























// import React, { useState, useRef } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import axios from 'axios';
// import API_URL from '../ConfigurationComponents/apiConfig';

// const Registration = ({ navigation }) => {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [errors, setErrors] = useState({});

//   const lastNameRef = useRef(null);
//   const phoneNumberRef = useRef(null);
//   const emailRef = useRef(null);
//   const passwordRef = useRef(null);
//   const confirmPasswordRef = useRef(null);

//   const validateForm = () => {
//     const newErrors = {};

//     if (firstName.trim() === '') {
//       newErrors.firstName = 'First Name is required';
//     }

//     if (lastName.trim() === '') {
//       newErrors.lastName = 'Last Name is required';
//     }

//     if (!/^\d{10}$/.test(phoneNumber)) {
//       newErrors.phoneNumber = 'Phone number must be 10 digits.';
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = 'Invalid email address.';
//     }

//     if (password.length < 8 || password.length > 15) {
//       newErrors.password = 'Password must be between 8 and 15 characters.';
//     }

//     if (password !== confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match.';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleRegister = async () => {
//     if (validateForm()) {
//       const userData = {
//         firstName,
//         lastName,
//         phoneNumber,
//         email,
//         password,
//       };

//       try {
//         const response = await axios.post(`${API_URL}/register`, userData);
//         navigation.navigate('Login');
//       } catch (error) {
//         setErrors({ apiError: 'Registration failed. Please try again.' });
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Registration</Text>

//       {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
//       <TextInput
//         style={styles.input}
//         placeholder="First Name"
//         value={firstName}
//         onChangeText={setFirstName}
//         returnKeyType="next"
//         onSubmitEditing={() => lastNameRef.current.focus()}
//       />
      
//       {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
//       <TextInput
//         style={styles.input}
//         placeholder="Last Name"
//         value={lastName}
//         onChangeText={setLastName}
//         ref={lastNameRef}
//         returnKeyType="next"
//         onSubmitEditing={() => phoneNumberRef.current.focus()}
//       />
      
//       {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number"
//         value={phoneNumber}
//         onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
//         keyboardType="numeric"
//         maxLength={10}
//         ref={phoneNumberRef}
//         returnKeyType="next"
//         onSubmitEditing={() => emailRef.current.focus()}
//       />
     
//       {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         ref={emailRef}
//         returnKeyType="next"
//         onSubmitEditing={() => passwordRef.current.focus()}
//       />
      
//       {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         ref={passwordRef}
//         returnKeyType="next"
//         onSubmitEditing={() => confirmPasswordRef.current.focus()}
//       />
      
//       {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm Password"
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//         secureTextEntry
//         ref={confirmPasswordRef}
//         returnKeyType="done"
//       />
      
//       {errors.apiError && <Text style={styles.errorText}>{errors.apiError}</Text>}

//       <TouchableOpacity style={styles.button} onPress={handleRegister}>
//         <Text style={styles.buttonText}>Register</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//         <Text style={styles.link}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   header: {
//     fontSize: 35,
//     marginBottom: 30,
//     textAlign: 'center',
//     color: '#808080', //'#A9A9A9',
//     fontWeight: 'bold',
//   },
//   input: {
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 12,
//     marginBottom: 5,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     backgroundColor: '#B0E0E6', // Ice blue color                                          // very lite grey'#D3D3D3',                                 
//     shadowColor: 'black',
//     shadowOffset: { width: 2, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5, // For Android
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
//     elevation: 5, // For Android
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   link: {
//     marginTop: 15,
//     textAlign: 'center',
//     color: '#A9A9A9', // Ash color
//   },
//   loginLink: {
//     color: '#00BFFF', // Blue color
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//   },
// });

// export default Registration;
