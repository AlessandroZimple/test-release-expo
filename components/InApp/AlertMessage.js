import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Dimensions } from 'react-native';
import Animated,
{
    Easing,
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { MaterialCommunityIcons, MaterialIcons, AntDesign, Entypo } from '@expo/vector-icons';

const { width } = Dimensions.get("window")
/**
 * Componente para mostrar una alerta en pantalla con animación de 
 * entrada y salida
 * @date 3/19/2024 - 9:12:27 AM
 * @author Alessandro Guevara
 *
 * @export
 * @param { Object } config - objeto con todos los parámetros de configuración de la alerta
 * @param { Config Object } text - texto de alerta, debe de ser diferente a la anterior alerta para que salga (Required)
 * @param { Config Object } type - tipo de alerta, de acuerdo al tipo cambia el color y icono de alerta [info | success | error | neutral]
 * @param { Config Object } animationsDuration - duración de animaciones en milisegundos
 * @param { Config Object } alertDuration - tiempo de duración de alerta en milisegundos 
 * @param { Config Object } position - posición de alerta, no cambiar en la misma pantalla de posición porque puede buguearse [top | bottom]
 * @param { Function Callback } onHide - función de callback para ejecutarse cuando se oculta la alerta
 */
export default function AlertMessage({ config, onHide }) {

    const [textLength, setTextLength] = useState(0);
    const [toastHeight, setToastHeight] = useState(0);
    const position = config?.position ?? 'bottom' 
    const animationsDuration = config?.animationsDuration ?? 400
    const alertDuration = config?.alertDuration ?? 4000

    const timer = useRef(null);
    const POSITION_AFTER_ANIMATION = position === 'top' ? 30 : -50
    const SPACE_ICON = 8

    const transY = useSharedValue(0);
    const transX = useSharedValue(0);

    // Detectar nueva alerta y hacer proceso para mostrar y ocultar
    useEffect(() => {
        if (textLength && toastHeight && config.text) {
            transX.value = textLength + SPACE_ICON;
            showToast();
            timer.current = setTimeout(() => {
                hideToast();
            }, alertDuration);
        }

        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        }
    }, [config, toastHeight, textLength]);

    // Detectar nuevo alto de contenido y desplazar en el eje Y la alerta
    useEffect(() => {
        if (toastHeight) {
            transY.value = position === 'top' ? -toastHeight : toastHeight;
        }
    }, [toastHeight]);

    // Variables de animación

    const rView = useAnimatedStyle(() => {
        // cambiar a otra v toastHeight
        const positionToastMove = position === 'top' ? -toastHeight : toastHeight
        return {
            transform: [{ translateY: transY.value }],
            opacity: interpolate(transY.value, [positionToastMove, POSITION_AFTER_ANIMATION], [0, 1], Extrapolation.CLAMP)
        }
    }, [toastHeight]);

    const rOuterView = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: -Math.max(transX.value, 1) / 2 }]
        }
    }, []);

    const rInnerView = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: transX.value }]
        }
    }, []);

    const rText = useAnimatedStyle(() => {
        return {
            opacity: interpolate(transX.value, [0, textLength], [1, 0])
        }
    }, [textLength]);

    // Funciones de comportamiento de la alerta

    const showToast = () => {
        transY.value = withTiming(POSITION_AFTER_ANIMATION, { duration: animationsDuration });
        transX.value = withDelay(animationsDuration, withTiming(0, { duration: animationsDuration }));
    }

    const hideToast = (callback) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }

        const positionToastMove = position === 'top' ? -toastHeight : toastHeight
        transX.value = withTiming(textLength + SPACE_ICON, { animationsDuration });
        transY.value = withDelay(animationsDuration, withTiming(positionToastMove, { duration: animationsDuration, easing: Easing.bezierFn(0.36, 0, 0.66, -0.56) }, () => {
            runOnJS(handleOnFinish)(callback);
        }));
    }

    const handleOnFinish = () => {
        if (onHide) {
            onHide();
        }
    }

    /**
     * Función para detectar renderizado y obtener el tamaño de el texto
     * @date 3/15/2024 - 4:16:37 PM
     * @author Alessandro Guevara
     *
     * @param { LayoutChangeEvent } event
    */
    const handleTextLayout = (event) => {
        if (textLength !== event.nativeEvent.layout.width) {
            setTextLength(Math.floor(event.nativeEvent.layout.width));
        }
    }

    /**
     * Función para detectar renderizado y obtener el alto del contenido
     * @date 3/15/2024 - 4:16:37 PM
     * @author Alessandro Guevara
     *
     * @param { LayoutChangeEvent } event
    */
    const handleViewLayout = (event) => {
        if (toastHeight !== event.nativeEvent.layout.height) {
            setToastHeight(event.nativeEvent.layout.height);
                // setToastHeight(position === "top" ? event.nativeEvent.layout.height : -event.nativeEvent.layout.height);
        }
    }

    // Funciones de diseño de alerta

    function GenerateBackgroundColor() {
        if (config?.type === 'success') {
            return '#1f8503';
        } else if (config?.type === 'error') {
            return '#f00a1d';
        } else {
            return '#0077ed';
        }
    }

    function RenderIcon() {
        if(config?.type === 'info') {
            return (
                <Entypo name="info-with-circle" size={28} color="white" />
            )
        }else if(config?.type === 'success') {
            return (
                <AntDesign name="checkcircle" size={26} color="white" />
            )
        }else if(config?.type === 'error') {
            return (
                <MaterialIcons name="error" size={28} color="white" />
            )
        }else if(config?.type === 'neutral') {
            return (
                <Entypo name="info-with-circle" size={28} color="white" />
            )
        }else {
            return (
                <Entypo name="info-with-circle" size={28} color="white" />
            )
        }
    }

    return (
        <Animated.View onLayout={handleViewLayout} style={[ position === 'top' ? styles.containerTop : styles.containerBottom, rView]}>
            <Animated.View style={[styles.outerContainer, rOuterView]}>
                <Animated.View style={[styles.innerContainer, rInnerView, { backgroundColor: GenerateBackgroundColor() }]}>
                        <RenderIcon />
                        <Animated.Text onLayout={handleTextLayout} style={[{...styles.text, marginLeft: SPACE_ICON,}, rText]}>{config.text}</Animated.Text>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );

    
};

const styles = StyleSheet.create({
    containerTop: {
        position: 'absolute',
        top: 0,
        zIndex: 100,
        right: 0,
        left: 0,
        marginHorizontal: parseInt((width/(width > 400 ? 9 : 8)).toFixed(0))
    },
    containerBottom: {
        position: 'absolute',
        bottom: 0,
        zIndex: 100,
        right: 0,
        left: 0,
        marginHorizontal: parseInt((width/(width > 400 ? 9 : 8)).toFixed(0))
    },
    outerContainer: {
        overflow: 'hidden',
        borderRadius: 1000
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 1000
    },
    text: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 12,
        textAlign: 'center'
    }
})
