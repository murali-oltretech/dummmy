import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for icons

import folderIcon from '../image/folderImage.png'; // Update the path to your folder icon

const ProjectScreen = ({ navigation }) => {
  const [folders, setFolders] = useState({});
  const [selectedFolders, setSelectedFolders] = useState([]);

  useEffect(() => {
    loadFolders();
    const willFocusSubscription = navigation.addListener('focus', loadFolders);
    return () => {
      willFocusSubscription.remove();
    };
  }, [navigation]);

  const loadFolders = async () => {
    try {
      const savedFolders = JSON.parse(await AsyncStorage.getItem('savedFolders')) || {};
      setFolders(savedFolders);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const getSortedFolderNames = () => {
    return Object.keys(folders).sort((a, b) => {
      const updatedTimeA = new Date(folders[a].updated_time);
      const updatedTimeB = new Date(folders[b].updated_time);
      return updatedTimeB - updatedTimeA; // Sort by updated_time descending
    });
  };

  const handleLongPress = (folderName) => {
    if (selectedFolders.includes(folderName)) {
      setSelectedFolders(selectedFolders.filter((name) => name !== folderName));
    } else {
      setSelectedFolders([...selectedFolders, folderName]);
    }
  };

  const handleDeleteSelectedFolders = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete the selected folders?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedFolders = { ...folders };
            selectedFolders.forEach((folder) => {
              delete updatedFolders[folder];
            });
            setFolders(updatedFolders);
            setSelectedFolders([]);
            await AsyncStorage.setItem('savedFolders', JSON.stringify(updatedFolders));
          },
        },
      ]
    );
  };

  const sortedFolderNames = getSortedFolderNames();

  const renderFolder = ({ item }) => {
    const folderImages = folders[item].images;
    const previewImage = folderImages && folderImages.length > 0 ? folderImages[0] : null;

    return (
      <TouchableOpacity
        style={styles.folder}
        onPress={() => {
          if (selectedFolders.length > 0) {
            handleLongPress(item);
          } else {
            navigation.navigate('ImageGrid', { folderName: item, images: folderImages });
          }
        }}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.imageContainer}>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
          ) : (
            <Text style={styles.debugText}>No Image</Text>
          )}
          <Image source={folderIcon} style={styles.folderIcon} />
          {selectedFolders.includes(item) && (
            <View style={styles.radioButton} /> // Radio button to show selection
          )}
        </View>
        <Text style={styles.folderText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* App Bar for Selected Folders */}
      {selectedFolders.length > 0 && (
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFolders([])}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.selectedText}>Selected: {selectedFolders.length}</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelectedFolders}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {sortedFolderNames.length === 0 ? (
        <Text style={styles.debugText}>No folders found</Text>
      ) : (
        <FlatList
          data={sortedFolderNames}
          renderItem={renderFolder}
          keyExtractor={(item) => item}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  folder: {
    flex: 1,
    margin: 5,
    backgroundColor: 'transparent',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 150,
    height: 180,
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '90%',
    height: '80%',
    position: 'absolute',
    zIndex: 1,
  },
  folderIcon: {
    width: '100%',
    height: '60%',
    position: 'absolute',
    top: '40%',
    zIndex: 2,
  },
  folderText: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  debugText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  appBar: {
    flexDirection: 'row',
    backgroundColor: 'dodgerblue',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    paddingHorizontal: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  selectedText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  deleteButton: {
    paddingHorizontal: 10,
  },
  radioButton: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'dodgerblue',
    backgroundColor: 'dodgerblue',
    top: 5,
    right: 5,
    zIndex: 3,
  },
});

export default ProjectScreen;

















// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Import your folder image
// import folderIcon from '../image/folderImage.png'; // Make sure to replace this path with the actual path to your folder icon

// const ProjectScreen = ({ navigation }) => {
//   const [folders, setFolders] = useState({});

//   // Use useEffect to load folders when the component mounts
//   useEffect(() => {
//     loadFolders();
//     const willFocusSubscription = navigation.addListener('focus', () => {
//       // Reload folders whenever the screen comes into focus
//       loadFolders();
//     });

//     return () => {
//       willFocusSubscription.remove();
//     };
//   }, [navigation]);

//     // Function to load folders from AsyncStorage
//     const loadFolders = async () => {
//       try {
//         const savedFolders = JSON.parse(await AsyncStorage.getItem('savedFolders')) || {};
//         console.log('Loaded folders:', savedFolders); // Debug: Log the loaded folders
//         setFolders(savedFolders);
//       } catch (error) {
//         console.error('Error loading folders:', error);
//       }
//     };
  


// const getSortedFolderNames = () => {
//   return Object.keys(folders).sort((a, b) => {
//     const updatedTimeA = new Date(folders[a].updated_time);
//     const updatedTimeB = new Date(folders[b].updated_time);
//     return updatedTimeB - updatedTimeA; // Sort by updated_time descending
//   });
// };

// const sortedFolderNames = getSortedFolderNames();
//   // Render each folder item
//   const renderFolder = ({ item }) => {
//     const folderImages = folders[item].images; // Access the images array for the folder
//     const previewImage = folderImages && folderImages.length > 0 ? folderImages[0] : null; // Corrected to access the URI directly
  
//     // Debug: Log the accessed preview image
//     console.log(`Rendering folder: ${item}, Preview Image URI: ${previewImage}`);
  
//     return (
//       <TouchableOpacity 
//         style={styles.folder}
//         onPress={() => navigation.navigate('ImageGrid', { folderName: item, images: folderImages})} // Navigate to ImageGridScreen with the folder name
//       >
//         <View style={styles.imageContainer}>
//           {previewImage ? (
//             <Image source={{ uri: previewImage }} style={styles.previewImage} />
//           ) : (
//             <Text style={styles.debugText}>No Image</Text> // Debug: Show text if no image is available
//           )}
//           <Image source={folderIcon} style={styles.folderIcon} />
//         </View>
//         <Text style={styles.folderText}>{item}</Text>
        

//       </TouchableOpacity>
//     );
//   };
  

//   // const folderNames = Object.keys(folders);

//   return (
//     <View style={styles.container}>
//       {sortedFolderNames.length === 0 ? ( // Debug: Show text if no folders are found
//         <Text style={styles.debugText}>No folders found</Text>
//       ) : (
//         <FlatList
//           data={sortedFolderNames}
//           renderItem={renderFolder}
//           keyExtractor={(item) => item}
//           numColumns={2}
//           columnWrapperStyle={styles.row}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
    
//   },
//   row: {
//     justifyContent: 'space-between',
//   },
//   folder: {
//     flex: 1,
//     margin: 5,
//     backgroundColor: 'transparent',
//     borderRadius: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   imageContainer: {
//     width: 150, // Set a fixed width
//     height: 180, // Set a fixed height
//     top:10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 5,
//     overflow: 'hidden',
//     position: 'relative',
   
//   },
//   previewImage: {
//     width: '90%',
//     height: '80%',
//     position: 'absolute',
//     zIndex: 1, // Lower zIndex to keep it behind the folder icon
//   },
//   folderIcon: {
//     width: '100%', // Adjust width for the folder icon
//     height: '60%',// Adjust height for the folder icon
//     position: 'absolute',
//     top: '40%',
//     zIndex: 2, // Higher zIndex to ensure it is on top
//   },
//   folderText: {
//     paddingTop: 10,
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   debugText: {
//     color: 'red',
//     textAlign: 'center',
//     marginTop: 10,
//   },
// });

// export default ProjectScreen;

