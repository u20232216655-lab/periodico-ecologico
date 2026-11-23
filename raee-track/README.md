# RAEE TRACK 2.0 — ECOBYTE

Prototipo académico de una aplicación web para registrar, clasificar y consultar dispositivos eléctricos y electrónicos en desuso.

## Cómo ejecutar
1. Extrae la carpeta `RAEE_TRACK_V2`.
2. Abre `index.html` en un navegador moderno (Chrome, Edge o Firefox).
3. Para que se carguen UIkit, Chart.js y las fuentes, el equipo debe tener conexión a Internet.
4. No requiere instalación, cuenta ni servidor.

También puede abrirse con la extensión Live Server de Visual Studio Code, aunque no es obligatorio.

## Funcionalidades
- Panel de resumen con unidades registradas por estado.
- Formulario de registro con categoría, estado, cantidad, fecha, ubicación y observaciones.
- Inventario con búsqueda y filtros.
- Edición y eliminación de registros.
- Exportación de inventario a CSV.
- Reportes con gráficas por estado y categoría.
- Guía educativa y enlaces a fuentes institucionales.
- Persistencia local mediante `localStorage`.
- Migración de registros sencillos del prototipo anterior (`raeeTrackDevices`) a la nueva clave `raeeTrackDevices_v2`.

## Estructura
- `index.html`: estructura de la aplicación.
- `css/styles.css`: identidad visual y diseño adaptable.
- `js/app.js`: navegación y lógica de la aplicación.
- `assets/`: reservado para recursos locales adicionales.

## Limitaciones y uso responsable
- Los datos se guardan únicamente en el navegador y perfil donde se registran. No hay sincronización entre equipos ni copias de seguridad automáticas.
- UIkit, Chart.js y Google Fonts se cargan desde CDN; sin Internet, la aplicación puede conservar su funcionalidad básica, pero algunos estilos, iconos o gráficos pueden no estar disponibles.
- El prototipo no recibe residuos, no es un gestor autorizado, no certifica reciclaje ni sustituye la información de las autoridades ambientales.
- La clasificación y las recomendaciones son educativas y dependen de la información que ingresa el usuario.

## Equipo
Juan David Vargas y Oscar Cerquera — Proyecto ECOBYTE, Ingeniería de Software, Universidad Surcolombiana.
