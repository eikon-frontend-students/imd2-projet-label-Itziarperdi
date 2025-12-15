// Toutes les fonctionnalités JS regroupées : carrousel, parallaxe stack, ancres et curseur section artist
// Écrit en français, sans l'effet de "rétractation" (supprimé)

window.addEventListener("load", () => {
  /* ---------- 1) Wrapper des images du carousel (overlay DISCOVER pour hover) ---------- */
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

  /* ---------- 2) Carrousels horizontaux infinis (double contenu + animation requestAnimationFrame) ---------- */
  const tracks = document.querySelectorAll(".carousel-left, .carousel-right");
  tracks.forEach((track) => {
    // dupliquer contenu pour boucle fluide
    track.innerHTML = track.innerHTML + track.innerHTML;

    // assurer layout horizontal
    track.style.overflowX = "hidden";
    track.style.whiteSpace = "nowrap";

    // calculs
    const halfWidth = track.scrollWidth / 2;
    const isLeft = track.classList.contains("carousel-left");
    track.scrollLeft = isLeft ? halfWidth : 0;

    const baseSpeed = 0.6;
    const speed = isLeft ? -baseSpeed : baseSpeed;

    let rafId = null;
    function step() {
      track.scrollLeft += speed;

      if (track.scrollLeft >= halfWidth) {
        track.scrollLeft -= halfWidth;
      } else if (track.scrollLeft <= 0) {
        track.scrollLeft += halfWidth;
      }

      rafId = requestAnimationFrame(step);
    }

    // démarrer
    rafId = requestAnimationFrame(step);

    // pauser si hors écran pour économiser CPU
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

  /* ---------- 3) Parallaxe vertical pour les .stack-img dans .stack-section ---------- */
  (function initStackParallax() {
    const section = document.querySelector(".stack-section");
    const images = document.querySelectorAll(".stack-img");
    if (!section || images.length === 0) return;

    function onScroll() {
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
    }

    // initial + throttle au scroll natif
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  })();

  /* ---------- 4) Gestion des ancres internes (scroll lisse avec offset nav fixe) ---------- */
  document.body.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return; // laisser comportement normal si aucune cible
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

  /* ---------- 5) Curseur personnalisé dans la section artist (ajoute/retire .cursor-artist sur le body) ---------- */
  (function setupArtistCursor() {
    const artistSection = document.getElementById("artist-section");
    if (!artistSection) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.body.classList.add("cursor-artist");
          } else {
            document.body.classList.remove("cursor-artist");
          }
        });
      },
      { threshold: 0.0 } // déclenche dès qu'une partie est visible
    );

    io.observe(artistSection);
  })();

  /* Fin du load handler */
});
