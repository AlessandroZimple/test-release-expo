/*<=======================================================
 - File Name: useModeOffline.js
 - Description: Hook para utilizar el context de modeOffline
 <----------------------------------------------->

 - Item Name: AEM Retail App - useModeOffline
 - Author: Carlos Alessandro Guevara Silva <alessandrocgs2@gmail.com>
 - Author URL: Carlos Alessandro Guevara Silva
 <----------------------------------------------->


=======================================================>*/

import React, { useContext } from "react";
import { ModeOfflineContext } from '../context/ModeOfflineContext'

export default () => useContext(ModeOfflineContext);