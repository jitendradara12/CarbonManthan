document.addEventListener('DOMContentLoaded', () => {
    // Sticky header (kept minimal; no hamburger anymore)
    const header = document.querySelector('.sticky-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // Animated counters
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    const animateCounter = (counter) => {
        const target = Number(counter.getAttribute('data-target')) || 0;
        const count = Number(counter.innerText.replace(/,/g, '')) || 0;
        const inc = Math.max(target / speed, 1);
        if (count < target) {
            counter.innerText = Math.min(Math.ceil(count + inc), target).toLocaleString();
            setTimeout(() => animateCounter(counter), 16); // ~60fps
        } else {
            counter.innerText = target.toLocaleString();
        }
    };
    const impactSection = document.querySelector('.impact-section');
    if (impactSection && counters.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(animateCounter);
                    obs.disconnect();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(impactSection);
    }

    // Scroll reveal animations
    const sections = document.querySelectorAll('section');
    if (sections.length) {
        const sectionObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        sections.forEach(section => {
            section.classList.add('fade-in-section');
            sectionObserver.observe(section);
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeToggle) {
        const applyTheme = (theme) => {
            const dark = theme === 'dark';
            body.classList.toggle('dark-theme', dark);
            themeToggle.textContent = dark ? '☀️' : '🌙';
        };
        let currentTheme = localStorage.getItem('theme') || 'light';
        applyTheme(currentTheme);
        themeToggle.addEventListener('click', () => {
            currentTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            applyTheme(currentTheme);
        });
    }
});
