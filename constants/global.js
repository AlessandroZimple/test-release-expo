/*=========================================================================================
File Name: global.js
Description: es usado para declarar variables globales en la aplicacion
--------------------------------------------------------------------------------------
Item Name: AEM Retail App - global
Author: Brandon Jelday Guevara Silva
Author URL: Brandon Jelday Guevara Silva
========================================================================================== */

export var app_version = "1.9.28";

export var name_only_user = "";

export var first_name_only_user = "";

export var name_user = "";

export var id_user = "";

export var perfil_user = "";

export var data_user = {};

export var radio_global = 50;

export var radio_visit_now = 50;

export var level_precision = 6;

export var is_camera_open = false;

export var is_visit_active = false;

export var store_visiting = "";

export var store_flag = "";

export var source = "";

export var use_camera = "cameraNative";

export const timeoutGetLocation = 5000; // Milliseconds

export const symbolBoldText = "*"

export const symbolCursiveText = "_"

export var configuration_downloads = [
    {id: 1, packageDownload: 'evaluaciones', status:'true'},
    {id: 2, packageDownload: 'catalogos', status:'false'},
    {id: 3, packageDownload: 'ubicaciones', status:'true'},
  
];

export var config_ignore_evs = [];

export function set_name_only_user(get_name_only_user) {
    name_only_user = get_name_only_user;
}

export function set_first_name_only_user(get_first_name_only_user) {
    first_name_only_user = get_first_name_only_user;
}

export function set_name_user(get_name_user) {
    name_user = get_name_user;
}

export function set_id_user(get_id_usuario) {
    id_user = get_id_usuario;
}

export function set_source(get_source) {
    source = get_source;
}

export function set_perfil_user(get_perfil_user) {
    perfil_user = get_perfil_user;
}

export function set_data_user(get_data_user) {
    data_user = get_data_user;
}

export function initial_configuration_downloads(arrayList) {
    configuration_downloads = arrayList;
}

export function set_configuration_downloads(name, status) {
    const new_configuration = configuration_downloads.map((item) => 
        item.packageDownload+"" === name+"" ?
        {...item, status: status+""} :
        item,
    );
    configuration_downloads = new_configuration;
}

export function set_radio_global(radio) {
    radio_global = radio;
}

export function set_radio_visit_now(radio) {
    radio_visit_now = radio;
}

export function set_level_precision(levelPrecision) {
    level_precision = levelPrecision;
}

export function set_is_camera_open(status) {
    is_camera_open = status;
}

export function set_is_visit_active(status) {
    is_visit_active = status;
}

export function set_store_visiting(store) {
    store_visiting = store;
}

export function set_store_flag(flag) {
    store_flag = flag;
}

export function set_config_ignore_evs(id_storage) {
    // Verificar si el id local de la evaluacion ya esta en el array
    let isInArray = config_ignore_evs.includes(id_storage);

    if (isInArray) {
        console.log("El número no está en el array.");
        // Buscamos posicion del id storage en el array
        let positionId = config_ignore_evs.indexOf(id_storage);

        // Si es diferente a -1 quiere decir que si se encontro en el array 
        if (positionId !== -1) {
            // Quitamos el id de la posicion que recibimos
            config_ignore_evs.splice(positionId, 1);
        }
        console.log(config_ignore_evs);

    } else {
        console.log("El número está presente en el array.");
        // Agregamos el id del storage al array
        config_ignore_evs.push(id_storage);
        console.log(config_ignore_evs);

    }
}

export function set_use_camera(camera) {
    use_camera = camera;
}
export default {};