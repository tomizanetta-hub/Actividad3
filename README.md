# ⚽ Ruta Gol — Templos del Fútbol

Sitio web de un recorrido temático por **cuatro estadios de fútbol de Buenos Aires y Avellaneda**.
Trabajo práctico de **Diseño y Desarrollo Web — Actividad 3 — Grupo 9**.

| | |
|---|---|
| 🌐 **Sitio desplegado** | https://tomizanetta-hub.github.io/Actividad3/ *(actualizar si cambia el nombre del repo)* |
| 🎨 **Prototipo en Figma** | https://www.figma.com/design/PYDJ3V7DwH0qmrgeVP71H9/Ruta-Gol---Grupo-9?node-id=2-2 |
| 🧩 **Design System** | Figma (enlace anterior) y versión implementada en [`design-system.html`](https://tomizanetta-hub.github.io/Actividad3/design-system.html) |

## Objetivo

Ayudar a los visitantes a planificar una experiencia informada: elegir qué estadio conocer, entender qué actividades ofrece cada lugar, ubicarlo en el mapa y verificar horarios o condiciones de acceso antes de salir.

- **Tema y categoría:** recorrido temático · fútbol y patrimonio urbano. Hilo conductor: *el estadio como lugar de memoria y pertenencia*.
- **Público destinatario:** hinchas, turistas, estudiantes y personas interesadas en el fútbol y el patrimonio de la ciudad.

## Recorrido

| Orden | Estadio | Club | Barrio | Página |
|---|---|---|---|---|
| 1 | El Cilindro (Estadio Presidente Perón) | Racing Club | Avellaneda | `cilindro.html` |
| 2 | La Bombonera (Estadio Alberto J. Armando) | Boca Juniors | La Boca | `bombonera.html` |
| 3 | El Templo de Caballito (Estadio Arq. Ricardo Etcheverri) | Ferro Carril Oeste | Caballito | `ferro.html` |
| 4 | Más Monumental (Estadio Antonio V. Liberti) | River Plate | Núñez / Belgrano | `monumental.html` |

## Funcionalidades principales

- **Página principal:** presentación, propuesta de valor, mapa del recorrido, acceso a las cuatro paradas, paquetes y promociones, recomendaciones y preguntas frecuentes.
- **Fichas de cada estadio:** historia y arquitectura, actividades, datos para la visita (ubicación, horarios, duración, acceso), mapa, galería con créditos, recomendaciones y navegación a la parada anterior/siguiente.
- **Mapa interactivo:** paradas numeradas con el color de cada club, unidas en el orden sugerido; la lista lateral centra el mapa en cada parada.
- **Reserva de experiencia (simulada):** elección de paquete, fecha, adultos y menores, servicios adicionales; cálculo automático del total en USD, descuento grupal y **conversión a pesos con el dólar oficial del día** (se muestran valor, fuente y fecha); resumen para revisar antes de confirmar y código de reserva.
- **Formulario de contacto (simulado):** nombre, correo, motivo y mensaje, con validación en vivo, resumen de errores y confirmación de envío.
- **Asistente de preguntas frecuentes:** chat disponible en todas las páginas que responde según palabras clave, con preguntas sugeridas; y buscador de preguntas frecuentes en la home.
- **Accesibilidad:** enlace "Saltar al contenido", navegación completa con teclado, foco visible, etiquetas en todos los campos, errores con ícono y texto, `alt` en todas las imágenes, contraste AA.

## Tecnologías

- **HTML5** semántico (`header`, `nav`, `main`, `section`, `aside`, `figure`, `dialog`, `fieldset`).
- **Tailwind CSS v4** como framework de estilos. Los tokens del Design System (colores, tipografía, radios) están en `src/input.css` y se compilan a `css/styles.css`.
- **JavaScript** sin frameworks (vanilla), dividido en módulos por funcionalidad.

### Bibliotecas, APIs y servicios externos

| Recurso | Uso | Por qué |
|---|---|---|
| [Leaflet 1.9](https://leafletjs.com/) (incluida en `vendor/`) | Mapas interactivos | Biblioteca libre y liviana; no requiere clave de API |
| [OpenStreetMap](https://www.openstreetmap.org/) | Mapa base | Datos abiertos (licencia ODbL) |
| [DolarApi.com](https://dolarapi.com/) | Cotización del dólar oficial | API gratuita, sin clave, con fecha de actualización |
| [Bluelytics](https://bluelytics.com.ar/) | Cotización alternativa | Se usa si DolarApi no responde |
| [Wikimedia Commons](https://commons.wikimedia.org/) | Fotografías | Imágenes con licencias libres; cada foto enlaza a su página con autor y licencia |
| Google Fonts (Archivo, Inter) | Tipografías | Licencia SIL Open Font License |

## Estructura del proyecto

```
├── index.html            Página principal
├── cilindro.html         Parada 1 — Racing (Tomás Zanetta)
├── bombonera.html        Parada 2 — Boca (Lucas Pistolesi)
├── ferro.html            Parada 3 — Ferro (Tomás Martinez Menghi)
├── monumental.html       Parada 4 — River (Mateo Marchetti)
├── reservas.html         Formulario de reserva con cálculo y conversión
├── contacto.html         Formulario de contacto
├── design-system.html    Design System implementado
├── src/input.css         Fuente de Tailwind: tokens y componentes
├── css/styles.css        CSS compilado (lo que usa el sitio)
├── js/
│   ├── datos.js          Estadios, paquetes, precios y reglas
│   ├── main.js           Menú móvil, imágenes de respaldo, utilidades
│   ├── mapa.js           Mapas con Leaflet
│   ├── validacion.js     Funciones de validación compartidas
│   ├── reservas.js       Cálculo, tipo de cambio y confirmación
│   ├── contacto.js       Formulario de contacto
│   └── asistente.js      Chat y preguntas frecuentes
├── img/logo.svg          Logo / favicon
└── vendor/leaflet/       Biblioteca Leaflet
```

## Cómo ver o ejecutar el sitio

- **Online:** abrir el enlace del sitio desplegado.
- **Local:** descargar el repositorio y abrir `index.html` en el navegador (o usar *Live Server* en VS Code).
- **Modificar estilos:** si se agregan clases de Tailwind nuevas, recompilar el CSS:
  ```bash
  npm install
  npm run dev     # recompila mientras se edita
  npm run build   # versión final minificada
  ```

## Integrantes y contribuciones

| Integrante | Contribución |
|---|---|
| **Tomás Zanetta** | Página de El Cilindro (`cilindro.html`). Configuración del repositorio y publicación en GitHub Pages. Página principal y mapa del recorrido (`index.html`, `js/mapa.js`). |
| **Lucas Pistolesi** | Página de La Bombonera (`bombonera.html`). Formulario de reserva, cálculo de precios y conversión de moneda (`reservas.html`, `js/reservas.js`, `js/datos.js`). |
| **Tomás Martinez Menghi** | Página de Ferro (`ferro.html`). Formulario de contacto y validaciones (`contacto.html`, `js/contacto.js`, `js/validacion.js`). |
| **Mateo Marchetti** | Página del Más Monumental (`monumental.html`). Asistente de preguntas frecuentes y Design System (`js/asistente.js`, `design-system.html`, `src/input.css`). |

> *Editar esta tabla para que coincida con lo que hizo realmente cada uno y con el historial de commits.*

## Créditos y aclaraciones

- Proyecto académico sin fines comerciales, no afiliado a Racing Club, Boca Juniors, Ferro Carril Oeste ni River Plate.
- Precios, reservas y envío de consultas son **simulaciones**. Horarios y condiciones de visita deben verificarse en las fuentes oficiales de cada club.
- Fotografías: Wikimedia Commons; el autor y la licencia de cada imagen figuran en la página enlazada debajo de cada foto.
- Mapas: © colaboradores de OpenStreetMap.
