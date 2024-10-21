/*=========================================================================================
File Name: Sidebar.js
Description: Personalizacion de Drawer
--------------------------------------------------------------------------------------
Item Name: AEM Retail App - Drawer Personalizado
Author: Brandon Jelday Guevara Silva
Author URL: Brandon Jelday Guevara Silva
========================================================================================== */
import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  ImageBackground,
  Text,
  View,
  Dimensions,
  Linking,
  Modal,
  StyleSheet,
  Alert,
  Platform
} from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import {
  Caption,
  IconButton,
  Paragraph,
} from "react-native-paper";
import {
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  FontAwesome
} from "@expo/vector-icons";
import Palette from "../constants/Palette";
import Images from "../constants/Images";
import { useNavigation } from "@react-navigation/native";
import AlertCustom from "./AlertCustom";
import * as SQLite from 'expo-sqlite/legacy'; 
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import style from "../src/styles/style";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
// import { MarkExitVisit } from "./HelperExitVisit";
import { GetDataUser2, SaveLastTimeInRange, generateUniqueId, sendCurrentLocation } from "./HelpersData";
import ProgressDialog from "./ProgressDialog";
import {set_id_user, 
  set_name_user, set_data_user, set_perfil_user,
  set_radio_visit_now, radio_global, set_name_only_user, set_first_name_only_user, 
  level_precision, is_camera_open, set_is_visit_active, set_store_visiting, set_source, set_store_flag, id_user, app_version
} from "../constants/global";
import useModeOffline from "../src/hooks/useModeOffline";
// import { OneSignal } from "react-native-onesignal";
import InAppNotification from "./InApp/InAppNotification";
import Constants from 'expo-constants';
import io from "socket.io-client";
import { differenceInHours } from "date-fns";

const { width, height } = Dimensions.get("screen");

const Sidebar = (props) => {
  const db = SQLite.openDatabase('localDataAstu.db');
  // DIMENSION DE LA PANTALLA --- --- --- --- ---
  // DIMENSION DE LA PANTALLA --- --- --- --- ---

  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const { id_usuario, perfil } = props.usuario[0];
  set_data_user(props.usuario[0]);
  set_perfil_user(perfil);
  set_id_user(id_usuario);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sinver,setSinver] = useState(0);
  const secondsAvaible = 120;
  const [submenuConfiguration, setSubmenuConfiguration] = useState(false);
  
  const [timerRest, setTimerRest] = useState(120);
  const storeLocations = useRef([]);
  const timerRest2 = useRef(120);
  const { isModeOffline }= useModeOffline();
  const idLocationStore = useRef(0);
  const [paramsAlertCustom, setParamsAlertCustom] = useState({
      show: false,
      type: "error",
      action: "close",
      action2: "close",
      title: "Titulo desde state",
      message: "Mensaje",
      firstButtonText: "Aceptar",
      secondButtonAble: true,
      secondButtonText: "Cancelar",
      widthModal: "90%",
  });

  const [dataNewNotification, setDataNewNotification] = useState(null)

  const rad = (x) => {
      return (x * Math.PI) / 180;
  };

  function Dist(lat1, lon1, lat2, lon2) {
      var R = 6378.137; //Radio de la tierra en km
      var dLat = rad(lat2 - lat1);
      var dLong = rad(lon2 - lon1);
      var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) *
          Math.cos(rad(lat2)) *
          Math.sin(dLong / 2) *
          Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      d = d * 1000;
      return d.toFixed(3); //Retorna tres decimales
  }

  const restTimeAvaible = () => {
    const total = timerRest - 1;
    
    if(timerRest2.current < 0) {
      timerRest2.current = 120;
    }else {
      timerRest2.current = timerRest2.current - 1;
    }
    setTimerRest(timerRest2.current);

  }

  const countTimer = () => {
    setInterval(restTime, 10000);
  }

  const verifyLocation = async () => {
    var objResp = new Object();
    try {
        db.transaction(tx => {
            tx.executeSql(
                "SELECT * FROM BO_visitas WHERE estatus = ? AND is_into_right_now = ? AND id_usuario = ?", 
                [1, 1, id_usuario],
                async (tx, result) => {
                    var num_rows = result.rows.length;
                    if(num_rows > 0) {
                        const data = result.rows._array;
                        const storeVisiting = data[0].store;
                        //console.log("DATA -> ", data[0].bandera);
                        // Convertimos a array los datos de la tienda que vienen separados por "-"
                        const dataStore = data[0].store_input.split("-");
                        try {
                          idLocationStore.current = parseInt(dataStore[0]); // La posición 0 es el id numérico de tienda
                        } catch (error) {
                          idLocationStore.current = 0;
                        }

                        objResp = {
                          status: true,
                          storeVisiting: storeVisiting,
                          numActiveVisits: num_rows
                        };
                        props.changeIsVisitActive(objResp);
                        set_is_visit_active(true);
                        set_store_flag(data[0].bandera);
                        set_store_visiting(data[0].id_store);

                        const visitDuration = differenceInHours(new Date(), new Date(data[0].date_visit_into))
                        const limitDuration = 18

                        // Validamos que la visita no exceda o iguale el máximo de duración de una visita
                        if(visitDuration >= limitDuration) {
                          setParamsAlertCustom({
                            ...paramsAlertCustom,
                            show: true,
                            type: "error",
                            action: "markEntry",
                            action2: "close",
                            title: "Tiempo de visita excedido",
                            message: `La visita actual en la tienda ${data[0].store} alcanzó el máximo de horas permitido (${limitDuration} hrs). Deberás crear una nueva visita.`,
                            firstButtonText: "Aceptar",
                            secondButtonAble: false,
                            secondButtonText: "",
                            showButtonExtra: false,
                            messageButtonExtra: "",
                            extraAction: "",
                            widthModal: "95%",
                          });
                          return
                        }

                        let { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

                        if (!canAskAgain || status === "denied") {

                        }else if(status === "granted") {
                            const idStore =  data[0].id_store;
                            const label_store = data[0].store;
                            let locationExpo = await Location.getCurrentPositionAsync({
                                accuracy: level_precision,
                            });

                            //OBTENEMOS VARIABLES DE LA POSICION
                            let { latitude, longitude } = locationExpo.coords;
                            const storeLat = storeLocations.current[idStore].latitude;
                            const storeLong = storeLocations.current[idStore].longitude;

                           
                            var distancia = Dist(storeLat, storeLong, latitude, longitude);

                            const radio_store_visited = storeLocations.current[idStore].radio_store === ''  ||
                                                        storeLocations.current[idStore].radio_store === undefined 
                                                        ? radio_global : Math.round(parseInt(storeLocations.current[idStore].radio_store));
                            set_radio_visit_now(radio_store_visited);

                            if(distancia <= radio_store_visited) {
                              //Guardamos tiempo de su ultima vez dentro de rango
                              SaveLastTimeInRange();
                            }else {
                              if(paramsAlertCustom.show != true) {
                                setParamsAlertCustom({
                                  ...paramsAlertCustom,
                                  show: true,
                                  type: "error",
                                  action: "markEntry",
                                  action2: "close",
                                  title: "No estás cerca de la tienda",
                                  message: "No te encuentras cerca de la ubicación de la tienda "+label_store+" . Acércate a un rango de "+radio_store_visited+" m para poder continuar.",
                                  firstButtonText: "Marcar salida",
                                  secondButtonAble: true,
                                  secondButtonText: "Continuar",
                                  showButtonExtra: true,
                                  messageButtonExtra: "Compartir ubicación actual",
                                  extraAction: "shareLocation",
                                  widthModal: "95%",
                                });
                              }
                            }

                          
                        } 
                        
                    }else {

                      objResp = {
                        status: false,
                      };
                      props.changeIsVisitActive(objResp);
                      set_is_visit_active(false);
                      set_store_flag('');
                      set_store_visiting('');
                      
                        if(paramsAlertCustom.show != false) {
                          // console.log("ENTRA FALSE");
                          setParamsAlertCustom({
                            ...paramsAlertCustom,
                            show: false,
                          });
                        }
                        //console.log("NO DATA IN TABLE");
                    }
                },
                (tx, error) => {
                    console.log("ERROR GET VISITAS");
                    console.log(error);
                    objResp = {
                      status: false,
                    };
                    props.changeIsVisitActive(objResp);
                    set_is_visit_active(false);
                    set_store_flag('');
                    set_store_visiting('');
                  }
                
            );
        })

    
    } catch (error) {
      console.log("ERROR GET VISITAS");
      console.log(error);
      objResp = {
        status: false,
      };
      props.changeIsVisitActive(objResp);
      set_is_visit_active(false);
      set_store_flag('');
      set_store_visiting('');

    }
  }

  //const interval = setInterval(verifyLocation, 10000);

  const getTiendas = async () => {

    return new Promise(async (resolve) => {

      // DECLARAMOS NOMBRE CON LA RUTA DEL ARCHIVO LOCAL
      let fileUri = FileSystem.documentDirectory + "fileSystemEvaluados.txt";

      try {

          //LEEMOS EL ARCHIVO
          var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.UTF8,
          });

          //SI RECIBIMOS ALGO LO PARSEAMOS A JSON
          fileSystemValue = fileSystemValue != null ? JSON.parse(fileSystemValue) : null;

      } catch (err) {
          console.log("ERROR ->");
          console.log(err);
          fileSystemValue = null;
      }

      var objLocations = new Object();

      //RECORREMOS TODOS LOS ITEMS DEL ARRAY MAPEANDOLOS
      fileSystemValue.map((item) => {
          //CUANDO SEA PERFIL DE TIENDA LO AGREGAMOS AL ARRAY
            if(item.Lon != null && item.Lat != null) {
                objLocations = {
                    ...objLocations,
                    [item.nombre] : {
                        latitude: item.Lat,
                        longitude: item.Lon,
                        radio_store: item.radio_store,
                    }
                };
            }
              
              
          
      })

      storeLocations.current = objLocations;
      resolve(true);
    });

  }

  const getVistos = ()=>{
    fetch(`https://messenger.aemretail.com/chats/${id_user}?page=1?perPage=100?idChat=`)
    .then(response => {
      // Primero, verifica si la respuesta es exitosa (código de estado HTTP 200-299)
      if (!response.ok) {
        throw new Error('La red estuvo bien, pero ocurrió un error HTTP!');
      }
      return response.json(); // Parsea la respuesta como JSON
    })
    .then(data => {
      //console.log(data); // Aquí manejas los datos obtenidos
      var contador = 0;
      Object.keys(data).forEach(key => {
        var objChats = data[key];
        contador = contador + parseInt(objChats.sin_leer);
      });
      setSinver(0);
      if(contador != 0){
        setSinver(contador);
      }
    })
    .catch(error => {
      console.error('Hubo un problema con la operación fetch:', error);
    });
  }

  const markExitVisit = (store, activeVisits) => {
    // Si hay mas de una visita activa, redireccionamos a la pantalla de visitas
    // para que marquen salida manualmente
    if(activeVisits > 1) {
      props.navigation.navigate("AgendaVisita", {
          usuario: props.usuario,
          retorno: true,
      });
    }else if(activeVisits === 1) {
      // Cuando solo es una visita si haremos proceso para marcar la salida desde aqui
      setParamsAlertCustom({
        ...paramsAlertCustom,
        show: true,
        type: "danger",
        action: "markEntry",
        title: "Marcar salida",
        message: "¿Estás seguro que deseas marcar la salida de la tienda "+store+"?",
        firstButtonText: "Aceptar",
        secondButtonAble: true,
        secondButtonText: "Cancelar",
        showButtonExtra: false,
        widthModal: "90%",
      });
    }else {
      setParamsAlertCustom({
        ...paramsAlertCustom,
        show: true,
        type: "danger",
        action: "close",
        title: "Sin visitas activas",
        message: "No hay ninguna visita activa.",
        firstButtonText: "Aceptar",
        secondButtonAble: false,
        showButtonExtra: false,
        widthModal: "90%",
      });
    }

    
  }

  props.markExitRef.current = {
    markExitVisit: markExitVisit
  };

  const { nombre, aPaterno, aMaterno, puesto } = props.usuario[0];
  const label_user = nombre + " " + aPaterno;
  set_name_user(label_user);
  set_name_only_user(nombre);
  set_first_name_only_user(aPaterno);
  const navigation = useNavigation();

  const runFunctions = async () => {
    const dataRes = await getTiendas();
    console.log("<<<<<<<<<::::::: "+dataRes);
    const interval = setInterval(() => {
      if(is_camera_open === false) {
        verifyLocation();
      }
    }, 30000);
    getVistos();
    setInterval(() => {
      getVistos();
    }, 20000);
    /*const timer = setInterval(() => {
      console.log(timerRest2.current);
      restTimeAvaible();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);

    };*/

    
  } 

  const eventListenerOneSignal = async () => {
    // Validamos que no estemos corriendo la aplicación desde expo
    if(Constants.appOwnership !== "expo") {
      try {
        var { OneSignal } = await import('react-native-onesignal');
        // Agregamos evento para identificar cuando se presiona una notificación
        
        OneSignal.Notifications.addEventListener('click', (noti) => {
          const navigateTo = noti.notification.additionalData?.screen;
          const idComponent = noti.notification.additionalData?.id;
          
          // Validamos que no sea undefined la pantalla a donde se debe de navegar
          if(navigateTo) {

            // Validamos que no sea undefined el id del componente que se va a cargar al navegar
            if(idComponent) {
              props.navigation.navigate(navigateTo, {
                openNotification: true,
                idToOpen: idComponent,
              });
            }else {
              props.navigation.navigate(navigateTo, {
                openNotification: true,
                idToOpen: 0,
              });
            }
          }

        })
      } catch (error) {
        try {
          Alert.alert('Error press notification', JSON.stringify(error))
        } catch (error) {
          
        }
      } 
    }
  }

  useEffect(() => {
    runFunctions();

    eventListenerOneSignal()

    // Limpiar al desmontar el componente (opcional)
    // return () => {
    //   try {
    //     // Eliminar el evento al desmontar el componente (opcional)
    //     OneSignal.Notifications.removeEventListener('click');
    //   } catch (error) {
    //     console.error('Error al limpiar el evento de clic en la notificación:', error);
    //   }
    // };
  }, []);
  const socket = useRef(null);
  useEffect(() => {
    function generarColorPorNombre(nombre) {
      // Calcula un hash a partir del nombre
      let hash = 0;
      for (let i = 0; i < nombre.length; i++) {
          hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
      }
  
      // Genera componentes de color más mate
      let r = (hash & 0xFF) % 200; // Rojo
      let g = ((hash >> 8) & 0xFF) % 200; // Verde
      let b = ((hash >> 16) & 0xFF) % 200; // Azul
  
      // Convierte los componentes de color a formato hexadecimal
      let colorHex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  
      return '#' + colorHex;
  }
          socket.current = io("https://messenger.aemretail.com/", {
            transports: ["websocket"], // Usar WebSocket como transporte.
          });

          socket.current.on("mensajeEntrante", async(objSocket) => {
            if(objSocket.accion != 'notificacion'){
                          if (objSocket.tipoChat == "2" || objSocket.tipoChat == "3") {
              var arrMiembro = objSocket.idMiembros.split(",");
              let recorrerMiembros = arrMiembro.map(async(member) => {
                if (id_user == parseInt(member) && id_user != objSocket.idUsuEmisor) {
                                //TODO OBTENER DATOOOOOS
                                try {
                                  const response = await fetch(`https://messenger.aemretail.com/chats/${id_user}?page=1?perPage=100?idChat=`);
                                  if (!response.ok) {
                                    throw new Error("La red estuvo bien, pero ocurrió un error HTTP!");
                                  }
                                  const data2 = await response.json();
                                    //console.log(data); // Aquí manejas los datos obtenidos
                                    const arrChatList = await Promise.all(Object.keys(data2).map(async(key)=>{
                                      const objChats = data2[key];
                                      var miebro = objChats.miembros[0];
                                      if(miebro == id_user){
                                        miebro = objChats.miembros[1];
                                      }
                                      const userData = await GetDataUser2(miebro);
                                      if(userData.status){
                                        
                                        const arrRes = userData.stores;
                                        const nombreC = arrRes.map((user) => `${user.nombre} ${user.aPaterno}`).join(', ');
                                        objChats.idChat = key;
                                        objChats.nombreC = nombreC;
                                        objChats.primeraLetra = nombreC[0];
                                        objChats.color = generarColorPorNombre(nombreC);
                                        if(objChats.id_usuario_ultimo_mensaje != null){
                                          const userData2 = await GetDataUser2(objChats.id_usuario_ultimo_mensaje);
                                            if(userData2.status) {
                                                //setDataUsers(result.data);
                                                const arrRes2 = userData2.stores;
                                                const nombreB = arrRes2.map((user) => `${user.nombre}`).join(', ');
                                                objChats.nombreB = nombreB;
                                            }
                                        }
                                      }
                                        return objChats;
                                    }));
                                    // Orden ascendente
                                    var chatId = objSocket.idChat+'';
                                    arrChatList.sort((a, b) => new Date(b.fecha_ultimo_mensaje) - new Date(a.fecha_ultimo_mensaje));
                                    var arrNew = arrChatList.filter(chat => chat.idChat == chatId);
                    //TODO AQUI SE ENVIA NOTI
                    console.log(objSocket);
                    console.log('socket de grupo sidebar................')
                    //getMessages(page, mensajeNo, true);
                    var nav = props.navigation.getState();
                    console.log(nav.index)
                    console.log(props.state.routes.findIndex((e) => e.name === "Messenger"));
                    if(nav.index === props.state.routes.findIndex((e) => e.name === "Messenger") || nav.index === props.state.routes.findIndex((e) => e.name === "Chat")){
                      console.log('estas en la ventana vv')
                    }else{
                      if(parseInt(objSocket.tipoChat) == 2){
                        console.log('no estas notificar')
                        if(objSocket.mensaje != ""){
                          setDataNewNotification({
                            id_notification: generateUniqueId(),
                            title: `${objSocket.nombreCreador} en @${objSocket.grupo} te envió un mensaje`,
                            message: objSocket.mensaje,
                            showIcon: true,
                            iconBackgroundColor: Palette.colors.info400,
                            iconName: 'message1',
                            iconColor: '#fff',
                            iconSize: 24,
                            navigationAble: true,
                            type: 'chat',
                            objeto:arrNew[0],
                          });
                        }else{
                          setDataNewNotification({
                            id_notification: generateUniqueId(),
                            title: `${objSocket.nombreCreador} en @${objSocket.grupo}`,
                            message: 'Te ha enviado un archivo',
                            showIcon: true,
                            iconBackgroundColor: Palette.colors.info400,
                            iconName: 'message1',
                            iconColor: '#fff',
                            iconSize: 24,
                            navigationAble: true,
                            type: 'chat',
                            objeto:arrNew[0],
                          });                        
                        }
                      }else{
                        console.log('no estas notificar')
                        if(objSocket.mensaje != ""){
                          setDataNewNotification({
                            id_notification: generateUniqueId(),
                            title: `${objSocket.nombreCreador} te envió un mensaje (a traves de difusión)`,
                            message: objSocket.mensaje,
                            showIcon: true,
                            iconBackgroundColor: Palette.colors.info400,
                            iconName: 'message1',
                            iconColor: '#fff',
                            iconSize: 24,
                            navigationAble: true,
                            type: 'chat',
                          });
                        }else{
                          setDataNewNotification({
                            id_notification: generateUniqueId(),
                            title: `${objSocket.nombreCreador} (a traves de difusión)`,
                            message: 'Te ha enviado un archivo',
                            showIcon: true,
                            iconBackgroundColor: Palette.colors.info400,
                            iconName: 'message1',
                            iconColor: '#fff',
                            iconSize: 24,
                            navigationAble: true,
                            type: 'chat',
                          });                        
                        }
  
                      }
                    }
                    //TODO FIN ENVIO DE NOTI
                                } catch (error) {
                                  console.error('Hubo un problema con la operación fetch:', error);
                                }
              //TODO FIN DATOOOOS
                }
              });
            }
            if (id_user == objSocket.idUsuRec) {
              //TODO OBTENER DATOOOOOS
              try {
                const response = await fetch(`https://messenger.aemretail.com/chats/${id_user}?page=1?perPage=100?idChat=`);
                if (!response.ok) {
                  throw new Error("La red estuvo bien, pero ocurrió un error HTTP!");
                }
                const data2 = await response.json();
                  //console.log(data); // Aquí manejas los datos obtenidos
                  const arrChatList = await Promise.all(Object.keys(data2).map(async(key)=>{
                    const objChats = data2[key];
                    var miebro = objChats.miembros[0];
                    if(miebro == id_user){
                      miebro = objChats.miembros[1];
                    }
                    const userData = await GetDataUser2(miebro);
                    if(userData.status){
                      
                      const arrRes = userData.stores;
                      const nombreC = arrRes.map((user) => `${user.nombre} ${user.aPaterno}`).join(', ');
                      objChats.idChat = key;
                      objChats.nombreC = nombreC;
                      objChats.primeraLetra = nombreC[0];
                      objChats.color = generarColorPorNombre(nombreC);
                      if(objChats.id_usuario_ultimo_mensaje != null){
                        const userData2 = await GetDataUser2(objChats.id_usuario_ultimo_mensaje);
                          if(userData2.status) {
                              //setDataUsers(result.data);
                              const arrRes2 = userData2.stores;
                              const nombreB = arrRes2.map((user) => `${user.nombre}`).join(', ');
                              objChats.nombreB = nombreB;
                          }
                      }
                    }
                      return objChats;
                  }));
                  var chatId = objSocket.idChat;
                  arrChatList.sort((a, b) => new Date(b.fecha_ultimo_mensaje) - new Date(a.fecha_ultimo_mensaje));
                  var arrNew = arrChatList.filter(chat => chat.idChat == chatId);
                    //TODO AQUI SE ENVIA NOTI
                    console.log(objSocket);
                    console.log('socket de privado sidebar................')
                    var nav = props.navigation.getState();
                    console.log(nav.index)
                    console.log(props.state.routes.findIndex((e) => e.name === "Messenger"));
                    if(nav.index === props.state.routes.findIndex((e) => e.name === "Messenger") || nav.index === props.state.routes.findIndex((e) => e.name === "Chat")){
                      console.log('estas en la ventana vv')
                    }else{
                      console.log('no estas notificar')
                      if(objSocket.mensaje != ""){
                        setDataNewNotification({
                          id_notification: generateUniqueId(),
                          title: `${objSocket.nombreCreador} te envió un mensaje`,
                          message: objSocket.mensaje,
                          showIcon: true,
                          iconBackgroundColor: Palette.colors.info400,
                          iconName: 'message1',
                          iconColor: '#fff',
                          iconSize: 24,
                          navigationAble: true,
                          type: 'chat',
                          objeto:arrNew[0],
                        });
                      }else{
                        setDataNewNotification({
                          id_notification: generateUniqueId(),
                          title: `${objSocket.nombreCreador}`,
                          message: 'Te ha enviado un archivo',
                          showIcon: true,
                          iconBackgroundColor: Palette.colors.info400,
                          iconName: 'message1',
                          iconColor: '#fff',
                          iconSize: 24,
                          navigationAble: true,
                          type: 'chat',
                          objeto:arrNew[0],
                        });                  
                      }
                    }
                    //TODO FIN ENVIO DE NOTI
              } catch (error) {
                console.error('Hubo un problema con la operación fetch:', error);
              }
              //TODO FIN DATOOOOS
            }
            }
          });
    // Cada que se quiera mostrar una notificación se deberá de agregar al state (dataNewNotification)
    // Este ejemplo tiene todas las propiedades, pero pueden variar dependiendo de la necesidad
    // de la notificación (Ver mapeo de propiedades en archivo NotificationCard.js)
    // setDataNewNotification({
    //   id_notification: generateUniqueId(),
    //   title: `Alessandro Guevara te envió un mensaje con muchos caracteres`,
    //   message: `Este es un mensaje de prueba con muchos más caracteres para que se haga más grande ${Math.trunc(Math.random() * 10000)}`,
    //   titleColor: '#fff',
    //   messageColor: '#fff',   
    //   notificationBackgroundColor: '#f8f8f8',
    //   showIcon: true,
    //   iconBackgroundColor: '#29A419',
    //   iconName: 'message1',
    //   iconColor: '#fff',
    //   iconSize: 24,
    //   navigationAble: true,
    //   notificationPosition: 'bottom',
    //   type: 'actionsPlan',
    // });
  }, []);
  
  return (
    <ImageBackground
      source={Images.gradient}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Componente para notificación/alert que se pueden apilar */}
      {Platform.OS === 'android' && (
        <InAppNotification newNotification={dataNewNotification} /> 
      )}
      
      <View
        style={{
          flex: 1,
        }}
      >
        <View style={{ marginLeft: ((width/1.5)), alignContent: 'center', alignSelf: 'center', display: showProgressDialog === true ? 'flex' : 'none',}}>
          <ProgressDialog mostrar={showProgressDialog}/>

        </View>
        
        <View
          style={{
            width: 120,
            height: 120,
            marginTop: 30,
            alignSelf: "center",
            borderRadius: 360,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 55,
          }}
        >

          <Image
            source={Images.logoAsturiano}
            style={{ width: 120, height: 120, alignSelf: "center" }}
          />
          
        </View>
        <DrawerContentScrollView {...props}>
          
          <View style={{ width: "100%", marginBottom: 25 }}>
            <Text
              style={{
                alignSelf: "center",
                textAlign: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {nombre} {aPaterno} {aMaterno}
            </Text>
            <Text
              style={{
                alignSelf: "center",
                textAlign: "center",
                color: "#fff",
                display: puesto == 100 ? "flex" : "none",
              }}
            >
              Desarrollo de software
            </Text>
          </View>
          {/* INICIO */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <Entypo name="home" size={24} color={Palette.colors.white} />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex((e) => e.name === "Inicio")
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>Inicio</Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              navigation.navigate("Inicio", {
                usuario: props.usuario,
              });
            }}
          />
          {/* INICIO */}
          {/* MESSENGER */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <Ionicons name="chatbubble-ellipses" size={24} color={Palette.colors.white} />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex((e) => e.name === "Messenger")
            }
            label={({ focused, color }) => (
              <View style={{flexDirection:'row'}}>
                <Text style={{ color: Palette.colors.white }}>SRI Messenger</Text>
                {sinver > 0 ?(
                  <View style={{backgroundColor:Palette.colors.success600,marginLeft:15,borderRadius:10,paddingHorizontal:10}}>
                    <Text style={{color:'white',fontWeight:'bold'}}>{sinver}</Text>
                  </View>
                ):(
                  <></>
                )}
              </View>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              props.navigation.navigate("Messenger", {
                usuario: props.usuario,
              });
            }}
          />
          {/* MESSENGER */}
          {/* EVALUACIONES */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <Entypo name="book" size={24} color={Palette.colors.white} />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex((e) => e.name === "Evaluaciones")
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>Evaluaciones</Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              props.navigation.navigate("Evaluaciones", {
                usuario: props.usuario,
              });
            }}
          />
          {/* EVALUACIONES */}
          {/* HISTORICO EVALUACIONES */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <MaterialCommunityIcons
                name="history"
                size={24}
                color={Palette.colors.white}
              />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex(
                (e) => e.name === "HistoricoEvaluaciones"
              )
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>
                Historico evaluaciones
              </Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              props.navigation.navigate("HistoricoEvaluaciones", {
                usuario: props.usuario,
              });
            }}
          />
          {/* HISTORICO EVALUACIONES */}

          {/* AGENDA DE VISITA */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <Ionicons
                name="calendar-sharp"
                size={24}
                color={Palette.colors.white}
              />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex(
                (e) => e.name === "AgendaVisita"
              )
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>
                Agenda de visita
              </Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              props.navigation.navigate("AgendaVisita", {
                usuario: props.usuario,
              });
            }}
          />
          {/* AGENDA DE VISITA */}

          {/* DESVIACIONES OPERATIVAS */}
          <DrawerItem
            icon={({ focused, color, size }) => (

              <Entypo name="new" size={24} color={Palette.colors.white} />

            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex(
                (e) => e.name === "DesviacionesOperativas"
              )
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>
                Desviaciones operativas
              </Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              set_source("Sidebar");
              props.navigation.navigate("DesviacionesOperativas", {
                // usuario: props.usuario, >> Quitamos esta prop porque no la utilizamos
                openNotification: false,
                idToOpen: 0,
              });
            }}
          />
          {/* DESVIACIONES OPERATIVAS */}

          {/* PLANES ACCION */}
          <DrawerItem
            icon={({ focused, color, size }) => (

              <MaterialCommunityIcons name="message-draw" size={24} color={Palette.colors.white}  />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex(
                (e) => e.name === "PlanesAccion"
              )
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>
                Planes de acción
              </Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              props.navigation.navigate("PlanesAccion", {
                // usuario: props.usuario,
                openNotification: false,
                idToOpen: 0,
              });
            }}
          />
          {/* PLANES ACCION */}

          {/* CÍCLICOS */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <MaterialCommunityIcons name="typewriter" size={24} color={Palette.colors.white} />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex(
                (e) => e.name === "Ciclicos"
              )
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>
                Cíclicos
              </Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              props.navigation.navigate("Ciclicos", {
                usuario: props.usuario,
              });
            }}
          />
          {/* CÍCLICOS */}

          {/* CONFIGURACION */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <FontAwesome name="gear" size={24} color={Palette.colors.white} />
            )}
            
            label={({ focused, color }) => (
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 0.9}}>
                  <Text style={{color: Palette.colors.white}}>Configuración</Text>
                </View>
                <View style={{flex: 0.1}}>
                 <MaterialIcons style={{display: submenuConfiguration ? 'none' : 'flex'}} name="arrow-drop-down" size={24} color={Palette.colors.white} />
                  <MaterialIcons style={{display: submenuConfiguration ? 'flex' : 'none'}} name="arrow-drop-up" size={24} color={Palette.colors.white} />
                </View>

              </View>

            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              setSubmenuConfiguration(!submenuConfiguration);

            }}
          />

          <View style={{display: submenuConfiguration ? 'flex' : 'none'}}>

            <DrawerItem
              icon={({ focused, color, size }) => (
                <MaterialIcons name="system-update" size={24} color={Palette.colors.white}  />
              )}
              focused={
                props.state.index ===
                props.state.routes.findIndex(
                  (e) => e.name === "ConfigurationUpdates"
                )
              }
              label={({ focused, color }) => (
                <Text style={{color: Palette.colors.white}}>Actualizaciones</Text>

              )}
              activeTintColor={Palette.colors.white}
              activeBackgroundColor={"rgba(255,255,255,0.3)"}
              onPress={() => {
                props.navigation.navigate("ConfigurationUpdates", {
                  usuario: props.usuario,
                });
              }}
              style={{marginLeft: 50}}
            />

            <DrawerItem
              icon={({ focused, color, size }) => (
                <Entypo name="upload-to-cloud" size={24} color={Palette.colors.white} />
              )}
              focused={
                props.state.index ===
                props.state.routes.findIndex(
                  (e) => e.name === "ConfigurationSyncIgnoreEvaluations"
                )
              }
              label={({ focused, color }) => (
                <Text style={{color: Palette.colors.white}}>Sincronización</Text>
              )}
              activeTintColor={Palette.colors.white}
              activeBackgroundColor={"rgba(255,255,255,0.3)"}
              onPress={() => {
                props.navigation.navigate("ConfigurationSyncIgnoreEvaluations", {
                  usuario: props.usuario,
                });
              }}
              style={{marginLeft: 50}}
            />

            <DrawerItem
              icon={({ focused, color, size }) => (
                <Entypo name="camera" size={24} color={Palette.colors.white} />
              )}
              focused={
                props.state.index ===
                props.state.routes.findIndex(
                  (e) => e.name === "ConfigurationCamera"
                )
              }
              label={({ focused, color }) => (
                <Text style={{color: Palette.colors.white}}>Cámara</Text>
              )}
              activeTintColor={Palette.colors.white}
              activeBackgroundColor={"rgba(255,255,255,0.3)"}
              onPress={() => {
                props.navigation.navigate("ConfigurationCamera", {
                  usuario: props.usuario,
                });
              }}
              style={{marginLeft: 50}}
            />
          </View>
          
          {/* CONFIGURACION */}

          {/* POLITICAS */}
          <DrawerItem
            icon={({ focused, color, size }) => (
              <MaterialCommunityIcons
                name="shield-lock"
                size={24}
                color={Palette.colors.white}
              />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex((e) => e.name === "Politicas")
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>
                Aviso de privacidad
              </Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={"rgba(255,255,255,0.3)"}
            onPress={() => {
              Linking.openURL("http://allsafe.mx/zimple/privacy-policy");
            }}
          />
          {/* POLITICAS */}

          {/* TEST */}
          {/* <DrawerItem
            icon={({ focused, color, size }) => (
              <MaterialCommunityIcons
                name='test-tube'
                size={24}
                color={Palette.colors.white}
              />
            )}
            focused={
              props.state.index ===
              props.state.routes.findIndex((e) => e.name === 'Test')
            }
            label={({ focused, color }) => (
              <Text style={{ color: Palette.colors.white }}>Test</Text>
            )}
            activeTintColor={Palette.colors.white}
            activeBackgroundColor={'rgba(255,255,255,0.3)'}
            onPress={() => {
              props.navigation.navigate('Test', {
                usuario: props.usuario,
              });
            }}
          /> */}
          {/* TEST */}
          {/* LOGOUT */}
        </DrawerContentScrollView>
        <View
          style={{
            // marginTop: height > 800 ? height * 0.46 : height * 0.35,
            height: 0.5,
            backgroundColor: Palette.colors.white,
          }}
        />
        <DrawerItem
          icon={({ focused, color, size }) => (
            <MaterialIcons
              name="logout"
              size={24}
              color={Palette.colors.white}
            />
          )}
          focused={
            props.state.index ===
            props.state.routes.findIndex((e) => e.name === "Logout")
          }
          label={({ focused, color }) => (
            <Text style={{ color: Palette.colors.white }}>Cerrar sesión</Text>
          )}
          activeTintColor={Palette.colors.white}
          activeBackgroundColor={"rgba(255,255,255,0.3)"}
          onPress={() => {
            props.navigation.navigate("Logout", {
              usuario: props.usuario,
            });
          }}
        />
        {/* LOGOUT */}
        <Caption style={{bottom: 2, margin: 0, marginTop: -8, left: 19, fontSize: 12, color: "#f9f9f9" }}>
          Versión {app_version}
        </Caption>
      </View>
      <AlertCustom
        show={paramsAlertCustom.show}
        type={paramsAlertCustom.type}
        title={paramsAlertCustom.title}
        message={paramsAlertCustom.message}
        firstButtonText={paramsAlertCustom.firstButtonText}
        secondButtonAble={paramsAlertCustom.secondButtonAble}
        secondButtonText={paramsAlertCustom.secondButtonText}
        widthModal={paramsAlertCustom.widthModal}
        heightModal={height > 800 ? "40%" : "50%"}
        showButtonExtra={paramsAlertCustom.showButtonExtra}
        messageButtonExtra={paramsAlertCustom.messageButtonExtra}
        extraAction={paramsAlertCustom.extraAction}
        parentCallbackClose={(val) => {
            setParamsAlertCustom({ ...paramsAlertCustom, show: false });
        }}
        parentCallbackFirstButton={(val) => {
            switch (paramsAlertCustom.action) {
            case "warning":

                break;
            case "close":
                setParamsAlertCustom({
                ...paramsAlertCustom,
                show: false,
                });
                break;
            case "updateEstatusVisita":
                setParamsAlertCustom({
                    ...paramsAlertCustom,
                    show: false,
                });
                console.log("PASA");
                updateEstatusVisita();
                break;
            case "markEntry":
                setParamsAlertCustom({
                    ...paramsAlertCustom,
                    show: false,
                });
                setShowProgressDialog(true);

                // MarkExitVisit(isModeOffline).then((result) => {
                //   console.log("RESULT SALIDA: "+result);
                //   if(result === true || result === "true") {
                //     let objResp = {
                //       status: false,
                //     };
                //     props.changeIsVisitActive(objResp);
                //     set_is_visit_active(false);
                //     set_store_visiting("");
                //     set_store_flag("");

                //     setParamsAlertCustom({
                //       ...paramsAlertCustom,
                //       show: true,
                //       type: "info",
                //       action: "close",
                //       title: "Salida registrada",
                //       message: "La salida se registró correctamente.",
                //       firstButtonText: "Aceptar",
                //       secondButtonAble: false,
                //       showButtonExtra: false,
                //       widthModal: "90%",
                //     });
                //     props.navigation.navigate("AgendaVisita", {
                //         usuario: props.usuario,
                //         retorno: true,
                //     });
                //   }else if(result === 'MoreThanOne') {
                //     props.navigation.navigate("AgendaVisita", {
                //         usuario: props.usuario,
                //         retorno: true,
                //     });
                //   }else {
                //     setParamsAlertCustom({
                //       ...paramsAlertCustom,
                //       show: true,
                //       type: "error",
                //       action: "close",
                //       title: "Error al registrar salida",
                //       message: "Parece que hubo algún problema al registrar la salida. Intentalo de nuevo.",
                //       firstButtonText: "Aceptar",
                //       secondButtonAble: false,
                //       showButtonExtra: false,
                //       widthModal: "90%",
                //     });
                //   }
                //   setShowProgressDialog(false);
                // })
                break;
            }
        }}
        parentCallbackSecondButton={(val) => {
            switch (paramsAlertCustom.action2) {
            case "close":
                setParamsAlertCustom({
                ...paramsAlertCustom,
                show: false,
                });
                break;
            }
        }}
        parentCallbackExtraButton={async (val) => {
            switch(paramsAlertCustom.extraAction) {
                case "shareLocation":
                setParamsAlertCustom({
                  ...paramsAlertCustom,
                  show: false,
                });
                setShowProgressDialog(true);
                await sendCurrentLocation(idLocationStore.current).then((result) => {
                    if(result) {
                        setParamsAlertCustom({
                            ...paramsAlertCustom,
                            show: true,
                            type: "success",
                            action: "close",
                            title: "Ubicación enviada",
                            message: "Comunícate con sistemas para que validen la ubicación.",
                            firstButtonText: "Aceptar",
                            secondButtonAble: false,
                            widthModal: "85%",
                            showButtonExtra: false,
                        });
                    }else {
                        setParamsAlertCustom({
                            ...paramsAlertCustom,
                            show: true,
                            type: "error",
                            action: "close",
                            title: "Error al guardar",
                            message: "Ocurrió un error al guardar la ubicación. Inténtalo de nuevo.",
                            firstButtonText: "Aceptar",
                            secondButtonAble: false,
                            widthModal: "85%",
                            showButtonExtra: false,
                        });
                    }
                })
                setShowProgressDialog(false);
                break;
            }
        }}
        
    />

    <View
      style={{
        display: "flex",
        position: "absolute"
      }}
    >
      <Modal
        animationType="fade"
        hardwareAccelerated={false}
        transparent={true}
        visible={false}
        style={{ backgroundColor: Palette.colors.danger }}
        onRequestClose={() => parentCallbackClose(false)}
        statusBarTranslucent
      >
        <View style={style.modalContainer2}>
          <View
            style={{
              backgroundColor: Palette.colors.white,
              width: "80%",
              height: "40%",
              borderRadius: 8,
            }}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                padding: 0,
                justifyContent: "space-between",
              }}
            >
              {/* _____ ICONO _____ */}
              <IconButton
                icon={
                    "information"
                }
                color={
                    
                  Palette.colors.danger600
                }
                size={80}
                style={{ alignSelf: "center" }}
              />
              {/* _____ ICONO _____ */}

              {/* _____ TITULO _____ */}
              
              {/* _____ TITULO _____ */}

              {/* _____ MESSAGE _____ */}
              <Paragraph
                style={{
                  marginTop: 15,
                  textAlign: "center",
                  alignSelf: "center",
                }}
              >
                No te encuentras cerca de la tienda. Acercate a un rango de 50m para poder continuar.
                
              </Paragraph>
              <View 
                style={{justifyContent: "center", alignItems: "center"}}
              >
                <CountdownCircleTimer
                  isPlaying={isPlaying}
                  duration={20}
                  colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                  onComplete={() => ({ shouldRepeat: true, delay: 2 })}
                  colorsTime={[7, 5, 2, 0]}
                >
                  {({ remainingTime }) => (
                    <>
                      <Text>Te restan </Text>
                      <Text style={{fontSize: 40}}>{remainingTime}</Text>
                      <Text>segundos</Text>
                    </>
                  )}
                </CountdownCircleTimer>
              </View>
              
              {/* _____ MESSAGE _____ */}

              {/* _____ BOTONES _____ */}
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "center",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                {/*<Button
                  mode="contained"
                  color={
                    Palette.colors.info600
                  }
                  onPress={() => parentCallbackFirstButton(false)}
                  style={{
                    borderWidth: 1,
                    marginHorizontal: 5,
                    width: "45%",
                  }}
                >
                  TEXT1
                </Button>*/}    
              </View>
              {/* _____ BOTONES _____ */}
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imgView: {
    width: width + 8,
    height: width,
    backgroundColor: Palette.colors.info,
    borderBottomRightRadius: 110,
  },
  img: {
    width: width,
    height: width - 3,
    borderBottomRightRadius: 120,
  },
  titulo: {
    position: "absolute",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: width * 0.6,
    color: Palette.colors.white,
    padding: 10,
  },
  btnIniciar: {
    zIndex: 100,
    marginTop: -25,
    width: width - 180,
    paddingTop: 18,
    paddingBottom: 18,
    width: 260,
    alignSelf: "flex-start",
  },
  body: {
    marginTop: 20,
    padding: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTextTitle: {
    fontSize: 24,
    color: Palette.colors.black,
    marginTop: 20,
    textAlign: "center",
  },
  modalText: {
    marginTop: 15,
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
export default Sidebar;
