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

  // --- Effet clic : rétractation de l'image .stack-img vers la droite et affichage d'un espace d'infos ---
  function setupStackImageDetailToggle() {
    document.body.addEventListener("click", (e) => {
      const img = e.target.closest("img.stack-img");
      if (!img) return;
      // si déjà ouvert -> fermer
      if (img.dataset.ckOpen === "1") {
        closeStackDetail(img);
      } else {
        openStackDetail(img);
      }
    });
  }

  function openStackDetail(img) {
    // éviter l'ouverture multiple
    if (document.querySelector(".ck-overlay")) return;

    // conserver l'état et empêcher le drag
    const parent = img.parentNode;
    const next = img.nextSibling;
    img.dataset.ckOriginalStyle = img.getAttribute("style") || "";
    img.draggable = false;

    const rect = img.getBoundingClientRect();

    // placeholder pour conserver la mise en page quand on fixe l'image
    const placeholder = document.createElement("div");
    placeholder.className = "ck-placeholder";
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.minWidth = `${rect.width}px`;
    placeholder.style.minHeight = `${rect.height}px`;
    placeholder.style.boxSizing = "border-box";
    parent.insertBefore(placeholder, img);

    // overlay (fond sombre + emplacement pour panneau d'infos à gauche)
    const overlay = document.createElement("div");
    overlay.className = "ck-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-hidden", "false");

    // panneau d'infos à gauche (laisse vide pour que tu puisses injecter les infos de l'artiste)
    const infoPanel = document.createElement("aside");
    infoPanel.className = "ck-info";
    infoPanel.innerHTML = `<button class="ck-close" aria-label="Fermer">×</button><div class="ck-info-inner"></div>`;

    overlay.appendChild(infoPanel);
    document.body.appendChild(overlay);

    // déplacer l'image originale dans le body pour pouvoir la positionner en fixed
    document.body.appendChild(img);

    // définir le positionnement initial fixe pour correspondre à l'emplacement d'origine
    Object.assign(img.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      transition: "all 420ms cubic-bezier(.2,.9,.3,1)",
      zIndex: "100002",
      objectFit: "cover",
    });

    // marquer comme ouvert
    img.dataset.ckOpen = "1";
    img.classList.add("ck-open");

    // animer vers la moitié droite (le panneau d'infos reste à gauche)
    requestAnimationFrame(() => {
      const half = Math.round(window.innerWidth / 2);
      // définir la largeur du panneau d'infos (JS fixe la valeur exacte)
      infoPanel.style.width = `${half}px`;
      infoPanel.style.height = `100vh`;
      // animer l'image vers la moitié droite
      img.style.left = `${half}px`;
      img.style.top = `0px`;
      img.style.width = `${window.innerWidth - half}px`;
      img.style.height = `${window.innerHeight}px`;
    });

    // gestion de la fermeture
    function onOverlayClick(ev) {
      if (ev.target === overlay || ev.target.closest(".ck-close")) {
        closeStackDetail(img);
      }
    }
    overlay.addEventListener("click", onOverlayClick);

    function onKeyUp(ev) {
      if (ev.key === "Escape") closeStackDetail(img);
    }
    window.addEventListener("keyup", onKeyUp);

    // stocker les références pour la restauration
    img._ckData = {
      parent,
      next,
      placeholder,
      overlay,
      onOverlayClick,
      onKeyUp,
    };
  }

  function closeStackDetail(img) {
    const data = img._ckData;
    if (!data) return;
    const { parent, next, placeholder, overlay, onOverlayClick, onKeyUp } =
      data;

    // position cible = position du placeholder
    const targetRect = placeholder.getBoundingClientRect();

    // animer l'image vers le placeholder
    Object.assign(img.style, {
      left: `${targetRect.left}px`,
      top: `${targetRect.top}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
    });

    // atténuer le fond de l'overlay
    overlay.classList.add("ck-closing");

    // après la transition, restaurer l'image dans le DOM et nettoyer
    const cleanup = () => {
      // restaurer le style inline d'origine
      if (img.dataset.ckOriginalStyle) {
        img.setAttribute("style", img.dataset.ckOriginalStyle);
      } else {
        img.removeAttribute("style");
      }
      // remettre l'image à sa position d'origine dans le parent
      if (next) parent.insertBefore(img, next);
      else parent.appendChild(img);

      // supprimer le placeholder et l'overlay
      placeholder.remove();
      overlay.remove();

      // retirer les marques d'ouverture
      delete img.dataset.ckOpen;
      img.classList.remove("ck-open");
      delete img._ckData;

      window.removeEventListener("keyup", onKeyUp);
      overlay.removeEventListener("click", onOverlayClick);
    };

    // attendre la fin de la transition pour nettoyer
    img.addEventListener(
      "transitionend",
      () => {
        cleanup();
      },
      { once: true }
    );
  }

  setupStackImageDetailToggle();
}); // fin du load
