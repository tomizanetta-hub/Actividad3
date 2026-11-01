/* ==========================================================
   reservas.js — Formulario de reserva de la experiencia Ruta Gol.
   1. Arma las opciones a partir de PAQUETES y ADICIONALES (datos.js).
   2. Calcula el total en USD en cada cambio.
   3. Consulta el tipo de cambio oficial (API) y convierte a ARS.
   4. Valida, muestra un resumen para revisar y confirma (simulación).
   ========================================================== */

// Estado del tipo de cambio que se está usando
const tipoCambio = { venta: null, fecha: null, fuente: "", respaldo: false };

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-reserva");
  if (!form) return;

  dibujarPaquetes();
  dibujarAdicionales();
  configurarFecha();
  preseleccionarDesdeURL();

  form.addEventListener("input", actualizarResumen);
  form.addEventListener("change", actualizarResumen);
  document.getElementById("btn-actualizar-tc").addEventListener("click", obtenerTipoCambio);

  // Botones − / + para las cantidades (más fácil en celular que el campo numérico)
  document.querySelectorAll("[data-paso]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const campo = document.getElementById(btn.dataset.campo);
      const nuevo = Number(campo.value || 0) + Number(btn.dataset.paso);
      campo.value = Math.min(Number(campo.max), Math.max(Number(campo.min), nuevo));
      campo.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  validarAlSalir(form, reglasReserva());
  form.addEventListener("submit", revisarReserva);
  form.addEventListener("reset", () => setTimeout(() => {
    Object.keys(reglasReserva()).forEach((id) => limpiarError(form.querySelector(`#${id}`)));
    document.getElementById("error-paquete").textContent = "";
    document.getElementById("errores-reserva").hidden = true;
    actualizarResumen();
  }));

  document.getElementById("btn-editar").addEventListener("click", () => document.getElementById("dialogo-reserva").close());
  document.getElementById("btn-confirmar").addEventListener("click", confirmarReserva);
  document.getElementById("btn-nueva").addEventListener("click", nuevaReserva);

  obtenerTipoCambio();
  actualizarResumen();
});

/* ---------- 1. Construcción de opciones ---------- */

function dibujarPaquetes() {
  const cont = document.getElementById("opciones-paquete");
  cont.innerHTML = PAQUETES.map((p) => `
    <label class="tarjeta relative flex cursor-pointer flex-col gap-2 p-4 has-[:checked]:border-cancha has-[:checked]:ring-2 has-[:checked]:ring-cancha has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-acento">
      <span class="flex items-center gap-2">
        <input type="radio" name="paquete" value="${p.id}" class="size-5 shrink-0 accent-cancha" aria-describedby="desc-${p.id}">
        <span class="font-display text-lg font-extrabold leading-tight">${p.nombre}</span>
      </span>
      <span><span class="font-display text-2xl font-black">USD ${p.precioUSD}</span> <span class="text-sm text-tinta-suave">por adulto</span></span>
      ${p.destacado ? '<span class="chip w-fit bg-boca text-tinta">★ El más elegido</span>' : ""}
      <span id="desc-${p.id}" class="text-sm text-tinta-suave">${p.descripcion}</span>
      <span class="hidden items-center gap-1 text-sm font-bold text-cancha [label:has(:checked)_&]:flex"><span aria-hidden="true">✓</span> Seleccionado</span>
    </label>`).join("");
}

function dibujarAdicionales() {
  const cont = document.getElementById("opciones-adicionales");
  cont.innerHTML = ADICIONALES.map((a) => `
    <label class="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-borde bg-white px-3 py-2 has-[:checked]:border-cancha has-[:checked]:bg-cancha-claro">
      <span class="flex items-center gap-3">
        <input type="checkbox" name="adicional" value="${a.id}" class="size-5 accent-cancha">
        <span class="font-semibold">${a.nombre}</span>
      </span>
      <span class="whitespace-nowrap text-sm">USD ${a.precioUSD} ${a.porPersona ? "por persona" : "por grupo"}</span>
    </label>`).join("");
}

// La fecha mínima es mañana y la máxima, 6 meses adelante (prevención de errores)
function configurarFecha() {
  const fecha = document.getElementById("fecha");
  const hoy = new Date();
  const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  const limite = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate());
  fecha.min = aISO(manana);
  fecha.max = aISO(limite);
}

function aISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Si se llega desde un botón "Reservar" de la home (reservas.html?paquete=clasica), se preselecciona
function preseleccionarDesdeURL() {
  const id = new URLSearchParams(location.search).get("paquete");
  const radio = document.querySelector(`input[name="paquete"][value="${id}"]`);
  if (radio) radio.checked = true;
}

/* ---------- 2. Cálculo del importe ---------- */

// Se trabaja en centavos (enteros) para evitar errores de redondeo con decimales
function calcular() {
  const form = document.getElementById("form-reserva");
  const paquete = PAQUETES.find((p) => p.id === form.querySelector('input[name="paquete"]:checked')?.value);
  const adultos = Math.max(0, parseInt(form.adultos.value, 10) || 0);
  const menores = Math.max(0, parseInt(form.menores.value, 10) || 0);
  const personas = adultos + menores;
  const elegidos = [...form.querySelectorAll('input[name="adicional"]:checked')]
    .map((c) => ADICIONALES.find((a) => a.id === c.value));

  const lineas = [];
  let subtotal = 0;

  if (paquete) {
    const unit = paquete.precioUSD * 100;
    if (adultos) {
      lineas.push({ texto: `${paquete.nombre} · ${adultos} adulto${adultos > 1 ? "s" : ""} × ${formatoUSD.format(unit / 100)}`, cent: unit * adultos });
    }
    if (menores) {
      const unitMenor = Math.round(unit * (1 - REGLAS.descuentoMenor));
      lineas.push({ texto: `${paquete.nombre} · ${menores} menor${menores > 1 ? "es" : ""} × ${formatoUSD.format(unitMenor / 100)} (50 %)`, cent: unitMenor * menores });
    }
  }
  elegidos.forEach((a) => {
    const cant = a.porPersona ? personas : 1;
    if (cant) lineas.push({ texto: `${a.nombre} · ${cant} × ${formatoUSD.format(a.precioUSD)}`, cent: a.precioUSD * 100 * cant });
  });
  lineas.forEach((l) => (subtotal += l.cent));

  const aplicaGrupo = personas >= REGLAS.minGrupoDescuento && subtotal > 0;
  const descuento = aplicaGrupo ? Math.round(subtotal * REGLAS.descuentoGrupo) : 0;
  const totalUSD = subtotal - descuento;
  const totalARS = tipoCambio.venta ? Math.round(totalUSD * tipoCambio.venta) : null;

  return { paquete, adultos, menores, personas, elegidos, lineas, subtotal, descuento, totalUSD, totalARS, aplicaGrupo };
}

function actualizarResumen() {
  const r = calcular();
  const lista = document.getElementById("resumen-lineas");
  lista.innerHTML = r.lineas.length
    ? r.lineas.map((l) => `<li class="flex justify-between gap-3 py-1.5"><span>${l.texto}</span><span class="whitespace-nowrap font-semibold">${formatoUSD.format(l.cent / 100)}</span></li>`).join("")
    : '<li class="py-1.5 text-tinta-suave">Elegí un paquete y la cantidad de personas para ver el cálculo.</li>';

  document.getElementById("res-subtotal").textContent = formatoUSD.format(r.subtotal / 100);
  const filaDesc = document.getElementById("fila-descuento");
  filaDesc.hidden = !r.aplicaGrupo;
  document.getElementById("res-descuento").textContent = `− ${formatoUSD.format(r.descuento / 100)}`;
  document.getElementById("res-total-usd").textContent = formatoUSD.format(r.totalUSD / 100);
  document.getElementById("res-total-ars").textContent = r.totalARS === null ? "Calculando…" : formatoARS.format(r.totalARS / 100);

  // Aviso de promoción: cuántas personas faltan para el descuento grupal
  const promo = document.getElementById("aviso-promo");
  const faltan = REGLAS.minGrupoDescuento - r.personas;
  promo.textContent = r.aplicaGrupo
    ? "✓ Se aplicó el 10 % de descuento por grupo de 6 o más personas."
    : r.personas > 0 && faltan > 0
      ? `Sumando ${faltan} persona${faltan > 1 ? "s" : ""} más obtenés 10 % de descuento grupal.`
      : "";
  return r;
}

/* ---------- 3. Tipo de cambio (API) ---------- */

async function obtenerTipoCambio() {
  const estado = document.getElementById("tc-estado");
  const boton = document.getElementById("btn-actualizar-tc");
  estado.textContent = "Consultando cotización del dólar oficial…";
  boton.disabled = true;

  // Fuente principal: DolarApi (dólar oficial, valor de venta)
  // Fuente alternativa: Bluelytics. Si ambas fallan se usa el valor de respaldo de datos.js
  const fuentes = [
    {
      url: "https://dolarapi.com/v1/dolares/oficial",
      leer: (d) => ({ venta: d.venta, fecha: d.fechaActualizacion, fuente: "DolarApi.com — dólar oficial (venta)" }),
    },
    {
      url: "https://api.bluelytics.com.ar/v2/latest",
      leer: (d) => ({ venta: d.oficial.value_sell, fecha: d.last_update, fuente: "Bluelytics — dólar oficial (venta)" }),
    },
  ];

  let obtenido = null;
  for (const f of fuentes) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const resp = await fetch(f.url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const datos = f.leer(await resp.json());
      if (!(datos.venta > 0)) throw new Error("Cotización inválida");
      obtenido = { ...datos, respaldo: false };
      break;
    } catch (err) {
      console.warn(`No se pudo consultar ${f.url}:`, err.message);
    }
  }
  if (!obtenido) obtenido = { ...TIPO_CAMBIO_RESPALDO, respaldo: true };

  Object.assign(tipoCambio, obtenido);
  mostrarTipoCambio();
  boton.disabled = false;
  actualizarResumen();
}

function mostrarTipoCambio() {
  const fecha = new Date(tipoCambio.fecha.length <= 10 ? `${tipoCambio.fecha}T12:00:00` : tipoCambio.fecha);
  const fechaTxt = fecha.toLocaleString("es-AR", { dateStyle: "long", ...(tipoCambio.respaldo ? {} : { timeStyle: "short" }) });
  document.getElementById("tc-valor").textContent = `USD 1 = ${formatoARS.format(tipoCambio.venta)}`;
  document.getElementById("tc-fuente").textContent = tipoCambio.fuente;
  document.getElementById("tc-fecha").textContent = fechaTxt;
  document.getElementById("tc-estado").textContent = tipoCambio.respaldo
    ? "⚠ No se pudo consultar la cotización en línea. Se usa un valor de referencia: el importe en pesos es aproximado."
    : "✓ Cotización actualizada en línea.";
}

/* ---------- 4. Validación, revisión y confirmación ---------- */

function reglasReserva() {
  return {
    fecha: (v, c) => {
      if (!v) return "Elegí la fecha de la visita.";
      if (v < c.min) return "La fecha debe ser a partir de mañana.";
      if (v > c.max) return "Solo se puede reservar con hasta 6 meses de anticipación.";
      return "";
    },
    adultos: (v) => {
      const n = Number(v);
      if (v === "" || !Number.isInteger(n)) return "Indicá la cantidad de adultos con un número entero.";
      if (n < 1) return "La reserva necesita al menos 1 adulto responsable.";
      return "";
    },
    menores: (v) => {
      const n = Number(v || 0);
      if (!Number.isInteger(n) || n < 0) return "La cantidad de menores debe ser un número entero, 0 o más.";
      const adultos = Number(document.getElementById("adultos").value || 0);
      if (adultos + n > REGLAS.maxPersonas) return `El máximo por reserva es de ${REGLAS.maxPersonas} personas. Para grupos más grandes, escribinos desde Contacto.`;
      return "";
    },
    "nombre-reserva": (v) => (!v ? "Escribí el nombre de quien reserva." : v.length < 3 ? "El nombre debe tener al menos 3 letras." : ""),
    "email-reserva": (v) => (!v ? "Escribí un correo para enviarte la confirmación." : !EMAIL_VALIDO.test(v) ? "El correo no tiene un formato válido. Ejemplo: nombre@correo.com" : ""),
    "telefono-reserva": (v) => (v && !/^[+\d][\d\s-]{7,}$/.test(v) ? "El teléfono solo puede tener números, espacios, guiones y + (mínimo 8 dígitos)." : ""),
    condiciones: (v) => (!v ? "Para continuar tenés que aceptar las condiciones de la visita." : ""),
  };
}

function revisarReserva(e) {
  e.preventDefault();
  const form = e.target;
  const errores = validarFormulario(form, reglasReserva());

  // El grupo de radios se valida aparte
  const errPaquete = document.getElementById("error-paquete");
  if (!form.querySelector('input[name="paquete"]:checked')) {
    errPaquete.innerHTML = '<span aria-hidden="true">⚠</span><span>Elegí uno de los tres paquetes.</span>';
    const primero = form.querySelector('input[name="paquete"]');
    primero.id = "paquete-primero";
    errores.unshift({ campo: primero, mensaje: "Elegí uno de los tres paquetes." });
  } else errPaquete.textContent = "";

  mostrarResumenErrores(document.getElementById("errores-reserva"), errores);
  if (errores.length) return;

  // Resumen previo a confirmar (prevención de errores)
  const r = actualizarResumen();
  const fecha = new Date(`${form.fecha.value}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("dialogo-contenido").innerHTML = `
    <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      <dt class="font-semibold">Paquete</dt><dd>${r.paquete.nombre}</dd>
      <dt class="font-semibold">Fecha</dt><dd>${fecha}</dd>
      <dt class="font-semibold">Personas</dt><dd>${r.adultos} adulto(s), ${r.menores} menor(es)</dd>
      <dt class="font-semibold">Adicionales</dt><dd>${r.elegidos.length ? r.elegidos.map((a) => a.nombre).join(", ") : "Ninguno"}</dd>
      <dt class="font-semibold">A nombre de</dt><dd>${escapar(form["nombre-reserva"].value)} (${escapar(form["email-reserva"].value)})</dd>
    </dl>
    <ul class="mt-4 divide-y divide-borde border-y border-borde text-sm">
      ${r.lineas.map((l) => `<li class="flex justify-between gap-3 py-1.5"><span>${l.texto}</span><span class="font-semibold">${formatoUSD.format(l.cent / 100)}</span></li>`).join("")}
      ${r.descuento ? `<li class="flex justify-between gap-3 py-1.5 text-exito"><span>Descuento grupal 10 %</span><span class="font-semibold">− ${formatoUSD.format(r.descuento / 100)}</span></li>` : ""}
    </ul>
    <p class="mt-4 flex justify-between font-display text-xl font-extrabold"><span>Total</span><span>${formatoUSD.format(r.totalUSD / 100)}</span></p>
    <p class="flex justify-between font-display text-lg font-extrabold text-cancha"><span>Equivale a</span><span>${formatoARS.format(r.totalARS / 100)}</span></p>
    <p class="mt-2 text-sm text-tinta-suave">Tipo de cambio: ${document.getElementById("tc-valor").textContent} · ${tipoCambio.fuente} · ${document.getElementById("tc-fecha").textContent}.</p>`;
  document.getElementById("dialogo-reserva").showModal();
}

function confirmarReserva() {
  const r = calcular();
  const codigo = "RG-" + Date.now().toString(36).slice(-5).toUpperCase();
  document.getElementById("dialogo-reserva").close();
  const form = document.getElementById("form-reserva");
  const nombre = form["nombre-reserva"].value.trim().split(" ")[0];
  const email = form["email-reserva"].value.trim();

  const exito = document.getElementById("exito-reserva");
  exito.querySelector("[data-codigo]").textContent = codigo;
  exito.querySelector("[data-detalle]").textContent =
    `¡Listo, ${nombre}! Tu solicitud del paquete ${r.paquete.nombre} para ${r.personas} persona(s) por ${formatoUSD.format(r.totalUSD / 100)} ` +
    `(${formatoARS.format(r.totalARS / 100)}) quedó registrada. En un sitio real recibirías la confirmación en ${email}.`;
  form.hidden = true;
  document.getElementById("columna-resumen").hidden = true;
  exito.hidden = false;
  exito.focus();
}

function nuevaReserva() {
  const form = document.getElementById("form-reserva");
  form.reset();
  form.hidden = false;
  document.getElementById("columna-resumen").hidden = false;
  document.getElementById("exito-reserva").hidden = true;
  form.querySelector('input[name="paquete"]').focus();
}

// Evita que el texto ingresado se interprete como HTML en el resumen
function escapar(t) {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
