// ...existing code...
window.addEventListener("load", () => {
  const tracks = document.querySelectorAll(".carousel-left, .carousel-right");

  tracks.forEach((track) => {
    // duplicate content for seamless loop
    track.innerHTML = track.innerHTML + track.innerHTML;
    // ensure horizontal scrolling
    track.style.overflowX = "hidden";
    track.style.whiteSpace = "nowrap";

    // compute half width after browser layout
    const halfWidth = track.scrollWidth / 2;

    // set initial position depending on direction
    const isLeft = track.classList.contains("carousel-left"); // left => images go RIGHT
    track.scrollLeft = isLeft ? halfWidth : 0;

    // speed (pixels per frame). Positive => scroll leftwards (images move left),
    // Negative => scroll rightwards (images move right).
    const baseSpeed = 0.6; // ajuster pour vitesse
    const speed = isLeft ? -baseSpeed : baseSpeed;

    let rafId = null;
    function step() {
      track.scrollLeft += speed;

      // seamless wrap
      if (track.scrollLeft >= halfWidth) {
        track.scrollLeft -= halfWidth;
      } else if (track.scrollLeft <= 0) {
        // when going rightwards past 0, jump forward
        track.scrollLeft += halfWidth;
      }

      rafId = requestAnimationFrame(step);
    }

    // start animation
    rafId = requestAnimationFrame(step);

    // (optionnel) stop animation when element is not in viewport to save CPU
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
});
