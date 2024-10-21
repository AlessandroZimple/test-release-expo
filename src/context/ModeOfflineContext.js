/*<=======================================================
 - File Name: ModeOfflineContext.js
 - Description: Contexto para tener un state global para saber cuando esta
 en modo offline y actualizar el state del modo offline
 <----------------------------------------------->

 - Item Name: AEM Retail App - ModeOfflineContext
 - Author: Carlos Alessandro Guevara Silva <alessandrocgs2@gmail.com>
 - Author URL: Carlos Alessandro Guevara Silva
 <----------------------------------------------->

 - Params:
    * props.children:  Componentes hijos a los que envuelve
=======================================================>*/

import { View, Text } from 'react-native'
import React, { createContext, useState } from 'react'

export const ModeOfflineContext = createContext({
    isModeOffline: false,
});

export function ModeOfflineProvider(props) {
    const { children } = props;
    const [isModeOffline, setIsModeOffline] = useState(false);

    const handleChangeIsModeOffline = (status) => {
        setIsModeOffline(status);
    }

    const valueContext = {
        isModeOffline,
        handleChangeIsModeOffline
    }

    

    return (
        <ModeOfflineContext.Provider value={valueContext}>
            {children}
        </ModeOfflineContext.Provider>
    )
}