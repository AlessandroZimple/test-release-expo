import { View, Text, StyleSheet, Animated } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Palette from '../../constants/Palette'
import { Portal } from 'react-native-paper';
import {useInAppNotifications} from '../../src/hooks/useInAppNotifications';
import NotificationCard from './NotificationCard';
import { useNavigation } from '@react-navigation/native';

export default function InAppNotification({ newNotification }) {
    const navigation = useNavigation()

    const {
        notifications,
        setDataNotifications,
        deleteHideNotification
    } = useInAppNotifications()

    const handleDeleteHideNotification = (dataNotification) => {
        deleteHideNotification(dataNotification)
    }

    // Callbacks de navegación 
    const messengerCallback = useCallback(() => {
        navigation.navigate('DesviacionesOperativas', {
        });
    }, [])

    // Callbacks de navegación 
    const chatCallback = useCallback((objeto) => {
        if(objeto != undefined){
            navigation.navigate("Chat",objeto);
        }else{
            navigation.navigate("Messenger");
        }
        
   }, [])

    const actionPlansCallback = useCallback(() => {
        navigation.navigate("PlanesAccion", {
            openNotification: false,
            idToOpen: 0,
        });
    }, [])

    const defaultCallback = useCallback(() => {
        navigation.navigate("PlanesAccion", {
            openNotification: false,
            idToOpen: 0,
        });
    }, [])

    useEffect(() => {
        if(newNotification) {
            setDataNotifications(newNotification)
        }
    }, [newNotification])

    return (
        <Portal >
            <View style={{flex: 1, justifyContent: newNotification?.notificationPosition === "bottom" ? 'flex-end' : 'flex-start'}}>
                {notifications && notifications.map(notification => (
                    <NotificationCard 
                        key={notification.id_notification}
                        notification={notification}
                        handleDeleteHideNotification={handleDeleteHideNotification}
                        navigateToCallback={() => {
                            // Llamamos a la función de callback y pasamos el objeto de la notificación como argumento
                            if (notification.type === 'chat') {
                                chatCallback(notification.objeto);
                            } else if (notification.type === 'messenger') {
                                messengerCallback();
                            } else if (notification.type === 'actionsPlan') {
                                actionPlansCallback();
                            } else {
                                defaultCallback();
                            }
                        }}
                    />
                ))}
            </View>
        </Portal>
    )
}

const styles = StyleSheet.create({
})