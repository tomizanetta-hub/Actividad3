/* ==========================================================
   datos.js — Información compartida por todo el sitio.
   Centralizar los datos evita repetirlos en cada página
   (estadios del mapa, paquetes y precios de reserva).
   ========================================================== */

// Las cuatro paradas, en el orden sugerido del recorrido (Avellaneda → norte de CABA)
const ESTADIOS = [
  {
    id: "cilindro",
    orden: 1,
    nombre: "El Cilindro",
    oficial: "Estadio Presidente Perón",
    club: "Racing Club",
    zona: "Avellaneda",
    direccion: "Pasaje Corbatta y Mozart, Avellaneda",
    coords: [-34.66756, -58.36858],
    color: "#75aadb",
    textoMarcador: "#0f172a",
    pagina: "cilindro.html",
    duracion: "30–75 min",
  },
  {
    id: "bombonera",
    orden: 2,
    nombre: "La Bombonera",
    oficial: "Estadio Alberto J. Armando",
    club: "Boca Juniors",
    zona: "La Boca",
    direccion: "Brandsen 805, CABA",
    coords: [-34.63565, -58.36465],
    color: "#f5b800",
    textoMarcador: "#0f172a",
    pagina: "bombonera.html",
    duracion: "60–90 min",
  },
  {
    id: "ferro",
    orden: 3,
    nombre: "El Templo de Caballito",
    oficial: "Estadio Arq. Ricardo Etcheverri",
    club: "Ferro Carril Oeste",
    zona: "Caballito",
    direccion: "Av. Avellaneda 1240, CABA",
    coords: [-34.61765, -58.44925],
    color: "#15803d",
    textoMarcador: "#ffffff",
    pagina: "ferro.html",
    duracion: "30–45 min",
  },
  {
    id: "monumental",
    orden: 4,
    nombre: "Más Monumental",
    oficial: "Estadio Antonio Vespucio Liberti",
    club: "River Plate",
    zona: "Núñez / Belgrano",
    direccion: "Av. Figueroa Alcorta 7597, CABA",
    coords: [-34.54530, -58.44975],
    color: "#c8102e",
    textoMarcador: "#ffffff",
    pagina: "monumental.html",
    duracion: "90–120 min",
  },
];

// Paquetes de la experiencia. Precios SIMULADOS con fines académicos, expresados en USD.
const PAQUETES = [
  {
    id: "exterior",
    nombre: "Pase Barrios",
    precioUSD: 35,
    descripcion: "Paseo guiado por el exterior de los 4 estadios y sus barrios, sin ingreso a los estadios.",
    incluye: ["Guía en el recorrido exterior", "Mapa digital de la ruta", "Duración aprox. 5 h"],
  },
  {
    id: "clasica",
    nombre: "Ruta Clásica",
    precioUSD: 89,
    descripcion: "Visita interior a La Bombonera y al Más Monumental, con sus museos, más paseo exterior por las otras dos paradas.",
    incluye: ["Entradas a 2 museos/tours", "Traslados en combi entre paradas", "Duración aprox. 7 h"],
    destacado: true,
  },
  {
    id: "completa",
    nombre: "Ruta Gol Completa",
    precioUSD: 149,
    descripcion: "Las 4 paradas con visita interior cuando el club la ofrece, traslados y guía durante toda la jornada.",
    incluye: ["Visitas interiores sujetas a agenda", "Traslados y guía todo el día", "Duración aprox. 9 h"],
  },
];

// Servicios adicionales. "porPersona" indica si el precio se multiplica por la cantidad de visitantes.
const ADICIONALES = [
  { id: "almuerzo", nombre: "Almuerzo en La Boca", precioUSD: 18, porPersona: true },
  { id: "traslado", nombre: "Traslado desde el alojamiento", precioUSD: 12, porPersona: true },
  { id: "fotos", nombre: "Sesión de fotos profesional", precioUSD: 25, porPersona: false },
];

// Reglas de precio
const REGLAS = {
  descuentoMenor: 0.5,     // menores de 12 años pagan el 50 %
  minGrupoDescuento: 6,    // desde 6 personas…
  descuentoGrupo: 0.10,    // …10 % de descuento sobre el subtotal
  maxPersonas: 20,
};

// Tipo de cambio de respaldo: se usa solo si las dos APIs fallan.
// ACTUALIZAR este valor antes de entregar con la cotización del día.
const TIPO_CAMBIO_RESPALDO = {
  venta: 1450,
  fecha: "2026-11-01",
  fuente: "Valor de respaldo cargado manualmente (dólar oficial BNA, venta)",
};
