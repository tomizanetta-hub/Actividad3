/* ==========================================================
   asistente.js — "Asistente Ruta Gol": chat de preguntas frecuentes.
   Funciona en el navegador, sin servidor: compara las palabras de la
   pregunta con palabras clave de cada respuesta y elige la de mayor
   puntaje. La misma base alimenta la sección de Preguntas frecuentes.
   ========================================================== */

const BASE_FAQ = [
  {
    pregunta: "¿Qué es Ruta Gol?",
    claves: ["que es", "ruta gol", "recorrido", "de que se trata", "propuesta"],
    respuesta: 'Ruta Gol es un recorrido por cuatro estadios de Buenos Aires y Avellaneda: El Cilindro (Racing), La Bombonera (Boca), el estadio de Ferro y el Más Monumental (River). Podés hacerlo por tu cuenta con las fichas del sitio o reservar un paquete guiado.',
    enlace: { texto: "Ver el recorrido", href: "index.html#recorrido" },
  },
  {
    pregunta: "¿En qué orden conviene visitar los estadios?",
    claves: ["orden", "primero", "secuencia", "itinerario", "ruta", "empezar"],
    respuesta: "El orden sugerido va de sur a norte: 1) El Cilindro en Avellaneda, 2) La Bombonera en La Boca, 3) Ferro en Caballito y 4) el Más Monumental en Núñez. Cada parada se puede visitar por separado, en días distintos.",
    enlace: { texto: "Ver el mapa", href: "index.html#recorrido" },
  },
  {
    pregunta: "¿Cuánto cuestan los paquetes?",
    claves: ["precio", "cuesta", "cuanto", "valor", "paquete", "paquetes", "tarifa", "costo", "sale"],
    respuesta: "Hay tres paquetes por adulto: Pase Barrios USD 35, Ruta Clásica USD 89 y Ruta Gol Completa USD 149. Los menores de 12 pagan 50 % y los grupos de 6 o más tienen 10 % de descuento. Son precios simulados del proyecto académico.",
    enlace: { texto: "Calcular mi reserva", href: "reservas.html" },
  },
  {
    pregunta: "¿Puedo pagar en pesos?",
    claves: ["pesos", "dolar", "dolares", "moneda", "cambio", "cotizacion", "ars", "usd", "pagar"],
    respuesta: "Los precios están en dólares y el formulario de reserva los convierte automáticamente a pesos con el dólar oficial (venta) del día. Debajo del total se muestra la cotización usada, su fuente y la fecha.",
    enlace: { texto: "Ir a reservas", href: "reservas.html" },
  },
  {
    pregunta: "¿Cómo hago una reserva?",
    claves: ["reservar", "reserva", "comprar", "anotarme", "inscribir", "contratar", "sacar"],
    respuesta: "Entrá a Reservar, elegí el paquete, la fecha y la cantidad de personas, sumá adicionales si querés y revisá el resumen antes de confirmar. Es una simulación: no se cobra nada ni se piden datos bancarios.",
    enlace: { texto: "Reservar ahora", href: "reservas.html" },
  },
  {
    pregunta: "¿Se puede entrar a todos los estadios?",
    claves: ["entrar", "ingresar", "adentro", "interior", "tour", "visita guiada", "todos"],
    respuesta: "No siempre. Boca y River ofrecen museo y tour habitualmente. En Racing y Ferro las visitas interiores dependen de lo que anuncie cada club. Por eso el recorrido combina paseo exterior y visitas interiores cuando están disponibles.",
  },
  {
    pregunta: "¿Qué pasa los días de partido?",
    claves: ["partido", "partidos", "juega", "evento", "recital", "cerrado", "domingo"],
    respuesta: "Los días de partido o de eventos los accesos, museos y tours pueden cerrar o cambiar de horario. Antes de salir, revisá el fixture y los canales oficiales del club.",
  },
  {
    pregunta: "¿Cuánto dura cada visita?",
    claves: ["dura", "duracion", "tiempo", "horas", "minutos", "demora", "tarda"],
    respuesta: "Como referencia: El Cilindro 30–75 min, La Bombonera 60–90 min (más si recorrés La Boca), Ferro 30–45 min y el Más Monumental 90–120 min con museo y estadio.",
  },
  {
    pregunta: "¿Cuáles son los horarios?",
    claves: ["horario", "horarios", "abre", "cierra", "hora", "abierto", "atencion"],
    respuesta: "El Museo River informa habitualmente atención de 10 a 19 h. En Boca los horarios del museo y del tour cambian según la agenda. Racing y Ferro no tienen horario fijo de visitas. Confirmá siempre en las fuentes oficiales.",
  },
  {
    pregunta: "¿Cómo llego en transporte público?",
    claves: ["llegar", "llego", "transporte", "colectivo", "subte", "tren", "como voy", "bondi"],
    respuesta: "Para Ferro podés usar la estación Primera Junta (línea A) o Caballito (tren Sarmiento). A Racing y Boca se llega en colectivo hasta Avellaneda y La Boca. Al Monumental, por la zona de Núñez (línea D o tren Mitre). Revisá tu trayecto en la app de transporte antes de salir.",
  },
  {
    pregunta: "¿Pueden ir chicos?",
    claves: ["chicos", "nenes", "menores", "ninos", "hijos", "edad", "familia"],
    respuesta: "Sí. Los menores de 12 años pagan 50 % del paquete y cada reserva necesita al menos un adulto responsable.",
  },
  {
    pregunta: "¿Es accesible para personas con movilidad reducida?",
    claves: ["accesible", "accesibilidad", "silla de ruedas", "movilidad", "discapacidad", "rampa", "ascensor"],
    respuesta: "Los paseos exteriores son en la vía pública. Para las visitas interiores, consultá las condiciones de accesibilidad de cada circuito con el club o escribinos desde Contacto eligiendo el motivo «Accesibilidad».",
    enlace: { texto: "Ir a Contacto", href: "contacto.html" },
  },
  {
    pregunta: "¿Puedo cancelar o cambiar la fecha?",
    claves: ["cancelar", "cancelacion", "cambiar", "modificar", "reprogramar", "devolucion", "reembolso"],
    respuesta: "En esta versión las reservas son simuladas. En un servicio real, los cambios se pedirían desde Contacto con el código de reserva que aparece al confirmar.",
    enlace: { texto: "Ir a Contacto", href: "contacto.html" },
  },
  {
    pregunta: "¿Se pueden sacar fotos?",
    claves: ["foto", "fotos", "sacar fotos", "camara", "fotografiar", "selfie"],
    respuesta: "Sí, en el exterior y en los sectores donde el personal lo permita. También podés sumar la sesión de fotos profesional como adicional en la reserva.",
  },
  {
    pregunta: "¿Qué tengo que llevar?",
    claves: ["llevar", "recomendaciones", "consejo", "tips", "ropa", "calzado", "seguridad", "pertenencias"],
    respuesta: "Calzado cómodo, agua y el celular cargado. En zonas concurridas como La Boca, cuidá tus pertenencias. Y confirmá la disponibilidad de la visita antes de viajar.",
  },
  {
    pregunta: "¿Qué hay para ver en La Bombonera?",
    claves: ["boca", "bombonera", "museo de la pasion", "caminito"],
    respuesta: "En La Bombonera podés recorrer el Museo de la Pasión Boquense, hacer el tour del estadio y caminar hasta Caminito.",
    enlace: { texto: "Ficha de La Bombonera", href: "bombonera.html" },
  },
  {
    pregunta: "¿Qué hay para ver en el Más Monumental?",
    claves: ["river", "monumental", "museo river", "nunez"],
    respuesta: "El Museo River muestra camisetas, trofeos e historia del club, y hay modalidades de visita del estadio con distintos sectores.",
    enlace: { texto: "Ficha del Más Monumental", href: "monumental.html" },
  },
  {
    pregunta: "¿Qué tiene de especial El Cilindro?",
    claves: ["racing", "cilindro", "avellaneda", "circular", "presidente peron"],
    respuesta: "Es un estadio de planta circular inaugurado en 1950, símbolo de Racing y de Avellaneda. Se puede apreciar su silueta desde afuera y consultar si hay visitas organizadas por el club.",
    enlace: { texto: "Ficha de El Cilindro", href: "cilindro.html" },
  },
  {
    pregunta: "¿Por qué incluir el estadio de Ferro?",
    claves: ["ferro", "caballito", "etcheverri", "ferrocarril", "verdolaga"],
    respuesta: "El estadio de Ferro, en Caballito, muestra otra forma de vivir el fútbol: un club de barrio de origen ferroviario. Es uno de los estadios en uso más antiguos del país.",
    enlace: { texto: "Ficha de Ferro", href: "ferro.html" },
  },
  {
    pregunta: "¿Cómo me comunico con ustedes?",
    claves: ["contacto", "contactar", "consulta", "mail", "correo", "hablar", "escribir", "telefono"],
    respuesta: "Podés escribirnos desde el formulario de Contacto. Elegí el motivo para que tu consulta llegue más rápido.",
    enlace: { texto: "Ir a Contacto", href: "contacto.html" },
  },
];

const SUGERENCIAS_INICIALES = ["¿Cuánto cuestan los paquetes?", "¿En qué orden conviene visitar los estadios?", "¿Puedo pagar en pesos?", "¿Qué pasa los días de partido?"];

/* ---------- Motor de respuestas ---------- */

function buscarRespuesta(texto) {
  const consulta = normalizar(texto).replace(/[¿?¡!.,]/g, " ");
  if (/^(hola|buenas|buen dia|buenas tardes|hey)\b/.test(consulta) && consulta.split(/\s+/).length <= 3) {
    return { respuesta: "¡Hola! Soy el asistente de Ruta Gol. Preguntame por precios, horarios, cómo llegar o cualquier estadio del recorrido." };
  }
  if (/\b(gracias|genial|perfecto)\b/.test(consulta)) {
    return { respuesta: "¡De nada! Si tenés otra duda, escribila acá. ⚽" };
  }

  let mejor = null;
  let mejorPuntaje = 0;
  for (const item of BASE_FAQ) {
    let puntaje = 0;
    for (const clave of item.claves) {
      const c = normalizar(clave);
      // Coincidencia exacta de palabra o frase vale más que una parcial
      if (new RegExp(`\\b${c}\\b`).test(consulta)) puntaje += c.includes(" ") ? 3 : 2;
      else if (c.length > 4 && consulta.includes(c.slice(0, -1))) puntaje += 1;
    }
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = item;
    }
  }
  return mejorPuntaje >= 2 ? mejor : null;
}

/* ---------- Interfaz del chat ---------- */

document.addEventListener("DOMContentLoaded", () => {
  dibujarFAQ();
  iniciarChat();
});

function iniciarChat() {
  const abrir = document.getElementById("btn-asistente");
  const panel = document.getElementById("panel-asistente");
  if (!abrir || !panel) return;

  const cerrar = panel.querySelector("[data-cerrar]");
  const form = panel.querySelector("form");
  const entrada = panel.querySelector("input");
  const log = document.getElementById("chat-mensajes");
  let iniciado = false;

  const mostrar = () => {
    panel.hidden = false;
    abrir.setAttribute("aria-expanded", "true");
    if (!iniciado) {
      agregarMensaje(log, "bot", "¡Hola! Soy el asistente de Ruta Gol. ¿Qué querés saber del recorrido?");
      agregarSugerencias(log, SUGERENCIAS_INICIALES, responder);
      iniciado = true;
    }
    entrada.focus();
  };
  const ocultar = () => {
    panel.hidden = true;
    abrir.setAttribute("aria-expanded", "false");
    abrir.focus();
  };

  abrir.addEventListener("click", () => (panel.hidden ? mostrar() : ocultar()));
  cerrar.addEventListener("click", ocultar);
  panel.addEventListener("keydown", (e) => e.key === "Escape" && ocultar());
  document.querySelectorAll("[data-abrir-asistente]").forEach((b) => b.addEventListener("click", mostrar));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = entrada.value.trim();
    if (!texto) {
      entrada.setAttribute("aria-invalid", "true");
      entrada.placeholder = "Escribí una pregunta antes de enviar";
      return;
    }
    entrada.removeAttribute("aria-invalid");
    entrada.value = "";
    responder(texto);
  });

  function responder(texto) {
    agregarMensaje(log, "usuario", texto);
    const escribiendo = agregarMensaje(log, "bot", "Escribiendo…", true);
    setTimeout(() => {
      escribiendo.remove();
      const r = buscarRespuesta(texto);
      if (r) {
        agregarMensaje(log, "bot", r.respuesta, false, r.enlace);
      } else {
        agregarMensaje(log, "bot", "No encontré una respuesta para eso. Probá con otras palabras, elegí una de estas preguntas o escribinos desde Contacto.", false, { texto: "Ir a Contacto", href: "contacto.html" });
        agregarSugerencias(log, ["¿Cuánto cuestan los paquetes?", "¿Cómo llego en transporte público?", "¿Cuáles son los horarios?"], responder);
      }
    }, 450);
  }
}

function agregarMensaje(log, autor, texto, temporal = false, enlace = null) {
  const esBot = autor === "bot";
  const div = document.createElement("div");
  div.className = `max-w-[85%] rounded-2xl px-3 py-2 text-sm ${esBot ? "self-start rounded-bl-sm bg-white border border-borde" : "self-end rounded-br-sm bg-cancha text-white"} ${temporal ? "italic text-tinta-suave" : ""}`;
  const quien = document.createElement("span");
  quien.className = "sr-only";
  quien.textContent = esBot ? "Asistente: " : "Vos: ";
  div.append(quien, document.createTextNode(texto));
  if (enlace) {
    const a = document.createElement("a");
    a.href = enlace.href;
    a.className = "enlace mt-1 block";
    a.textContent = `${enlace.texto} →`;
    div.append(a);
  }
  log.append(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

function agregarSugerencias(log, preguntas, alElegir) {
  const cont = document.createElement("div");
  cont.className = "flex flex-wrap gap-2 self-start";
  cont.setAttribute("role", "group");
  cont.setAttribute("aria-label", "Preguntas sugeridas");
  preguntas.forEach((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rounded-full border-2 border-cancha bg-white px-3 py-1 text-left text-sm font-semibold text-cancha hover:bg-cancha-claro";
    b.textContent = p;
    b.addEventListener("click", () => {
      cont.remove();
      alElegir(p);
    });
    cont.append(b);
  });
  log.append(cont);
  log.scrollTop = log.scrollHeight;
}

/* ---------- Sección de Preguntas frecuentes (home) ---------- */

function dibujarFAQ() {
  const lista = document.getElementById("faq-lista");
  if (!lista) return;
  const buscador = document.getElementById("faq-buscador");
  const estado = document.getElementById("faq-estado");

  const pintar = (items) => {
    lista.innerHTML = items.map((f) => `
      <details class="tarjeta group p-0">
        <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold">
          <span>${f.pregunta}</span>
          <span aria-hidden="true" class="text-xl text-cancha transition-transform group-open:rotate-45">+</span>
        </summary>
        <div class="px-4 pb-4 text-tinta-suave">${f.respuesta}${f.enlace ? ` <a class="enlace" href="${f.enlace.href}">${f.enlace.texto}</a>` : ""}</div>
      </details>`).join("");
  };
  pintar(BASE_FAQ.slice(0, 8));

  // Buscador: filtra preguntas por texto (flexibilidad y eficiencia de uso)
  buscador?.addEventListener("input", () => {
    const q = normalizar(buscador.value);
    if (!q) {
      pintar(BASE_FAQ.slice(0, 8));
      estado.textContent = "";
      return;
    }
    const encontrados = BASE_FAQ.filter((f) =>
      normalizar(f.pregunta + " " + f.respuesta + " " + f.claves.join(" ")).includes(q));
    pintar(encontrados);
    estado.textContent = encontrados.length
      ? `${encontrados.length} pregunta${encontrados.length > 1 ? "s" : ""} encontrada${encontrados.length > 1 ? "s" : ""}.`
      : "No hay preguntas con ese texto. Probá con el asistente o escribinos desde Contacto.";
  });
}
