/*=========================================================================================
File Name: Login.js
Description: Primer screen que ve el usuario para iniciar sesion
--------------------------------------------------------------------------------------
Item Name: AEM Retail App - Login
Author: Brandon Jelday Guevara Silva
Author URL: Brandon Jelday Guevara Silva
========================================================================================== */

import React, { useState, useEffect } from "react";
import {
  View,
  ImageBackground,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Palette from "../../constants/Palette";
import { Input } from "galio-framework";
import JWT from "expo-jwt";
import base64 from "react-native-base64";
import * as SecureStore from "expo-secure-store";
import API from "../../constants/API";
import NetInfo from "@react-native-community/netinfo";
import { FontAwesome5, Feather} from "@expo/vector-icons";
import {
  Snackbar as SnackbarPaper,
  Button as ButtonPaper,
} from "react-native-paper";
import * as FileSystem from "expo-file-system";
// import { OneSignal } from "react-native-onesignal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import AlertMessage from "../../components/InApp/AlertMessage";

const key = "ZimpleDevs";

// DIMENSION DE LA PANTALLA --- --- --- --- ---
const { width, height } = Dimensions.get("screen");
// DIMENSION DE LA PANTALLA --- --- --- --- ---



const Login = (props) => {
  /**
  |--------------------------------------------------
  | VARIABLES DE ESTADO
  |--------------------------------------------------
  */
  // DATOS DEL USUARIO
  const [token, setToken] = useState([]);

  // VALORES DE INPUTS
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  // VALIADACIONES
  const [usuarioValidation, setUsuarioValidation] = useState(true);
  const [contrasenaValidation, setContrasenaValidation] = useState(true);
  const [snackError, setSnackError] = useState(false);
  const [alertConfig, setAlertConfig] = useState({})

  // Variable de snackbar sin conexion
  const [snackConnected, setSnackConnected] = useState(false);

  // Variable de boton
  const [botonIniciar, setBotonIniciar] = useState(false);

  // Variables props
  const sessionMessage =
    props.route.params != undefined ? props.route.params.sessionMessage : "";
  /**
  |--------------------------------------------------
  | VARIABLES DE ESTADO
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | VALIDAR LOGIN: valida los campos de usuario, pass y redirecciona
  |--------------------------------------------------
  */
  const validaLogin = async () => {
    if (usuario.length == 0) {
      setUsuario("");
      setUsuarioValidation(false);
      return;
    } else {
      setUsuarioValidation(true);
    }

    if (contrasena.length == 0) {
      setContrasena("");
      setContrasenaValidation(false);
      return;
    } else {
      setContrasenaValidation(true);
    }

    // SI LOS CAMPOS SON VALIDOS

    setBotonIniciar(true);

    //Comprobamos conexion a internet del usuario
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log("online: ");
        goLogin(usuario, contrasena);
      } else {
        console.log("offline: ");
        setSnackConnected(true);
        setBotonIniciar(false);
      }
    });
  };
  /**
  |--------------------------------------------------
  | VALIDAR LOGIN: valida los campos de usuario, pass y redirecciona
  |--------------------------------------------------
  */

  /**
   * Función para registrar id de usuario en OneSignal
   * @date 11/15/2023 - 12:47:57 PM
   * @author Alessandro Guevara
   **/
  const registerUserInOneSignal = async (id_user) => {
    try {
      // Importar OneSignal solo cuando la aplicación no se ejecuta desde expo
      if(Constants.appOwnership !== "expo") {
        var { OneSignal } = await import('react-native-onesignal');
        OneSignal.login(id_user+"");
      }
    } catch (error) {
      console.log('error register onesignal')
      console.log(error)
    }
  }

  /**
  |--------------------------------------------------
  | LOGIN: valida que el usuario y pass coincidan en la DB
  |--------------------------------------------------
  */
  const goLogin = async (usuario, contrasena) => {
    try {
      let usuarioEncode = base64.encode(usuario);
      let contrasenaEncode = base64.encode(contrasena);

      const api = API.apiUrl.concat("login", "/", usuarioEncode, "/", contrasenaEncode);
      const apiNotis = API.apiNotis.concat("login");

      const response = await fetch(api);
      const json = await response.json();

      
      setToken(json);

      if (json == "403") {
        // 403 Forbidden El cliente no posee los permisos necesarios para cierto contenido, por lo que el servidor está rechazando otorgar una respuesta apropiada.
        setAlertConfig({
          text: "Este usuario no posee los permisos necesarios para acceder a la aplicación", 
          type: "error",
          animationsDuration: 400,
          alertDuration: 5000,
          position: "bottom"
        })
        setBotonIniciar(false);
      } else if (json == "404") {
        //404 Not Found El servidor no pudo encontrar el contenido solicitado
        setAlertConfig({
          text: "El usuario o la contraseña son incorrectos", 
          type: "error",
          animationsDuration: 400,
          alertDuration: 5000,
          position: "bottom"
        })
        setBotonIniciar(false);
      } else if (json == "500") {
        //500 Internal Server Error El servidor ha encontrado una situación que no sabe cómo manejarla
        setAlertConfig({
          text: "¡Oh no! Ocurrió un error al iniciar sesión", 
          type: "error",
          animationsDuration: 400,
          alertDuration: 5000,
          position: "bottom"
        })
        setBotonIniciar(false);
      } else {
        // DECODIFICAMOS TOKEN Y REDIRIGIMOS
        try {


          try {
          
            // Iniciamos sesion para obtener token para enviar datos a tabla de notificaciones AEMRETAIL
            //! De momento no estan todos los usuarios registrados para hacer login en la API
            //! Se pondra un usuario y password global para poder realizarlo
            const dataUser = {
              usuario: 'alessandro.silva',
              password: '310822asilva'
            }
      
            const optionsNotis = {
              method: "POST",
              body: JSON.stringify(dataUser),
              headers: {
                  "Accept": "*/*",
                  "content-type": "application/json",
              },
            }

            let tokenNotifications = "";
            const responseLoginNotis = await fetch(apiNotis, optionsNotis);
            if(responseLoginNotis.ok) {
              const jsonNotis = await responseLoginNotis.json();
              if(jsonNotis.token !== undefined) {
                tokenNotifications = jsonNotis.token;
              }
            }else {
              console.log('error login in notifications AEMRETAIL');
              console.log(responseLoginNotis.statusText);
            }
            
            if(tokenNotifications === "") {
              setAlertConfig({
                text: "Error al obtener token de notificaciones", 
                type: "error",
                animationsDuration: 400,
                alertDuration: 5000,
                position: "bottom"
              })
              setBotonIniciar(false);
            }

            try {
              await AsyncStorage.setItem('tokenNotifications', tokenNotifications);
            } catch (error) {
              console.log("Error al guardar token de notificaciones");
              console.log(error);
              setAlertConfig({
                text: "Error al guardar token de notificaciones", 
                type: "error",
                animationsDuration: 400,
                alertDuration: 5000,
                position: "bottom"
              })
              setBotonIniciar(false);
            }
          } catch (error) {
            console.log("ERROR AL AUTENTICAR EN API")
            console.log(error)
            setAlertConfig({
              text: error.message, 
              type: "error",
              animationsDuration: 400,
              alertDuration: 5000,
              position: "bottom"
            })
            setBotonIniciar(false);
          }

          const userData = JWT.decode(json, key);

          let fileUri = FileSystem.documentDirectory + "tokenAEMAPP.txt";
          const jsonValue = json;
          await FileSystem.writeAsStringAsync(fileUri, jsonValue, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          setBotonIniciar(false);

          // Registramos usuario en OneSignal, solo se registra cuando no esta en Expo
          registerUserInOneSignal(userData[0].id_usuario);

          setUsuario("");
          setContrasena("");

          props.navigation.navigate("Navigation", {
            usuario: userData,
          });
        } catch (error) {
          // if the token has expired the error here will be `TokenExpired`.
          // console.log(error);
          setAlertConfig({
            text: "Ocurrió un problema al obtener datos de usuario", 
            type: "error",
            animationsDuration: 400,
            alertDuration: 5000,
            position: "bottom"
          })
          setBotonIniciar(false);
        }
      }
    } catch (error) {
      // console.error(error);
      setAlertConfig({
        text: "¡Oh no! Ocurrió un error al iniciar sesión", 
        type: "error",
        animationsDuration: 400,
        alertDuration: 5000,
        position: "bottom"
      })
      setBotonIniciar(false);
    }
  };
  /**
  |--------------------------------------------------
  | LOGIN: valida que el usuario y pass coincidan en la DB
  |--------------------------------------------------
  */

  /**
  |--------------------------------------------------
  | VERIFICAR TOKEN: si hay un token activo accedemos
  |--------------------------------------------------
  */
  async function verificarToken() {
    // Leemos archivo de file system
    let fileUri = FileSystem.documentDirectory + "tokenAEMAPP.txt";
    try {
      var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (e) {
      var fileSystemValue = null;
    }

    //SI EXISTE TRATAMOS DE DECODIFICAR Y REDIRECCIONAR A INICIO
    if (fileSystemValue != null) {
      try {
        const userData = JWT.decode(fileSystemValue, key);

        // AMPLIAMOS LA SESION
        try {
          var usuario = base64.encode(userData[0]["usuario"]);
          var contrasena = base64.encode(userData[0]["contrasena"]);

          const api = API.apiUrl.concat("login", "/", usuario, "/", contrasena);

          const response = await fetch(api);
          const json = await response.json();

          if (json != "403" && json != "404" && json != "500") {
            await FileSystem.writeAsStringAsync(fileUri, json, {
              encoding: FileSystem.EncodingType.UTF8,
            });
            // alert("Sesión ampliada");
          }
        } catch (error) {
          // alert("Error al ampliar la sesión");
        }
        // AMPLIAMOS LA SESION

        setUsuario("");
        setContrasena("");

        // alert('Token valido y activo' + userData);

        props.navigation.navigate("Navigation", {
          usuario: userData,
        });
      } catch (error) {
        //SI EL TOKEN HA EXPIRADO O NO EXISTE REDIRECCIONAMOS AL LOGIN
        // alert('Token Expired');
        // console.log(error);
        // Alert.alert(
        //   "Datos de usuario",
        //   "SRI Móvil recoge, transmite, sincroniza y almacena la ubicación del dispositivo y datos locales para habilitar la función de sincronizar evaluaciones, mientras la aplicación esta en uso o en segundo plano.",
        //   [
        //     {
        //       text: "Aceptar",
        //     },
        //   ]
        // );
      }
    } else {
      // alert('No tokens stored under that key');
      // Alert.alert(
      //   "Datos de usuario",
      //   "SRI Móvil recoge, transmite, sincroniza y almacena la ubicación del dispositivo y datos locales para habilitar la función de sincronizar evaluaciones, mientras la aplicación esta en uso o en segundo plano.",
      //   [
      //     {
      //       text: "Aceptar",
      //     },
      //   ]
      // );
    }
  }
  /**
  |--------------------------------------------------
  | VERIFICAR TOKEN: si hay un token activo accedemos
  |--------------------------------------------------
  */


  const testData = async () => {
      let fileUri = FileSystem.documentDirectory + "fileSystemEvaluacionesDisponibles.txt";
      console.log("PRE ENTER READ");
      console.log("fileUri => ", fileUri);

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log("PASS GET FILE INFO ");
      console.log(fileInfo);
  }

  /**
  |--------------------------------------------------
  | USEEFFECTS
  |--------------------------------------------------
  */
  useEffect(() => {
    verificarToken();
    testData()
  }, []);
  /**
  |--------------------------------------------------
  | USEEFFECTS
  |--------------------------------------------------
  */

  return (
    <View>
      {/* SNACKBAR NO CONECCTION */}
      <SnackbarPaper
        visible={snackConnected}
        onDismiss={() => setSnackConnected(false)}
        style={{
          backgroundColor: Palette.colors.danger600,
          zIndex: 100,
          bottom: "1%",
        }}
        theme={{ colors: { accent: Palette.colors.white } }}
        duration={10000}
      >
        <Feather name="wifi-off" size={20} color={Palette.colors.white} />
        <Text style={{ fontSize: 15 }}>
          &nbsp;&nbsp;Iniciar sesión requiere conexión a internet
        </Text>
      </SnackbarPaper>
      {/* SNACKBAR NO CONECCTION */}
      <KeyboardAwareScrollView>
        <ImageBackground
          source={require("../../assets/images/gradient.png")}
          style={{ width, height }}
        >
          <View style={styles.contenedor}>
            <View style={{
                ...styles.contenedorBlanco,
                height: height > 812 ? height * (Platform.OS === 'ios' ? 0.74 : 0.7) : height * 0.75
              }}
            >
              {/* Imagen */}
              <View style={styles.contenedorImg}>
                <Image
                  source={require("../../assets/images/logoAsturiano.png")}
                  style={styles.LogoLogin}
                />
              </View>
              {/* Imagen */}

              <View style={styles.bodyLogin}>
                <Text style={styles.AEM}>
                  Administración de empresas al menudeo S.A de C.V
                </Text>
                {sessionMessage == "" && (
                  <Text style={styles.mensajeBienvenida}>
                    ¡Bienvenido de nuevo!
                  </Text>
                )}

                {/* SI EXISTE LA PROP MOSTRAMOS MENSAJE */}
                {sessionMessage != "" && (
                  <Text
                    style={{
                      ...styles.mensajeBienvenida,
                      color: Palette.colors.danger600,
                      fontSize: 15,
                    }}
                  >
                    {sessionMessage}
                  </Text>
                )}

                {/* USUARIO */}
                <Input
                  placeholder="Usuario"
                  placeholderTextColor={Palette.colors.input}
                  onChangeText={(val) => setUsuario(val)}
                  value={usuario}
                  style={{
                    borderColor: usuarioValidation
                      ? Palette.colors.input
                      : Palette.colors.danger,
                    width: "96%",
                    alignSelf: "center",
                    marginTop: 30,
                  }}
                  iconContent={
                    <FontAwesome5
                      name="user-alt"
                      size={16}
                      color={
                        usuarioValidation
                          ? Palette.colors.input
                          : Palette.colors.danger
                      }
                      style={styles.inputIcons}
                    />
                  }
                />
                <Text
                  size={12}
                  style={{
                    display: usuarioValidation ? "none" : "flex",
                    width: "95%",
                    alignSelf: "center",
                    color: Palette.colors.danger,
                  }}
                >
                  * Debes de ingresar un usuario
                </Text>
                {/* USUARIO */}
                {/* CONTRASEÑA */}
                <Input
                  password
                  autoCorrect={false}
                  placeholder="Contraseña"
                  placeholderTextColor={Palette.colors.input}
                  onChangeText={(val) => setContrasena(val)}
                  value={contrasena}
                  style={{
                    borderColor: contrasenaValidation
                      ? Palette.colors.input
                      : Palette.colors.danger,
                    width: "95%",
                    alignSelf: "center",
                    marginTop: 10,
                  }}
                  iconContent={
                    <FontAwesome5
                      name="lock"
                      size={16}
                      color={
                        contrasenaValidation
                          ? Palette.colors.input
                          : Palette.colors.danger
                      }
                      style={styles.inputIcons}
                    />
                  }
                />
                <Text
                  size={12}
                  style={{
                    display: contrasenaValidation ? "none" : "flex",
                    width: "95%",
                    alignSelf: "center",
                    color: Palette.colors.danger,
                  }}
                >
                  * Debes de ingresar una contraseña
                </Text>
                {/* CONTRASEÑA */}

                {/* <Button
                  color={Palette.colors.danger}
                  style={{ width: '95%', alignSelf: 'center', marginTop: 40 }}
                  onPress={() => {
                    validaLogin();
                  }}
                >
                  Iniciar sesión
                </Button> */}

                <ButtonPaper
                  mode="contained"
                  icon="arrow-right"
                  color={Palette.colors.danger600}
                  loading={botonIniciar}
                  disabled={botonIniciar}
                  onPress={() => {
                    validaLogin();
                  }}
                  style={{
                    marginTop: width < 350 ? 10 : 30,
                    padding: 2,
                    width: "95%",
                    alignSelf: "center",
                  }}
                  contentStyle={{ flexDirection: "row-reverse" }}
                >
                  Iniciar sesión
                </ButtonPaper>

                <ButtonPaper
                  mode="contained"
                  icon="barcode-scan"
                  color={'#523D8F'}
                  loading={false}
                  disabled={false}
                  onPress={() => {
                    props.navigation.navigate("ScannerQR", {
                    });
                  }}
                  style={{
                    marginTop: width < 350 ? 10 : 30,
                    padding: 2,
                    width: "95%",
                    alignSelf: "center",
                  }}
                  contentStyle={{ flexDirection: "row-reverse" }}
                >
                  Iniciar sesión con código QR
                </ButtonPaper>

                <ButtonPaper
                  mode="text"
                  icon="help-circle-outline"
                  color={'#523D8F'}
                  loading={false}
                  disabled={false}
                  onPress={() => {
                    props.navigation.navigate("TutorialQrCode", {
                    });
                  }}
                  style={{
                    marginTop: 10,
                    padding: 2,
                    width: "95%",
                    alignSelf: "center",
                  }}
                  contentStyle={{ flexDirection: "row-reverse" }}
                >
                  Cómo obtener código QR
                </ButtonPaper>

                {Platform.OS === "ios" && (
                  <ButtonPaper
                    mode="text"
                    icon="account-plus"
                    color={'#523D8F'}
                    loading={false}
                    disabled={false}
                    onPress={() => {
                        props.navigation.navigate("CreateAccountWV", {
                      });
                    }}
                    style={{
                      marginTop: 10,
                      padding: 2,
                      width: "95%",
                      alignSelf: "center",
                    }}
                    contentStyle={{ flexDirection: "row-reverse" }}
                  >
                    Crear cuenta
                  </ButtonPaper>
                )}

              </View>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAwareScrollView>
      
      <AlertMessage config={alertConfig} />
    </View>
  );
};

// ESTILOS DE LA SCREEN --- --- --- --- ---

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
  },
  contenedorBlanco: {
    backgroundColor: "#F4F5F7",
    width: width * 0.9,
    height: height > 812 ? height * 0.7 : height * 0.75,
    marginTop: height > 812 ? height * 0.18 : height * 0.18,
    padding: 3,
    borderRadius: 20,
    shadowColor: Palette.colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  contenedorImg: {
    position: "relative",
    marginTop: -80,
  },
  LogoLogin: {
    width: height * 0.22,
    height: height * 0.22,
    zIndex: 1,
    borderWidth: 10,
    borderColor: "#F4F5F7",
    borderRadius: 360,
    alignSelf: "center",
  },
  bodyLogin: {
    flex: 1,
  },
  AEM: {
    fontSize: 20,
    textAlign: "center",
  },
  mensajeBienvenida: {
    fontSize: 20,
    color: Palette.colors.info,
    textAlign: "center",
    marginTop: 20,
  },
  textInput: {
    fontSize: 18,
    alignSelf: "center",
    borderRadius: 10,
    padding: 8,
    borderColor: Palette.colors.grey,
    borderWidth: 1,
    width: "95%",
    marginTop: 50,
  },
  inputIcons: {
    marginRight: 12,
  },
});

// ESTILOS DE LA SCREEN --- --- --- --- ---
export default Login;
