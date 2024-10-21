/*=========================================================================================
File Name: Navigation.js
Description: Screen de configuración y creacion de menu DRAWER
--------------------------------------------------------------------------------------
Item Name: AEM Retail App - Navegación
Author: Brandon Jelday Guevara Silva
Author URL: Brandon Jelday Guevara Silva
========================================================================================== */

import React, { useEffect, useState, useRef } from 'react';
import { AppState, Alert, View, Dimensions, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Sidebar from '../../../components/Sidebar';
import Inicio from '../private/Inicio';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import API from '../../../constants/API';
import base64 from 'react-native-base64';
import * as FileSystem from 'expo-file-system';
import JWT from 'expo-jwt';
// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';
// import * as Updates from 'expo-updates';

import { useIsFocused } from '@react-navigation/native';
import Palette from '../../../constants/Palette';

const key = 'ZimpleDevs';
const BACKGROUND_FETCH_TASK = 'background-fetch';
const { width, height } = Dimensions.get("screen");

const Drawer = createDrawerNavigator();

const Navigation = (props) => {
  /**
  |--------------------------------------------------
  | VARIABLES DE ESTADO
  |--------------------------------------------------
  */
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState(null);

  const { usuario } = props.route.params;
  const { id_sesion } = usuario;
  const { id_usuario } = usuario[0];

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isVisitActive, setIsVisitActive] = useState(false);
  const markExitRef = useRef(null);
  const storeVisiting = useRef("");
  const numActiveVisits = useRef(0);

  const [paramsAlertCustom, setParamsAlertCustom] = useState({
    show: true,
    type: "danger",
    action: "close",
    action2: "close",
    title: "Titulo desde state",
    message: "Mensaje",
    firstButtonText: "Aceptar",
    secondButtonAble: true,
    secondButtonText: "Cancelar",
    widthModal: "80%",
  });


  /**
  |--------------------------------------------------
  | VARIABLES DE ESTADO
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | FOREGROUND: se ejecutarán estos procesos siempre
  |--------------------------------------------------
  */
  // const foregroundFunction = async () => {
  //   console.log('Foreground...');
  //   console.log('Verify Expo Updates OTA');
  //   verifyOTAUpdates();
  //   /*--------------------------------------------------
  //   FileSystemUser: obtener los datos del usuario */
  //   let fileUri = FileSystem.documentDirectory + 'tokenAEMAPP.txt';
  //   try {
  //     var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
  //       encoding: FileSystem.EncodingType.UTF8,
  //     });
  //   } catch (e) {
  //     // console.log(e);
  //     var fileSystemValue = null;
  //   }

  //   //SI EXISTE TRATAMOS DE DECODIFICAR
  //   if (fileSystemValue != null) {
  //     try {
  //       var userData = JWT.decode(fileSystemValue, key);
  //       // console.log(userData);
  //       verifysession(userData);
  //     } catch (error) {
  //       console.log(error);
  //       // Cerramos sesion
  //       console.log('Cerrando sesion...' + id_sesion);

  //       let fileUri = FileSystem.documentDirectory + 'tokenAEMAPP.txt';
  //       const jsonValue = '';
  //       await FileSystem.writeAsStringAsync(fileUri, jsonValue, {
  //         encoding: FileSystem.EncodingType.UTF8,
  //       });
  //       navigation.navigate('Login', {
  //         sessionMessage: 'La sesión ha caducado',
  //       });
  //     }
  //   } else {
  //     console.log('No tokens stored under that key');
  //   }
  //   /* FileSystemUser: obtener los datos del usuario
  // --------------------------------------------------*/
  // };
  /**
  |--------------------------------------------------
  | FOREGROUND: se ejecutarán estos procesos siempre
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | VERIFYOTAUPDATES: Verifica las actualizaciones via OTA y reinicia el dispositivo
  |--------------------------------------------------
  */
  // const verifyOTAUpdates = async () => {
  //   try {
  //     const update = await Updates.checkForUpdateAsync();
  //     if (update.isAvailable) {
  //       Alert.alert(
  //         'Actualizaciones disponibles',
  //         '¿Deseas reiniciar la aplicación ahora mismo para actualizara?',
  //         [
  //           {
  //             text: 'Posponer',
  //           },
  //           {
  //             text: 'Reiniciar',
  //             onPress: async () => {
  //               console.log('ACTUALIZAR EXPO');
  //               await Updates.fetchUpdateAsync();
  //               await Updates.reloadAsync();
  //             },
  //           },
  //         ]
  //       );
  //     } else {
  //       console.log('No hay actualizaciones');
  //     }
  //   } catch (e) {
  //     console.log('Error al verificar actualizaciones');
  //     console.log(e);
  //   }
  // };

  /**
  |--------------------------------------------------
  | VERIFICAR SESION: comprueba si el id local es igual al ultimo de la DB
  |--------------------------------------------------
  */
  // const verifysession = async (userData) => {
  //   const { id_usuario } = userData[0];
  //   const id_sesion = userData['id_sesion'];

  //   try {
  //     var id_usuario_base64 = base64.encode(id_usuario);

  //     const api = API.apiUrl.concat('verifysession', '/', id_usuario_base64);
  //     const response = await fetch(api);
  //     const json = await response.json();
  //     // Si el id local y el de la db no es igual, cerramos la sesion con el mensaje
  //     if (json[0].id_mov == id_sesion) {
  //       console.log('Sesion activa: ' + id_sesion);
  //     } else {
  //       // Cerramos sesion
  //       console.log('Cerrando sesion...' + id_sesion);

  //       let fileUri = FileSystem.documentDirectory + 'tokenAEMAPP.txt';
  //       const jsonValue = '';
  //       await FileSystem.writeAsStringAsync(fileUri, jsonValue, {
  //         encoding: FileSystem.EncodingType.UTF8,
  //       });
  //       navigation.navigate('Login', {
  //         sessionMessage:
  //           'La sesión fue finalizada porque se inició en otro dispositivo móvil',
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };
  /**
  |--------------------------------------------------
  | VERIFICAR SESION: comprueba si el id local es igual al ultimo de la DB
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | SUBIR EVALUACIONES: la tarea llamará a esta funcion para subir evaluaciones
  |--------------------------------------------------
  */

  // const backgroundTaskSubirEvaluaciones = async () => {
  //   if (
  //     AppState.currentState == 'background' &&
  //     (global.cameraOpen === false || global.cameraOpen == undefined) &&
  //     (global.galleryOpen === false || global.galleryOpen == undefined)
  //   ) {
  //     console.log('Iniciando subida de evaluaciones BACKGROUND...');

  //     var modificarEv = '';

  //     // Llamamos funcion para insertar en el historico de conexiones
  //     HistoricoConexion(
  //       id_usuario,
  //       'Sincronizacion de evaluaciones en Background',
  //       'Iniciado',
  //       0
  //     );

  //     try {
  //       console.log('obteniendo datos...');
  //       let fileUri =
  //         FileSystem.documentDirectory +
  //         'fileSystemEvaluaciones' +
  //         id_usuario +
  //         '.txt';

  //       var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
  //         encoding: FileSystem.EncodingType.UTF8,
  //       });
  //       fileSystemValue =
  //         fileSystemValue != null ? JSON.parse(fileSystemValue) : null;

  //       modificarEv = fileSystemValue;

  //       // ITERAMOS LAS EVALUACIONES PENDIENTES --- --- ---
  //       await Promise.all(
  //         Object.keys(fileSystemValue).map(async (item) => {
  //           console.log('----------- ITEM -----------');
  //           console.log(item);

  //           // VALIDAMOS QUE NO ESTE SUBIDA YA Y ESTE TERMINADA
  //           if (
  //             fileSystemValue[item]['evaluacionTerminada'] &&
  //             fileSystemValue[item]['uploaded'] == false
  //           ) {
  //             console.log('Insertar');
  //             // INSERTAMOS LA EVALUACION --- --- ---
  //             const api = API.apiUrl.concat('guardar/evaluacion/');
  //             let response = await fetch(api, {
  //               method: 'POST',
  //               headers: {
  //                 Accept: 'application/json',
  //                 'Content-Type': 'application/json',
  //               },
  //               body: JSON.stringify({
  //                 id_evaluacion: fileSystemValue[item].id_evaluacion,
  //                 id_usuario: fileSystemValue[item].id_usuario,
  //                 id_evaluado: fileSystemValue[item].id_evaluado,
  //                 id_local: item,
  //                 supervisor: fileSystemValue[item].supervisor,
  //                 lider: fileSystemValue[item].lider,
  //                 area: fileSystemValue[item].area,
  //                 puesto: fileSystemValue[item].puesto,
  //                 id_empresario: fileSystemValue[item].id_empresario,
  //                 respuestasIniEval: fileSystemValue[item].respuestasIniEval,

  //                 puntosObtenidos: fileSystemValue[item].puntosObtenidos,
  //                 num_pregunta: fileSystemValue[item].num_pregunta,
  //                 respuestasResponderEval:
  //                   fileSystemValue[item].respuestasResponderEval,

  //                 firmas: fileSystemValue[item].firmas,

  //                 localizacion: fileSystemValue[item].localizacion,
  //               }),
  //             });

  //             let data = await response.json();

  //             console.log('##### DATOS #####');
  //             console.log(data);

  //             //ACTUALIZAMOS EL ITEM SI SE LOGRO SUBIR
  //             if (data.code == '200') {
  //               // Si se logra insertar en la db actualizamos el estado de uploaded a true
  //               modificarEv = {
  //                 ...modificarEv,
  //                 [item]: {
  //                   ...modificarEv[item],
  //                   uploaded: true,
  //                   // respuestasResponderEval: '',
  //                   id_detalle_uploaded: data.id_detalle,
  //                 },
  //               };

  //               // console.log(modificarEv);

  //               console.log('Item: ' + item + ' actualizado y subido');
  //               // Si se logra insertar en la db actualizamos el estado de uploaded a true

  //               // INSERTAMOS MENSAJE DEPENDIENDO DE SI ES NUEVA O YA SE HABIA SICRONIZADO
  //               if (data.sync == 'new') {
  //                 // Llamamos funcion para insertar en el historico de conexiones
  //                 HistoricoConexion(
  //                   id_usuario,
  //                   'Sincronizacion de la evaluacion ' + item,
  //                   'Exitosa',
  //                   item
  //                 );
  //               } else {
  //                 // Llamamos funcion para insertar en el historico de conexiones
  //                 HistoricoConexion(
  //                   id_usuario,
  //                   'Evaluacion previamente sincronizada ' + item,
  //                   'Anteriormente exitosa',
  //                   item
  //                 );
  //               }
  //             } else {
  //               var mensaje = data.message;
  //               mensaje = mensaje.replace(/[.*'+?^$:{}()|[\]\\]/g, '');
  //               HistoricoConexion(
  //                 id_usuario,
  //                 'Sincronizacion de la evaluacion ' + item,
  //                 mensaje,
  //                 item
  //               );
  //             }

  //             // INSERTAMOS LA EVALUACION --- --- ---
  //           } else {
  //             // console.log('No se inserta');
  //           }
  //         })
  //       );
  //       const jsonValue = JSON.stringify(modificarEv);

  //       try {
  //         FileSystem.writeAsStringAsync(fileUri, jsonValue, {
  //           encoding: FileSystem.EncodingType.UTF8,
  //         });
  //       } catch (e) {
  //         console.log(e);
  //       }
  //       // ITERAMOS LAS EVALUACIONES PENDIENTES --- --- ---
  //     } catch (e) {
  //       // Llamamos funcion para insertar en el historico de conexiones
  //       HistoricoConexion(
  //         id_usuario,
  //         'Sincronizacion de evaluaciones Background',
  //         e.message,
  //         0
  //       );
  //     }
  //   }
  //   global.task = true;
  // };
  /**
  |--------------------------------------------------
  | SUBIR EVALUACIONES: la tarea llamará a esta funcion para subir evaluaciones
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | BACKGROUND: registrar tarea para cuando la app este en background
  |--------------------------------------------------
  */
  //Valor para que se ejecute en IOS
  // BackgroundFetch.setMinimumIntervalAsync(60 * 15);

  // // Definimos la tarea que se realizara en el background
  // TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  //   const now = Date.now();
  //   console.log(
  //     `Got background fetch call at date: ${new Date(now).toISOString()}`
  //   );

  //   if (global.task === true || global.task == undefined) {
  //     console.log('Si puedes ejecutar');
  //     global.task = false;
  //     backgroundTaskSubirEvaluaciones();
  //   } else {
  //     console.log('No se puede ejecutar');
  //   }

  //   return BackgroundFetch.Result.NewData;
  // });

  // // Registramos la tarea BACKGROUND_FETCH_TASK
  // async function registerBackgroundFetchAsync() {
  //   return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
  //     minimumInterval: 60 * 15, // 1 minutes
  //     stopOnTerminate: false, // android only,
  //     startOnBoot: true, // android only
  //   });
  // }

  // // Revisamos estatus de la tarea y cambiamos las variables
  // const checkStatusAsync = async () => {
  //   const status = await BackgroundFetch.getStatusAsync();
  //   const isRegistered = await TaskManager.isTaskRegisteredAsync(
  //     BACKGROUND_FETCH_TASK
  //   );
  //   setStatus(status);
  //   setIsRegistered(isRegistered);
  // };

  // // Comprobamos si la tarea esta registrada o no
  // const toggleFetchTask = async () => {
  //   if (isRegistered) {
  //     console.log('Tarea lista');
  //   } else {
  //     await registerBackgroundFetchAsync();
  //     console.log('Tarea registrada');
  //   }

  //   checkStatusAsync();
  // };
  /**
  |--------------------------------------------------
  | BACKGROUND: registrar tarea para cuando la app este en background
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | Effect que se ejecuta cada minuto y llama a foreground
  |--------------------------------------------------
  */

  const changeIsVisitActive = (state) => {
    //console.log("cambio aqui; "+state.status);

    if(state.status === true || state.status === "true") {
      setIsVisitActive(true);
      storeVisiting.current = state.storeVisiting;
      numActiveVisits.current = state.numActiveVisits;
    }else if(state.status === false || state.status === "false") {
      setIsVisitActive(false);
      storeVisiting.current = "";
      numActiveVisits.current = 0;
    }
  }

  const markExitVisit11 = () => {
    console.log("MARCA SALIDA");
    
  }
  const MINUTE_MS = 60000;

  useEffect(() => {
    console.log("ENTRAMOS NAVIGATION");
    const interval = setInterval(() => {
      // foregroundFunction();
    }, MINUTE_MS);

    return () => clearInterval(interval);
  }, []);

  
  /**
  |--------------------------------------------------
  | Effect que se ejecuta cada minuto y llama a foreground
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | EFFECTS
  |--------------------------------------------------
  */
  // useEffect(() => {
  //   toggleFetchTask();
  // }, []);
  /**
  |--------------------------------------------------
  | EFFECTS
  |--------------------------------------------------
  */

  return (
    // Creamos estructura de Navigation Drawer
    <Drawer.Navigator
      initialRouteName='Inicio'
      drawerType='front'
      drawerContent={(props) => <Sidebar {...props} usuario={usuario} changeIsVisitActive={changeIsVisitActive} markExitRef={markExitRef} />}
    >
      <Drawer.Screen
        name='Inicio'
        component={Inicio}
        {...props}
        usuario={usuario}
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <View style={{flexDirection: 'row'}}>
            </View>
          ),
          headerRight:() => (
            <View style={{flexDirection: 'row', display: isVisitActive === true ? 'flex' : 'none', marginTop: 40}}>
              {/* <IndicatorVisit isVisitActive={isVisitActive} colorText={Palette.colors.white}/> */}
              <View >
                <MaterialCommunityIcons 
                  onPress={() => markExitRef.current.markExitVisit(storeVisiting.current, numActiveVisits.current)} 
                  name="exit-run" 
                  size={24} 
                  color="white" 
                  style={{marginRight: 20}} 
                />
              </View>
             
            </View>
            
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
    containerIndicator: {
      flexDirection: 'row', 
      marginRight: 10, 
      justifyContent: 'center', 
      alignItems: 'center',
      borderWidth: 1,
      padding: 5,
      borderRadius: 20
    },
    circle: {
      width: 15, 
      height: 15, 
      backgroundColor: Palette.colors.success700, 
      borderRadius: 8, 
      marginRight: 2
    },
    textIndicator: {
      fontSize: 12, 
      marginLeft: 2,
      color: Palette.colors.success700
    }
})

export default Navigation;
