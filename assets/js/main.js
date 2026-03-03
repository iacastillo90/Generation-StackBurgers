gsap.registerPlugin(ScrollTrigger);
console.log("GSAP and ScrollTrigger initializing...");

// 1. CONFIGURACIÓN DEL CANVAS Y FRAMES
const canvas = document.getElementById("burger-canvas");
const context = canvas.getContext("2d");
const frameCount = 160; 

// Formatea el nombre (burger_001.jpg, burger_002.jpg...)
const currentFrame = index => (
  `assets/img/sequence/burger_${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const burger = { frame: 0 };

// 2. FUNCIÓN PARA LOS TEXTOS (Tu código original, mantenido)
function updateTextStep(index) {
  const steps = document.querySelectorAll(".reveal-step");
  if (steps.length === 0) return;
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });
}

// 3. PRECARGA DE IMÁGENES Y RENDERIZADO
const preloadImages = () => {
  return new Promise((resolve) => {
    let loadedCount = 0;
    
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          console.log("✅ Todas las 160 imágenes cargadas");
          resolve();
        }
      };
      
      img.onerror = () => {
        console.warn(`❌ Error cargando imagen ${i}`);
        loadedCount++;
        if (loadedCount === frameCount) resolve();
      };
      
      images.push(img);
    }
  });
};

const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const img = images[Math.floor(burger.frame)];
  if (img && img.complete) {
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
};

// Ajuste responsivo del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
});

// 4. ESTADO INICIAL
window.addEventListener("DOMContentLoaded", async () => {
  // 1. Forzamos al navegador a ir arriba del todo al recargar
  window.scrollTo(0, 0); 
  
  console.log("DOM loaded, loading images...");
  updateTextStep(0);
  
  // Renderizamos el primer frame inmediatamente para evitar la pantalla vacía
  const img0 = new Image();
  img0.src = currentFrame(0);
  await new Promise(r => {
      img0.onload = () => {
          images[0] = img0;
          render();
          r();
      };
      img0.onerror = r;
  });

  await preloadImages();
  document.body.classList.remove("loading"); // Ya podemos permitir scroll
  initializeTimeline();
});

// 5. EL TIMELINE PRINCIPAL
function initializeTimeline() {
  console.log("Iniciando timeline...");
  
  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero", 
      pin: true,             
      start: "top top",
      // Calculamos un alto basado en el alto del viewport real
      end: () => "+=" + (window.innerHeight * 0.5),   
      // IMPORTANTE: scrub: true (o un valor muy bajo como 0.1) asegura que 
      // la animación no se retrase respecto al scroll. El "lag" de scrub: 1 
      // hacía que la pantalla se soltara antes de que la animación terminara de "alcanzar" al scroll.
      scrub: 0.1, 
      pinSpacing: true,
      markers: false,
      anticipatePin: 1
    }
  });

  ScrollTrigger.refresh();
  mainTl.to(burger, {
    frame: frameCount - 1,
    ease: "none",
    duration: 1,
    onUpdate: function() {
      render();
      const currentF = burger.frame;
      if (currentF < 20) updateTextStep(0);
      else if (currentF >= 20 && currentF < 50) updateTextStep(1);
      else if (currentF >= 50 && currentF < 80) updateTextStep(2);
      else if (currentF >= 80 && currentF < 110) updateTextStep(3);
      else if (currentF >= 110 && currentF < 140) updateTextStep(4);
      else updateTextStep(5);
    }
  })
  
  // Pequeña pausa al final para que la última imagen se vea completa antes de bajar
  .to({}, { duration: 0.05 });

  ScrollTrigger.refresh();
}