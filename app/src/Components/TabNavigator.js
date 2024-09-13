import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../PrimaryScreens/HomeScreen';
import ProjectScreen from '../PrimaryScreens/ProjectScreen';
import ScanScreen from '../PrimaryScreens/ScanScreen';
import ProfileScreen from '../PrimaryScreens/ProfileScreen';
import RecentScreen from '../PrimaryScreens/RecentScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarStyle: {
        backgroundColor: '#43d7ec', // Background color of the tab bar
        height: 70, // Height of the tab bar
        paddingBottom: 10, // Padding to avoid clipping
      },
      tabBarActiveTintColor: '#fff', // Color of the icon when active
      tabBarInactiveTintColor: '#ddd', // Color of the icon when inactive
      tabBarLabelStyle: { fontSize: 14 },
      tabBarIconStyle: {
        width: 50, // Increased width of the icon container
        height: 50, // Increased height of the icon container
        marginVertical: 0, // Remove vertical margin
      },
      tabBarIcon: ({ color, size, focused }) => (
        <View
          style={{
            backgroundColor: focused ? '#87CEEB' : 'transparent', // 3D effect when focused
            borderRadius: 25, // Increased border radius for a circular effect
            padding: 5, // Reduced padding for better fit
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            justifyContent: 'center', // Center icon within container
            alignItems: 'center', // Center icon within container
            overflow: 'visible', // Ensure no clipping
          }}
        >
          <Icon
            name={route.name === 'Home' ? 'home' :
                  route.name === 'Project' ? 'folder' :
                  route.name === 'Scan' ? 'scan' :
                  route.name === 'Profile' ? 'person' :
                  'time'}
            color={color}
            size={size} // Icon size
          />
        </View>
      ),
    })}
  >
    
    <Tab.Screen name="Project" component={ProjectScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
    
  </Tab.Navigator>
);

export default TabNavigator;

//<Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
//<Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
//<Tab.Screen name="Recent" component={RecentScreen} options={{ headerShown: false }} />










