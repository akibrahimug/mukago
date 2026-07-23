// Scroll reveal for sections
const revealTargets = document.querySelectorAll('.why__inner, .pact-intro__inner, .half, .journey__item, .signup__inner');
revealTargets.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
);
revealTargets.forEach((el) => observer.observe(el));

// Email signup — front-end only, no backend wired up yet.
// Swap this handler for a real request to your email service (Mailchimp,
// ConvertKit, Buttondown, Formspree, etc.) before launch.
const form = document.getElementById('signup-form');
const input = document.getElementById('email');
const fine = document.getElementById('signup-fine');
const fineDefault = fine.textContent;

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = input.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValid) {
    fine.textContent = 'That email doesn’t look right — mind checking it?';
    fine.classList.remove('is-success');
    fine.classList.add('is-error');
    input.focus();
    return;
  }

  fine.classList.remove('is-error');
  fine.classList.add('is-success');
  fine.textContent = 'Pact signed. We’ll be in touch before 2027.';
  form.querySelector('.signup__submit').disabled = true;
  input.disabled = true;

  setTimeout(() => {
    fine.classList.remove('is-success');
    fine.textContent = fineDefault;
    form.querySelector('.signup__submit').disabled = false;
    input.disabled = false;
    input.value = '';
  }, 5000);
});
