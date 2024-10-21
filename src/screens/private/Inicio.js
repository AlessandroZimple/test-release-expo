import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import * as FileSystem from "expo-file-system";

export default function Inicio() {

    const testData = async () => {
        let fileUri = FileSystem.documentDirectory + "fileSystemEvaluacionesDisponibles.txt";
        console.log("PRE ENTER READ");
        console.log("fileUri => ", fileUri);
  
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log("PASS GET FILE INFO ");
        console.log(fileInfo);
    }

    const runFunctions = async () => {
        console.log("TEST DATA");
        let i = 0
        if(i === 0) {
            await testData()
        }
        console.log("TEST DATA");
    }

    useEffect(() => {
        runFunctions()
    }, []); 

    return (
        <View>
        <Text>Inicio</Text>
        </View>
    )
}