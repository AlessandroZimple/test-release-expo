import * as SQLite from "expo-sqlite/legacy";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { addHours, format, subDays, subHours, subMinutes } from "date-fns";
import API from "../constants/API";
import { id_user, level_precision, perfil_user } from "../constants/global";
import AsyncStorage from "@react-native-async-storage/async-storage";
const db = SQLite.openDatabase("localDataAstu.db");

/**
|--------------------------------------------------
| DISTANCIA: funciones para calcular la distancia entre dos coordenadas
|--------------------------------------------------
*/

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
/**
 |--------------------------------------------------
| DISTANCIA: funciones para calcular la distancia entre dos coordenadas
|--------------------------------------------------
*/

export const GetLocationStores = async () => {
  console.log("AQUI LOCATIONS");

  return new Promise(async (resolve) => {
    // DECLARAMOS NOMBRE CON LA RUTA DEL ARCHIVO LOCAL
    let fileUri = FileSystem.documentDirectory + "fileSystemEvaluados.txt";

    try {
      //LEEMOS EL ARCHIVO
      var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      //SI RECIBIMOS ALGO LO PARSEAMOS A JSON
      fileSystemValue =
        fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
    } catch (err) {
      console.log("ERROR ->");
      console.log(err);
      fileSystemValue = null;
    }

    var objLocations = new Object();

    //RECORREMOS TODOS LOS ITEMS DEL ARRAY MAPEANDOLOS
    fileSystemValue.map((item) => {
      //CUANDO SEA PERFIL DE TIENDA LO AGREGAMOS AL ARRAY
      if (item.Lon != null && item.Lat != null) {
        objLocations = {
          ...objLocations,
          [item.nombre]: {
            latitude: item.Lat,
            longitude: item.Lon,
          },
        };
      }
    });

    resolve(objLocations);
  });
};

export const getUsersAuxiliares = async (id_tienda) => {
  //? Esta funcion nos permitira recuperar los usuarios auxiliares
  //? desde los archivos del celular

  let fileUri =
    FileSystem.documentDirectory + "fileSystemUsuariosAuxiliares.txt";

  var { exists } = await FileSystem.getInfoAsync(fileUri);
  var arrayUsers = [];
  if (exists) {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    fileSystemValue = JSON.parse(fileSystemValue);
    //console.log(fileSystemValue);

    let filterUsers = fileSystemValue.filter(
      (user) => user.tiendas.includes(id_tienda)
    );

    filterUsers.map((item) => {
      const regexTest = /^T\d+$/;
      const firstNameUser = item.nameUser.split(" ")[0];
      let typeUser = "";
      // Validaremos si el primer nombre corresponde al de una tienda
      if (regexTest.test(firstNameUser)) {
        typeUser = "store";
      } else {
        typeUser = "normal";
      }
      arrayUsers.push({
        id: item.id_usuario,
        label: item.nameUser,
        value: item.id_usuario,
        typeUser: typeUser,
      });
    });
    //console.log(arrayUsers);
    const res = {
      estatus: true,
      data: arrayUsers,
    };
    return new Promise(async (resolve, reject) => {
      resolve(res);
    });
  } else {
    return new Promise(async (resolve, reject) => {
      const res = {
        estatus: false,
      };
      resolve(res);
    });
  }
};

/**
 * Función para obtener los datos de todos los usuarios del sistema
 * @date 6/14/2023 - 2:00:37 PM
 * @author Alessandro Guevara
 *
 * @async
 * @returns {Object} objecto con parámetros: estatus, data
 */
export const getAllDataUsers = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemUsuariosInfo.txt";

  var { exists } = await FileSystem.getInfoAsync(fileUri);
  if (exists) {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    fileSystemValue = JSON.parse(fileSystemValue);

    const res = {
      estatus: true,
      data: fileSystemValue,
    };
    return new Promise(async (resolve, reject) => {
      resolve(res);
    });
  } else {
    return new Promise(async (resolve, reject) => {
      const res = {
        estatus: false,
      };
      resolve(res);
    });
  }
};

export const GetStores = () => {
  return new Promise(async (resolve) => {
    // DECLARAMOS NOMBRE CON LA RUTA DEL ARCHIVO LOCAL
    let fileUri = FileSystem.documentDirectory + "fileSystemEvaluados.txt";

    try {
      //LEEMOS EL ARCHIVO
      var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      //SI RECIBIMOS ALGO LO PARSEAMOS A JSON
      fileSystemValue =
        fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
    } catch (err) {
      console.log("ERROR ->");
      console.log(err);
      fileSystemValue = null;
    }

    const arrayTienda = [];

    //RECORREMOS TODOS LOS ITEMS DEL ARRAY MAPEANDOLOS
    fileSystemValue.map((item) => {
      //CUANDO SEA PERFIL DE TIENDA LO AGREGAMOS AL ARRAY
      arrayTienda.push(item);
    });

    const res = {
      status: true,
      stores: arrayTienda,
    };

    resolve(res);
  });
};

export const GetDataStores = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemTiendas.txt";

  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    // console.log('##### No hay archivo #####');
    fileSystemValue = null;
  }

  //console.log(fileSystemValue[]);

  console.log("data tiendas listas");
  return fileSystemValue;
};

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GET ZONAS, REGIONES Y BANDERAS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

export const GetDataRegiones = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemRegiones.txt";

  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    //console.log("##### No hay archivo #####");
    fileSystemValue = null;
  }

  //console.log(fileSystemValue);

  console.log("data regiones listas");
  return fileSystemValue;
};

export const GetDataZonas = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemZonas.txt";

  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    //console.log("##### No hay archivo #####");
    fileSystemValue = null;
  }

  console.log(fileSystemValue);

  console.log("data zonas listas");
  return fileSystemValue;
};

export const GetDataBanderas = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemBanderas.txt";
  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    fileSystemValue = null;
  }
  console.log("data banderas listas");
  return fileSystemValue;
};

export const GetConfigBanderas = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemConfigBanderas.txt";
  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    fileSystemValue = null;
  }
  console.log("configuracion banderas listas");
  return fileSystemValue;
};

export const GetDataZonasRegion = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemZonasRegion.txt";

  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    //console.log("##### No hay archivo #####");
    fileSystemValue = null;
  }

  //console.log(fileSystemValue);

  console.log("data zonas region listas");
  return fileSystemValue;
};

export const GetDataOpcionesDesv = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemOpcionesDesviacion.txt";

  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    console.log("##### No hay archivo #####");
    fileSystemValue = null;
  }

  //console.log(fileSystemValue);

  console.log("data opciones listas");
  return fileSystemValue;
};

/**
 * Función para obtener los datos del perfil de un usuario
 * @date 11/29/2023 - 2:40:34 PM
 * @author Alessandro Guevara
 *
 * @param {string} id_user - id del usuario del que se quiere obtener los datos
 **/
export const GetDataUser = (id_user) => {
  return new Promise(async (resolve) => {
    // DECLARAMOS NOMBRE CON LA RUTA DEL ARCHIVO LOCAL
    let fileUri = FileSystem.documentDirectory + "fileSystemEvaluados.txt";

    try {
      //LEEMOS EL ARCHIVO
      var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      //SI RECIBIMOS ALGO LO PARSEAMOS A JSON
      fileSystemValue =
        fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
    } catch (err) {
      console.log("ERROR ->");
      console.log(err);
      fileSystemValue = null;
    }

    const arrayData = [];

    //RECORREMOS TODOS LOS ITEMS DEL ARRAY MAPEANDOLOS
    fileSystemValue.map((item) => {
      //CUANDO SEA PERFIL DE TIENDA LO AGREGAMOS AL ARRAY
      if (item.id_usuario.toString() === id_user.toString()) {
        arrayData.push(item);
      }
    });

    const res = {
      status: arrayData.length > 0 ? true : false,
      stores: arrayData,
    };

    resolve(res);
  });
};

export const GetDataUser2 = (id_user) => {
  return new Promise(async (resolve) => {
    // DECLARAMOS NOMBRE CON LA RUTA DEL ARCHIVO LOCAL
    let fileUri = FileSystem.documentDirectory + "fileSystemUsuariosInfo.txt";

    try {
      //LEEMOS EL ARCHIVO
      var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      //SI RECIBIMOS ALGO LO PARSEAMOS A JSON
      fileSystemValue =
        fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
    } catch (err) {
      console.log("ERROR ->");
      console.log(err);
      fileSystemValue = null;
    }

    const arrayData = [];

    //RECORREMOS TODOS LOS ITEMS DEL ARRAY MAPEANDOLOS
    fileSystemValue.map((item) => {
      //CUANDO SEA PERFIL DE TIENDA LO AGREGAMOS AL ARRAY
      if (item.id_usuario.toString() === id_user.toString()) {
        arrayData.push(item);
      }
    });

    const res = {
      status: arrayData.length > 0 ? true : false,
      stores: arrayData,
    };

    resolve(res);
  });
};

export const GetSupervisores = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemSupervisores.txt";

  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    // console.log('##### No hay archivo #####');
    fileSystemValue = null;
  }

  // console.log(fileSystemValue);

  const arrSupervisores = [];

  //ITERAMOS EL OBJETO PARA PASAR LOS VALORES AL RNP
  fileSystemValue.map((item) => {
    arrSupervisores.push({
      label: item.nombre.concat(" ", item.aPaterno),
      value: item.id_usuario,
    });
  });

  console.log("supervisores listos");
  return arrSupervisores;
};

export const GetLideres = async () => {
  let fileUri = FileSystem.documentDirectory + "fileSystemLideres.txt";

  try {
    var fileSystemValue = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    fileSystemValue =
      fileSystemValue != null ? JSON.parse(fileSystemValue) : null;
  } catch (e) {
    // console.log('##### No hay archivo #####');
    fileSystemValue = null;
  }

  // console.log(fileSystemValue);

  const arrLideres = [];

  fileSystemValue.map((item) => {
    arrLideres.push({
      label: item.nombre.concat(" ", item.aPaterno),
      value: item.id_usuario,
    });
  });

  console.log("lideres listos");
  return arrLideres;
};

export const GetLocationUser = async () => {
  console.log("ENTER GET LOCA");
  return new Promise(async (resolve) => {
    //PERMISOS PARA OBTENER LOCALIZACION
    let { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();
    let objResult = new Object();

    if (!canAskAgain || status === "denied") {
      objResult = {
        estatus: false,
      };
      resolve(objResult);
    } else if (status === "granted") {
      let locationExpo = await Location.getCurrentPositionAsync({
        accuracy: level_precision,
      });

      //OBTENEMOS VARIABLES DE LA POSICION
      let { latitude, longitude } = locationExpo.coords;

      console.log("MILAT: " + latitude + " MILON: " + longitude);
      objResult = {
        latitude: latitude,
        longitude: longitude,
        estatus: true,
      };
      resolve(objResult);
    }
  });
};

export const CompareLocations = async (
  latitudeMove,
  longitudeMove,
  latitudeStatic,
  longitudeStatic,
  is_into_right_now,
  rango_distancia
) => {
  //? LATITUDESTATIC Y LONGITUDESTATIC SON LAS COORDENADAS DEL PUNTO QUE ES FIJO, TIPO UNA TIENDA O ASI
  //? LATITUDEMOVE Y LONGITUDEMOVE SON LAS COORDENADAS DEL PUNTO QUE SE ESTA
  //? MOVIENDO O NO SIEMPRE SERA LA MISMA, TIPO UNA PERSONA, CELULAR
  return new Promise(async (resolve) => {
    let exit_out_range = 0;
    var distancia = Dist(
      latitudeMove,
      longitudeMove,
      latitudeStatic,
      longitudeStatic
    );

    if (distancia <= rango_distancia) {
      exit_out_range = 0;
    } else {
      //SI DEBE MARCAR SALIDA SI DEJAREMOS QUE LA MARQUE AUNQUE NO ESTE DENTRO DE LA ZONA
      if (is_into_right_now === 1) {
        console.log("NOOO ESTA DENTRO, PERO PUEDE MARCAR");
        exit_out_range = 1;
      } else {
        //SI ES ENTRADA NO LO DEJAREMOS MARCAR PORQUE ESTA FUERA DE ZONA
        console.log("NOOO ESTA DENTRO");
        exit_out_range = 0;
      }
    }

    resolve(exit_out_range);
  });
};

export const DistanceBetweenTwoLocations = async (
  latitudeMove,
  longitudeMove,
  latitudeStatic,
  longitudeStatic
) => {
  //? LATITUDESTATIC Y LONGITUDESTATIC SON LAS COORDENADAS DEL PUNTO QUE ES FIJO, TIPO UNA TIENDA O ASI
  //? LATITUDEMOVE Y LONGITUDEMOVE SON LAS COORDENADAS DEL PUNTO QUE SE ESTA
  //? MOVIENDO O NO SIEMPRE SERA LA MISMA, TIPO UNA PERSONA, CELULAR
  var distancia = Dist(
    latitudeMove,
    longitudeMove,
    latitudeStatic,
    longitudeStatic
  );
  var res = {
    distance: distancia,
  };
  return res;
};

//? Función para guardar el tiempo actual y tomarlo como su ultima vez
//? dentro del rango de la tienda
export const SaveLastTimeInRange = async () => {
  const name_value = "last_datetime_in_range";
  await VerifyExistInsertedValue(name_value).then((result) => {
    const date_now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    if (result.status) {
      //Actualizamos en caso de que ya exista
      db.transaction(async (tx) => {
        tx.executeSql(
          "UPDATE GN_data_general SET " + "value_data = ? WHERE name_data = ?",
          [date_now + "", name_value],
          (tx, result) => {
            if (result.rowsAffected > 0) {
            } else {
            }
          },
          (tx, error) => {
            console.log("ERROR UPDATE");
            console.log(error);
          }
        );
      });
    } else {
      //Insertamos en caso de que no exista
      db.transaction(async (tx) => {
        tx.executeSql(
          "INSERT INTO GN_data_general" +
            "(name_data, value_data)" +
            "VALUES(?,?)",
          [name_value, date_now],
          (tx, result) => {},
          (tx, error) => {
            console.log("ERROR INSERT TIME");
            console.log(error);
          }
        );
      });
    }
  });
};

//? Función para guardar el tiempo actual y tomarlo como su ultima vez
//? dentro del rango de la tienda
/**
 * Función para guardar el tiempo actual y sumarle las horas que se le pasen a la función
 * y tomarlo como su ultima vez dentro del rango de la tienda
 * @date 8/1/2023 - 12:15:54 PM
 * @author Alessandro Guevara
 *
 * @async
 * @param {Int} num_hours - numero de horas que se le agregaran a la hora actual
 * @returns {*}
 */
export const SaveLastTimeInRangeAddHours = async (num_hours) => {
  const name_value = "last_datetime_in_range";
  await VerifyExistInsertedValue(name_value).then((result) => {
    const date_now = format(
      addHours(new Date(), num_hours),
      "yyyy-MM-dd HH:mm:ss"
    );
    if (result.status) {
      //Actualizamos en caso de que ya exista
      db.transaction(async (tx) => {
        tx.executeSql(
          "UPDATE GN_data_general SET " + "value_data = ? WHERE name_data = ?",
          [date_now + "", name_value],
          (tx, result) => {
            if (result.rowsAffected > 0) {
            } else {
            }
          },
          (tx, error) => {
            console.log("ERROR UPDATE");
            console.log(error);
          }
        );
      });
    } else {
      //Insertamos en caso de que no exista
      db.transaction(async (tx) => {
        tx.executeSql(
          "INSERT INTO GN_data_general" +
            "(name_data, value_data)" +
            "VALUES(?,?)",
          [name_value, date_now],
          (tx, result) => {},
          (tx, error) => {
            console.log("ERROR INSERT TIME");
            console.log(error);
          }
        );
      });
    }
  });
};

export const VerifyExistInsertedValue = async (name_value) => {
  return new Promise((resolve) => {
    try {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM GN_data_general WHERE name_data = ? LIMIT 1",
          [name_value],
          (tx, result) => {
            if (result.rows.length > 0) {
              var objResp = {
                status: true,
                last_time: result.rows._array[0].value_data,
              };
              resolve(objResp);
            } else {
              var objResp = {
                status: false,
              };
              resolve(objResp);
            }
          },
          (tx, error) => {
            var objResp = {
              status: false,
            };
            console.log("Error verify exist value" + error);
            resolve(objResp);
          }
        );
      });
    } catch (error) {
      var objResp = {
        status: false,
      };
      resolve(objResp);
    }
  });
};

export const sendCurrentLocation = async (id_store_visit) => {
  return new Promise(async (resolve) => {
    console.log("ENTRY FUNCTION");
    let { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();

    if (!canAskAgain || status === "denied") {
    } else if (status === "granted") {
      let locationExpo = await Location.getCurrentPositionAsync({
        accuracy: level_precision,
      });

      // console.log(locationExpo);
      // let { latitude, longitude } = locationExpo.coords;

      const api = API.apiUrl.concat("saveCurrentLocation");
      try {
        let response = await fetch(api, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            localizacion: locationExpo,
            id_store: id_store_visit,
            id_current_user: id_user,
          }),
        });

        let data = await response.json();

        console.log(data);
        if (data.code === "200" || data.code === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        resolve(false);
      }
    }
  });
};

export const getDataPlanAccion = (id_local_to_search) => {
  return new Promise((resolve, reject) => {
    let query =
      perfil_user === "TIENDA" ? "id_store_asignate" : "id_usuario_creador";
    try {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM BOPA_planes_accion WHERE " + query + " = ?",
          [id_user],
          (tx, result) => {
            let num_rows = result.rows.length;
            if (num_rows > 0) {
              let data_plan = result.rows._array.filter(
                (pln) =>
                  pln.id_plan_local.toString() === id_local_to_search.toString()
              );
              resolve(data_plan);
            } else {
              console.log("NO DATA IN TABLE PLANES");
              resolve([]);
            }
          },
          (tx, error) => {
            console.log("ERROR GET PLANES");
            console.log(error);
            resolve([]);
          }
        );
      });
    } catch (error) {
      console.log("ERROR GET PLANES SSS");
      console.log(error);
      resolve([]);
    }
  });
};

/**
 * Función para obtener token de usuario de notificaciones API AEMRETAIL
 * @date 12/5/2023 - 1:44:50 PM
 * @author Alessandro Guevara
 *
 * @async
 **/
export const getTokenNotifications = async () => {
  let token = "";
  try {
    const storedToken = await AsyncStorage.getItem("tokenNotifications");
    token = storedToken;
  } catch (error) {
    console.error("Error al recuperar el token:", error);
  }

  return token;
};

/**
 * Función para obtener si es la primera vez iniciando la app
 * @date 10/1/2024 - 1:01:50 PM
 * @author Alan Balderas Trejo
 *
 * @async
 **/
export const getFirstTime = async () => {
  let isFirstTime = "";
  try {
    const firstTime = await AsyncStorage.getItem("isFirstTime");
    isFirstTime = firstTime;
  } catch (error) {
    console.error("Error al recuperar el valor de la primera vez:", error);
  }

  return isFirstTime;
};

/**
 * Función para obtener si es la primera vez iniciando la app
 * @date 04/03/2024 - 13:50:50 PM
 * @author Alan Balderas Trejo
 *
 * @async
 **/
export const getFirstTimeContador = async () => {
  let isFirstTimeContador = "";
  try {
    const firstTimeContador = await AsyncStorage.getItem("isFirstTimeContador");
    isFirstTimeContador = firstTimeContador;
  } catch (error) {
    console.error("Error al recuperar el valor de la primera vez:", error);
  }

  return isFirstTimeContador;
};

/**
 * Función para obtener si es la primera vez iniciando la app para imagenes
 * @date 24/01/2024 - 12:08:35 PM
 * @author Alan Balderas Trejo
 *
 * @async
 **/
export const getFirstTimeImage = async () => {
  let isFirstTimeImage = "";
  try {
    const firstTimeImage = await AsyncStorage.getItem("isFirstTimeImage");
    isFirstTimeImage = firstTimeImage;
  } catch (error) {
    console.error("Error al recuperar el valor de la primera vez:", error);
  }

  return isFirstTimeImage;
};

/**
 * Función para obtener si es la primera vez iniciando la app para imagenes
 * @date 01/02/2024 - 12:24:35 PM
 * @author Alan Balderas Trejo
 *
 * @async
 **/
export const getFiltersDefault = async () => {
  return new Promise(async (resolve, reject) => {
    let isFilters = "";
    try {
      const filtersHelpers = await AsyncStorage.getItem("filtersDefault");
      isFilters = filtersHelpers;
    } catch (error) {
      console.error("Error al recuperar el valor de la primera vez:", error);
    }
    resolve(isFilters);
  })
};


/**
 * Función para limpiar token de usuario de notificaciones API AEMRETAIL
 * @date 12/5/2023 - 1:44:50 PM
 * @author Alessandro Guevara
 *
 * @async
 **/
export const clearTokenNotifications = async () => {
  try {
    // Elimina el token de AsyncStorage
    await AsyncStorage.removeItem("tokenNotifications");
  } catch (error) {
    console.error("Error al eliminar el token:", error);
  }
};

/**
 * Función para generar horas a las que se deben de mandar
 * notificaciones de recordatorios, también se va a generar el
 * objeto que se manda a la API para hacer el registro de la notificación
 * @date 12/5/2023 - 2:13:30 PM
 * @author Alessandro Guevara
 *
 * @param {String} title - titulo de notificación
 * @param {String} message - mensaje de notificación
 * @param {Integer} user_to_notify - Id de usuario que se les enviara la notificación (Son ids de la aplicación SRI)
 * @param {String} navigate_to - pantalla a la cual se debe de redirigir al presionar la notificación
 * @param {String} id_specific - id de componente en especifico el cual se require cargar (Por ejemplo: Si se require abrir
 * @param {String Date} date_origin - fecha a partir de la que se sacara el tiempo donde se debe de notificar al usuario (2023-12-21 10:20)
 * @param {Array Strings} array_intervals - array de strings para definir numero y formato a restar a la fecha
 *                                          Ejemplo: ["1-hours", "30-minutes"], el total a restar deberá se separarse con un "-" del siguiente
 *                                         valor que seria lo que se quiere restar (hours, minutes, days)
 * @return {Array objects} - retornamos objecto con los datos de notificacion
 * @async
 **/
export const getTimesToRemindNotifications = (
  title,
  message,
  user_to_notify,
  navigate_to,
  id_specific,
  date_origin,
  array_intervals
) => {
  const arrayNotis = [];

  array_intervals.map((inter) => {
    const interSplitted = inter.split("-");

    // Solo debe de tener 2 valores
    if (interSplitted.length === 2) {
      try {
        const amountRest = parseInt(interSplitted[0]);
        const formatRest = interSplitted[1];
        let dateRest;
        let messageFormat = message;

        // Validamos que formato es el que se va a restar
        switch (formatRest) {
          case "minutes":
            dateRest = subMinutes(new Date(date_origin), amountRest);
            messageFormat += ` ${amountRest} ${
              amountRest > 1 ? "minutos" : "minuto"
            }`;
            break;
          case "hours":
            dateRest = subHours(new Date(date_origin), amountRest);
            messageFormat += ` ${amountRest} ${
              amountRest > 1 ? "horas" : "hora"
            }`;
            break;
          case "days":
            dateRest = subDays(new Date(date_origin), amountRest);
            messageFormat += ` ${amountRest} ${
              amountRest > 1 ? "días" : "día"
            }`;
            break;
          default:
            break;
        }

        const dataNoti = {
          id_cliente: "1",
          id_ticket: id_specific + "",
          modulo: "MOVIL",
          accion: title,
          mensaje: messageFormat,
          icono: "fa-regular fa-bell",
          tipo_notificacion: "danger",
          estatus_nuevo: "1",
          id_usuario: parseInt(user_to_notify),
          fecha_hora: format(dateRest, "MM-dd-yy HH:mm"),
          estatus: "1",
          id_relacionado: parseInt(id_specific),
          enlace: navigate_to,
        };

        arrayNotis.push(dataNoti);
      } catch (error) {
        console.log("ERROR INTERVALS");
        console.log(error);
      }
    }
  });

  return arrayNotis;
};

/**
 * Función para generar un id único de acuerdo con la hora actual, la podremos
 * usar solo si no nos importa de cuantos dígitos es el ID, ya que es muy grande el ID
 * @date 1/23/2024 - 8:29:25 AM
 * @author Alessandro Guevara
 *
**/ 
export const generateUniqueId = () => {
  const timestamp = new Date().getTime();
  const uniqueId = `${timestamp}${Math.trunc(Math.random() * 10000)}`;
  return parseInt(uniqueId);
}
 