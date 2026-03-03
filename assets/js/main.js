// Arrancamos el motor. Registrar ScrollTrigger es vital para que GSAP entienda que la animación depende del scroll del usuario.
gsap.registerPlugin(ScrollTrigger);
console.log("GSAP inicializado...");

// Preparamos el lienzo. Aquí proyectaremos las 160 imágenes que forman la ilusión de video de nuestra hamburguesa.
const canvas = document.getElementById("burger-canvas");
const context = canvas.getContext("2d");
const frameCount = 160;

// Esta pequeña función formatea la ruta para que siempre busque números de tres dígitos (burger_001.jpg, etc.)
const currentFrame = (index) =>
  `assets/img/sequence/burger_${(index + 1).toString().padStart(3, "0")}.jpg`;

const images = [];
const burger = { frame: 0 };

// El director de orquesta para los textos. Revisa en qué fotograma vamos y decide qué mensaje mostrar en pantalla.
function updateTextStep(index) {
  const steps = document.querySelectorAll(".reveal-step");
  if (steps.length === 0) return;

  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });
}

// Si no guardamos las imágenes en memoria antes de empezar, el usuario vería tirones o espacios en blanco al bajar.
// Es un sacrificio de unos segundos de carga inicial para lograr una experiencia fluida después.
const preloadImages = () => {
  return new Promise((resolve) => {
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);

      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          console.log("Secuencia cargada con éxito en memoria.");
          resolve();
        }
      };

      img.onerror = () => {
        console.warn(`Error al cargar el frame ${i}, pero seguimos adelante.`);
        loadedCount++;
        if (loadedCount === frameCount) resolve();
      };

      images.push(img);
    }
  });
};

// Limpia y pinta el fotograma exacto que corresponde al momento del scroll.
const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const img = images[Math.floor(burger.frame)];

  if (img && img.complete) {
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
};

// Nos aseguramos de que el lienzo no se rompa si el usuario gira el teléfono o achica la ventana.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
});

// El punto de partida de la página.
window.addEventListener("DOMContentLoaded", async () => {
  // Un truco importante: forzamos el inicio arriba de todo para que GSAP calcule bien las distancias.
  window.scrollTo(0, 0);

  updateTextStep(0);

  // Pintamos la primera imagen de inmediato para que la pantalla no se vea vacía mientras el resto carga en el fondo.
  const img0 = new Image();
  img0.src = currentFrame(0);
  await new Promise((r) => {
    img0.onload = () => {
      images[0] = img0;
      render();
      r();
    };
    img0.onerror = r;
  });

  await preloadImages();

  // Ya estamos listos. Liberamos el scroll quitando la clase de carga.
  document.body.classList.remove("loading");
  initializeTimeline();
});

// Aquí es donde todo se conecta. Anclamos la sección (pin) y hacemos que el progreso de la animación dependa del scroll.
function initializeTimeline() {
  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      pin: true,
      start: "top top",
      end: () => "+=" + window.innerHeight * 0.5,
      // Este 'scrub' bajo es la clave para que el movimiento de la hamburguesa no se sienta robótico ni tenga lag.
      scrub: 0.1,
      pinSpacing: true,
      anticipatePin: 1,
    },
  });

  ScrollTrigger.refresh();

  // Animamos el valor de nuestro objeto desde 0 hasta el final de las fotos.
  mainTl
    .to(burger, {
      frame: frameCount - 1,
      ease: "none",
      duration: 1,
      onUpdate: function () {
        render();

        // La lógica de los cortes: decidimos qué texto acompaña a qué fase del armado de la hamburguesa.
        const currentF = burger.frame;
        if (currentF < 20) updateTextStep(0);
        else if (currentF >= 20 && currentF < 50) updateTextStep(1);
        else if (currentF >= 50 && currentF < 80) updateTextStep(2);
        else if (currentF >= 80 && currentF < 110) updateTextStep(3);
        else if (currentF >= 110 && currentF < 140) updateTextStep(4);
        else updateTextStep(5);
      },
    })
    .to({}, { duration: 0.05 }); // Dejamos respirar la última imagen un instante.

  ScrollTrigger.refresh();
}

// Aplicación práctica de manipulación del DOM vista en clase.
// Empezamos con el formulario de reservas.
function procesar_reserva() {
  // Capturamos lo que el usuario escribió.
  console.log("Nombre: ", document.getElementById("nombreReserva").value);
  console.log("Email: ", document.getElementById("emailReserva").value);
  console.log("Personas: ", document.getElementById("personasReserva").value);
  console.log("Fecha: ", document.getElementById("fechaReserva").value);

  // Cumplimos con el requisito de usar la alerta nativa.
  alert("¡Reserva exitosa en StackBurgers!");

  // Dejamos la casa limpia para una nueva reserva vaciando los campos manualmente.
  document.getElementById("nombreReserva").value = "";
  document.getElementById("emailReserva").value = "";
  document.getElementById("personasReserva").value = "";
  document.getElementById("fechaReserva").value = "";

  // Le damos un feedback visual amigable inyectando HTML directamente en nuestro contenedor vacío.
  document.getElementById("mensajeReserva").innerHTML =
    "<h5 class='mb-0'>Registro realizado correctamente.</h5>";
}

// Misma esencia para el contacto, sumando validaciones básicas.
function procesar_contacto() {
  const nombre = document.getElementById("nombreContacto").value;
  const email = document.getElementById("emailContacto").value;
  const mensaje = document.getElementById("mensajeContacto").value;

  // Un pequeño freno por si alguien le da al botón sin escribir nada.
  if (nombre === "" || email === "" || mensaje === "") {
    alert(
      "⚠️ Por favor, completa todos los campos antes de enviar tu mensaje.",
    );
    return;
  }

  console.log("--- Nuevo Mensaje de Contacto ---");
  console.log("Nombre: " + nombre);
  console.log("Email: " + email);
  console.log("Mensaje: " + mensaje);

  alert("¡Gracias por escribirnos, " + nombre + "! Hemos recibido tu mensaje.");

  document.getElementById("nombreContacto").value = "";
  document.getElementById("emailContacto").value = "";
  document.getElementById("mensajeContacto").value = "";

  // Aquí fuimos un paso más allá inyectando un bloque entero de Bootstrap para que el éxito se vea más elegante.
  document.getElementById("alertaContacto").innerHTML = `
        <div class="alert alert-success fw-bold mb-0" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> Mensaje enviado correctamente.
        </div>
    `;
}
