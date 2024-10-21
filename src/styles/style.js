import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Palette from '../../constants/Palette';

// DIMENSION DE LA PANTALLA --- --- --- --- ---
const { width, height } = Dimensions.get('screen');
// DIMENSION DE LA PANTALLA --- --- --- --- ---

export default StyleSheet.create({
  modalContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainerNew: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.0)',
  },

  modalContainer2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  modalLarge: {
    backgroundColor: Palette.colors.white,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    width: width,
    height: '70%',
    marginTop: 'auto',
    padding: 0,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalSmall: {
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    width: width,
    height: '100%',
    marginTop: 'auto',
    padding: 0,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalLateral: {
    backgroundColor: Palette.colors.white,
    alignSelf: 'flex-end',
    width: '85%',
    height: '100%',
  },

  modalMega: {
    backgroundColor: Palette.colors.white,
    width: '90%',
    height: '90%',
    borderRadius: 8
  },

  modalAdapted: {
    backgroundColor: Palette.colors.white,
    width: '80%',
    height: '50%',
    borderRadius: 8
  },

  card: {
    backgroundColor: Palette.colors.white,
    margin: 10,
    borderRadius: 5,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 6,
    backgroundColor: '#fff',
  },

  tr: {
    borderWidth: 1,
    borderColor: Palette.colors.grey300
  },

  tr2: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Palette.colors.grey300
  },

  trStriped : {
    borderWidth: 1,
    borderColor: Palette.colors.grey300,
    backgroundColor: Palette.colors.grey100
  },

  trStriped2 : {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Palette.colors.grey300,
    backgroundColor: Palette.colors.grey100
  },

  td: {
    justifyContent: 'center'
  },

});
