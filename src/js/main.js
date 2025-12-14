// ...existing code...
window.addEventListener("load", () => {
  // Wrap each .img-carousel in a .carousel-item with an overlay (for hover "DISCOVER")
  function wrapCarouselImages() {
    document.querySelectorAll(".img-carousel").forEach((img) => {
      if (img.closest(".carousel-item")) return; // already wrapped
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
    // duplicate content for seamless loop
    track.innerHTML = track.innerHTML + track.innerHTML;
    // ensure horizontal behavior
    track.style.overflowX = "hidden";
    track.style.whiteSpace = "nowrap";

    // compute half width after duplication/layout
    const halfWidth = track.scrollWidth / 2;

    // set initial position depending on direction
    const isLeft = track.classList.contains("carousel-left"); // left => images move RIGHT
    track.scrollLeft = isLeft ? halfWidth : 0;

    // speed (pixels per frame). Negative => scrollLeft decreases (images move right).
    const baseSpeed = 0.6; // adjust for desired speed
    const speed = isLeft ? -baseSpeed : baseSpeed;

    let rafId = null;
    function step() {
      track.scrollLeft += speed;

      // seamless wrap
      if (track.scrollLeft >= halfWidth) {
        track.scrollLeft -= halfWidth;
      } else if (track.scrollLeft <= 0) {
        track.scrollLeft += halfWidth;
      }

      rafId = requestAnimationFrame(step);
    }

    // start animation
    rafId = requestAnimationFrame(step);

    // pause animation when track is offscreen to save CPU
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

  // Stack-section parallax behavior (initial code moved inside load to ensure DOM ready)
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
});
