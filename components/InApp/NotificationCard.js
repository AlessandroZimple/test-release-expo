import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { AntDesign } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import Palette from '../../constants/Palette';
import { reduceText } from '../../src/helpers/FuncionalitiesHelpers';
import Animated, { useSharedValue, withTiming, withSpring, delay, runOnJS, useAnimatedStyle, useAnimatedGestureHandler } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

// Creamos componente de TouchableOpacity para que soporte animaciones
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const { width, height } = Dimensions.get("screen")
const SCREEN_WIDTH = width

// Variables para definir cual es el limite hasta donde se va a llegar el gesto de deslizar notificación
const TRANSLATE_X_THRESHOLD_NEGATIVE = -SCREEN_WIDTH * 0.3
const TRANSLATE_X_THRESHOLD_POSITIVE = SCREEN_WIDTH * 0.3

/**
 * Mapeo de datos de notificación prop -> (notification)
 * @author Alessandro Guevara
 *
 * @parent_prop {notification}
 * @param {Number} id_notification - id de notificación
 * @param {String} title - titulo de notificación (Optional)
 * @param {String} message - mensaje de notificación (Optional)
 * @param {String Color Hex} notificationBackgroundColor - color de fondo de notificación, por defecto es (#f8f8f8)
 * @param {String Color Hex} titleColor - color del texto del titulo de notificación, por defecto es (#000)
 * @param {String Color Hex} messageColor - color del texto del mensaje de notificación, por defecto es (#000)
 * @param {Boolean} showIcon - variable para mostrar o ocultar icono (Required)
 * @param {String Color Hex} iconBackgroundColor - color de fondo de icono (Required with showIcon in true)
 * @param {String} iconName - nombre de fondo de icono, de momento tiene que ser de AntDesign (Required with showIcon in true)
 * @param {String Color Hex} iconColor - color de icono (Required with showIcon in true)
 * @param {Number} iconSize - tamaño de icono (Required with showIcon in true)
 * @param {Boolean} navigationAble - si necesita navegar al presionar notificación (Optional)
 * @param {String [bottom | top]} notificationPosition - posición en la que se renderizaran las notificaciones, hay 
 *                                                      dos tipos bottom y top, con cada posición se necesitan diferentes valores en las animaciones (Optional)
 * @param {String} type - tipo de notificación, de acuerdo al tipo se debe de hacer un callback 
 *                      para la navegación, los callbacks se hacen en el archivo InAppNotification.js (Required to handle navigate callback)
*/

/**
 * Renderizado de notificación
 * @date 2/26/2024 - 3:09:05 PM
 * @author Alessandro Guevara
 *
 * @export
 * @param {Object} notification - datos de notificación
 * @param {Function} handleDeleteHideNotification - función que se debe de ejecutar al ocultar o querer cerrar notificación
 * @param {Function} navigateToCallback - función que se debe de ejecutar al presionar la notificación
 * @returns {*}
 */
export default function NotificationCard({
    notification, handleDeleteHideNotification, navigateToCallback
}) {

    // Datos de notificación
    const {
        id_notification, title, message, notificationBackgroundColor,
        titleColor, messageColor, showIcon, iconBackgroundColor, iconName,
        iconColor, iconSize, navigationAble, notificationPosition, type
    } = notification

    // Variables de animación
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(-20);
    const translateX = useSharedValue(0)
    // const [shouldAnimate, setShouldAnimate] = useState(true);
    
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value }
            ],
        };
    });

    /**
     * Función manejar navegación al abrir la notificación
     * @date 2/26/2024 - 2:00:19 PM
     * @author Alessandro Guevara
     *
    **/
    const handleNavigateTo = () => {
        handleDeleteHideNotification(notification);
        if(navigationAble) {
            navigateToCallback()
        }
    }
    
    /**
     * Controlamos gestos para identificar cuando deslizan la notificación a la izquierda o derecha para poder borrarla
     * @date 2/27/2024 - 9:56:50 AM
     * @author Alessandro Guevara
     *
     * @type {*}
     */
    const panGesture = useAnimatedGestureHandler({
        onActive: (event) => {
            translateX.value = event.translationX
        },
        onEnd: () => {
            const shouldBeDelete = translateX.value < TRANSLATE_X_THRESHOLD_NEGATIVE || translateX.value > TRANSLATE_X_THRESHOLD_POSITIVE
            if(shouldBeDelete) {
                translateX.value = withTiming(translateX.value < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH)
                opacity.value = withTiming(0, undefined, (isFinished) => {
                    if(isFinished && handleDeleteHideNotification) {
                        runOnJS(handleDeleteHideNotification)(notification)
                    }
                })
            }else {
                translateX.value = withTiming(0)
            }
        }
    }) 

    /**
     * UseEffect para utilizar animación de fadeIn y fadeOut cada que haya una nueva notificación
     * @date 2/26/2024 - 2:00:19 PM
     * @author Alessandro Guevara
     *
    **/
    useEffect(() => {
        // Animamos opacidad de notificación y traslado en Y desde la parte de arriba hacia abajo (dependiendo de la posición establecida en las props)
        opacity.value = withSpring(1, { damping: 10, stiffness: 80 });
        translateY.value = withSpring(notificationPosition === "bottom" ? -40 : 0, { damping: 10, stiffness: 80 });

        const hideNotification = () => {
            opacity.value = withSpring(0);

            // Se borra del array de notificaciones para que ya no se apilen debajo de la notificación borrada
            setTimeout(() => {
                handleDeleteHideNotification(notification);
            }, 100);
            
            translateY.value = withSpring(notificationPosition === "bottom" ? -20 : -10, {});
        };

        // Después de 6 segundos ocultamos notificación
        const timeoutId = setTimeout(hideNotification, 6000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [notification]);

    /**
     * UseEffect validar si hay una nueva notificación
     * @date 2/26/2024 - 2:00:19 PM
     * @author Alessandro Guevara
     *
    **/
    // useEffect(() => {
    //     setShouldAnimate(true);
    // }, [id_notification]);

    return (
        <PanGestureHandler onGestureEvent={panGesture}>
            <AnimatedTouchableOpacity 
                key={id_notification}
                style={[styles.containerNotification, {backgroundColor: (notificationBackgroundColor ?? "#f8f8f8")}, animatedStyle]}
                onPress={() => handleNavigateTo()}
            >

                {showIcon && (
                    <View style={styles.containerIcon}>
                        <View 
                            style={{...styles.circleIcon, backgroundColor: (iconBackgroundColor ?? Palette.colors.info)}}>
                            <AntDesign 
                                name={(iconName ?? 'message1')} 
                                size={(iconSize ?? 24)} 
                                color={(iconColor ?? 'white')} 
                            />
                        </View>
                    </View>
                )}
                
                <View 
                    style={{...styles.containerInformation, flex: showIcon ? 0.7 : 0.9}}
                >
                    {title && (
                        <Text style={{...styles.titleText, color: (titleColor ?? "#000")}}>{title}</Text>
                    )}
                    {message && (
                        <Text style={{...styles.messageText, color: (messageColor ?? "#000")}}>{reduceText(message, 60)}</Text>
                    )}
                </View>

                {/* {showNavigationBtn && (
                    <View style={styles.containerActions}>
                        <TouchableOpacity 
                            onPress={() => handleNavigateTo()}
                        >
                            <Text style={styles.navigationText}>{(navigationBtnText ?? 'Abrir')}</Text>
                        </TouchableOpacity>
                    </View>
                )} */}

                <TouchableOpacity 
                    style={styles.closeNotification}
                    onPress={() => handleDeleteHideNotification(notification)}
                >
                    <AntDesign name="closecircle" size={24} color={"#9b9b9b"} />
                </TouchableOpacity>
            </AnimatedTouchableOpacity>
        </PanGestureHandler>
    )
}

const styles = StyleSheet.create({
    containerNotification: {
        flexDirection: 'row',
        width: "96%", 
        top: 26, 
        height: 'auto', 
        backgroundColor: '#f8f8f8', 
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 8,
        padding: 6,
        shadowOffset: { width: 1, height: 2 },
        shadowColor: "black",
        shadowOpacity: 0.4,
        shadowRadius: 2, 
        elevation: 8,
    },
    containerIcon: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circleIcon: {
        height: 46, 
        width: 46, 
        backgroundColor: '#29A419', 
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerInformation: {
        flex: 0.7,
    },
    titleText: {
        fontSize: 14, 
        fontWeight: 'bold'
    },
    messageText: {
        fontSize: 14, 
        fontWeight: '400',
        marginTop: 4
    },
    containerActions: {
        flex: 0.1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    navigationText: {
        fontSize: 15, 
        color: Palette.colors.info, 
        borderBottomWidth: 1, 
        borderBottomColor: Palette.colors.info
    },
    closeNotification: {
        position: 'absolute', 
        top: 4, 
        right: 4
    }
})