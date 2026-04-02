/* ============================================
   八溟科技 - Main JavaScript
   ============================================ */

// ===== Cosmic Comet & Starfield System =====
(function initCosmos() {
    const canvas = document.getElementById('cosmicCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    const stars = [];
    const comets = [];
    const nebulaClouds = [];
    const STAR_COUNT = 260;
    const MAX_COMETS = 4;

    function resize() {
        const dpr = devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // --- Stars ---
    function createStar() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.8 + 0.3,
            baseOpacity: Math.random() * 0.6 + 0.2,
            opacity: 0,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: ['255,255,255', '200,200,255', '180,170,255', '140,160,255', '255,210,180'][Math.floor(Math.random() * 5)]
        };
    }

    function initStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) stars.push(createStar());
    }

    function drawStars(time) {
        stars.forEach(s => {
            s.opacity = s.baseOpacity * (0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.color},${s.opacity})`;
            ctx.fill();

            // Glow for brighter stars
            if (s.size > 1.2) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
                const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
                g.addColorStop(0, `rgba(${s.color},${s.opacity * 0.3})`);
                g.addColorStop(1, `rgba(${s.color},0)`);
                ctx.fillStyle = g;
                ctx.fill();
            }
        });
    }

    // --- Nebula clouds ---
    function createNebula() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            radius: Math.random() * 250 + 150,
            color: [
                [108, 92, 231],
                [168, 85, 247],
                [59, 130, 246],
                [99, 60, 200],
                [40, 80, 180]
            ][Math.floor(Math.random() * 5)],
            opacity: Math.random() * 0.03 + 0.01,
            drift: (Math.random() - 0.5) * 0.08
        };
    }

    function initNebula() {
        nebulaClouds.length = 0;
        for (let i = 0; i < 6; i++) nebulaClouds.push(createNebula());
    }

    function drawNebula(time) {
        nebulaClouds.forEach(n => {
            n.x += n.drift;
            if (n.x < -n.radius) n.x = w + n.radius;
            if (n.x > w + n.radius) n.x = -n.radius;

            const pulse = n.opacity * (0.7 + 0.3 * Math.sin(time * 0.0008 + n.x));
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            g.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${pulse})`);
            g.addColorStop(0.5, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${pulse * 0.4})`);
            g.addColorStop(1, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // --- Comets ---
    function createComet() {
        const fromLeft = Math.random() > 0.3;
        const angle = (Math.random() * 0.4 + 0.15) * (fromLeft ? 1 : -1); // 10-30 degree downward slope
        const speed = Math.random() * 4 + 3;
        const startX = fromLeft ? -100 : w + 100;
        const startY = Math.random() * h * 0.5;
        return {
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
            vy: Math.abs(Math.sin(angle)) * speed,
            tailLength: Math.random() * 120 + 80,
            size: Math.random() * 2.5 + 1.5,
            life: 1,
            decay: Math.random() * 0.002 + 0.003,
            trail: [],
            maxTrail: Math.floor(Math.random() * 40 + 30),
            hue: Math.random() > 0.5 ? [160, 140, 255] : [120, 180, 255],
            sparkles: []
        };
    }

    function spawnComet() {
        if (comets.length < MAX_COMETS && Math.random() < 0.008) {
            comets.push(createComet());
        }
    }

    function drawComets() {
        for (let i = comets.length - 1; i >= 0; i--) {
            const c = comets[i];

            // Update position
            c.x += c.vx;
            c.y += c.vy;
            c.life -= c.decay;

            // Store trail
            c.trail.unshift({ x: c.x, y: c.y, life: 1 });
            if (c.trail.length > c.maxTrail) c.trail.pop();

            // Spawn sparkles
            if (Math.random() < 0.6) {
                c.sparkles.push({
                    x: c.x + (Math.random() - 0.5) * 4,
                    y: c.y + (Math.random() - 0.5) * 4,
                    vx: (Math.random() - 0.5) * 1.5 - c.vx * 0.1,
                    vy: (Math.random() - 0.5) * 1.5 - c.vy * 0.1,
                    life: 1,
                    size: Math.random() * 1.2 + 0.3
                });
            }

            // Draw trail (comet tail)
            if (c.trail.length > 1) {
                for (let t = 1; t < c.trail.length; t++) {
                    const progress = t / c.trail.length;
                    const alpha = (1 - progress) * c.life * 0.6;
                    const width = c.size * (1 - progress * 0.8);
                    c.trail[t].life -= 0.02;

                    ctx.beginPath();
                    ctx.moveTo(c.trail[t - 1].x, c.trail[t - 1].y);
                    ctx.lineTo(c.trail[t].x, c.trail[t].y);
                    ctx.strokeStyle = `rgba(${c.hue[0]},${c.hue[1]},${c.hue[2]},${alpha})`;
                    ctx.lineWidth = width;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }

            // Draw comet head glow
            const headGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 8);
            headGlow.addColorStop(0, `rgba(255,255,255,${c.life * 0.9})`);
            headGlow.addColorStop(0.2, `rgba(${c.hue[0]},${c.hue[1]},${c.hue[2]},${c.life * 0.5})`);
            headGlow.addColorStop(1, `rgba(${c.hue[0]},${c.hue[1]},${c.hue[2]},0)`);
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size * 8, 0, Math.PI * 2);
            ctx.fillStyle = headGlow;
            ctx.fill();

            // Draw comet head core
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${c.life})`;
            ctx.fill();

            // Draw sparkles
            for (let s = c.sparkles.length - 1; s >= 0; s--) {
                const sp = c.sparkles[s];
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.life -= 0.03;
                sp.vx *= 0.97;
                sp.vy *= 0.97;

                if (sp.life <= 0) {
                    c.sparkles.splice(s, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${c.hue[0]},${c.hue[1]},${c.hue[2]},${sp.life * 0.7})`;
                ctx.fill();
            }

            // Remove dead comets
            if (c.life <= 0 || c.x < -200 || c.x > w + 200 || c.y > h + 200) {
                comets.splice(i, 1);
            }
        }
    }

    // --- Shooting stars (fast tiny streaks) ---
    const shootingStars = [];
    function spawnShootingStar() {
        if (shootingStars.length < 2 && Math.random() < 0.003) {
            const angle = Math.random() * 0.5 + 0.3;
            const speed = Math.random() * 12 + 8;
            shootingStars.push({
                x: Math.random() * w,
                y: -10,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                length: Math.random() * 80 + 40
            });
        }
    }

    function drawShootingStars() {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.015;

            const tailX = s.x - (s.vx / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length;
            const tailY = s.y - (s.vy / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length;

            const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255,255,255,${s.life * 0.9})`);
            grad.addColorStop(0.3, `rgba(180,170,255,${s.life * 0.4})`);
            grad.addColorStop(1, `rgba(108,92,231,0)`);

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // head glow
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${s.life})`;
            ctx.fill();

            if (s.life <= 0 || s.y > h + 50) {
                shootingStars.splice(i, 1);
            }
        }
    }

    // --- Main loop ---
    function animate(time) {
        ctx.clearRect(0, 0, w, h);

        drawNebula(time);
        drawStars(time);
        spawnComet();
        drawComets();
        spawnShootingStar();
        drawShootingStars();

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        initStars();
        initNebula();
    });

    resize();
    initStars();
    initNebula();
    // Spawn an initial comet for immediate impact
    comets.push(createComet());
    requestAnimationFrame(animate);
})();

// ===== Navbar Scroll Effect =====
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }
})();

// ===== Number Counter Animation =====
(function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;

    function animateCounters() {
        if (animated) return;
        const trigger = window.innerHeight * 0.85;

        counters.forEach(counter => {
            const rect = counter.getBoundingClientRect();
            if (rect.top < trigger) {
                animated = true;
                const target = parseFloat(counter.dataset.target);
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const start = performance.now();

                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const current = target * ease;

                    counter.textContent = isDecimal
                        ? current.toFixed(1)
                        : Math.floor(current);

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                }

                requestAnimationFrame(update);
            }
        });
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters();
})();

// ===== Scroll Reveal Animation =====
(function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.about-card, .service-card, .tech-item, .contact-item, .contact-form'
    );

    elements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
})();

// ===== Tech Bar Animation =====
(function initTechBars() {
    const bars = document.querySelectorAll('.tech-bar-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.dataset.width;
                entry.target.style.width = width + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    bars.forEach(bar => observer.observe(bar));
})();

// ===== Contact Form =====
(function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>已发送 ✓</span>';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            btn.disabled = false;
            form.reset();
        }, 3000);
    });
})();

// ===== Smooth Scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
