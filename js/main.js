/* ==========================================================
   main.js — Comportamiento común a todas las páginas:
   menú móvil, año del pie y respaldo de imágenes.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  iniciarMenuMovil();
  marcarImagenesSinCarga();
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
});

// Menú hamburguesa: alterna aria-expanded para que los lectores de pantalla
// sepan si el menú está abierto, y se cierra con Escape (control y libertad del usuario).
function iniciarMenuMovil() {
  const boton = document.getElementById("btn-menu");
  const menu = document.getElementById("menu-movil");
  if (!boton || !menu) return;

  const cerrar = () => {
    boton.setAttribute("aria-expanded", "false");
    boton.querySelector("[data-texto]").textContent = "Menú";
    menu.hidden = true;
  };

  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    if (abierto) return cerrar();
    boton.setAttribute("aria-expanded", "true");
    boton.querySelector("[data-texto]").textContent = "Cerrar";
    menu.hidden = false;
    menu.querySelector("a")?.focus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
      cerrar();
      boton.focus();
    }
  });

  // Si se agranda la ventana a escritorio, el menú móvil se oculta
  window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => e.matches && cerrar());
}

// Si una foto externa no carga, se muestra un recuadro con su texto alternativo
// para que el diseño no se rompa (ayuda a recuperarse de errores).
function marcarImagenesSinCarga() {
  document.querySelectorAll("img[data-foto]").forEach((img) => {
    const fallar = () => {
      const caja = document.createElement("div");
      caja.className = img.className + " img-fallback grid place-items-center p-4 text-center text-sm font-semibold text-tinta-suave";
      caja.setAttribute("role", "img");
      caja.setAttribute("aria-label", img.alt);
      caja.textContent = img.alt;
      img.replaceWith(caja);
    };
    if (img.complete && img.naturalWidth === 0) fallar();
    else img.addEventListener("error", fallar, { once: true });
  });
}

// Formatos de moneda reutilizados por reservas.js
const formatoUSD = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const formatoARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

// Quita tildes y pasa a minúsculas (usado por el asistente y validaciones)
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
