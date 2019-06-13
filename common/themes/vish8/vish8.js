
export const DEFINITION = {
    /*
    * viewName: [<Nombre del tema en inglés>, <Nombre del tema es español>],
    * font: Fuente principal del tema (tiene que ser de Google Fonts),
    * background: [
    *   Insertar colores o url a las imágenes del tema. Por ejemplo: 'url(/themes/orange/background_images/orange0.jpg)',...
    * ],
    * colors: {
    *   themeColor1: color principal del tema,
    *   themeColor2:
    *   themeColor3:
    *   themeColor4:
    *   themeColor5:
    * },
    * images: {
    *   template1: { left: '' },
    *   template3: { topLeft: 'topLeft.png', topRight: 'topRight.png', bottomLeft: 'bottomLeft.png', bottomRight: 'bottomRight.png' },
    *   template7: { left: '' },
    * }
    * */
    viewName: ['Vish 8', 'Vish 8'],
    font: 'Maven Pro',
    background: {
        f16_9: [
            'url(../themes/vish8/background_images/vish8_169.jpeg)',
        ],
        f4_3: [
            'url(../themes/vish8/background_images/vish8_43.jpg)',
        ],
    },
    colors: {
        themeColor1: '#ffffff',
        themeColor2: '#ff444d',
        themeColor3: '#4bff9f',
        themeColor4: '#65caff',
        themeColor5: '#ffbe45',
        themeColor6: '#ffffff',
    },
    images: {
        template1: { left: 'left.jpg' },
        template3: { topLeft: 'topLeft.png', topRight: 'topRight.png', bottomLeft: 'bottomLeft.png', bottomRight: 'bottomRight.png' },
        template7: { left: 'placeholder.svg' },
    },
};
