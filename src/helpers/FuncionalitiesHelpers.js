import { symbolBoldText, symbolCursiveText } from "../../constants/global";

/**
 * Función para acortar un texto a un determinado numero 
 * de caracteres (No se toma en cuenta los últimos 3 puntos [...] )
 * @date 2/26/2024 - 3:05:06 PM
 * @author Alessandro Guevara
 * 
 * @param {String} text - texto que se quiere acortar
 * @param {Number} maximumLength - máximo de letras que se quiere tener
 *
**/
export const reduceText = (text, maximumLength) => {
    if (text.length > maximumLength) {
        return `${text.slice(0, maximumLength)}...`;
    } else {
        return text;
    }
}

/**
 * Función para validar que tipo de estilo se debe de aplicar a un texto
 * @date 3/21/2024 - 1:52:04 PM
 * @author Alessandro Guevara
 *
 * @param {String} text - texto que se requiere validar que estilo tiene que tener
 * @returns {Object} [cleanText {String} => texto sin símbolos de estilos] 
 *                  [styleText {String} => bold | cursive | normal] 
 *                  se regresa el tipo de estilo que debe de tener el texto y el texto sin simbolos
 */
export const identifyTextStyle = (text) => {
    // Expresión regular para validar si inicia el texto con los símbolos específicos de los tipos de texto
    const regexBoldText = new RegExp(`^\\${symbolBoldText}.*\\${symbolBoldText}$`);
    const regexCursiveText = new RegExp(`^\\${symbolCursiveText}.*?\\${symbolCursiveText}$`);

    // Verificar si el texto cumple con el regex de tipos de texto
    const isBoldText = regexBoldText.test(text);
    const isCursiveText = regexCursiveText.test(text);
    let styleText = "normal"

    if(isBoldText) {
        styleText = "bold"
    } else if(isCursiveText) {
        styleText = "cursive"
    }else {
        styleText = "normal"
    }

    // Si tiene estilo quitamos el primer y ultimo carácter
    const textWithoutSymbols = styleText !== "normal" ? text.substring(1, text.length - 1) : text 

    const objResp = {
        cleanText: textWithoutSymbols,
        styleText: styleText
    }
    return objResp

}

/**
 * Función para crear una expresión regular para buscar texto dentro de dos delimitadores
 * Ejemplo: [*Texto que se va a buscar*] 
 * @date 3/22/2024 - 1:35:57 PM
 * @author Alessandro Guevara
 *
 * @param {String} symbol - símbolo delimitador
 * @returns {Regex}
 */
export const buildRegex = (symbol) => {
    const initialDelimiter = `\\${symbol}`;  // Simbología inicial
    const finalDelimiter = `\\${symbol}`;  // Simbología final
    const searchText = '.*?'; // Cualquier texto dentro de los delimitadores

    // Expresión para buscar texto dentro de los símbolos delimitadores
    return new RegExp(initialDelimiter + '(' + searchText + ')' + finalDelimiter, 'g');
}

/**
 * Función para encontrar las palabras que requieren un estilo en especifico
 * @date 3/22/2024 - 1:38:09 PM
 * @author Alessandro Guevara
 *
 * @param {String} text - texto que se quiere identificar el texto que debe de tener estilo en especifico
 * @returns {Array} array con el texto que se debe de aplicar un estilo en especifico
 * [textSearch {String} texto para aplicar estilo (se le quita los delimitadores),
    typeStyle {String} tipo de estilo a aplicar (bold | cursive)]
 */
export const identifyTextWithinSymbols = (text) => {

    // Buscamos coincidencias para todos los tipos de símbolos
    const regexBold = buildRegex(symbolBoldText)
    const coincidentBold = text.match(regexBold);

    const regexCursive = buildRegex(symbolCursiveText)
    const coincidentCursive = text.match(regexCursive);

    let arrayText = []

    // Recorremos todas las coincidencias que deben de ser texto bold
    if(coincidentBold && coincidentBold?.length > 0) {
        coincidentBold.map((txt) => {
            arrayText.push({
                textSearch: `${txt.slice(1, -1)}`,
                typeStyle: "bold"
            })
        })   
    }
    
    // Recorremos todas las coincidencias que deben de ser texto cursive
    if(coincidentCursive && coincidentCursive?.length > 0) {
        coincidentCursive.map((txt) => {
            arrayText.push({
                textSearch: `${txt.slice(1, -1)}`,
                typeStyle: "cursive"
            })
        })
    }

    return arrayText

} 

/**
 * Función para 
 * @date 3/22/2024 - 1:42:12 PM
 * @author Alessandro Guevara
 *
 * @param {Array} textWithStyle - array qeu obtuvimos en la función de arriba
 * @param {String} text - texto inicial
 * @returns {String} texto con flags para poder aplicar estilo
 */
export const replaceWithFlagsStyle = (textWithStyle, text) => {
    let textUpdated = text

    textWithStyle.map((txtStyle) => {
        let textToSearch = txtStyle.textSearch
        let symbolReplace = txtStyle.typeStyle === 'bold' 
                                ? symbolBoldText 
                                : txtStyle.typeStyle === 'cursive' 
                                    ? symbolCursiveText
                            : ''

        // Agregaremos una bandera y delimitadores en los textos que tendrán estilos
        let regexText = new RegExp(`\\${symbolReplace}${textToSearch}\\${symbolReplace}`, 'g');
        
        // A cada texto que requiera estilo, agregaremos un ("-") al principio y final
        // para poder delimitar el texto que tendrá estilo
        // Después del primer ("-") agregamos el tipo de estilo y un ("|") para delimitar del texto
        textUpdated = textUpdated.replace(regexText, `-${txtStyle.typeStyle}|${textToSearch}-`)
    })

    return textUpdated
}