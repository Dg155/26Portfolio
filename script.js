const reveals = document.querySelectorAll('.section, #about, #resume');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.2 });

reveals.forEach(el => observer.observe(el));

document.querySelectorAll(".gallery img").forEach(img => {

    img.addEventListener("click", () => {

        document.getElementById("hero-image").src = img.src;

    });

});