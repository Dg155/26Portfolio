// ===== THEME TOGGLE =====
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(dark) {
    document.documentElement.classList.toggle("dark", dark);
    themeToggle.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
}

// On load: honour saved choice, else match OS preference
// (the inline <script> in <head> already added the class to prevent flash,
//  but we still need to set the button icon here)
const saved = localStorage.getItem("theme");
if (saved) {
    applyTheme(saved === "dark");
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme(true);
}

themeToggle.addEventListener("click", () => {
    applyTheme(!document.documentElement.classList.contains("dark"));
});

// ===== FADE-IN OBSERVER =====
const reveals = document.querySelectorAll(".section, #about, #resume");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("active");
        });
    },
    { threshold: 0.2 }
);

reveals.forEach((el) => observer.observe(el));

// ===== CAROUSEL =====
document.querySelectorAll(".gallery-wrapper").forEach((wrapper) => {
    const track = wrapper.querySelector(".gallery-track");
    const items = track.children;
    const prev = wrapper.querySelector(".prev");
    const next = wrapper.querySelector(".next");
    const VISIBLE = 4;
    const maxIndex = Math.max(0, items.length - VISIBLE);
    let index = 0;

    if (items.length <= VISIBLE) {
        prev.classList.add("hidden");
        next.classList.add("hidden");
        track.classList.add("fill");
        return;
    }

    function update() {
        const step = items[0].getBoundingClientRect().width + 2;
        track.style.transform = `translateX(${-index * step}px)`;
        prev.disabled = index === 0;
        next.disabled = index === maxIndex;
    }

    prev.addEventListener("click", () => {
        index = Math.max(0, index - 1);
        update();
    });
    next.addEventListener("click", () => {
        index = Math.min(maxIndex, index + 1);
        update();
    });
    window.addEventListener("resize", update);
    update();
});

// ===== LIGHTBOX =====
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");

document.querySelectorAll(".gallery-track img").forEach((img) => {
    img.addEventListener("click", () => {
        lightboxImage.src = img.src;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

lightbox.addEventListener("click", (e) => {
    if (e.target !== lightboxImage) closeLightbox();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
});