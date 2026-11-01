/* ==========================================================
   contacto.js — Formulario de consulta.
   SIMULACIÓN: no hay servidor que reciba el mensaje. Se valida
   todo en el navegador y se muestra la confirmación de envío.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-contacto");
  if (!form) return;

  const mensaje = form.querySelector("#mensaje");
  const contador = document.getElementById("contador-mensaje");
  const resumen = document.getElementById("errores-contacto");
  const exito = document.getElementById("exito-contacto");
  const MAX = Number(mensaje.getAttribute("maxlength"));

  const reglas = {
    nombre: (v) =>
      !v ? "Escribí tu nombre." :
      v.length < 2 ? "El nombre debe tener al menos 2 letras." :
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ' -]+$/.test(v) ? "El nombre solo puede tener letras y espacios." : "",
    email: (v) =>
      !v ? "Escribí tu correo electrónico." :
      !EMAIL_VALIDO.test(v) ? "El correo no tiene un formato válido. Ejemplo: nombre@correo.com" : "",
    motivo: (v) => (!v ? "Elegí el motivo de tu consulta." : ""),
    mensaje: (v) =>
      !v ? "Escribí tu mensaje." :
      v.length < 20 ? `El mensaje es muy corto: escribí al menos 20 caracteres (llevás ${v.length}).` : "",
  };

  validarAlSalir(form, reglas);

  // Contador de caracteres: visibilidad del estado del sistema
  const actualizarContador = () => {
    const n = mensaje.value.length;
    contador.textContent = `${n} / ${MAX} caracteres`;
  };
  mensaje.addEventListener("input", actualizarContador);
  actualizarContador();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    exito.hidden = true;
    const errores = validarFormulario(form, reglas);
    mostrarResumenErrores(resumen, errores);
    if (errores.length) return;

    // Estado de "enviando" para que el usuario sepa que algo está pasando
    const boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Enviando…";

    setTimeout(() => {
      const datos = Object.fromEntries(new FormData(form));
      const motivoTexto = form.querySelector(`#motivo option[value="${datos.motivo}"]`).textContent;
      exito.querySelector("[data-detalle]").textContent =
        `Gracias, ${datos.nombre.split(" ")[0]}. Registramos tu consulta sobre “${motivoTexto}”. ` +
        `En un sitio real te responderíamos a ${datos.email} dentro de las 48 h hábiles.`;
      exito.hidden = false;
      exito.focus();
      form.reset();
      actualizarContador();
      boton.disabled = false;
      boton.textContent = "Enviar consulta";
    }, 700);
  });

  // Botón "Limpiar": deshace todo, incluidos los mensajes de error (control y libertad)
  form.addEventListener("reset", () => {
    Object.keys(reglas).forEach((id) => limpiarError(form.querySelector(`#${id}`)));
    resumen.hidden = true;
    setTimeout(actualizarContador);
  });
});
