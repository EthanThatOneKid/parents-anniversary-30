document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const waxSeal = document.getElementById('wax-seal');
    const envelope = document.querySelector('.envelope');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const cardContent = document.getElementById('card-content');
    const instructionText = document.querySelector('.instruction-text');
    
    // Audio Elements
    const bgMusic = document.getElementById('bg-music');
    const audioToggle = document.getElementById('audio-toggle');
    
    // Lightbox Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    // Polaroid Elements
    const polaroids = document.querySelectorAll('.polaroid');
    let currentPhotoIndex = 0;
    const photoData = [];

    // Initialize Polaroid Data and Scatter Rotations
    polaroids.forEach((polaroid, index) => {
        // Collect photo details for lightbox navigation
        const img = polaroid.querySelector('img');
        const caption = polaroid.querySelector('.caption').textContent;
        photoData.push({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            caption: caption
        });

        // Set random rotation angle for desktop scattered collage effect
        if (window.innerWidth > 600) {
            const randomRotation = (Math.random() * 8 - 4).toFixed(2); // rotation between -4deg and +4deg
            polaroid.style.setProperty('--rot', `${randomRotation}deg`);
        } else {
            polaroid.style.setProperty('--rot', '0deg');
        }

        // Add click listener to open lightbox
        polaroid.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    // 1. Envelope Opening Sequence
    waxSeal.addEventListener('click', openEnvelope);
    // Support enter key for accessibility
    waxSeal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openEnvelope();
        }
    });

    function openEnvelope() {
        if (envelope.classList.contains('open')) return;

        // Start open animation
        envelope.classList.add('open');
        instructionText.style.display = 'none';

        // Show the audio control immediately
        audioToggle.classList.remove('hidden');

        // Play audio upon user click (safely allowed by browser auto-play policy)
        bgMusic.volume = 0.35;
        bgMusic.play()
            .then(() => {
                audioToggle.querySelector('.icon').textContent = '🔊';
            })
            .catch(err => {
                console.log('Audio autoplay blocked or failed:', err);
                audioToggle.querySelector('.icon').textContent = '🔇';
            });

        // Wait for envelope flap & paper pull animations, then transition screens
        setTimeout(() => {
            envelopeWrapper.classList.add('fade-out');
            cardContent.classList.add('card-visible');
            
            // Sequentially reveal paragraphs for high-end feel
            revealCardTexts();
        }, 1800);
    }

    // Paragraph stagger reveal animation
    function revealCardTexts() {
        const paragraphs = document.querySelectorAll('.fade-in-el');
        paragraphs.forEach((p, idx) => {
            setTimeout(() => {
                p.classList.add('revealed');
            }, idx * 450); // 450ms offset between elements
        });
    }

    // 2. Background Music Controller
    audioToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            audioToggle.querySelector('.icon').textContent = '🔊';
        } else {
            bgMusic.pause();
            audioToggle.querySelector('.icon').textContent = '🔇';
        }
    });

    // 3. Ambient Gold Particles Canvas System
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const maxParticles = 65;

    // Adjust canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        // Reset polaroids rotations on resize transitions
        polaroids.forEach((p) => {
            if (window.innerWidth <= 600) {
                p.style.setProperty('--rot', '0deg');
            }
        });
    });

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            // Place initially throughout screen, or spawn at bottom
            this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedY = -(Math.random() * 0.4 + 0.15); // slow upward float
            this.speedX = Math.random() * 0.3 - 0.15; // gentle side sway
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.color = Math.random() > 0.5 ? '245, 231, 200' : '212, 175, 55'; // Champagne vs Gold
            this.wobbleSpeed = Math.random() * 0.02;
            this.wobbleValue = Math.random() * Math.PI * 2;
        }

        update() {
            this.y += this.speedY;
            this.wobbleValue += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobbleValue) * 0.2;

            // Fade in/out cycle
            if (this.y < 0 || this.opacity <= 0) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Animation Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();

    // 4. Lightbox Dialog Logic
    function openLightbox(index) {
        currentPhotoIndex = index;
        updateLightboxImage();
        lightbox.style.display = 'flex';
        lightbox.setAttribute('aria-hidden', 'false');
        
        // Use timeout to trigger opacity transition
        setTimeout(() => {
            lightbox.classList.add('active');
        }, 10);
        
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 400); // match transition speed

        document.body.style.overflow = '';
    }

    function updateLightboxImage() {
        const photo = photoData[currentPhotoIndex];
        lightboxImg.src = photo.src;
        lightboxImg.alt = photo.alt;
        lightboxCaption.textContent = photo.caption;
    }

    function nextImage() {
        currentPhotoIndex = (currentPhotoIndex + 1) % photoData.length;
        updateLightboxImage();
    }

    function prevImage() {
        currentPhotoIndex = (currentPhotoIndex - 1 + photoData.length) % photoData.length;
        updateLightboxImage();
    }

    // Lightbox Events
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        }
    });
});
