/* ==========================================================
   pago.js — Checkout SIMULADO para la reserva.
   Reproduce el flujo de una pasarela de pagos (elegir medio,
   cargar la tarjeta, procesar y ver el resultado) sin servidor,
   sin APIs de cobro y sin datos reales: todo pasa en el navegador.

   Para que nadie cargue una tarjeta verdadera, el formulario SOLO
   acepta las tarjetas de prueba publicadas para entornos de testeo.
   El resultado del pago lo decide el nombre del titular:
   APRO = aprobado, FUND/SECU/EXPI/OTHE = rechazado, CONT = pendiente.
   ========================================================== */

const PagoSimulado = (() => {
  // Tarjetas de prueba de sandbox: no sirven para cobrar, solo para demostraciones.
  const TARJETAS_PRUEBA = [
    { marca: "visa", etiqueta: "Visa", numero: "4509953566233704", cvv: "123", venc: "11/30" },
    { marca: "mastercard", etiqueta: "Mastercard", numero: "5031755734530604", cvv: "123", venc: "11/30" },
    { marca: "amex", etiqueta: "American Express", numero: "371180303257522", cvv: "1234", venc: "11/30" },
  ];

  // Códigos que simulan la respuesta del emisor (van en el nombre del titular)
  const RESPUESTAS = {
    APRO: { estado: "aprobado", titulo: "¡Pago aprobado!", detalle: "El emisor autorizó la operación." },
    CONT: { estado: "pendiente", titulo: "Pago pendiente", detalle: "El emisor todavía no confirmó la operación. Te avisaríamos por correo cuando se acredite." },
    FUND: { estado: "rechazado", titulo: "Pago rechazado", detalle: "La tarjeta no tiene fondos suficientes. Probá con otra tarjeta o pagá en menos cuotas." },
    SECU: { estado: "rechazado", titulo: "Pago rechazado", detalle: "El código de seguridad es inválido. Revisá el CVV que figura en la tarjeta." },
    EXPI: { estado: "rechazado", titulo: "Pago rechazado", detalle: "La fecha de vencimiento es inválida. Revisá el mes y el año de la tarjeta." },
    OTHE: { estado: "rechazado", titulo: "Pago rechazado", detalle: "El emisor rechazó la operación por un error general. Podés intentarlo de nuevo." },
  };

  // Planes de cuotas. El coeficiente simula el recargo por financiación.
  const PLANES = [
    { cuotas: 1, coef: 1, leyenda: "" },
    { cuotas: 3, coef: 1, leyenda: "sin interés" },
    { cuotas: 6, coef: 1.15, leyenda: "con interés" },
    { cuotas: 12, coef: 1.35, leyenda: "con interés" },
  ];

  const SALDO_CUENTA = 25000000; // $250.000,00 ficticios, en centavos

  // Datos de la reserva en curso y callback de éxito
  let ctx = null;
  // Paso al que lleva la flecha de la cabecera (null = no se puede volver)
  let pasoAnterior = null;

  /* ---------- Apertura y navegación entre pasos ---------- */

  function abrir(opciones) {
    ctx = { ...opciones, medio: null };
    const dialogo = document.getElementById("dialogo-pago");
    document.getElementById("pago-total").textContent = formatoARS.format(ctx.totalARS / 100);
    // Se abre primero para que el foco quede en el título del paso y no en la cruz de cerrar
    dialogo.showModal();
    pasoMedios();
  }

  function pintar(html, anterior) {
    const cont = document.getElementById("pago-contenido");
    cont.innerHTML = html;
    cont.closest(".pago-cuerpo").scrollTop = 0; // cada paso arranca arriba
    pasoAnterior = anterior || null;
    document.querySelector("#dialogo-pago [data-atras]").hidden = !pasoAnterior;
    cont.querySelector("[data-foco]")?.focus();
    return cont;
  }

  function cerrar() {
    document.getElementById("dialogo-pago").close();
  }

  /* ---------- Paso 1: elegir el medio de pago ---------- */

  function pasoMedios() {
    const alcanzaSaldo = SALDO_CUENTA >= ctx.totalARS;
    const cont = pintar(`
      <h3 class="pago-paso-titulo" tabindex="-1" data-foco>¿Cómo querés pagar?</h3>
      <ul class="pago-medios">
        <li><button type="button" class="pago-medio" data-medio="credito">
          <span class="pago-medio-icono">${ICONO_TARJETA}</span>
          <span class="pago-medio-texto"><strong>Tarjeta de crédito</strong><span>Hasta 12 cuotas · 3 cuotas sin interés</span></span>
          <span class="pago-medio-flecha" aria-hidden="true">${ICONO_FLECHA}</span>
        </button></li>
        <li><button type="button" class="pago-medio" data-medio="debito">
          <span class="pago-medio-icono">${ICONO_TARJETA}</span>
          <span class="pago-medio-texto"><strong>Tarjeta de débito</strong><span>Se debita en el momento, en un pago</span></span>
          <span class="pago-medio-flecha" aria-hidden="true">${ICONO_FLECHA}</span>
        </button></li>
        <li><button type="button" class="pago-medio" data-medio="cuenta">
          <span class="pago-medio-icono">${ICONO_BILLETERA}</span>
          <span class="pago-medio-texto"><strong>Dinero en cuenta</strong><span>Saldo disponible: ${formatoARS.format(SALDO_CUENTA / 100)}${alcanzaSaldo ? "" : " · no alcanza para este total"}</span></span>
          <span class="pago-medio-flecha" aria-hidden="true">${ICONO_FLECHA}</span>
        </button></li>
      </ul>
      <button type="button" class="pago-boton pago-boton-secundario" data-volver style="margin-top:1rem">Volver a la reserva</button>`, null);

    cont.querySelectorAll("[data-medio]").forEach((b) => {
      b.addEventListener("click", () => {
        ctx.medio = b.dataset.medio;
        ctx.medio === "cuenta" ? pasoCuenta() : pasoTarjeta();
      });
    });
    cont.querySelector("[data-volver]").addEventListener("click", cerrar);
  }

  /* ---------- Paso 2a: datos de la tarjeta ---------- */

  function pasoTarjeta() {
    const credito = ctx.medio === "credito";
    const cont = pintar(`
      <h3 class="pago-paso-titulo" tabindex="-1" data-foco>Datos de la tarjeta de ${credito ? "crédito" : "débito"}</h3>

      <div class="pago-tarjeta-visual" id="pago-visual" data-marca="">
        <div class="pago-chip" aria-hidden="true"></div>
        <strong class="pago-tarjeta-marca" id="pago-visual-marca" aria-hidden="true"></strong>
        <p class="pago-tarjeta-numero" id="pago-visual-numero" aria-hidden="true">•••• •••• •••• ••••</p>
        <div class="pago-tarjeta-pie" aria-hidden="true">
          <p><span>Titular</span><em id="pago-visual-titular" style="font-style:normal">NOMBRE APELLIDO</em></p>
          <p><span>Vence</span><em id="pago-visual-venc" style="font-style:normal">MM/AA</em></p>
        </div>
      </div>

      <form class="pago-form" id="pago-form" novalidate>
        <div class="pago-campo">
          <label for="pago-numero">Número de la tarjeta</label>
          <input id="pago-numero" name="numero" type="text" inputmode="numeric" autocomplete="off" maxlength="19" placeholder="0000 0000 0000 0000" aria-describedby="pago-ayuda-numero pago-error-numero">
          <p class="pago-ayuda" id="pago-ayuda-numero">Es una simulación: no uses una tarjeta real. Abajo tenés tarjetas de prueba.</p>
          <p class="pago-error" id="pago-error-numero" aria-live="polite"></p>
        </div>

        <div class="pago-campo">
          <label for="pago-titular">Nombre del titular, como figura en la tarjeta</label>
          <input id="pago-titular" name="titular" type="text" autocomplete="off" maxlength="40" placeholder="APRO Perez" aria-describedby="pago-error-titular">
          <p class="pago-error" id="pago-error-titular" aria-live="polite"></p>
        </div>

        <div class="pago-fila">
          <div class="pago-campo">
            <label for="pago-venc">Vencimiento</label>
            <input id="pago-venc" name="venc" type="text" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="MM/AA" aria-describedby="pago-error-venc">
            <p class="pago-error" id="pago-error-venc" aria-live="polite"></p>
          </div>
          <div class="pago-campo">
            <label for="pago-cvv">Código de seguridad</label>
            <input id="pago-cvv" name="cvv" type="text" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="123" aria-describedby="pago-error-cvv">
            <p class="pago-error" id="pago-error-cvv" aria-live="polite"></p>
          </div>
        </div>

        <div class="pago-campo">
          <label for="pago-dni">Documento del titular</label>
          <input id="pago-dni" name="dni" type="text" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="12345678" aria-describedby="pago-error-dni">
          <p class="pago-error" id="pago-error-dni" aria-live="polite"></p>
        </div>

        ${credito ? `
        <div class="pago-campo">
          <label for="pago-cuotas">Cuotas</label>
          <select id="pago-cuotas" name="cuotas">${opcionesCuotas()}</select>
          <p class="pago-ayuda" id="pago-ayuda-cuotas" aria-live="polite"></p>
        </div>` : ""}

        <button type="submit" class="pago-boton">Pagar ${formatoARS.format(ctx.totalARS / 100)}</button>
        <button type="button" class="pago-boton pago-boton-secundario" data-volver>Cambiar medio de pago</button>
      </form>

      <details class="pago-pruebas">
        <summary>Ver tarjetas de prueba (ninguna es real)</summary>
        <div class="pago-pruebas-cuerpo">
          <p class="pago-ayuda" style="margin:0">Tocá una para completar el formulario. El resultado lo decide el nombre del titular: <strong>APRO</strong> aprueba, <strong>FUND</strong>, <strong>SECU</strong>, <strong>EXPI</strong> y <strong>OTHE</strong> rechazan, <strong>CONT</strong> deja el pago pendiente.</p>
          ${TARJETAS_PRUEBA.map((t, i) => `
            <button type="button" class="pago-prueba" data-prueba="${i}">
              <span><strong>${t.etiqueta}</strong><br><code>${agrupar(t.numero, t.marca)}</code></span>
              <span>CVV ${t.cvv} · ${t.venc}</span>
            </button>`).join("")}
        </div>
      </details>`, pasoMedios);

    const form = cont.querySelector("#pago-form");
    const numero = form.numero;

    // Máscaras: el número se agrupa de a 4 (o 4-6-5 en Amex) y el vencimiento como MM/AA
    numero.addEventListener("input", () => {
      const limpio = soloDigitos(numero.value).slice(0, 16);
      const marca = detectarMarca(limpio);
      numero.value = agrupar(limpio, marca);
      numero.maxLength = marca === "amex" ? 17 : 19;
      form.cvv.maxLength = marca === "amex" ? 4 : 3;
      dibujarTarjeta(form);
    });
    form.venc.addEventListener("input", () => {
      const d = soloDigitos(form.venc.value).slice(0, 4);
      form.venc.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
      dibujarTarjeta(form);
    });
    form.cvv.addEventListener("input", () => (form.cvv.value = soloDigitos(form.cvv.value)));
    form.dni.addEventListener("input", () => (form.dni.value = soloDigitos(form.dni.value)));
    form.titular.addEventListener("input", () => {
      form.titular.value = form.titular.value.toUpperCase();
      dibujarTarjeta(form);
    });
    form.cuotas?.addEventListener("change", () => mostrarAyudaCuotas(form));

    cont.querySelectorAll("[data-prueba]").forEach((b) => {
      b.addEventListener("click", () => {
        const t = TARJETAS_PRUEBA[Number(b.dataset.prueba)];
        form.numero.value = agrupar(t.numero, t.marca);
        form.cvv.value = t.cvv;
        form.venc.value = t.venc;
        form.dni.value = "12345678";
        if (!form.titular.value) form.titular.value = "APRO PEREZ";
        dibujarTarjeta(form);
        form.titular.focus();
      });
    });

    cont.querySelector("[data-volver]").addEventListener("click", pasoMedios);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (validarTarjeta(form)) procesar(datosDelPago(form));
    });

    if (credito) mostrarAyudaCuotas(form);
  }

  function opcionesCuotas() {
    return PLANES.map((p) => {
      const total = Math.round(ctx.totalARS * p.coef);
      const cuota = Math.round(total / p.cuotas);
      const txt = p.cuotas === 1
        ? `1 pago de ${formatoARS.format(total / 100)}`
        : `${p.cuotas} cuotas de ${formatoARS.format(cuota / 100)} ${p.leyenda}`;
      return `<option value="${p.cuotas}">${txt}</option>`;
    }).join("");
  }

  function mostrarAyudaCuotas(form) {
    const plan = PLANES.find((p) => p.cuotas === Number(form.cuotas.value));
    const total = Math.round(ctx.totalARS * plan.coef);
    form.querySelector("#pago-ayuda-cuotas").textContent = plan.coef === 1
      ? `Total a pagar: ${formatoARS.format(total / 100)}, sin recargo.`
      : `Total financiado: ${formatoARS.format(total / 100)} (incluye ${Math.round((plan.coef - 1) * 100)} % de recargo).`;
  }

  // Refleja en la tarjeta dibujada lo que se va escribiendo
  function dibujarTarjeta(form) {
    const limpio = soloDigitos(form.numero.value);
    const marca = detectarMarca(limpio);
    const visual = document.getElementById("pago-visual");
    visual.dataset.marca = marca;
    document.getElementById("pago-visual-marca").textContent =
      { visa: "VISA", mastercard: "Mastercard", amex: "AMEX" }[marca] || "";
    const plantilla = marca === "amex" ? "•••• •••••• •••••" : "•••• •••• •••• ••••";
    const escrito = agrupar(limpio, marca);
    document.getElementById("pago-visual-numero").textContent = escrito + plantilla.slice(escrito.length);
    document.getElementById("pago-visual-titular").textContent = form.titular.value || "NOMBRE APELLIDO";
    document.getElementById("pago-visual-venc").textContent = form.venc.value || "MM/AA";
  }

  /* ---------- Paso 2b: pago con saldo en cuenta ---------- */

  function pasoCuenta() {
    const alcanza = SALDO_CUENTA >= ctx.totalARS;
    const cont = pintar(`
      <h3 class="pago-paso-titulo" tabindex="-1" data-foco>Pagar con dinero en cuenta</h3>
      <dl class="pago-resultado-detalle" style="margin-top:0;border-top:none;padding-top:0">
        <div><dt>Saldo disponible</dt><dd>${formatoARS.format(SALDO_CUENTA / 100)}</dd></div>
        <div><dt>Total de la reserva</dt><dd>${formatoARS.format(ctx.totalARS / 100)}</dd></div>
        <div><dt>Saldo después del pago</dt><dd>${formatoARS.format((SALDO_CUENTA - ctx.totalARS) / 100)}</dd></div>
      </dl>
      <p class="pago-ayuda">${alcanza
        ? "El importe se descuenta del saldo simulado al confirmar."
        : "⚠ El saldo no alcanza para cubrir el total. Elegí otro medio de pago."}</p>
      <div class="pago-resultado-acciones">
        <button type="button" class="pago-boton" data-pagar ${alcanza ? "" : "disabled"}>Pagar ${formatoARS.format(ctx.totalARS / 100)}</button>
        <button type="button" class="pago-boton pago-boton-secundario" data-volver>Cambiar medio de pago</button>
      </div>`, pasoMedios);

    cont.querySelector("[data-volver]").addEventListener("click", pasoMedios);
    cont.querySelector("[data-pagar]").addEventListener("click", () => procesar({
      medio: "cuenta",
      etiquetaMedio: "Dinero en cuenta",
      cuotas: 1,
      totalCobrado: ctx.totalARS,
      respuesta: RESPUESTAS.APRO,
    }));
  }

  /* ---------- Validación de la tarjeta ---------- */

  function validarTarjeta(form) {
    const limpio = soloDigitos(form.numero.value);
    const marca = detectarMarca(limpio);
    const errores = [];

    const revisar = (campo, mensaje) => {
      const caja = form.querySelector(`#pago-error-${campo.name}`);
      caja.textContent = mensaje;
      campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
      if (mensaje) errores.push(campo);
    };

    // El número solo tiene que estar completo: al ser una simulación no se
    // valida el dígito verificador ni se exige una tarjeta de prueba, así
    // cualquier número sirve para mostrar el flujo.
    revisar(form.numero, limpio ? "" : "Escribí el número de la tarjeta.");

    revisar(form.titular,
      !form.titular.value.trim() ? "Escribí el nombre del titular."
      : form.titular.value.trim().length < 3 ? "El nombre debe tener al menos 3 letras."
      : "");

    revisar(form.venc, validarVencimiento(form.venc.value));

    const largoCVV = marca === "amex" ? 4 : 3;
    revisar(form.cvv,
      !form.cvv.value ? "Escribí el código de seguridad."
      : form.cvv.value.length !== largoCVV ? `El código de seguridad de esta tarjeta tiene ${largoCVV} dígitos.`
      : "");

    revisar(form.dni,
      !form.dni.value ? "Escribí el documento del titular."
      : form.dni.value.length < 7 ? "El documento debe tener 7 u 8 dígitos."
      : "");

    errores[0]?.focus();
    return errores.length === 0;
  }

  function validarVencimiento(valor) {
    const m = /^(\d{2})\/(\d{2})$/.exec(valor.trim());
    if (!valor) return "Escribí el vencimiento de la tarjeta.";
    if (!m) return "Usá el formato MM/AA. Por ejemplo: 11/30.";
    const mes = Number(m[1]);
    const anio = 2000 + Number(m[2]);
    if (mes < 1 || mes > 12) return "El mes tiene que estar entre 01 y 12.";
    const hoy = new Date();
    const ultimoDia = new Date(anio, mes, 0);
    if (ultimoDia < hoy) return "La tarjeta está vencida.";
    return "";
  }

  // Primero se busca entre las tarjetas de prueba (alguna usa un rango que no
  // entra en las reglas generales); si no, se deduce por los primeros dígitos.
  function detectarMarca(numero) {
    if (!numero) return "";
    const prueba = TARJETAS_PRUEBA.find((t) => t.numero.startsWith(numero) || numero.startsWith(t.numero.slice(0, 4)));
    if (prueba) return prueba.marca;
    if (/^4/.test(numero)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(numero)) return "mastercard";
    if (/^3[47]/.test(numero)) return "amex";
    return "";
  }

  function agrupar(numero, marca) {
    if (marca === "amex") {
      return [numero.slice(0, 4), numero.slice(4, 10), numero.slice(10, 15)].filter(Boolean).join(" ");
    }
    return (numero.match(/.{1,4}/g) || []).join(" ");
  }

  function soloDigitos(v) {
    return v.replace(/\D/g, "");
  }

  /* ---------- Paso 3: procesar ---------- */

  function datosDelPago(form) {
    const limpio = soloDigitos(form.numero.value);
    const marca = detectarMarca(limpio);
    const cuotas = Number(form.cuotas?.value || 1);
    const plan = PLANES.find((p) => p.cuotas === cuotas);
    // La primera palabra del titular hace de código de respuesta del emisor
    const codigo = form.titular.value.trim().split(/\s+/)[0].toUpperCase();
    return {
      medio: ctx.medio,
      etiquetaMedio: `${ctx.medio === "credito" ? "Tarjeta de crédito" : "Tarjeta de débito"} ${{ visa: "Visa", mastercard: "Mastercard", amex: "Amex" }[marca] || ""}`.trim(),
      ultimos4: limpio.slice(-4),
      cuotas,
      totalCobrado: Math.round(ctx.totalARS * plan.coef),
      respuesta: RESPUESTAS[codigo] || RESPUESTAS.APRO,
    };
  }

  function procesar(pago) {
    pintar(`
      <div class="pago-procesando" role="status" tabindex="-1" data-foco>
        <div class="pago-spinner" aria-hidden="true"></div>
        <p><strong>Procesando el pago…</strong></p>
        <p class="pago-ayuda">Estamos confirmando la operación con el emisor. No cierres esta ventana.</p>
      </div>`, null);
    setTimeout(() => pasoResultado(pago), 1800);
  }

  /* ---------- Paso 4: resultado ---------- */

  function pasoResultado(pago) {
    const r = pago.respuesta;
    pago.idOperacion = String(Date.now()).slice(-10);
    pago.fecha = new Date();

    const detalle = `
      <dl class="pago-resultado-detalle">
        <div><dt>Medio de pago</dt><dd>${pago.etiquetaMedio}${pago.ultimos4 ? ` ••••${pago.ultimos4}` : ""}</dd></div>
        ${pago.cuotas > 1 ? `<div><dt>Cuotas</dt><dd>${pago.cuotas} de ${formatoARS.format(pago.totalCobrado / pago.cuotas / 100)}</dd></div>` : ""}
        <div><dt>Importe</dt><dd>${formatoARS.format(pago.totalCobrado / 100)}</dd></div>
        <div><dt>N° de operación</dt><dd>${pago.idOperacion}</dd></div>
        <div><dt>Fecha</dt><dd>${pago.fecha.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}</dd></div>
      </dl>`;

    const acciones = r.estado === "rechazado"
      ? `<button type="button" class="pago-boton" data-reintentar>Probar con otro medio de pago</button>
         <button type="button" class="pago-boton pago-boton-secundario" data-cerrar>Volver a la reserva</button>`
      : `<button type="button" class="pago-boton" data-listo>Ver mi reserva</button>`;

    const cont = pintar(`
      <div class="pago-resultado" data-estado="${r.estado}" role="status" tabindex="-1" data-foco>
        <span class="pago-resultado-icono" aria-hidden="true">${{ aprobado: ICONO_OK, rechazado: ICONO_CRUZ, pendiente: ICONO_RELOJ }[r.estado]}</span>
        <h3>${r.titulo}</h3>
        <p>${r.detalle}</p>
        ${r.estado === "rechazado" ? "" : detalle}
        <div class="pago-resultado-acciones">${acciones}</div>
      </div>`, r.estado === "rechazado" ? pasoMedios : null);

    cont.querySelector("[data-reintentar]")?.addEventListener("click", pasoMedios);
    cont.querySelector("[data-cerrar]")?.addEventListener("click", cerrar);
    cont.querySelector("[data-listo]")?.addEventListener("click", () => {
      cerrar();
      ctx.onAprobado(pago);
    });
  }

  /* ---------- Íconos ---------- */

  const ICONO_TARJETA = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>';
  const ICONO_BILLETERA = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"/><rect x="3" y="7" width="18" height="12" rx="2.5"/><path d="M16 13h2"/></svg>';
  const ICONO_FLECHA = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  const ICONO_OK = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
  const ICONO_CRUZ = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICONO_RELOJ = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  /* ---------- Enganches del diálogo ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    const dialogo = document.getElementById("dialogo-pago");
    if (!dialogo) return;
    dialogo.querySelector("[data-cerrar-pago]").addEventListener("click", cerrar);
    dialogo.querySelector("[data-atras]").addEventListener("click", () => pasoAnterior?.());
    // Mientras se procesa el pago no se puede cerrar con Escape (evita dejarlo a medias)
    dialogo.addEventListener("cancel", (e) => {
      if (dialogo.querySelector(".pago-procesando")) e.preventDefault();
    });
  });

  return { abrir };
})();
