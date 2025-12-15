// ...existing code...
window.addEventListener("load", () => {
  // Enveloppe chaque .img-carousel dans .carousel-item avec un overlay (pour le hover "DISCOVER")
  function wrapCarouselImages() {
    document.querySelectorAll(".img-carousel").forEach((img) => {
      if (img.closest(".carousel-item")) return; // déjà enveloppé
      const wrapper = document.createElement("div");
      wrapper.className = "carousel-item";

      const overlay = document.createElement("div");
      overlay.className = "carousel-overlay";

      const label = document.createElement("span");
      label.className = "discover-text";
      label.textContent = "DISCOVER";
      overlay.appendChild(label);

      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      wrapper.appendChild(overlay);
    });
  }

  wrapCarouselImages();

  const tracks = document.querySelectorAll(".carousel-left, .carousel-right");

  tracks.forEach((track) => {
    // dupliquer le contenu pour une boucle fluide
    track.innerHTML = track.innerHTML + track.innerHTML;
    // forcer le comportement horizontal
    track.style.overflowX = "hidden";
    track.style.whiteSpace = "nowrap";

    // calculer la moitié de la largeur après duplication / rendu
    const halfWidth = track.scrollWidth / 2;

    // position initiale selon la direction
    const isLeft = track.classList.contains("carousel-left"); // left => images se déplacent VERS LA DROITE
    track.scrollLeft = isLeft ? halfWidth : 0;

    // vitesse (pixels par frame). Négatif => scrollLeft diminue (images vont à droite).
    const baseSpeed = 0.6; // ajuster selon la vitesse souhaitée
    const speed = isLeft ? -baseSpeed : baseSpeed;

    let rafId = null;
    function step() {
      track.scrollLeft += speed;

      // gestion de la boucle continue
      if (track.scrollLeft >= halfWidth) {
        track.scrollLeft -= halfWidth;
      } else if (track.scrollLeft <= 0) {
        track.scrollLeft += halfWidth;
      }

      rafId = requestAnimationFrame(step);
    }

    // démarrer l'animation
    rafId = requestAnimationFrame(step);

    // mettre en pause l'animation quand la piste est hors écran pour économiser le CPU
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(step);
          } else {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      },
      { threshold: 0.1 }
    );
    io.observe(track);
  });

  // Comportement parallaxe pour la section "stack" (déplacé dans load pour s'assurer que le DOM est prêt)
  const section = document.querySelector(".stack-section");
  const images = document.querySelectorAll(".stack-img");

  if (section && images.length) {
    window.addEventListener("scroll", () => {
      const rect = section.getBoundingClientRect();
      const totalScroll = Math.max(
        section.offsetHeight - window.innerHeight,
        1
      );
      const scrollY = -rect.top;

      images.forEach((img, index) => {
        const start = (totalScroll / images.length) * index;
        const end = start + totalScroll / images.length;

        let progress = (scrollY - start) / (end - start);
        progress = Math.min(Math.max(progress, 0), 1);

        const translateY = 100 - progress * 100;
        img.style.transform = `translateY(${translateY}%)`;
      });
    });
  }

  // GESTION DES ANCRES : scroll vers la cible en tenant compte de la nav fixe
  document.body.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nav-height"
        )
      ) || 80;
    const rect = target.getBoundingClientRect();
    const top = window.pageYOffset + rect.top - navH - 8;
    window.scrollTo({ top, behavior: "smooth" });
  });

  // NOTE: Le code de "rétractation" au clic pour .stack-img a été retiré.
  // Les effets de parallax et l'empilement des images (.stack-img) restent inchangés.
});
// fin du load
// ...existing code...
