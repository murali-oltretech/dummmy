
//code for flatlist and                        not working draggableflatlist but with index
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';


const ScanScreen = ({ navigation }) => {
  const bottomSheetRef = useRef(null);

  // Open bottom sheet when component mounts or when returning to this screen
  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      bottomSheetRef.current?.expand(); // Ensures the bottom sheet expands when the screen is focused
    });

    const blurListener = navigation.addListener('blur', () => {
      bottomSheetRef.current?.close(); // Closes the bottom sheet when navigating away
    });

    // Cleanup listeners on component unmount
    return () => {
      focusListener(); // Remove focus listener
      blurListener(); // Remove blur listener
    };
  }, [navigation]);

  //old
  const captureImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, });
      
      if (!result.canceled && result.assets.length > 0) {
        navigation.navigate('ImageGrid', { images: [result.assets[0].uri] });
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const selectImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        // allowsEditing: true,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        let selectedImages = result.assets.map(asset => asset.uri);
  
        // Check if selected images exceed the limit of 25
        if (selectedImages.length > 25) {
          Alert.alert(
            'Selection Limit Exceeded',
            'You can only select up to 25 images. The first 25 images will be used.',
          );
          // Slice the first 25 images
          selectedImages = selectedImages.slice(0, 25);
        }
  
        // Navigate with the first 25 images
        navigation.navigate('ImageGrid', { images: selectedImages });
      }
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[175]} // Snap point set to 175
        backgroundStyle={styles.bottomSheetBackground}
        enablePanDownToClose={false} // Disable user closing the sheet
        index={0} // Start with the BottomSheet expanded
      >
        <View style={styles.bottomSheetContent}>
          <TouchableOpacity style={styles.cameraButton} onPress={captureImage}>
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={selectImageFromGallery}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cameraButton: {
    width: '100%', // Full width of the screen
    backgroundColor: '#00BFFF', // Ice blue color
    borderRadius: 12, // 12px corner radius
    paddingVertical: 12, // Button height
    marginBottom: 12, // Space between buttons
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
  },
  buttonText: {
    color: '#FFFFFF', // Button text color
    fontSize: 16, // Font size
  },
  buttonSpacing: {
    height: 16, // Space between buttons
  },
});

export default ScanScreen;


































//code for draggableflatlist working but without index and what every dragged its going to first index
// import React, { useRef, useEffect } from 'react';
// import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
// import BottomSheet from '@gorhom/bottom-sheet';
// import * as ImagePicker from 'expo-image-picker';

// const ScanScreen = ({ navigation }) => {
//   const bottomSheetRef = useRef(null);

//   // Open bottom sheet when component mounts or when returning to this screen
//   useEffect(() => {
//     const focusListener = navigation.addListener('focus', () => {
//       bottomSheetRef.current?.expand(); // Ensures the bottom sheet expands when the screen is focused
//     });

//     const blurListener = navigation.addListener('blur', () => {
//       bottomSheetRef.current?.close(); // Closes the bottom sheet when navigating away
//     });

//     // Cleanup listeners on component unmount
//     return () => {
//       focusListener(); // Remove focus listener
//       blurListener(); // Remove blur listener
//     };
//   }, [navigation]);



//   const captureImage = async () => {
//     try {
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//       });
//       if (!result.canceled && result.assets.length > 0) {
//         // Add a key based on index (since only one image is captured, index is 0)
//         const imageWithKey = {
//           uri: result.assets[0].uri,
//           key: '0', // Using '0' as the key for the captured image
//         };
//         navigation.navigate('ImageGrid', { images: [imageWithKey] });
//       }
//     } catch (error) {
//       console.error('Error capturing image:', error);
//     }
//   };
  
  
//   const selectImageFromGallery = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsMultipleSelection: true,
//         // allowsEditing: true,
//       });
  
//       if (!result.canceled && result.assets.length > 0) {
//         // Map through the assets and add keys based on their index
//         let selectedImages = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           key: index.toString(), // Using the index as the key (0, 1, 2, etc.)
//         }));
  
//         // Check if selected images exceed the limit of 25
//         if (selectedImages.length > 25) {
//           Alert.alert(
//             'Selection Limit Exceeded',
//             'You can only select up to 25 images. The first 25 images will be used.'
//           );
//           // Slice the first 25 images
//           selectedImages = selectedImages.slice(0, 25);
//         }
  
//         // Navigate with the first 25 images
//         navigation.navigate('ImageGrid', { images: selectedImages });
//       }
//     } catch (error) {
//       console.error('Error selecting image from gallery:', error);
//     }
//   };
  

//   return (
//     <View style={styles.container}>
//       <BottomSheet
//         ref={bottomSheetRef}
//         snapPoints={[175]} // Snap point set to 175
//         backgroundStyle={styles.bottomSheetBackground}
//         enablePanDownToClose={false} // Disable user closing the sheet
//         index={0} // Start with the BottomSheet expanded
//       >
//         <View style={styles.bottomSheetContent}>
//           <TouchableOpacity style={styles.cameraButton} onPress={captureImage}>
//             <Text style={styles.buttonText}>Camera</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.cameraButton} onPress={selectImageFromGallery}>
//             <Text style={styles.buttonText}>Gallery</Text>
//           </TouchableOpacity>
//         </View>
//       </BottomSheet>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   bottomSheetBackground: {
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   bottomSheetContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   cameraButton: {
//     width: '100%', // Full width of the screen
//     backgroundColor: '#00BFFF', // Ice blue color
//     borderRadius: 12, // 12px corner radius
//     paddingVertical: 12, // Button height
//     marginBottom: 12, // Space between buttons
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000', // Shadow color
//     shadowOffset: { width: 0, height: 4 }, // Shadow offset
//     shadowOpacity: 0.3, // Shadow opacity
//     shadowRadius: 4, // Shadow blur radius
//   },
//   buttonText: {
//     color: '#FFFFFF', // Button text color
//     fontSize: 16, // Font size
//   },
//   buttonSpacing: {
//     height: 16, // Space between buttons
//   },
// });

// export default ScanScreen;





















