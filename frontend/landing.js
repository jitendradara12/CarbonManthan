document.addEventListener('DOMContentLoaded', () => {
    // Sticky header
    const header = document.querySelector('.sticky-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            header.style.boxShadow = 'none';
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
});
