// Scroll-snap carousel with arrows, dots and a slow autoplay.
// Autoplay pauses on hover/focus, stops after manual navigation,
// and is disabled for users who prefer reduced motion.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var items = Array.prototype.slice.call(track.children);
    var prev = carousel.querySelector(".carousel-prev");
    var next = carousel.querySelector(".carousel-next");
    var dotsBox = carousel.querySelector(".carousel-dots");
    var delay = parseInt(carousel.dataset.autoplay || "0", 10);
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var timer = null;
    var paused = false;
    var stopped = false;

    function step() {
      return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
    }

    function maxIndex() {
      return Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / step()));
    }

    function currentIndex() {
      return Math.round(track.scrollLeft / step());
    }

    function goTo(index) {
      index = Math.max(0, Math.min(index, maxIndex()));
      track.scrollLeft = index * step();
      update(index);
    }

    function placeArrows() {
      var img = items.length ? items[0].querySelector("img") : null;
      if (!img) return;
      var top = img.offsetTop + img.offsetHeight / 2 + "px";
      prev.style.top = top;
      next.style.top = top;
    }

    function buildDots() {
      placeArrows();
      dotsBox.innerHTML = "";
      for (var i = 0; i <= maxIndex(); i++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", (function (i) {
          return function () { stopped = true; goTo(i); };
        })(i));
        dotsBox.appendChild(dot);
      }
      dotsBox.hidden = maxIndex() === 0;
      update();
    }

    function update(index) {
      if (typeof index !== "number") index = currentIndex();
      prev.disabled = index <= 0;
      next.disabled = index >= maxIndex();
      Array.prototype.forEach.call(dotsBox.children, function (dot, i) {
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    prev.addEventListener("click", function () { stopped = true; goTo(currentIndex() - 1); });
    next.addEventListener("click", function () { stopped = true; goTo(currentIndex() + 1); });
    track.addEventListener("scroll", function () { update(); }, { passive: true });
    track.addEventListener("touchstart", function () { stopped = true; }, { passive: true });
    track.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) stopped = true;
    }, { passive: true });
    window.addEventListener("resize", buildDots);

    ["mouseenter", "focusin"].forEach(function (ev) {
      carousel.addEventListener(ev, function () { paused = true; });
    });
    ["mouseleave", "focusout"].forEach(function (ev) {
      carousel.addEventListener(ev, function () { paused = false; });
    });

    if (delay > 0 && !reduceMotion) {
      timer = window.setInterval(function () {
        if (stopped) { window.clearInterval(timer); return; }
        if (paused || document.hidden) return;
        goTo(currentIndex() >= maxIndex() ? 0 : currentIndex() + 1);
      }, delay);
    }

    buildDots();
  });
});
