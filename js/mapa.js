/* ==========================================================
   mapa.js — Mapas con Leaflet + OpenStreetMap.
   • #mapa-recorrido: las 4 paradas numeradas y unidas en el orden sugerido.
   • #mapa-estadio[data-estadio]: mapa de una ficha, con la parada actual destacada.
   Leaflet es una biblioteca JS libre; los mapas base son de OpenStreetMap.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof L === "undefined") return mostrarErrorMapa();
  const general = document.getElementById("mapa-recorrido");
  if (general) crearMapaRecorrido(general);
  const ficha = document.getElementById("mapa-estadio");
  if (ficha) crearMapaEstadio(ficha);
});

function capaBase(mapa) {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>',
  }).addTo(mapa);
}

// Marcador circular con el número de parada (el número evita depender solo del color)
function iconoParada(est, destacado = true) {
  return L.divIcon({
    className: "",
    html: `<span class="marcador-ruta" style="background:${est.color};color:${est.textoMarcador};opacity:${destacado ? 1 : 0.55}">${est.orden}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function popupParada(est) {
  return `<strong>${est.orden}. ${est.nombre}</strong><br>${est.club} · ${est.zona}<br><a href="${est.pagina}">Ver ficha del estadio</a>`;
}

function crearMapaRecorrido(contenedor) {
  const mapa = L.map(contenedor, { scrollWheelZoom: false });
  capaBase(mapa);

  const marcadores = {};
  ESTADIOS.forEach((est) => {
    marcadores[est.id] = L.marker(est.coords, {
      icon: iconoParada(est),
      title: `${est.orden}. ${est.nombre}`,
      alt: `Parada ${est.orden}: ${est.nombre}`,
      keyboard: true,
    }).addTo(mapa).bindPopup(popupParada(est));
  });

  // Línea punteada que indica el orden sugerido (no es un trayecto real de transporte)
  const linea = L.polyline(ESTADIOS.map((e) => e.coords), {
    color: "#14532d", weight: 3, dashArray: "6 8", opacity: 0.8,
  }).addTo(mapa);
  mapa.fitBounds(linea.getBounds(), { padding: [40, 40] });

  // Los botones de la lista lateral centran el mapa en cada parada
  document.querySelectorAll("[data-ir-a]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const est = ESTADIOS.find((e) => e.id === boton.dataset.irA);
      mapa.flyTo(est.coords, 15, { duration: 0.8 });
      marcadores[est.id].openPopup();
      contenedor.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  const verTodo = document.getElementById("ver-recorrido-completo");
  verTodo?.addEventListener("click", () => {
    mapa.closePopup();
    mapa.flyToBounds(linea.getBounds(), { padding: [40, 40], duration: 0.8 });
  });
}

function crearMapaEstadio(contenedor) {
  const actual = ESTADIOS.find((e) => e.id === contenedor.dataset.estadio);
  const mapa = L.map(contenedor, { scrollWheelZoom: false }).setView(actual.coords, 15);
  capaBase(mapa);

  ESTADIOS.forEach((est) => {
    const esActual = est.id === actual.id;
    const m = L.marker(est.coords, {
      icon: iconoParada(est, esActual),
      title: `${est.orden}. ${est.nombre}`,
      alt: `Parada ${est.orden}: ${est.nombre}`,
      zIndexOffset: esActual ? 1000 : 0,
    }).addTo(mapa).bindPopup(popupParada(est));
    if (esActual) m.openPopup();
  });
}

function mostrarErrorMapa() {
  document.querySelectorAll("#mapa-recorrido, #mapa-estadio").forEach((c) => {
    c.innerHTML = '<p class="p-6 text-center font-semibold">No se pudo cargar el mapa. Las direcciones de cada parada figuran en la lista.</p>';
  });
}
