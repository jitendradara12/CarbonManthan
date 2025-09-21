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
    let impactStarted = false;
    if (impactSection && counters.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    impactStarted = true;
                    counters.forEach(animateCounter);
                    obs.disconnect();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(impactSection);
    }
    const triggerImpactIfReady = () => {
        if (impactStarted) {
            counters.forEach(animateCounter);
        }
    };

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

    // Dynamic impact numbers from public projects API
    (async () => {
        try {
            const resp = await fetch('/api/public/projects.geojson');
            if (!resp.ok) return; // keep zeros silently
            const data = await resp.json();
            const features = Array.isArray(data.features) ? data.features : [];
            const approved = features.filter(f => f?.properties?.status === 'Approved');
            // 1 credit = 1 metric ton CO2
            const totalCO2 = approved.reduce((s, f) => s + (Number(f?.properties?.total_credits_minted) || 0), 0);
            const totalArea = approved.reduce((s, f) => s + (Number(f?.properties?.area_hectares) || 0), 0);
            const communities = approved.length; // using count of approved projects as proxy for communities/NGO

            const co2El = document.getElementById('impact-co2');
            const areaEl = document.getElementById('impact-area');
            const commEl = document.getElementById('impact-communities');
            if (co2El) co2El.setAttribute('data-target', String(Math.round(totalCO2)));
            if (areaEl) areaEl.setAttribute('data-target', String(Math.round(totalArea)));
            if (commEl) commEl.setAttribute('data-target', String(communities));
            // If numbers are on screen already, animate now
            triggerImpactIfReady();
        } catch (e) {
            // ignore network errors on public landing
        }
    })();
});
