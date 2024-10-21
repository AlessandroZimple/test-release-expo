/*=========================================================================================
File Name: ProgressDialog.js
Description: Usado para mostrar un activity indicator al usuario 
--------------------------------------------------------------------------------------
Item Name: AEM Retail App - ProgressDialog
Author: Brandon Jelday Guevara Silva
Author URL: Brandon Jelday Guevara Silva
========================================================================================== */

import React from 'react';
import { ActivityIndicator, View, Dimensions, Text } from 'react-native';
import Palette from '../constants/Palette';

const ProgressDialog = (props) => {

  // DIMENSION DE LA PANTALLA --- --- --- --- ---
  const { width, height } = Dimensions.get('screen');
  // DIMENSION DE LA PANTALLA --- --- --- --- ---
  return (
    <View
      style={{
        display: props.mostrar == true ? 'flex' : 'none',
        position: props.mostrar == true ? 'absolute' : 'relative',
        width: width * 10,
        height: height * 10,
        zIndex: 1001,
        backgroundColor: '#fff',
        opacity: 0.8,
      }}
    >
      <View
        style={{
          display: props.mostrar == true ? 'flex' : 'none',
          position: props.mostrar == true ? 'absolute' : 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: width,
          height: height * 0.8,
          zIndex: 1001,
          top: 0,
        }}
      >
        <ActivityIndicator size='large' color={Palette.colors.danger600} />
        <Text style={{ marginTop: 10 }}>Cargando...</Text>
      </View>
    </View>
  );
};

export default ProgressDialog;
