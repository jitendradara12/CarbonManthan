document.addEventListener('DOMContentLoaded', () => {
    // Sticky header
    const header = document.querySelector('.sticky-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scroll for hero button
    const exploreBtn = document.querySelector('.hero-content .btn');
    if(exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Animated counters
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // The lower the slower

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;

        const inc = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(() => animateCounter(counter), 1);
        } else {
            counter.innerText = target.toLocaleString();
        }
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                counters.forEach(counter => {
                    animateCounter(counter);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const impactSection = document.querySelector('.impact-section');
    if(impactSection) {
        observer.observe(impactSection);
    }

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    hamburger.addEventListener('click', () => {
        header.classList.toggle('nav-active');
    });

    // Scroll animations
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('fade-in-section');
        sectionObserver.observe(section);
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '☀️'; // Sun icon for dark mode
        } else {
            body.classList.remove('dark-theme');
            themeToggle.innerHTML = '🌙'; // Moon icon for light mode
        }
    };

    let currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        currentTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    });
});
