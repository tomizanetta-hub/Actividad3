/* ==========================================================
   validacion.js — Funciones de validación compartidas por los
   formularios de contacto y de reserva.
   Cada campo tiene un <p id="error-CAMPO"> vinculado mediante
   aria-describedby, así el lector de pantalla lee el error.
   ========================================================== */

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mostrarError(campo, mensaje) {
  const destino = document.getElementById(`error-${campo.id || campo.name}`);
  campo.setAttribute?.("aria-invalid", "true");
  if (destino) {
    // Icono + texto: el error no se comunica solo con color rojo
    destino.innerHTML = `<span aria-hidden="true">⚠</span><span>${mensaje}</span>`;
  }
}

function limpiarError(campo) {
  const destino = document.getElementById(`error-${campo.id || campo.name}`);
  campo.removeAttribute?.("aria-invalid");
  if (destino) destino.textContent = "";
}

/**
 * Recorre las reglas y devuelve la lista de errores.
 * reglas = { idCampo: (valor, campo) => "mensaje de error" | "" }
 */
function validarFormulario(form, reglas) {
  const errores = [];
  for (const [id, regla] of Object.entries(reglas)) {
    const campo = form.querySelector(`#${id}`);
    const valor = campo.type === "checkbox" ? campo.checked : campo.value.trim();
    const mensaje = regla(valor, campo);
    if (mensaje) {
      mostrarError(campo, mensaje);
      errores.push({ campo, mensaje });
    } else {
      limpiarError(campo);
    }
  }
  return errores;
}

/**
 * Muestra un resumen de errores arriba del formulario con enlaces a cada campo
 * y le da el foco, para que quien usa teclado o lector sepa qué corregir.
 */
function mostrarResumenErrores(caja, errores) {
  if (!errores.length) {
    caja.hidden = true;
    caja.innerHTML = "";
    return;
  }
  const items = errores
    .map((e) => `<li><a class="enlace text-error" href="#${e.campo.id}">${e.mensaje}</a></li>`)
    .join("");
  caja.innerHTML = `
    <h2 class="font-display text-lg font-extrabold">Revisá ${errores.length === 1 ? "este dato" : `estos ${errores.length} datos`} antes de continuar:</h2>
    <ul class="mt-2 list-disc space-y-1 pl-5">${items}</ul>`;
  caja.hidden = false;
  caja.focus();
}

/** Valida un campo cuando el usuario sale de él (feedback inmediato, sin molestar mientras escribe). */
function validarAlSalir(form, reglas) {
  for (const [id, regla] of Object.entries(reglas)) {
    const campo = form.querySelector(`#${id}`);
    const evento = campo.type === "checkbox" || campo.tagName === "SELECT" ? "change" : "blur";
    campo.addEventListener(evento, () => {
      const valor = campo.type === "checkbox" ? campo.checked : campo.value.trim();
      const msg = regla(valor, campo);
      msg ? mostrarError(campo, msg) : limpiarError(campo);
    });
    // Si el campo ya tenía error, se limpia apenas el dato pasa a ser válido
    campo.addEventListener("input", () => {
      if (campo.getAttribute("aria-invalid") !== "true") return;
      const valor = campo.type === "checkbox" ? campo.checked : campo.value.trim();
      if (!regla(valor, campo)) limpiarError(campo);
    });
  }
}
