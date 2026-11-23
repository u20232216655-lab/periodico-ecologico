# ECOBYTE

**La tecnología también debe aprender a renovarse.**

ECOBYTE es un periódico digital interactivo de carácter académico sobre los residuos de aparatos eléctricos y electrónicos (RAEE), sus impactos ambientales y las alternativas para promover un consumo tecnológico más responsable.

El proyecto fue desarrollado para consulta desde un navegador, sin necesidad de instalar aplicaciones ni configurar un servidor backend.

## Equipo editorial

- **Juan David Vargas**
- **Oscar Cerquera**

## Contenido del periódico

La página principal reúne las siguientes secciones:

- Reportaje central sobre la problemática mundial y colombiana de los residuos electrónicos.
- IA y mi carrera: oportunidades y responsabilidades desde la Ingeniería de Software.
- Voces del territorio.
- Debate cruzado.
- Bug del mes.
- La cifra del día.
- Calculadora de impacto ambiental.
- RAEE TRACK: prototipo interactivo para registrar y consultar dispositivos electrónicos.
- Historia que inspira y cierre editorial.

## Funcionalidades interactivas

### Calculadora de impacto

Permite introducir cantidades de teléfonos, computadores y tabletas para estimar el peso total de los dispositivos y el porcentaje que podría destinarse a reutilización.

### RAEE TRACK

Prototipo local para registrar dispositivos, clasificarlos por categoría y estado, consultar el inventario, editar o eliminar registros y generar reportes gráficos y archivos CSV.

Los registros de RAEE TRACK se almacenan en el almacenamiento local del navegador (`localStorage`). Por tanto, los datos permanecen en el navegador y dispositivo donde se registran; no se sincronizan con una base de datos ni con otros usuarios.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- UIkit
- Chart.js
- Google Fonts

No se requiere proceso de compilación ni instalación de dependencias.

## Ejecutar el proyecto localmente

1. Clona el repositorio o descarga la rama de trabajo.
2. Abre la carpeta del proyecto en Visual Studio Code.
3. Ejecuta `index.html` con una extensión de servidor local, por ejemplo Live Server.
4. Para abrir el prototipo de inventario, selecciona **RAEE TRACK** desde el periódico o abre `raee-track/index.html`.

También puedes abrir los archivos HTML directamente en el navegador. Se recomienda un servidor local para una experiencia de desarrollo más consistente.

## Publicar con GitHub Pages

La rama de rediseño se puede publicar como sitio estático desde GitHub Pages:

1. Abre **Settings** en el repositorio.
2. En el menú lateral, entra a **Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona la rama `ecobyte-redisenio-integral`.
5. Selecciona la carpeta `/(root)`.
6. Guarda los cambios y espera a que GitHub complete la publicación.

La URL esperada del sitio del proyecto es:

https://u20232216655-lab.github.io/periodico-ecologico/

La publicación solo estará disponible cuando GitHub Pages se encuentre configurado y el despliegue haya finalizado correctamente.

## Estructura del repositorio

```text
periodico-ecologico/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── raee-track/
    ├── index.html
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── app.js
    └── README.md
```

## Rama de trabajo

Los cambios del rediseño integral se mantienen en:

`ecobyte-redisenio-integral`

La rama `main` se conserva separada.

---

**ECOBYTE · Proyecto académico · USCO · Neiva, Huila, Colombia**
