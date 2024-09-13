import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FirstRenderPage from './PrimaryScreens/FirstRenderPage';
import TabNavigator from './Components/TabNavigator';
import AppBar from './Components/AppBar';
import Registration from './PrimaryScreens/Registration';
import Login from './PrimaryScreens/Login';
import ImageGridScreen from './Components/AdditionalComponents/ImageGridScreen';
  
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ navigation, route }) => (
  <Drawer.Navigator
    screenOptions={{
      header: () => (
        <AppBar title={route.state?.routeNames[route.state.index] || 'Cam Scan'} openDrawer={() => navigation.openDrawer()} />
      ),
      headerShown: true,
    }}
  >
    <Drawer.Screen name="TabNavigator" component={TabNavigator} options={{ title: 'PDF Creator' }} />
  </Drawer.Navigator>
);

const App = () => (
 
    <Stack.Navigator initialRouteName="FirstRenderPage">
      <Stack.Screen name="FirstRenderPage" component={FirstRenderPage} options={{ headerShown: false }}/>
      <Stack.Screen name="NavScreen" component={DrawerNavigator} options={{ headerShown: false }}/>    
     
      <Stack.Screen name="ImageGrid" component={ImageGridScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Registration" component={Registration} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
     
    </Stack.Navigator>

);

export default App;

