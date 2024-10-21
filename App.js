/*=========================================================================================
File Name: App.js
Description: Screen donde creamos el contenido de la navegación por Stack
--------------------------------------------------------------------------------------
Item Name: AEM Retail App - Navegación
Author: Brandon Jelday Guevara Silva
Author URL: Brandon Jelday Guevara Silva
========================================================================================== */

import React, { useEffect } from 'react';

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './src/screens/Login';
import Navigation from './src/screens/private/Navigation';
// import 'react-native-gesture-handler';
// import {LogBox} from "react-native";
// import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';
import { Alert, Linking, Platform } from 'react-native';
// import * as Permissions from 'expo-permissions';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

// Definimos tema predeterminado para los componentes de la aplicación (React Native Paper)
const theme = {
  ...DefaultTheme,
};

export default function App() {

  // const oneSignalAppId = Constants.expoConfig.extra.onesignal.oneSignalAppId;

  /**
   * Función para abrir configuración de aplicación
   * @date 11/28/2023 - 1:30:46 PM
   * @author Alessandro Guevara
   **/
  const openAppConfiguration = () => {
    // Verificamos plataforma y abrimos configuración de cada uno
    if(Platform.OS === 'ios') {
      Linking.openURL(`app-settings:`)
    }else {
      Linking.openSettings();
    }
  }

  /**
   * Función para verificar si el usuario tiene permisos para recibir notificaciones
   * @date 11/28/2023 - 1:30:02 PM
   * @author Alessandro Guevara
   *
   * @async
  **/
  const fetchPermissions = async () => {
    // const hasPermissions = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    // if(!hasPermissions.granted) {
    //   Alert.alert(
    //     'Notificaciones no disponibles', 
    //     'Los permisos de notificaciones están desactivados. Dirígete a la configuración de la aplicación para activar las notificaciones.',
    //     [
    //       {
    //         text: 'Ahora no',
    //       },
    //       {
    //         text: 'Ir a configuración',
    //         onPress: () => openAppConfiguration()
    //       }
    //     ]
    //   )
    // }
  }

  // Inicializamos OneSignal para notificaciones push
  useEffect(() => {

    // Validamos que no estemos corriendo la aplicación desde expo
    if(Constants.appOwnership !== "expo") {
      // Configuración de OneSignal
      // configureOneSignal()

      // Revisar permisos de notificaciones
      fetchPermissions();
    }
    
  }, []);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
            <Stack.Navigator
              initialRouteName='Login'
              screenOptions={{
                headerStyle: { elevation: 0 },
                cardStyle: { backgroundColor: '#fff' },
              }}
            >
              <Stack.Screen
                name='Login'
                component={Login}
                options={{
                  headerTransparent: true,
                  headerShown: false,
                  title: 'Login',
                }}
              />
              <Stack.Screen
                name='Navigation'
                component={Navigation}
                options={{ headerTransparent: true, headerShown: false }}
              />
            </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
