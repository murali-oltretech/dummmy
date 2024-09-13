
//code with bad working draggableflatlist and with index
import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert, BackHandler } from 'react-native';
import * as Print from 'expo-print';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import DraggableFlatList from 'react-native-draggable-flatlist';


const ImageGridScreen = ({ route }) => { 
  const [images, setImages] = useState(route.params.images || []);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [fileName, setFileName] = useState(route.params?.folderName ||`File_${Math.floor(Math.random() * 1000)}`);
  const [fileType, setFileType] = useState(images.length > 1 ? 'pdf' : 'pdf'); // Default to 'pdf'
  const [selectedImages, setSelectedImages] = useState([]);
  const [compression, setCompression] = useState('Original'); 
  const [imagesWithIndex, setImagesWithIndex] = useState([]);
  const navigation = useNavigation();
  const MAX_IMAGES = 25;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => backHandler.remove();
  }, [handleBackButton]);

  useEffect(() => {
    setImagesWithIndex(images.map((uri, index) => ({ uri, index })));
  }, [images]);

  // Debugging: Check if images state is correct before saving
  useEffect(() => {
    console.log('Current images state:', images);
  }, [images]);

  // Modify the share and download button handlers
const handleShare = () => handleFileAction('share');
const handleDownload = () => handleFileAction('download');
// Function to get the current date and time
const getCurrentDateTime = () => new Date().toISOString();

// Function to handle image addition logic
const handleAddImages = async (source) => {
  const currentImageCount = images.length; // Get the current number of images
  const remainingImageCount = MAX_IMAGES - currentImageCount; // Calculate remaining slots

  if (remainingImageCount <= 0) { // If no space left for more images
    Alert.alert(`You already have ${MAX_IMAGES} images. Cannot add more.`); // Show alert
    return; // Stop further processing
  }

  // Call addImageFromCamera or addImageFromGallery based on the source parameter
  if (source === 'camera') {
    await addImageFromCamera(remainingImageCount); // Pass remaining slots to the function
  } else if (source === 'gallery') {
    await addImageFromGallery(remainingImageCount); // Pass remaining slots to the function
  }
};

   // Function to add images from the camera
   const addImageFromCamera = async (remainingCount) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = [...images, result.assets[0].uri]; // Add captured image
      if (newImages.length > MAX_IMAGES) { // Check if the new total exceeds the limit
        Alert.alert(`Limit exceeded. Only ${remainingCount} more images can be added.`);
        newImages.splice(MAX_IMAGES); // Trim the array to fit the limit
      }
      setImages(newImages); // Update state with the new list of images
      if (newImages.length > 1) {
        setFileType('pdf'); // Change file type to 'pdf' if more than one image
      }
    }
  };


   // Function to add images from the gallery
   const addImageFromGallery = async (remainingCount) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      // allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      // Limit selected images to remaining slots
      const selectedImages = result.assets.slice(0, remainingCount).map((asset) => asset.uri);
      const newImages = [...images, ...selectedImages]; // Add selected images

      if (result.assets.length > remainingCount) { // If more images were selected than allowed
        Alert.alert(`Limit exceeded. Only ${remainingCount} more images can be added.`);
      }

      setImages(newImages); // Update state with the new list of images
      if (newImages.length > 1) {
        setFileType('pdf'); // Change file type to 'pdf' if more than one image
      }
    }
  };

  
  const convertToBase64 = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileBase64 = await FileSystem.readAsStringAsync(fileInfo.uri, { encoding: FileSystem.EncodingType.Base64 });
      return `data:image/jpeg;base64,${fileBase64}`;
    } catch (error) {
      console.error('Error converting to base64:', error);
      return '';
    }
  };

  // Convert static image to base64
const convertStaticImageToBase64 = async (imagePath) => {
  try {
    const asset = Asset.fromModule(imagePath);
    await asset.downloadAsync(); // Ensure the asset is downloaded
    const localUri = asset.localUri || asset.uri; // Get the local URI
    
    const response = await fetch(localUri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Return base64 string without data URL prefix
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting static image to Base64:', error);
    throw error;
  }
};

  // Save image file to the file system
  const saveImageToFile = async (uri, fileType, fileName) => {
    const fileExtension = fileType === 'jpg' ? '.jpg' : '.png';
    const fileUri = FileSystem.documentDirectory + fileName + fileExtension;
    await FileSystem.copyAsync({ from: uri, to: fileUri });
    return fileUri;
  };

  const handleFileAction = async (action) => {
    try {
      console.log("muraliiiiiiiiiiiiiiiiii testingggggggggggggggg"+images)
      let fileUri;
      if (fileType === 'pdf') {
        const pdfPageHeight = 841.89; // PDF height in pixels
        const pdfPageWidth = 595.28;  // PDF width in pixels

      const watermarkImagePath = require('../../image/oltree.png');
      const base64Logo = await convertStaticImageToBase64(watermarkImagePath);

      // Define watermark HTML
      // const watermark = `
      //   <div style="position: absolute; bottom: 15px; right: 25px; opacity:2; display: flex; align-items: center;">
      //     <img src="data:image/png;base64,${base64Logo}" alt="logo" style="height: 30px; margin-right: 5px;"/>
      //     <span style="font-size: 17px; color: black;">camscan</span>
      //   </div>`;

        // Define the centered diagonal text watermark HTML
      const diagonalTextWatermark = `
      <div style="
        position: absolute; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%) rotate(-30deg); 
        font-size: 115px; 
        color: #B0B0B0; 
        opacity: 0.3; 
        white-space: nowrap;">
        Camscan
      </div>`;
  
        const imageHtmlPromises = images.map(async (uri) => {
          console.log("Processing URI:", uri);
  
          if (!uri) {
            throw new Error('Image URI is null or undefined');
          }
  
          let width, height;
          try {
            const { width: imgWidth, height: imgHeight } = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.PNG });
            width = imgWidth;
            height = imgHeight;
          } catch (error) {
            console.error('Error getting image size:', error);
            throw new Error('Failed to get image size.');
          }
  
          // Calculate scaled dimensions
          let scaledWidth = width;
          let scaledHeight = height;
          const aspectRatio = width / height;
  
          if (width > pdfPageWidth) {
            scaledWidth = pdfPageWidth * 0.95; 
            scaledHeight = scaledWidth / aspectRatio;
          }
  
          const base64Image = await convertToBase64(uri);
          // Ensure watermark is included within each image wrapper
          return `
            <div style="page-break-before: always; position: relative; text-align: center; height: 100%; width: 100%;">
              <img src="${base64Image}" 
                   style="width: ${scaledWidth}px; height: ${scaledHeight}px; max-width: 100%; max-height: 100%; display: block; margin: 0 auto;"/>
             
               ${diagonalTextWatermark} <!-- Include diagonal text watermark here -->
            </div>`;
        });
      //  <!-- ${watermark} Include watermark here to ensure it appears on every page -->
        const htmlContent = (await Promise.all(imageHtmlPromises)).join('');
        const { uri: pdfUri } = await Print.printToFileAsync({
          html: `<html><body style="margin: 0; padding: 0;">${htmlContent}</body></html>`,
          width: pdfPageWidth,
          height: pdfPageHeight,
        });
  
        const newFileUri = FileSystem.documentDirectory + `${fileName}.pdf`;
        await FileSystem.moveAsync({
          from: pdfUri,
          to: newFileUri,
        });
  
        fileUri = newFileUri;
      } else {
        // Handle JPG and PNG
        const imageUris = await Promise.all(images.map(uri => saveImageToFile(uri, fileType, fileName)));
        fileUri = imageUris[0]; // Assuming the first image is sufficient for the action
      }
  
      // Handle sharing or downloading
      if (action === 'share') {
        await Sharing.shareAsync(fileUri, {
          mimeType: fileType === 'pdf' ? 'application/pdf' : (fileType === 'jpg' ? 'image/jpeg' : 'image/png'),
          dialogTitle: `Share ${fileType.toUpperCase()} File`,
          UTI: fileType === 'pdf' ? 'com.adobe.pdf' : (fileType === 'jpg' ? 'public.jpeg' : 'public.png'),
        });
      } else if (action === 'download') {
        if (fileType === 'pdf') {
          const documentDirectory = FileSystem.documentDirectory + 'Documents/';
          const documentUri = documentDirectory + fileName + '.pdf';
  
          await FileSystem.makeDirectoryAsync(documentDirectory, { intermediates: true });
          await FileSystem.moveAsync({
            from: fileUri,
            to: documentUri,
          });
  
          Alert.alert('File Saved', `PDF file has been saved to ${documentUri}`);
        } else {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Permission to access gallery is required!');
            return;
          }
  
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync('Camscan Images', asset, false);
  
          Alert.alert('File Saved', 'Image has been saved to your gallery!');
        }
      }
    } catch (error) {
      console.error('Error in handleFileAction:', error);
      Alert.alert('Error', 'There was an error processing the file. Please try again.');
    }
  };

  // Handle image selection
  const handleSelectImage = (uri) => {
    setSelectedImages((prevSelectedImages) =>
      prevSelectedImages.includes(uri)
        ? prevSelectedImages.filter((image) => image !== uri)
        : [...prevSelectedImages, uri]
    );
  };

  // Delete selected images
  const handleDeleteSelectedImages = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete the selected images?',
      [
        {
          text: 'Cancel',
          onPress: () => setSelectedImages([]),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setImages((prevImages) => prevImages.filter((image) => !selectedImages.includes(image)));
            setSelectedImages([]);
            console.log("imagessssssssssssssssssssssssssssssssssssssss"+images)
          },
        },
      ]
    );
  };


    
  const saveDocument = async () => {
    try {
      
      console.log(images)
      // Load existing folders from AsyncStorage
      const savedFolders = JSON.parse(await AsyncStorage.getItem('savedFolders')) || {};
      // console.log('Loaded Saved Folders:', savedFolders);
  
      // Determine the current folder name using the latest state of fileName
      const currentFolder = fileName || 'defaultFolder'; // Fallback to 'defaultFolder' if fileName is not set
      console.log('Current Folder Name:', currentFolder);
  
      // Check if the folder already exists
      if (savedFolders[currentFolder]) {
        console.log(`Folder "${currentFolder}" exists. Checking images...`);
  
        // Folder exists, prompt user for confirmation to replace
        Alert.alert(
          'Folder Exists',
          `The folder name "${currentFolder}" already exists. Do you want to replace it?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Replace',
              onPress: async () => {
                const existingFolder = savedFolders[currentFolder];
                
                // Ensure existingFolder.images is an array
                const existingImages = existingFolder.images || [];
                console.log('Existing Images:', existingImages);
  
                // Merge new images with existing ones
                const updatedImages = [...existingImages];
  
                console.log("save document starteddddddddddddddddddddddd")
                console.log(images)

                images.forEach((newImage) => {
                  // Check if the new image is already in the existing folder by comparing names
                  const imageExists = existingImages.some(existingImage => existingImage.name === newImage.name);
                  console.log("existingggggggggggggggggg images"+imageExists)
                  if (imageExists) {
                    console.log(`Image "${newImage.name}" already exists in the folder.`);
                  } else {
                    console.log(`Adding new image "${newImage.name}" to the folder.`);
                    console.log("newImage"+newImage)
                    updatedImages.push(newImage);
                  }
                });
  
                console.log('Updated Images After Merge:', updatedImages);
  
                // Update the folder with new images and times
                savedFolders[currentFolder] = {
                  ...existingFolder,
                  images: updatedImages,
                  updated_time: getCurrentDateTime(),
                };
  
                // Save the updated folders structure
                await AsyncStorage.setItem('savedFolders', JSON.stringify(savedFolders));
                console.log('Saved Folders After Update:', savedFolders);
  
                // Navigate to ProjectScreen after saving
                navigation.navigate('Project');
              },
            },
          ]
        );
      } else {
        console.log(`Folder "${currentFolder}" does not exist. Creating a new one.`);
  
        // Folder does not exist, create a new one
        console.log(images)
        savedFolders[currentFolder] = {
          
          images,
          created_time: getCurrentDateTime(),
          updated_time: getCurrentDateTime(),
        };
  
        console.log('New Folder Structure:', savedFolders[currentFolder]);
  
        // Save the updated folders structure
        await AsyncStorage.setItem('savedFolders', JSON.stringify(savedFolders));
        console.log('Saved Folders After Creation:', savedFolders);
  
        // Navigate to ProjectScreen after saving
        navigation.navigate('Project');
      }
    } catch (error) {
      console.error('Error saving images:', error);
    }
  };

  
  const handleBackButton = useCallback(async () => {
    if (images.length === 0) {
      navigation.navigate('Project');
    } else {
      await saveDocument(); // Call saveDocument method using updated images
    }
    return true; // Prevent default back action
  }, [images, fileName, navigation]);
  
 const renderImage = ({ item, drag, isActive }) => {
  console.log('Rendering item:', item.uri, 'at index:', item.index); // Debugging line to show item and index

  return (
    <TouchableOpacity
      style={[
        styles.imageContainer,
        selectedImages.includes(item.uri) ? styles.imageSelected : {},
        isActive && { opacity: 0.8 }, // Highlight the item being dragged
      ]}
      onPress={() => handleSelectImage(item.uri)}
      onLongPress={drag} // Initiates drag on long press
    >
      <Image source={{ uri: item.uri.toString() }} style={styles.image} />
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>{item.index !== undefined ? item.index + 1 : 'N/A'}</Text> 
        <TouchableOpacity
          style={[styles.radioButton, selectedImages.includes(item.uri) && styles.radioButtonSelected]}
          onPress={() => handleSelectImage(item.uri)}
        />
      </View>
    </TouchableOpacity>
  );
};


   // Function to handle drag end and update images order
   const handleDragEnd = ({ data }) => {

    try {
      // Update the state with the new order and reassign indexes
      const updatedImages = data.map((item, index) => ({ ...item, index }));
      setImages(updatedImages);
      
    } catch (error) {
      Alert.alert('Error', 'An error occurred while dragging the item.');
      console.error('Drag end error:', error);
    }
  };

  // Add index to each image item
  // const imagesWithIndex = images.map((uri, index) => ({ uri, index }));

  return (
    <View style={styles.container}>

<DraggableFlatList
        data={imagesWithIndex}
        renderItem={renderImage}
        keyExtractor={(item) => item.uri} // Ensure unique key for each item
        onDragEnd={handleDragEnd}
        numColumns={2} // Maintain grid layout
        contentContainerStyle={styles.listContent}
      />

{/* <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
      /> */}

      {/* Download Button */}
      <TouchableOpacity style={styles.downloadButton} 
        onPress={() => {
            if (images.length === 0) {
              Alert.alert('No Images', 'Please add at least one image before Export');
              return;
            }
            if (images.length === 1) {
              setFileType('jpg'); // Set default file type to 'jpg' if only one image is present
            } else {
              setFileType('pdf'); // Set default file type to 'pdf' if more than one image is present
            }
            setBottomSheetVisible(true);
          }}>

        <View style={styles.exportContent}>
        <Ionicons name="download-outline" size={24} color="white" />
        <Text style={styles.exportText}>Export</Text>
        </View>
      </TouchableOpacity>

      {/* Add Image Buttons */}
      <View style={styles.addButtonsContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => handleAddImages('camera')}>
          <Ionicons name="camera-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => handleAddImages('gallery')}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* App Bar for Selected Items */}
      {selectedImages.length > 0 && (
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImages([])}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.selectedText}>
            Selected: {selectedImages.length}
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelectedImages}>
            <Ionicons name="trash-outline" size={24} color="green" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <Modal
        isVisible={isBottomSheetVisible}
        onBackdropPress={() => setBottomSheetVisible(false)}
        style={styles.modal}
      >
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetTitle}>Save File</Text>
          <TextInput
            style={styles.input}
            value={fileName}
            onChangeText={setFileName}
          />
          <View style={styles.dropdown}>
            <Text style={styles.label}>File Type:</Text>

            <Picker
        selectedValue={fileType}
        enabled={images.length <= 1} // Disable picker if more than 1 image
        onValueChange={(itemValue) => {
          if (images.length <= 1) {
            setFileType(itemValue);
          }
        }}
      >
        <Picker.Item label="JPG" value="jpg" />
        <Picker.Item label="PNG" value="png" />
        <Picker.Item label="PDF" value="pdf" />
      </Picker>
           
          </View>
          <View style={styles.dropdown}>
          <Text style={styles.label}>File Compression:</Text>
          <Picker
            selectedValue={compression}
            onValueChange={(itemValue) => setCompression(itemValue)}
          >
            <Picker.Item label="Original" value="Original" />
            <Picker.Item label="5MB" value="5MB" />
            <Picker.Item label="10MB" value="10MB" />
            <Picker.Item label="15MB" value="15MB" />
            <Picker.Item label="20MB" value="20MB" />
            <Picker.Item label="25MB" value="25MB" />
          </Picker>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton}  onPress={handleDownload}>
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  listContent: {
    paddingBottom: 16,
  },
  imageContainer: {
    width: '45%',
    height: 300,
    margin: 5,
    borderRadius: 10,
    borderColor: '#E0F7FA',
    borderWidth: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  indexContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E0F7FA',
    padding: 5,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indexText: {
    color: '#00796B',
    fontWeight: 'bold',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00796B',
    backgroundColor: 'transparent',
  },
  radioButtonSelected: {
    backgroundColor: '#00796B',
  },
  imageSelected: {
    borderColor: '#00796B',
  },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#E0F7FA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#00796B',
  },
  closeButton: {
    backgroundColor: 'transparent',
  },
  closeButtonText: {
    color: '#00796B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#00796B',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    
  },
  shareButton: {
    backgroundColor: '#0077B6',
    padding: 10,
    borderRadius: 13,
    alignItems: 'center',
    marginBottom: 10,
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
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomSheetContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    marginHorizontal: 0,
    position: 'relative',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  dropdown: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  downloadButton: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    backgroundColor: '#0077B6',
    padding: 10,
    borderRadius: 5,
  },
  addButtonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#0077B6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  exportContent: {
    flexDirection: 'row', // Aligns children in a row
    alignItems: 'center', // Centers the content vertically
  },
exportText: {
    color: 'white', // Text color
    marginLeft: 8, // Space between the icon and text
    fontSize: 16, // Adjust the font size as needed
    
}
});

export default ImageGridScreen;



































//code with good working draggableflatlist and without index
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Image, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert, BackHandler } from 'react-native';
// import * as Print from 'expo-print';
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import * as FileSystem from 'expo-file-system';
// import * as ImagePicker from 'expo-image-picker';
// import * as Sharing from 'expo-sharing';
// import Modal from 'react-native-modal';
// import { Picker } from '@react-native-picker/picker';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import * as MediaLibrary from 'expo-media-library';
// import * as ImageManipulator from 'expo-image-manipulator';
// import { Asset } from 'expo-asset';
// import DraggableFlatList from 'react-native-draggable-flatlist';


// const ImageGridScreen = ({ route }) => {
  
//   const [images, setImages] = useState(route.params.images || []);
//   const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
//   const [fileName, setFileName] = useState(route.params?.folderName ||`File_${Math.floor(Math.random() * 1000)}`);
//   const [fileType, setFileType] = useState(images.length > 1 ? 'pdf' : 'pdf'); // Default to 'pdf'
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [compression, setCompression] = useState('Original'); 
//   const navigation = useNavigation();
//   const MAX_IMAGES = 25;

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
//     return () => backHandler.remove();
//   }, [handleBackButton]);

//   // Modify the share and download button handlers
// const handleShare = () => handleFileAction('share');
// const handleDownload = () => handleFileAction('download');
// // Function to get the current date and time
// const getCurrentDateTime = () => new Date().toISOString();

// // Function to handle image addition logic
// const handleAddImages = async (source) => {
//   const currentImageCount = images.length; // Get the current number of images
//   const remainingImageCount = MAX_IMAGES - currentImageCount; // Calculate remaining slots

//   if (remainingImageCount <= 0) { // If no space left for more images
//     Alert.alert(`You already have ${MAX_IMAGES} images. Cannot add more.`); // Show alert
//     return; // Stop further processing
//   }

//   // Call addImageFromCamera or addImageFromGallery based on the source parameter
//   if (source === 'camera') {
//     await addImageFromCamera(remainingImageCount); // Pass remaining slots to the function
//   } else if (source === 'gallery') {
//     await addImageFromGallery(remainingImageCount); // Pass remaining slots to the function
//   }
// };

//    // Function to add images from the camera
//    const addImageFromCamera = async (remainingCount) => {
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//     });

//     if (!result.canceled && result.assets.length > 0) {
//       const newImages = [...images, result.assets[0].uri]; // Add captured image
//       if (newImages.length > MAX_IMAGES) { // Check if the new total exceeds the limit
//         Alert.alert(`Limit exceeded. Only ${remainingCount} more images can be added.`);
//         newImages.splice(MAX_IMAGES); // Trim the array to fit the limit
//       }
//       setImages(newImages); // Update state with the new list of images
//       if (newImages.length > 1) {
//         setFileType('pdf'); // Change file type to 'pdf' if more than one image
//       }
//     }
//   };

//    // Function to add images from the gallery
//    const addImageFromGallery = async (remainingCount) => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       // allowsEditing: true,
//     });

//     if (!result.canceled && result.assets.length > 0) {
//       // Limit selected images to remaining slots
//       const selectedImages = result.assets.slice(0, remainingCount).map((asset) => asset.uri);
//       const newImages = [...images, ...selectedImages]; // Add selected images

//       if (result.assets.length > remainingCount) { // If more images were selected than allowed
//         Alert.alert(`Limit exceeded. Only ${remainingCount} more images can be added.`);
//       }

//       setImages(newImages); // Update state with the new list of images
//       if (newImages.length > 1) {
//         setFileType('pdf'); // Change file type to 'pdf' if more than one image
//       }
//     }
//   };

  
//   const convertToBase64 = async (uri) => {
//     try {
//       const fileInfo = await FileSystem.getInfoAsync(uri);
//       const fileBase64 = await FileSystem.readAsStringAsync(fileInfo.uri, { encoding: FileSystem.EncodingType.Base64 });
//       return `data:image/jpeg;base64,${fileBase64}`;
//     } catch (error) {
//       console.error('Error converting to base64:', error);
//       return '';
//     }
//   };

//   // Convert static image to base64
// const convertStaticImageToBase64 = async (imagePath) => {
//   try {
//     const asset = Asset.fromModule(imagePath);
//     await asset.downloadAsync(); // Ensure the asset is downloaded
//     const localUri = asset.localUri || asset.uri; // Get the local URI
    
//     const response = await fetch(localUri);
//     const blob = await response.blob();

//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result.split(',')[1]); // Return base64 string without data URL prefix
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   } catch (error) {
//     console.error('Error converting static image to Base64:', error);
//     throw error;
//   }
// };

//   // Save image file to the file system
//   const saveImageToFile = async (uri, fileType, fileName) => {
//     const fileExtension = fileType === 'jpg' ? '.jpg' : '.png';
//     const fileUri = FileSystem.documentDirectory + fileName + fileExtension;
//     await FileSystem.copyAsync({ from: uri, to: fileUri });
//     return fileUri;
//   };

//   const handleFileAction = async (action) => {
//     try {
//       let fileUri;
//       if (fileType === 'pdf') {
//         const pdfPageHeight = 841.89; // PDF height in pixels
//         const pdfPageWidth = 595.28;  // PDF width in pixels

//       const watermarkImagePath = require('../../image/oltree.png');
//       const base64Logo = await convertStaticImageToBase64(watermarkImagePath);

//       // Define watermark HTML
//       const watermark = `
//         <div style="position: absolute; bottom: 15px; right: 25px; opacity:2; display: flex; align-items: center;">
//           <img src="data:image/png;base64,${base64Logo}" alt="logo" style="height: 30px; margin-right: 5px;"/>
//           <span style="font-size: 17px; color: black;">camscan</span>
//         </div>`;
  
//         const imageHtmlPromises = images.map(async (uri) => {
//           console.log("Processing URI:", uri);
  
//           if (!uri) {
//             throw new Error('Image URI is null or undefined');
//           }
  
//           let width, height;
//           try {
//             const { width: imgWidth, height: imgHeight } = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.PNG });
//             width = imgWidth;
//             height = imgHeight;
//           } catch (error) {
//             console.error('Error getting image size:', error);
//             throw new Error('Failed to get image size.');
//           }
  
//           // Calculate scaled dimensions
//           let scaledWidth = width;
//           let scaledHeight = height;
//           const aspectRatio = width / height;
  
//           if (width > pdfPageWidth) {
//             scaledWidth = pdfPageWidth * 0.95; 
//             scaledHeight = scaledWidth / aspectRatio;
//           }
  
//           const base64Image = await convertToBase64(uri);
//           // Ensure watermark is included within each image wrapper
//           return `
//             <div style="page-break-before: always; position: relative; text-align: center; height: 100%; width: 100%;">
//               <img src="${base64Image}" 
//                    style="width: ${scaledWidth}px; height: ${scaledHeight}px; max-width: 100%; max-height: 100%; display: block; margin: 0 auto;"/>
//               ${watermark} <!-- Include watermark here to ensure it appears on every page -->
//             </div>`;
//         });
  
//         const htmlContent = (await Promise.all(imageHtmlPromises)).join('');
//         const { uri: pdfUri } = await Print.printToFileAsync({
//           html: `<html><body style="margin: 0; padding: 0;">${htmlContent}</body></html>`,
//           width: pdfPageWidth,
//           height: pdfPageHeight,
//         });
  
//         const newFileUri = FileSystem.documentDirectory + `${fileName}.pdf`;
//         await FileSystem.moveAsync({
//           from: pdfUri,
//           to: newFileUri,
//         });
  
//         fileUri = newFileUri;
//       } else {
//         // Handle JPG and PNG
//         const imageUris = await Promise.all(images.map(uri => saveImageToFile(uri, fileType, fileName)));
//         fileUri = imageUris[0]; // Assuming the first image is sufficient for the action
//       }
  
//       // Handle sharing or downloading
//       if (action === 'share') {
//         await Sharing.shareAsync(fileUri, {
//           mimeType: fileType === 'pdf' ? 'application/pdf' : (fileType === 'jpg' ? 'image/jpeg' : 'image/png'),
//           dialogTitle: `Share ${fileType.toUpperCase()} File`,
//           UTI: fileType === 'pdf' ? 'com.adobe.pdf' : (fileType === 'jpg' ? 'public.jpeg' : 'public.png'),
//         });
//       } else if (action === 'download') {
//         if (fileType === 'pdf') {
//           const documentDirectory = FileSystem.documentDirectory + 'Documents/';
//           const documentUri = documentDirectory + fileName + '.pdf';
  
//           await FileSystem.makeDirectoryAsync(documentDirectory, { intermediates: true });
//           await FileSystem.moveAsync({
//             from: fileUri,
//             to: documentUri,
//           });
  
//           Alert.alert('File Saved', `PDF file has been saved to ${documentUri}`);
//         } else {
//           const { status } = await MediaLibrary.requestPermissionsAsync();
//           if (status !== 'granted') {
//             Alert.alert('Permission Required', 'Permission to access gallery is required!');
//             return;
//           }
  
//           const asset = await MediaLibrary.createAssetAsync(fileUri);
//           await MediaLibrary.createAlbumAsync('Camscan Images', asset, false);
  
//           Alert.alert('File Saved', 'Image has been saved to your gallery!');
//         }
//       }
//     } catch (error) {
//       console.error('Error in handleFileAction:', error);
//       Alert.alert('Error', 'There was an error processing the file. Please try again.');
//     }
//   };

//   // Handle image selection
//   const handleSelectImage = (uri) => {
//     setSelectedImages((prevSelectedImages) =>
//       prevSelectedImages.includes(uri)
//         ? prevSelectedImages.filter((image) => image !== uri)
//         : [...prevSelectedImages, uri]
//     );
//   };

//   // Delete selected images
//   const handleDeleteSelectedImages = () => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete the selected images?',
//       [
//         {
//           text: 'Cancel',
//           onPress: () => setSelectedImages([]),
//           style: 'cancel',
//         },
//         {
//           text: 'Yes',
//           onPress: () => {
//             setImages((prevImages) => prevImages.filter((image) => !selectedImages.includes(image)));
//             setSelectedImages([]);
//           },
//         },
//       ]
//     );
//   };


//   const renderImage = ({ item, index, drag }) => (
//     <TouchableOpacity
//       style={styles.imageContainer}
//       onLongPress={drag} // Initiates drag when long-pressed
//     >
     
//       <Text style={styles.imageIndex}>{index + 1}</Text>
      
//       <Image
//         source={{ uri: item.uri }}
//         style={styles.image}
//       />
       
//     </TouchableOpacity>
//   );

//   const saveDocument = async () => {
//     try {
//       // Load existing folders from AsyncStorage
//       const savedFolders = JSON.parse(await AsyncStorage.getItem('savedFolders')) || {};
//       // console.log('Loaded Saved Folders:', savedFolders);
  
//       // Determine the current folder name using the latest state of fileName
//       const currentFolder = fileName || 'defaultFolder'; // Fallback to 'defaultFolder' if fileName is not set
//       console.log('Current Folder Name:', currentFolder);
  
//       // Check if the folder already exists
//       if (savedFolders[currentFolder]) {
//         console.log(`Folder "${currentFolder}" exists. Checking images...`);
  
//         // Folder exists, prompt user for confirmation to replace
//         Alert.alert(
//           'Folder Exists',
//           `The folder name "${currentFolder}" already exists. Do you want to replace it?`,
//           [
//             {
//               text: 'Cancel',
//               style: 'cancel',
//             },
//             {
//               text: 'Replace',
//               onPress: async () => {
//                 const existingFolder = savedFolders[currentFolder];
                
//                 // Ensure existingFolder.images is an array
//                 const existingImages = existingFolder.images || [];
//                 console.log('Existing Images:', existingImages);
  
//                 // Merge new images with existing ones
//                 const updatedImages = [...existingImages];
  
//                 images.forEach((newImage) => {
//                   // Check if the new image is already in the existing folder by comparing names
//                   const imageExists = existingImages.some(existingImage => existingImage.name === newImage.name);
  
//                   if (imageExists) {
//                     console.log(`Image "${newImage.name}" already exists in the folder.`);
//                   } else {
//                     console.log(`Adding new image "${newImage.name}" to the folder.`);
//                     updatedImages.push(newImage);
//                   }
//                 });
  
//                 console.log('Updated Images After Merge:', updatedImages);
  
//                 // Update the folder with new images and times
//                 savedFolders[currentFolder] = {
//                   ...existingFolder,
//                   images: updatedImages,
//                   updated_time: getCurrentDateTime(),
//                 };
  
//                 // Save the updated folders structure
//                 await AsyncStorage.setItem('savedFolders', JSON.stringify(savedFolders));
//                 console.log('Saved Folders After Update:', savedFolders);
  
//                 // Navigate to ProjectScreen after saving
//                 navigation.navigate('Project');
//               },
//             },
//           ]
//         );
//       } else {
//         console.log(`Folder "${currentFolder}" does not exist. Creating a new one.`);
  
//         // Folder does not exist, create a new one
//         console.log(images)
//         savedFolders[currentFolder] = {
          
//           images,
//           created_time: getCurrentDateTime(),
//           updated_time: getCurrentDateTime(),
//         };
  
//         console.log('New Folder Structure:', savedFolders[currentFolder]);
  
//         // Save the updated folders structure
//         await AsyncStorage.setItem('savedFolders', JSON.stringify(savedFolders));
//         console.log('Saved Folders After Creation:', savedFolders);
  
//         // Navigate to ProjectScreen after saving
//         navigation.navigate('Project');
//       }
//     } catch (error) {
//       console.error('Error saving images:', error);
//     }
//   };
  
  

//   // handleBackButton method that uses saveDocument
//   const handleBackButton = useCallback(async () => {
//     if (images.length === 0) {
//       navigation.navigate('Project');
//     } else {
//       await saveDocument(); // Call saveDocument method
//     }
//     return true; // Prevent default back action
//   }, [images, fileName, navigation]);

//   return (
//     <View style={styles.container}>
//       <DraggableFlatList
//         data={images}
//         renderItem={renderImage}
//         keyExtractor={(item) => item.key}
//         numColumns={2}
//         onDragEnd={({ data }) => setImages(data)} // Update state with new order
//       />

//       {/* Download Button */}
//       <TouchableOpacity style={styles.downloadButton} 
//         onPress={() => {
//             if (images.length === 0) {
//               Alert.alert('No Images', 'Please add at least one image before Export');
//               return;
//             }
//             if (images.length === 1) {
//               setFileType('jpg'); // Set default file type to 'jpg' if only one image is present
//             } else {
//               setFileType('pdf'); // Set default file type to 'pdf' if more than one image is present
//             }
//             setBottomSheetVisible(true);
//           }}>

//         <View style={styles.exportContent}>
//         <Ionicons name="download-outline" size={24} color="white" />
//         <Text style={styles.exportText}>Export</Text>
//         </View>
//       </TouchableOpacity>

//       {/* Add Image Buttons */}
//       <View style={styles.addButtonsContainer}>
//         <TouchableOpacity style={styles.addButton} onPress={() => handleAddImages('camera')}>
//           <Ionicons name="camera-outline" size={24} color="white" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.addButton} onPress={() => handleAddImages('gallery')}>
//           <Ionicons name="add-circle-outline" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {/* App Bar for Selected Items */}
//       {selectedImages.length > 0 && (
//         <View style={styles.appBar}>
//           <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImages([])}>
//             <Text style={styles.closeButtonText}>X</Text>
//           </TouchableOpacity>
//           <Text style={styles.selectedText}>
//             Selected: {selectedImages.length}
//           </Text>
//           <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelectedImages}>
//             <Ionicons name="trash-outline" size={24} color="green" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Modal */}
//       <Modal
//         isVisible={isBottomSheetVisible}
//         onBackdropPress={() => setBottomSheetVisible(false)}
//         style={styles.modal}
//       >
//         <View style={styles.bottomSheetContainer}>
//           <Text style={styles.bottomSheetTitle}>Save File</Text>
//           <TextInput
//             style={styles.input}
//             value={fileName}
//             onChangeText={setFileName}
//           />
//           <View style={styles.dropdown}>
//             <Text style={styles.label}>File Type:</Text>

//             <Picker
//         selectedValue={fileType}
//         enabled={images.length <= 1} // Disable picker if more than 1 image
//         onValueChange={(itemValue) => {
//           if (images.length <= 1) {
//             setFileType(itemValue);
//           }
//         }}
//       >
//         <Picker.Item label="JPG" value="jpg" />
//         <Picker.Item label="PNG" value="png" />
//         <Picker.Item label="PDF" value="pdf" />
//       </Picker>
           
//           </View>
//           <View style={styles.dropdown}>
//           <Text style={styles.label}>File Compression:</Text>
//           <Picker
//             selectedValue={compression}
//             onValueChange={(itemValue) => setCompression(itemValue)}
//           >
//             <Picker.Item label="Original" value="Original" />
//             <Picker.Item label="5MB" value="5MB" />
//             <Picker.Item label="10MB" value="10MB" />
//             <Picker.Item label="15MB" value="15MB" />
//             <Picker.Item label="20MB" value="20MB" />
//             <Picker.Item label="25MB" value="25MB" />
//           </Picker>
//           </View>
//           <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
//             <Text style={styles.buttonText}>Share</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.shareButton}  onPress={handleDownload}>
//             <Text style={styles.buttonText}>Download</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#f2f2f2',
//   },
//   imageContainer: {
//     width: '45%',
//     height: 300,
//     margin: 5,
//     borderRadius: 10,
//     borderColor: '#E0F7FA',
//     borderWidth: 2,
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
//   indexContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#E0F7FA',
//     padding: 5,
//     alignItems: 'center',
//     borderBottomLeftRadius: 10,
//     borderBottomRightRadius: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   indexText: {
//     color: '#00796B',
//     fontWeight: 'bold',
//   },
//   radioButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#00796B',
//     backgroundColor: 'transparent',
//   },
//   radioButtonSelected: {
//     backgroundColor: '#00796B',
//   },
//   imageSelected: {
//     borderColor: '#00796B',
//   },
//   appBar: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 40,
//     backgroundColor: '#E0F7FA',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     borderBottomWidth: 1,
//     borderColor: '#00796B',
//   },
//   closeButton: {
//     backgroundColor: 'transparent',
//   },
//   closeButtonText: {
//     color: '#00796B',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   selectedText: {
//     color: '#00796B',
//     fontSize: 16,
//   },
//   deleteButton: {
//     backgroundColor: 'transparent',
    
//   },
//   shareButton: {
//     backgroundColor: '#0077B6',
//     padding: 10,
//     borderRadius: 13,
//     alignItems: 'center',
//     marginBottom: 10,
//     shadowColor: 'black',
//     shadowOffset: { width: 2, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   buttonText: {
//     fontWeight: 'bold',
//     color: '#fff',
//     fontSize: 16,
//   },
//   modal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   bottomSheetContainer: {
//     padding: 20,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     width: '100%',
//     marginHorizontal: 0,
//     position: 'relative',
//   },
//   bottomSheetTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     padding: 10,
//     marginVertical: 10,
//     borderRadius: 5,
//   },
//   dropdown: {
//     marginVertical: 10,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   downloadButton: {
//     position: 'absolute',
//     left: 20,
//     bottom: 20,
//     backgroundColor: '#0077B6',
//     padding: 10,
//     borderRadius: 5,
//   },
//   addButtonsContainer: {
//     position: 'absolute',
//     right: 20,
//     bottom: 20,
//     flexDirection: 'row',
//   },
//   addButton: {
//     backgroundColor: '#0077B6',
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 10,
//   },
//   exportContent: {
//     flexDirection: 'row', // Aligns children in a row
//     alignItems: 'center', // Centers the content vertically
//   },
// exportText: {
//     color: 'white', // Text color
//     marginLeft: 8, // Space between the icon and text
//     fontSize: 16, // Adjust the font size as needed
    
// }
// });

// export default ImageGridScreen;
























//code with good working flatlist
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Image, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert, BackHandler } from 'react-native';
// import * as Print from 'expo-print';
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import * as FileSystem from 'expo-file-system';
// import * as ImagePicker from 'expo-image-picker';
// import * as Sharing from 'expo-sharing';
// import Modal from 'react-native-modal';
// import { Picker } from '@react-native-picker/picker';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import * as MediaLibrary from 'expo-media-library';
// import * as ImageManipulator from 'expo-image-manipulator';
// import { Asset } from 'expo-asset';
// //import DraggableFlatList from 'react-native-draggable-flatlist';


// const ImageGridScreen = ({ route }) => {
  
//   const [images, setImages] = useState(route.params.images || []);
//   const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
//   const [fileName, setFileName] = useState(route.params?.folderName ||`File_${Math.floor(Math.random() * 1000)}`);
//   const [fileType, setFileType] = useState(images.length > 1 ? 'pdf' : 'pdf'); // Default to 'pdf'
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [compression, setCompression] = useState('Original'); 
//   const navigation = useNavigation();
//   const MAX_IMAGES = 25;

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
//     return () => backHandler.remove();
//   }, [handleBackButton]);

//   // Modify the share and download button handlers
// const handleShare = () => handleFileAction('share');
// const handleDownload = () => handleFileAction('download');
// // Function to get the current date and time
// const getCurrentDateTime = () => new Date().toISOString();

// // Function to handle image addition logic
// const handleAddImages = async (source) => {
//   const currentImageCount = images.length; // Get the current number of images
//   const remainingImageCount = MAX_IMAGES - currentImageCount; // Calculate remaining slots

//   if (remainingImageCount <= 0) { // If no space left for more images
//     Alert.alert(`You already have ${MAX_IMAGES} images. Cannot add more.`); // Show alert
//     return; // Stop further processing
//   }

//   // Call addImageFromCamera or addImageFromGallery based on the source parameter
//   if (source === 'camera') {
//     await addImageFromCamera(remainingImageCount); // Pass remaining slots to the function
//   } else if (source === 'gallery') {
//     await addImageFromGallery(remainingImageCount); // Pass remaining slots to the function
//   }
// };

//    // Function to add images from the camera
//    const addImageFromCamera = async (remainingCount) => {
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//     });

//     if (!result.canceled && result.assets.length > 0) {
//       const newImages = [...images, result.assets[0].uri]; // Add captured image
//       if (newImages.length > MAX_IMAGES) { // Check if the new total exceeds the limit
//         Alert.alert(`Limit exceeded. Only ${remainingCount} more images can be added.`);
//         newImages.splice(MAX_IMAGES); // Trim the array to fit the limit
//       }
//       setImages(newImages); // Update state with the new list of images
//       if (newImages.length > 1) {
//         setFileType('pdf'); // Change file type to 'pdf' if more than one image
//       }
//     }
//   };

//    // Function to add images from the gallery
//    const addImageFromGallery = async (remainingCount) => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       // allowsEditing: true,
//     });

//     if (!result.canceled && result.assets.length > 0) {
//       // Limit selected images to remaining slots
//       const selectedImages = result.assets.slice(0, remainingCount).map((asset) => asset.uri);
//       const newImages = [...images, ...selectedImages]; // Add selected images

//       if (result.assets.length > remainingCount) { // If more images were selected than allowed
//         Alert.alert(`Limit exceeded. Only ${remainingCount} more images can be added.`);
//       }

//       setImages(newImages); // Update state with the new list of images
//       if (newImages.length > 1) {
//         setFileType('pdf'); // Change file type to 'pdf' if more than one image
//       }
//     }
//   };

  
//   const convertToBase64 = async (uri) => {
//     try {
//       const fileInfo = await FileSystem.getInfoAsync(uri);
//       const fileBase64 = await FileSystem.readAsStringAsync(fileInfo.uri, { encoding: FileSystem.EncodingType.Base64 });
//       return `data:image/jpeg;base64,${fileBase64}`;
//     } catch (error) {
//       console.error('Error converting to base64:', error);
//       return '';
//     }
//   };

//   // Convert static image to base64
// const convertStaticImageToBase64 = async (imagePath) => {
//   try {
//     const asset = Asset.fromModule(imagePath);
//     await asset.downloadAsync(); // Ensure the asset is downloaded
//     const localUri = asset.localUri || asset.uri; // Get the local URI
    
//     const response = await fetch(localUri);
//     const blob = await response.blob();

//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result.split(',')[1]); // Return base64 string without data URL prefix
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   } catch (error) {
//     console.error('Error converting static image to Base64:', error);
//     throw error;
//   }
// };

//   // Save image file to the file system
//   const saveImageToFile = async (uri, fileType, fileName) => {
//     const fileExtension = fileType === 'jpg' ? '.jpg' : '.png';
//     const fileUri = FileSystem.documentDirectory + fileName + fileExtension;
//     await FileSystem.copyAsync({ from: uri, to: fileUri });
//     return fileUri;
//   };

//   const handleFileAction = async (action) => {
//     try {
//       let fileUri;
//       if (fileType === 'pdf') {
//         const pdfPageHeight = 841.89; // PDF height in pixels
//         const pdfPageWidth = 595.28;  // PDF width in pixels

//       const watermarkImagePath = require('../../image/oltree.png');
//       const base64Logo = await convertStaticImageToBase64(watermarkImagePath);

//       // Define watermark HTML
//       const watermark = `
//         <div style="position: absolute; bottom: 15px; right: 25px; opacity:2; display: flex; align-items: center;">
//           <img src="data:image/png;base64,${base64Logo}" alt="logo" style="height: 30px; margin-right: 5px;"/>
//           <span style="font-size: 17px; color: black;">camscan</span>
//         </div>`;
  
//         const imageHtmlPromises = images.map(async (uri) => {
//           console.log("Processing URI:", uri);
  
//           if (!uri) {
//             throw new Error('Image URI is null or undefined');
//           }
  
//           let width, height;
//           try {
//             const { width: imgWidth, height: imgHeight } = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.PNG });
//             width = imgWidth;
//             height = imgHeight;
//           } catch (error) {
//             console.error('Error getting image size:', error);
//             throw new Error('Failed to get image size.');
//           }
  
//           // Calculate scaled dimensions
//           let scaledWidth = width;
//           let scaledHeight = height;
//           const aspectRatio = width / height;
  
//           if (width > pdfPageWidth) {
//             scaledWidth = pdfPageWidth * 0.95; 
//             scaledHeight = scaledWidth / aspectRatio;
//           }
  
//           const base64Image = await convertToBase64(uri);
//           // Ensure watermark is included within each image wrapper
//           return `
//             <div style="page-break-before: always; position: relative; text-align: center; height: 100%; width: 100%;">
//               <img src="${base64Image}" 
//                    style="width: ${scaledWidth}px; height: ${scaledHeight}px; max-width: 100%; max-height: 100%; display: block; margin: 0 auto;"/>
//               ${watermark} <!-- Include watermark here to ensure it appears on every page -->
//             </div>`;
//         });
  
//         const htmlContent = (await Promise.all(imageHtmlPromises)).join('');
//         const { uri: pdfUri } = await Print.printToFileAsync({
//           html: `<html><body style="margin: 0; padding: 0;">${htmlContent}</body></html>`,
//           width: pdfPageWidth,
//           height: pdfPageHeight,
//         });
  
//         const newFileUri = FileSystem.documentDirectory + `${fileName}.pdf`;
//         await FileSystem.moveAsync({
//           from: pdfUri,
//           to: newFileUri,
//         });
  
//         fileUri = newFileUri;
//       } else {
//         // Handle JPG and PNG
//         const imageUris = await Promise.all(images.map(uri => saveImageToFile(uri, fileType, fileName)));
//         fileUri = imageUris[0]; // Assuming the first image is sufficient for the action
//       }
  
//       // Handle sharing or downloading
//       if (action === 'share') {
//         await Sharing.shareAsync(fileUri, {
//           mimeType: fileType === 'pdf' ? 'application/pdf' : (fileType === 'jpg' ? 'image/jpeg' : 'image/png'),
//           dialogTitle: `Share ${fileType.toUpperCase()} File`,
//           UTI: fileType === 'pdf' ? 'com.adobe.pdf' : (fileType === 'jpg' ? 'public.jpeg' : 'public.png'),
//         });
//       } else if (action === 'download') {
//         if (fileType === 'pdf') {
//           const documentDirectory = FileSystem.documentDirectory + 'Documents/';
//           const documentUri = documentDirectory + fileName + '.pdf';
  
//           await FileSystem.makeDirectoryAsync(documentDirectory, { intermediates: true });
//           await FileSystem.moveAsync({
//             from: fileUri,
//             to: documentUri,
//           });
  
//           Alert.alert('File Saved', `PDF file has been saved to ${documentUri}`);
//         } else {
//           const { status } = await MediaLibrary.requestPermissionsAsync();
//           if (status !== 'granted') {
//             Alert.alert('Permission Required', 'Permission to access gallery is required!');
//             return;
//           }
  
//           const asset = await MediaLibrary.createAssetAsync(fileUri);
//           await MediaLibrary.createAlbumAsync('Camscan Images', asset, false);
  
//           Alert.alert('File Saved', 'Image has been saved to your gallery!');
//         }
//       }
//     } catch (error) {
//       console.error('Error in handleFileAction:', error);
//       Alert.alert('Error', 'There was an error processing the file. Please try again.');
//     }
//   };

//   // Handle image selection
//   const handleSelectImage = (uri) => {
//     setSelectedImages((prevSelectedImages) =>
//       prevSelectedImages.includes(uri)
//         ? prevSelectedImages.filter((image) => image !== uri)
//         : [...prevSelectedImages, uri]
//     );
//   };

//   // Delete selected images
//   const handleDeleteSelectedImages = () => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete the selected images?',
//       [
//         {
//           text: 'Cancel',
//           onPress: () => setSelectedImages([]),
//           style: 'cancel',
//         },
//         {
//           text: 'Yes',
//           onPress: () => {
//             setImages((prevImages) => prevImages.filter((image) => !selectedImages.includes(image)));
//             setSelectedImages([]);
//           },
//         },
//       ]
//     );
//   };

  // //Render image in grid view
  // const renderImage = ({ item, index }) => (
  //   <TouchableOpacity
  //     style={[
  //       styles.imageContainer,
  //       selectedImages.includes(item) ? styles.imageSelected : {},
  //     ]}
  //     onPress={() => handleSelectImage(item)}
     
  //   >
  //     <Image source={{ uri: item }} style={styles.image} />
  //     <View style={styles.indexContainer}>
  //       <Text style={styles.indexText}>{index + 1}</Text>
  //       <TouchableOpacity
  //         style={[styles.radioButton, selectedImages.includes(item) && styles.radioButtonSelected]}
  //         onPress={() => handleSelectImage(item)}
  //       />
  //     </View>
  //   </TouchableOpacity>
  // );


//   const saveDocument = async () => {
//     try {
//       // Load existing folders from AsyncStorage
//       const savedFolders = JSON.parse(await AsyncStorage.getItem('savedFolders')) || {};
//       // console.log('Loaded Saved Folders:', savedFolders);
  
//       // Determine the current folder name using the latest state of fileName
//       const currentFolder = fileName || 'defaultFolder'; // Fallback to 'defaultFolder' if fileName is not set
//       console.log('Current Folder Name:', currentFolder);
  
//       // Check if the folder already exists
//       if (savedFolders[currentFolder]) {
//         console.log(`Folder "${currentFolder}" exists. Checking images...`);
  
//         // Folder exists, prompt user for confirmation to replace
//         Alert.alert(
//           'Folder Exists',
//           `The folder name "${currentFolder}" already exists. Do you want to replace it?`,
//           [
//             {
//               text: 'Cancel',
//               style: 'cancel',
//             },
//             {
//               text: 'Replace',
//               onPress: async () => {
//                 const existingFolder = savedFolders[currentFolder];
                
//                 // Ensure existingFolder.images is an array
//                 const existingImages = existingFolder.images || [];
//                 console.log('Existing Images:', existingImages);
  
//                 // Merge new images with existing ones
//                 const updatedImages = [...existingImages];
  
//                 images.forEach((newImage) => {
//                   // Check if the new image is already in the existing folder by comparing names
//                   const imageExists = existingImages.some(existingImage => existingImage.name === newImage.name);
  
//                   if (imageExists) {
//                     console.log(`Image "${newImage.name}" already exists in the folder.`);
//                   } else {
//                     console.log(`Adding new image "${newImage.name}" to the folder.`);
//                     updatedImages.push(newImage);
//                   }
//                 });
  
//                 console.log('Updated Images After Merge:', updatedImages);
  
//                 // Update the folder with new images and times
//                 savedFolders[currentFolder] = {
//                   ...existingFolder,
//                   images: updatedImages,
//                   updated_time: getCurrentDateTime(),
//                 };
  
//                 // Save the updated folders structure
//                 await AsyncStorage.setItem('savedFolders', JSON.stringify(savedFolders));
//                 console.log('Saved Folders After Update:', savedFolders);
  
//                 // Navigate to ProjectScreen after saving
//                 navigation.navigate('Project');
//               },
//             },
//           ]
//         );
//       } else {
//         console.log(`Folder "${currentFolder}" does not exist. Creating a new one.`);
  
//         // Folder does not exist, create a new one
//         console.log(images)
//         savedFolders[currentFolder] = {
          
//           images,
//           created_time: getCurrentDateTime(),
//           updated_time: getCurrentDateTime(),
//         };
  
//         console.log('New Folder Structure:', savedFolders[currentFolder]);
  
//         // Save the updated folders structure
//         await AsyncStorage.setItem('savedFolders', JSON.stringify(savedFolders));
//         console.log('Saved Folders After Creation:', savedFolders);
  
//         // Navigate to ProjectScreen after saving
//         navigation.navigate('Project');
//       }
//     } catch (error) {
//       console.error('Error saving images:', error);
//     }
//   };
  
  

//   // handleBackButton method that uses saveDocument
//   const handleBackButton = useCallback(async () => {
//     if (images.length === 0) {
//       navigation.navigate('Project');
//     } else {
//       await saveDocument(); // Call saveDocument method
//     }
//     return true; // Prevent default back action
//   }, [images, fileName, navigation]);

//   return (
//     <View style={styles.container}>

      // <FlatList
      //   data={images}
      //   renderItem={renderImage}
      //   keyExtractor={(item, index) => index.toString()}
      //   numColumns={2}
      // />

//       {/* Download Button */}
//       <TouchableOpacity style={styles.downloadButton} 
//         onPress={() => {
//             if (images.length === 0) {
//               Alert.alert('No Images', 'Please add at least one image before Export');
//               return;
//             }
//             if (images.length === 1) {
//               setFileType('jpg'); // Set default file type to 'jpg' if only one image is present
//             } else {
//               setFileType('pdf'); // Set default file type to 'pdf' if more than one image is present
//             }
//             setBottomSheetVisible(true);
//           }}>

//         <View style={styles.exportContent}>
//         <Ionicons name="download-outline" size={24} color="white" />
//         <Text style={styles.exportText}>Export</Text>
//         </View>
//       </TouchableOpacity>

//       {/* Add Image Buttons */}
//       <View style={styles.addButtonsContainer}>
//         <TouchableOpacity style={styles.addButton} onPress={() => handleAddImages('camera')}>
//           <Ionicons name="camera-outline" size={24} color="white" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.addButton} onPress={() => handleAddImages('gallery')}>
//           <Ionicons name="add-circle-outline" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {/* App Bar for Selected Items */}
//       {selectedImages.length > 0 && (
//         <View style={styles.appBar}>
//           <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImages([])}>
//             <Text style={styles.closeButtonText}>X</Text>
//           </TouchableOpacity>
//           <Text style={styles.selectedText}>
//             Selected: {selectedImages.length}
//           </Text>
//           <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelectedImages}>
//             <Ionicons name="trash-outline" size={24} color="green" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Modal */}
//       <Modal
//         isVisible={isBottomSheetVisible}
//         onBackdropPress={() => setBottomSheetVisible(false)}
//         style={styles.modal}
//       >
//         <View style={styles.bottomSheetContainer}>
//           <Text style={styles.bottomSheetTitle}>Save File</Text>
//           <TextInput
//             style={styles.input}
//             value={fileName}
//             onChangeText={setFileName}
//           />
//           <View style={styles.dropdown}>
//             <Text style={styles.label}>File Type:</Text>

//             <Picker
//         selectedValue={fileType}
//         enabled={images.length <= 1} // Disable picker if more than 1 image
//         onValueChange={(itemValue) => {
//           if (images.length <= 1) {
//             setFileType(itemValue);
//           }
//         }}
//       >
//         <Picker.Item label="JPG" value="jpg" />
//         <Picker.Item label="PNG" value="png" />
//         <Picker.Item label="PDF" value="pdf" />
//       </Picker>
           
//           </View>
//           <View style={styles.dropdown}>
//           <Text style={styles.label}>File Compression:</Text>
//           <Picker
//             selectedValue={compression}
//             onValueChange={(itemValue) => setCompression(itemValue)}
//           >
//             <Picker.Item label="Original" value="Original" />
//             <Picker.Item label="5MB" value="5MB" />
//             <Picker.Item label="10MB" value="10MB" />
//             <Picker.Item label="15MB" value="15MB" />
//             <Picker.Item label="20MB" value="20MB" />
//             <Picker.Item label="25MB" value="25MB" />
//           </Picker>
//           </View>
//           <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
//             <Text style={styles.buttonText}>Share</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.shareButton}  onPress={handleDownload}>
//             <Text style={styles.buttonText}>Download</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#f2f2f2',
//   },
//   imageContainer: {
//     width: '45%',
//     height: 300,
//     margin: 5,
//     borderRadius: 10,
//     borderColor: '#E0F7FA',
//     borderWidth: 2,
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
//   indexContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#E0F7FA',
//     padding: 5,
//     alignItems: 'center',
//     borderBottomLeftRadius: 10,
//     borderBottomRightRadius: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   indexText: {
//     color: '#00796B',
//     fontWeight: 'bold',
//   },
//   radioButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#00796B',
//     backgroundColor: 'transparent',
//   },
//   radioButtonSelected: {
//     backgroundColor: '#00796B',
//   },
//   imageSelected: {
//     borderColor: '#00796B',
//   },
//   appBar: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 40,
//     backgroundColor: '#E0F7FA',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     borderBottomWidth: 1,
//     borderColor: '#00796B',
//   },
//   closeButton: {
//     backgroundColor: 'transparent',
//   },
//   closeButtonText: {
//     color: '#00796B',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   selectedText: {
//     color: '#00796B',
//     fontSize: 16,
//   },
//   deleteButton: {
//     backgroundColor: 'transparent',
    
//   },
//   shareButton: {
//     backgroundColor: '#0077B6',
//     padding: 10,
//     borderRadius: 13,
//     alignItems: 'center',
//     marginBottom: 10,
//     shadowColor: 'black',
//     shadowOffset: { width: 2, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   buttonText: {
//     fontWeight: 'bold',
//     color: '#fff',
//     fontSize: 16,
//   },
//   modal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   bottomSheetContainer: {
//     padding: 20,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     width: '100%',
//     marginHorizontal: 0,
//     position: 'relative',
//   },
//   bottomSheetTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     padding: 10,
//     marginVertical: 10,
//     borderRadius: 5,
//   },
//   dropdown: {
//     marginVertical: 10,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   downloadButton: {
//     position: 'absolute',
//     left: 20,
//     bottom: 20,
//     backgroundColor: '#0077B6',
//     padding: 10,
//     borderRadius: 5,
//   },
//   addButtonsContainer: {
//     position: 'absolute',
//     right: 20,
//     bottom: 20,
//     flexDirection: 'row',
//   },
//   addButton: {
//     backgroundColor: '#0077B6',
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 10,
//   },
//   exportContent: {
//     flexDirection: 'row', // Aligns children in a row
//     alignItems: 'center', // Centers the content vertically
//   },
// exportText: {
//     color: 'white', // Text color
//     marginLeft: 8, // Space between the icon and text
//     fontSize: 16, // Adjust the font size as needed
    
// }
// });

// export default ImageGridScreen;



























