// ════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════

/** Returns a debounced version of `fn` that waits `ms` after the last call. */
function debounce(fn, ms = 100) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

/** Capitalize the first letter of a string ("scale" → "Scale"). */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// ════════════════════════════════════════
//  EMAILJS INITIALIZATION
// ════════════════════════════════════════

if (typeof emailjs !== "undefined") {
    emailjs.init("lcJrfXospYKI34J0N");
}


// ════════════════════════════════════════
//  THEME TOGGLE
// ════════════════════════════════════════

const themeToggle = document.getElementById("theme-toggle");

function applyTheme(dark) {
    document.documentElement.classList.toggle("dark", dark);
    themeToggle.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
}

// Set button icon to match the class already added by the inline <head> script
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    applyTheme(savedTheme === "dark");
} else {
    applyTheme(true);
}

themeToggle.addEventListener("click", () => {
    applyTheme(!document.documentElement.classList.contains("dark"));
});


// ════════════════════════════════════════
//  PRELOADER
// ════════════════════════════════════════

const preloader = document.getElementById("preloader");
const PRELOADER_DELAY = 2300;

if (preloader) {
    document.body.classList.add("scroll-locked");

    setTimeout(() => {
        preloader.remove();
        document.body.classList.remove("scroll-locked");
        initScrollReveal();
    }, PRELOADER_DELAY);
} else {
    initScrollReveal();
}


// ════════════════════════════════════════
//  SCROLL REVEAL
// ════════════════════════════════════════

function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
}


// ════════════════════════════════════════
//  HERO RESPONSIVE SCALING
// ════════════════════════════════════════
//
//  Each .hero-image keeps its desktop defaults in the inline style attribute:
//      style="--hero-x: 0%; --hero-y: -10%; --hero-scale: 1.2;"
//
//  Responsive overrides are declared via data attributes:
//      data-md-x="30%"   data-md-y="-5%"   data-md-scale="1.3"   (≤ 900px)
//      data-sm-x="40%"   data-sm-y="0%"    data-sm-scale="1.4"   (≤ 700px)
//      data-xs-x="50%"   data-xs-y="0%"    data-xs-scale="1.5"   (≤ 480px)
//
//  Cascade: if a property isn't defined at a smaller breakpoint it
//  falls through to the next larger one, then to the default.

const heroImages = document.querySelectorAll(".hero-image");

// Breakpoints sorted ascending — the first one that matches AND has a
// data attribute wins; if none match we fall back to the inline default.
const HERO_BREAKPOINTS = [
    { name: "xs", maxWidth: 480 },
    { name: "sm", maxWidth: 700 },
    { name: "md", maxWidth: 900 },
    { name: "lg", maxWidth: 1100 },
];

// Cache the original inline-style values so we can restore them on desktop
heroImages.forEach((img) => {
    img._heroDefaults = {
        x:     img.style.getPropertyValue("--hero-x").trim(),
        y:     img.style.getPropertyValue("--hero-y").trim(),
        scale: img.style.getPropertyValue("--hero-scale").trim(),
    };
});

/**
 * For a given image and property ("x" | "y" | "scale"), return the best
 * value for the current viewport width.
 */
function getHeroValue(img, prop) {
    const w = window.innerWidth;

    // Walk breakpoints smallest → largest; first one whose maxWidth ≥ w
    // AND has a data-attr defined wins.  If xs has nothing, sm is tried, etc.
    for (const bp of HERO_BREAKPOINTS) {
        if (w <= bp.maxWidth) {
            const key = bp.name + capitalize(prop); // e.g. "mdScale"
            if (img.dataset[key]) return img.dataset[key];
        }
    }

    // Desktop or no override defined — use the original inline value
    return img._heroDefaults[prop];
}

/** Re-evaluate every hero image's custom properties. */
function updateHeroScaling() {
    heroImages.forEach((img) => {
        img.style.setProperty("--hero-x",     getHeroValue(img, "x"));
        img.style.setProperty("--hero-y",     getHeroValue(img, "y"));
        img.style.setProperty("--hero-scale", getHeroValue(img, "scale"));
    });
}

// Run once on load so mobile visitors get the right values immediately
updateHeroScaling();


// ════════════════════════════════════════
//  GALLERY CAROUSEL
// ════════════════════════════════════════

const galleryUpdaters = []; // collected so we can call them from one resize handler

document.querySelectorAll(".gallery-wrapper").forEach((wrapper) => {
    const track = wrapper.querySelector(".gallery-track");
    const items = Array.from(track.children);
    const prev  = wrapper.querySelector(".prev");
    const next  = wrapper.querySelector(".next");
    let index   = 0;

    function getVisibleCount() {
        const raw = getComputedStyle(wrapper)
            .getPropertyValue("--gallery-visible")
            .trim();
        const n = parseInt(raw, 10);
        return Number.isNaN(n) ? 4 : n;
    }

    function update() {
        const visible  = getVisibleCount();
        const maxIndex = Math.max(0, items.length - visible);

        // If everything fits, hide arrows and stretch items
        if (items.length <= visible) {
            prev.classList.add("hidden");
            next.classList.add("hidden");
            track.classList.add("fill");
            track.style.transform = "translateX(0)";
            index = 0;
            return;
        }

        prev.classList.remove("hidden");
        next.classList.remove("hidden");
        track.classList.remove("fill");

        // Clamp in case visible count changed on resize
        index = Math.min(index, maxIndex);

        const step = items[0].getBoundingClientRect().width + 2; // 2 = gap
        track.style.transform = `translateX(${-index * step}px)`;
        prev.disabled = index === 0;
        next.disabled = index === maxIndex;
    }

    prev.addEventListener("click", () => { index = Math.max(0, index - 1); update(); });
    next.addEventListener("click", () => {
        const maxIndex = Math.max(0, items.length - getVisibleCount());
        index = Math.min(maxIndex, index + 1);
        update();
    });

    galleryUpdaters.push(update);
    update();
});


// ════════════════════════════════════════
//  LIGHTBOX
// ════════════════════════════════════════

const lightbox      = document.getElementById("lightbox");
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


// ════════════════════════════════════════
//  CONTACT MODAL  &  EMAILJS
// ════════════════════════════════════════

const EMAILJS_SERVICE_ID  = "service_sbmxuqo";
const EMAILJS_TEMPLATE_ID = "template_xy5qbbs";

const contactModal      = document.getElementById("contact-modal");
const emailButton       = document.getElementById("email-button");
const floatingEmail     = document.getElementById("floating-email");
const contactModalClose = document.getElementById("contact-modal-close");
const contactForm       = document.getElementById("contact-form");
const contactStatus     = document.getElementById("contact-status");
const socialMenu        = document.querySelector(".social-menu");
const socialToggle      = document.querySelector(".social-toggle");

function openContactModal() {
    contactModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeContactModal() {
    contactModal.classList.remove("active");
    document.body.style.overflow = "";
}

if (emailButton)       emailButton.addEventListener("click", openContactModal);
if (floatingEmail)     floatingEmail.addEventListener("click", openContactModal);
if (contactModalClose) contactModalClose.addEventListener("click", closeContactModal);

if (socialToggle) {

    socialToggle.addEventListener("click", (e) => {

        e.stopPropagation();

        socialMenu.classList.toggle("open");

    });

}

if (contactModal) {
    contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) closeContactModal();
    });
}

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name    = contactForm.elements["name"].value.trim();
        const email   = contactForm.elements["email"].value.trim();
        const message = contactForm.elements["message"].value.trim();

        if (!name || !email || !message) {
            contactStatus.textContent = "Please fill out all fields.";
            return;
        }

        // Guard against EmailJS failing to load (e.g. ad-blocker)
        if (typeof emailjs === "undefined") {
            contactStatus.textContent =
                "Email service unavailable — please email me directly at danielboghoss@gmail.com";
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        contactStatus.textContent = "Sending…";

        emailjs
            .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                name,
                email,
                message,
            })
            .then(() => {
                contactStatus.textContent = "Message sent! I'll get back to you soon.";
                contactForm.reset();
                submitBtn.disabled = false;

                // Auto-close modal after a short pause
                setTimeout(() => {
                    contactStatus.textContent = "";
                    closeContactModal();
                }, 2500);
            })
            .catch((err) => {
                console.error("EmailJS error:", err);
                contactStatus.textContent = "Something went wrong. Please try again.";
                submitBtn.disabled = false;
            });
    });
}


// ════════════════════════════════════════
//  KEYBOARD HANDLERS
// ════════════════════════════════════════

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (lightbox.classList.contains("active")) closeLightbox();
    if (contactModal && contactModal.classList.contains("active")) closeContactModal();
});

document.addEventListener("click", (e) => {

    if (!socialMenu) return;

    if (!socialMenu.contains(e.target)) {

        socialMenu.classList.remove("open");

    }

});


// ════════════════════════════════════════
//  CONSOLIDATED RESIZE HANDLER
// ════════════════════════════════════════

window.addEventListener(
    "resize",
    debounce(() => {
        updateHeroScaling();
        galleryUpdaters.forEach((fn) => fn());
    }, 100)
);