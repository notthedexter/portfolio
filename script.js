class StarField {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 300;
        this.resize();
        this.createStars();
        window.addEventListener('resize', () => this.resize());
        window.requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Re-create stars to fill new dimensions, or just let them drift
        if (this.stars.length === 0) this.createStars();
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(this.randomStar());
        }
    }

    randomStar() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 1.2 + 0.1,
            alpha: Math.random() * 0.8 + 0.2,
            twinkleSpeed: (Math.random() - 0.5) * 0.02,
            velocity: {
                x: (Math.random() - 0.5) * 0.15,
                y: (Math.random() - 0.5) * 0.15
            }
        };
    }

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.stars.forEach(star => {
            // Draw star
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Move star
            star.x += star.velocity.x;
            star.y += star.velocity.y;

            // Wrap around edges
            if (star.x < 0) star.x = this.canvas.width;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height;
            if (star.y > this.canvas.height) star.y = 0;

            // Twinkle effect
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 1 || star.alpha < 0.2) {
                star.twinkleSpeed = -star.twinkleSpeed;
            }
        });

        window.requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('load', () => {
    new StarField('auroraCanvas');
});

const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks?.classList.remove('active'));
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.glass-panel, .project-card, .skill-category').forEach(element => {
        element.classList.add('pre-reveal');
        revealObserver.observe(element);
    });
}

const initGlassPhysics = () => {
    if (prefersReducedMotion) return;
    const panels = document.querySelectorAll('.glass-panel');
    if (!panels.length) return;

    panels.forEach(panel => {
        const handlePointerMove = event => {
            const rect = panel.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate normalized position (-1 to 1)
            const normX = (event.clientX - centerX) / (rect.width / 2);
            const normY = (event.clientY - centerY) / (rect.height / 2);
            
            // Calculate angle and distance for polar coordinates
            const angle = Math.atan2(normY, normX) * (180 / Math.PI);
            const distance = Math.min(Math.hypot(normX, normY), 1);
            
            // Calculate refraction offsets using sin/cos
            // This simulates light bending through the glass thickness
            const refractionX = -Math.cos(angle * (Math.PI / 180)) * 12 * distance;
            const refractionY = -Math.sin(angle * (Math.PI / 180)) * 12 * distance;

            panel.style.setProperty('--glow-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
            panel.style.setProperty('--glow-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
            panel.style.setProperty('--angle', `${angle}deg`);
            panel.style.setProperty('--refract-x', `${refractionX}px`);
            panel.style.setProperty('--refract-y', `${refractionY}px`);
            panel.classList.add('is-active');
        };

        panel.addEventListener('pointermove', handlePointerMove);
        panel.addEventListener('pointerleave', () => {
            panel.classList.remove('is-active');
            panel.style.removeProperty('--glow-x');
            panel.style.removeProperty('--glow-y');
        });
    });
};

initGlassPhysics();

const highlightNav = () => {
    const sections = document.querySelectorAll('section');
    const navLens = document.querySelector('.nav-lens');
    const navLinksContainer = document.querySelector('.nav-links');
    let current = '';

    sections.forEach(section => {
        const offset = section.offsetTop - 220;
        if (window.scrollY >= offset) {
            current = section.id;
        }
    });

    const activeLink = document.querySelector(`.nav-links a[href="#${current}"]`);
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    if (activeLink) {
        activeLink.classList.add('active');
        
        // Move Lens
        const linkRect = activeLink.getBoundingClientRect();
        const containerRect = navLinksContainer.getBoundingClientRect();
        
        const left = linkRect.left - containerRect.left;
        const width = linkRect.width;
        
        navLens.style.opacity = '1';
        navLens.style.left = `${left}px`;
        navLens.style.width = `${width}px`;
    } else {
        navLens.style.opacity = '0';
    }
};

window.addEventListener('scroll', highlightNav);
window.addEventListener('resize', highlightNav); // Recalculate on resize
highlightNav();

// Draggable Lens Logic
const initDraggableLens = () => {
    const navLinksContainer = document.querySelector('.nav-links');
    const navLens = document.querySelector('.nav-lens');
    const links = document.querySelectorAll('.nav-links a');
    let isDragging = false;
    let startX;
    let initialLeft;

    // Attach listeners to the container but filter in dragStart
    navLinksContainer.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Touch support
    navLinksContainer.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // STRICT CHECK: Only start dragging if clicking ON the lens
        const lensRect = navLens.getBoundingClientRect();
        if (clientX < lensRect.left || clientX > lensRect.right || 
            clientY < lensRect.top || clientY > lensRect.bottom) {
            return; // Clicked outside the lens
        }

        // Prevent default to stop text selection, but allow touch scrolling if needed (handled in drag)
        if (!e.touches) e.preventDefault();

        startX = clientX;
        
        // Get current lens position
        const style = window.getComputedStyle(navLens);
        initialLeft = parseFloat(style.left) || 0;
        
        // Disable transition for direct 1:1 movement
        navLens.style.transition = 'none';
        isDragging = true;
        
        // Add grabbing cursor class to body or container
        navLinksContainer.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - startX;
        
        if (e.touches) e.preventDefault(); // Prevent scroll while dragging lens

        // Calculate new position
        let newLeft = initialLeft + deltaX;
        
        // Constrain to container bounds
        const containerWidth = navLinksContainer.offsetWidth;
        const lensWidth = navLens.offsetWidth;
        
        // Elastic constraint (optional) or hard stop
        if (newLeft < 0) newLeft = 0;
        if (newLeft > containerWidth - lensWidth) newLeft = containerWidth - lensWidth;

        navLens.style.left = `${newLeft}px`;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        navLinksContainer.style.cursor = ''; // Reset cursor
        
        // Re-enable transition for the snap effect
        navLens.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        
        // Find closest link to snap to
        const lensRect = navLens.getBoundingClientRect();
        const lensCenter = lensRect.left + lensRect.width / 2;
        
        let closestLink = null;
        let minDistance = Infinity;
        
        links.forEach(link => {
            const linkRect = link.getBoundingClientRect();
            const linkCenter = linkRect.left + linkRect.width / 2;
            const distance = Math.abs(linkCenter - lensCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestLink = link;
            }
        });
        
        if (closestLink) {
            // 1. Visually snap immediately to the target link
            const containerRect = navLinksContainer.getBoundingClientRect();
            const linkRect = closestLink.getBoundingClientRect();
            const left = linkRect.left - containerRect.left;
            const width = linkRect.width;
            
            navLens.style.left = `${left}px`;
            navLens.style.width = `${width}px`;

            // 2. Trigger the actual navigation
            // We use a small timeout to ensure the visual snap isn't interrupted by scroll logic immediately
            setTimeout(() => {
                closestLink.click();
            }, 50);
        } else {
            // Fallback: snap back to where it was (current active)
            highlightNav();
        }
    }
};

initDraggableLens();

const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    alert('Thank you for reaching out! I will respond shortly.');
    contactForm.reset();
});

console.log('%cPortfolio refreshed', 'font-size: 14px; color: #8ce0ff; font-weight: 600;');
