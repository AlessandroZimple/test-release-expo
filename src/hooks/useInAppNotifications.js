/*<=======================================================
 - File Name: useInAppNotifications.js
 - Description: Hook para utilizar el context de modeOffline
 <----------------------------------------------->

 - Item Name: AEM Retail App - useInAppNotifications
 - Author: Carlos Alessandro Guevara Silva <alessandrocgs2@gmail.com>
 - Author URL: Carlos Alessandro Guevara Silva
 <----------------------------------------------->
=======================================================>*/
import { useState } from "react"

export const useInAppNotifications = () => {
    const [notifications, setNotifications] = useState([])


    /**
     * Función para agregar una nueva notificación al array de notificaciones
     * @date 2/26/2024 - 2:05:26 PM
     * @author Alessandro Guevara
     * 
     * @param {Object} dataNotification - datos de notificación
     **/
    const setDataNotifications = (dataNotification) => {
        setNotifications([...notifications, dataNotification])
    }

    /**
     * Función para eliminar una notificación del array cuando ya no se requiere que se vea
     * @date 2/26/2024 - 2:05:26 PM
     * @author Alessandro Guevara
     * 
     * @param {Object} hideNotification - datos de notificación que se quiere eliminar 
     * 
     **/
    const deleteHideNotification = (hideNotification) => {
        setNotifications((preNotifications) => preNotifications.filter(
            (currentNotification) => 
            currentNotification.id_notification !== hideNotification.id_notification
        ))
    }

    return {
        notifications,
        setDataNotifications,
        deleteHideNotification
    }
}