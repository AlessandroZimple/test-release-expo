/*=========================================================================================
File Name: AlertCustom.js
Description: Componente diseñado para mostrar un modal con mensaje y tamaño personalizado
--------------------------------------------------------------------------------------
Item Name: AEM Retail App - Modal Adapted
Author: Brandon Jelday Guevara Silva
Author URL: Brandon Jelday Guevara Silva
========================================================================================== */

import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  Pressable,
  View,
  Dimensions,
  StyleSheet,
  Modal,
  TouchableOpacity
} from "react-native";
import Palette from "../constants/Palette";
import { Ionicons } from "@expo/vector-icons";
import style from "../src/styles/style";
import {
  IconButton,
  Title,
  Divider,
  Paragraph,
  Button,
} from "react-native-paper";

// ! __________ DIMENSION DE LA PANTALLA __________
// ? Declaracion del tamaño de la pantalla
const { width, height } = Dimensions.get("screen");
// ! __________ DIMENSION DE LA PANTALLA __________

// ! __________ STATE DEL COMPONENTE __________
// ? Ejemplo del uuso de el AlertCustom
// const [paramsAlertCustom, setParamsAlertCustom] = useState({
//   show: false,
//   type: "danger",
//   action: "close",
//   action2: "close",
//   title: "Titulo desde state",
//   message: "Mensaje",
//   firstButtonText: "Aceptar",
//   secondButtonAble: true,
//   secondButtonText: "Cancelar",
//   widthModal: "80%",
// });

{
  /* <AlertCustom
  show={paramsAlertCustom.show}
  type={paramsAlertCustom.type}
  title={paramsAlertCustom.title}
  message={paramsAlertCustom.message}
  firstButtonText={paramsAlertCustom.firstButtonText}
  secondButtonAble={paramsAlertCustom.secondButtonAble}
  secondButtonText={paramsAlertCustom.secondButtonText}
  widthModal={paramsAlertCustom.widthModal}
  heightModal={height > 800 ? "40%" : "50%"}
  parentCallbackClose={(val) => {
    setParamsAlertCustom({ ...paramsAlertCustom, show: false });
  }}
  parentCallbackFirstButton={(val) => {
    switch (paramsAlertCustom.action) {
      case "close":
        setParamsAlertCustom({
          ...paramsAlertCustom,
          show: false,
        });
        break;
      case "deleteData":
        deleteData();
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
/>; */
}
// ! __________ STATE DEL COMPONENTE __________

const AlertCustom = ({
  show,
  type,
  parentCallbackClose,
  parentCallbackFirstButton,
  parentCallbackSecondButton,
  title,
  message,
  firstButtonText,
  firstButtonAble,
  secondButtonAble,
  secondButtonText,
  heightModal,
  widthModal,
  showButtonExtra,
  messageButtonExtra,
  extraAction,
  parentCallbackExtraButton,
  actionHide,
  parentCallbackActionHide
}) => {

  const heightIcon = width * 0.4;
  const heightButtons = width * 0.15;
  
  
  const [heightContentModal, setHeightContentModal] = useState(0);
  const counterPress = useRef(0);

  /**
   * Función para contabilizar las veces que se han presionado el icono
   * de la alerta y al llegar a 10 presionadas realizar la función que se pasa en el callback
   * @date 8/28/2023 - 4:49:50 PM
   * @author Alessandro Guevara
   */
  const handlePressIcons = () => {
    if(actionHide) {
      counterPress.current = counterPress.current + 1;
      if(counterPress.current >= 10) {
        try {
          parentCallbackActionHide(false);
          
        } catch (error) {
          console.log("ERROR ACTION HIDE");
        }
      }
    }
  }

  useEffect(() => {
    if(show) {
      const messageHeight = message ? width * 0.001 * message.length : 0;
      const extraBtnHeight = showButtonExtra ? width * 0.1 : 0;
      const totalHeight = (width * 0.2) + messageHeight + heightIcon + extraBtnHeight + heightButtons;
      setHeightContentModal(totalHeight);
      counterPress.current = 0;
      // console.log("totalHeight");
      // console.log(totalHeight);
      // console.log(messageHeight);
      // console.log(heightIcon);
      // console.log(extraBtnHeight);
      // console.log(heightButtons);
      // console.log(height * 0.0003);
    }
  }, [show]);

  
  return (
    <View
      style={{
        display: show ? "flex" : "none",
        position: show ? "absolute" : "relative",
      }}
    >
      <Modal
        animationType="fade"
        hardwareAccelerated={false}
        transparent={true}
        visible={show}
        style={{ backgroundColor: Palette.colors.danger }}
        onRequestClose={() => parentCallbackClose(false)}
        statusBarTranslucent
      >
        <View style={style.modalContainer2}>
          <View
            style={{
              backgroundColor: Palette.colors.white,
              width: widthModal,
              height: heightContentModal,
              borderRadius: 18,
            }}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                padding: 0,
                justifyContent: "center",
              }}
            >
              {/* _____ ICONO _____ */}
              <TouchableOpacity
                onPress={() => handlePressIcons()}
                disabled={!actionHide}
              >
                <IconButton
                  icon={
                    type == "success"
                      ? "check-circle"
                      : type == "info"
                      ? "information"
                      : type == "error"
                      ? "close-circle"
                      : type == "warning"
                      ? "information"
                      : "information"
                  }
                  color={
                    type == "success"
                      ? Palette.colors.success600
                      : type == "info"
                      ? Palette.colors.info600
                      : type == "error"
                      ? Palette.colors.danger600
                      : type == "warning"
                      ? Palette.colors.warning600
                      : Palette.colors.info600
                  }
                  size={100}
                  style={{ alignSelf: "center", marginTop: 0 }}
                />
              </TouchableOpacity>
              {/* _____ ICONO _____ */}

              {/* _____ TITULO _____ */}
              <Title
                style={{
                  textAlign: "center",
                  alignSelf: "center",
                  color: Palette.colors.black
                }}
              >
                {title}
              </Title>
              {/* _____ TITULO _____ */}

              {/* _____ MESSAGE _____ */}
              <Paragraph
                style={{
                  marginTop: 15,
                  textAlign: "center",
                  alignSelf: "center",
                  color: Palette.colors.black
                }}
              >
                {message}
              </Paragraph>
              {/* _____ MESSAGE _____ */}

              {/* _____ BUTTON ADICIONAL _____ */}
              {showButtonExtra && (
                  <View
                    style={{justifyContent: 'center'}}
                  >
                    <Button
                      icon={
                        extraAction == "shareLocation"
                          ? "share-circle"
                          : extraAction == "anotherAction"
                          ? "crosshairs-question"
                        : "information"
                      }
                      mode="text"
                      color={
                        extraAction == "shareLocation"
                          ? Palette.colors.info600
                          : extraAction == "anotherAction"
                          ? Palette.colors.info600
                        : Palette.colors.info900
                      }
                      style={{ padding: 1, borderRadius: 20 }}
                      onPress={() => parentCallbackExtraButton(false)}
                    >
                      {messageButtonExtra}
                    </Button>
                  </View>
              )}
             
              {/* _____ BUTTON ADICIONAL _____ */}


              {/* _____ BOTONES _____ */}
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "center",
                  marginTop: 10,
                }}
              >
                {(firstButtonAble ?? true) && (
                  <Button
                    mode="contained"
                    color={
                      type == "success"
                        ? Palette.colors.success600
                        : type == "info"
                        ? Palette.colors.info600
                        : type == "error"
                        ? Palette.colors.danger600
                        : type == "warning"
                        ? Palette.colors.warning600
                        : Palette.colors.info600
                    }
                    onPress={() => parentCallbackFirstButton(false)}
                    style={{
                      borderWidth: 1,
                      marginHorizontal: 5,
                      width: "45%",
                    }}
                  >
                    {firstButtonText}
                  </Button>
                )}
                {secondButtonAble && (
                  <Button
                    mode="contained"
                    color={Palette.colors.secondary}
                    onPress={() => parentCallbackSecondButton(false)}
                    style={{
                      borderWidth: 1,
                      marginHorizontal: 5,
                      width: "45%",
                    }}
                  >
                    {secondButtonText}
                  </Button>
                )}
              </View>
              {/* _____ BOTONES _____ */}
            </View>
          </View>
        </View>
      </Modal>
    </View>
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

export default AlertCustom;
