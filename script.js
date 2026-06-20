/**
 * script.js
 * Interactive and romantic features for Sania's website.
 * Implements: Floating hearts canvas, audio engine (YouTube API + Web Audio fallback),
 * evading button logic, reasons carousel, memory timeline, custom confetti, and love counter.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // STATE & CONFIGURATION
    // ==========================================
    const config = {
        // Customize the date you fell in love (YYYY-MM-DD format)
        loveStartDate: '2025-06-20T00:00:00',
        youtubeVideoId: 'Nge4P9t9Z8U', // "Saudebazi" song ID
        cheekyComments: [
            "Nice try! 😜",
            "Too slow! 💨",
            "Not today! 😏",
            "You can't escape! 🚫",
            "Try again! 🍭",
            "Nope! 😜",
            "Yes is on the left! 👉",
            "Saudebazi? More like Chase-bazi! 🎵",
            "Almost! 🤏",
            "Give up yet? 🥺"
        ]
    };

    let noAttempts = 0;
    let audioStarted = false;
    let youtubePlayer = null;
    let webAudioSynth = null;
    let audioFallbackActive = false;

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const views = {
        question: document.getElementById('view-question'),
        convince: document.getElementById('view-convince'),
        victory: document.getElementById('view-victory')
    };

    const buttons = {
        yes: document.getElementById('btn-yes'),
        no: document.getElementById('btn-no'),
        noWrapper: document.getElementById('no-btn-wrapper'),
        giveUp: document.getElementById('btn-give-up'),
        yesConvince: document.getElementById('btn-yes-convince'),
        restart: document.getElementById('btn-restart')
    };

    const containers = {
        giveUp: document.getElementById('give-up-container'),
        cheekyBubble: document.getElementById('cheeky-bubble'),
        envelope: document.getElementById('envelope')
    };

    // ==========================================
    // VIEW NAVIGATION
    // ==========================================
    function showView(viewId) {
        // Hide all views
        Object.values(views).forEach(view => {
            if (view.classList.contains('active')) {
                view.style.opacity = '0';
                view.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    view.classList.remove('active');
                }, 400);
            }
        });

        // Show targets view
        setTimeout(() => {
            const targetView = views[viewId];
            targetView.classList.add('active');
            // Force reflow
            targetView.offsetHeight;
            targetView.style.opacity = '1';
            targetView.style.transform = 'translateY(0)';

            // Trigger view-specific behaviors
            if (viewId === 'victory') {
                startConfetti();
                initLoveTimer();
            } else {
                stopConfetti();
            }
            
            // Scroll convince view to top
            if (viewId === 'convince') {
                views.convince.querySelector('.convince-card').scrollTop = 0;
            }
        }, 400);
    }

    // ==========================================
    // FLOATING HEARTS BACKGROUND
    // ==========================================
    const heartsCanvas = document.getElementById('hearts-canvas');
    const ctxHearts = heartsCanvas.getContext('2d');
    let hearts = [];

    function resizeCanvas() {
        heartsCanvas.width = window.innerWidth;
        heartsCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Heart {
        constructor() {
            this.reset();
            this.y = Math.random() * heartsCanvas.height; // Distribute vertically initially
        }

        reset() {
            this.x = Math.random() * heartsCanvas.width;
            this.y = heartsCanvas.height + 20;
            this.size = Math.random() * 15 + 8;
            this.speedY = -(Math.random() * 1.5 + 0.5);
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.scaleSpeed = Math.random() * 0.005 + 0.002;
            this.pulseFactor = 0;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.2;
            this.pulseFactor += this.scaleSpeed;

            if (this.y < -20 || this.opacity <= 0) {
                this.reset();
            }
        }

        draw() {
            ctxHearts.save();
            ctxHearts.globalAlpha = this.opacity;
            ctxHearts.translate(this.x, this.y);
            
            // Breathing scaling effect
            const scale = 1 + Math.sin(this.pulseFactor) * 0.1;
            ctxHearts.scale(scale, scale);

            // Draw Heart Shape
            ctxHearts.beginPath();
            ctxHearts.moveTo(0, 0);
            ctxHearts.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, -this.size / 3, -this.size, 0);
            ctxHearts.bezierCurveTo(-this.size, this.size / 2, -this.size / 3, this.size, 0, this.size * 1.4);
            ctxHearts.bezierCurveTo(this.size / 3, this.size, this.size, this.size / 2, this.size, 0);
            ctxHearts.bezierCurveTo(this.size, -this.size / 3, this.size / 2, -this.size / 2, 0, 0);
            ctxHearts.closePath();

            // Gradient fill
            const grad = ctxHearts.createRadialGradient(0, 0, 1, 0, 0, this.size);
            grad.addColorStop(0, '#ff4f73');
            grad.addColorStop(1, '#ff1e56');
            ctxHearts.fillStyle = grad;
            ctxHearts.fill();
            
            ctxHearts.restore();
        }
    }

    // Initialize hearts
    for (let i = 0; i < 45; i++) {
        hearts.push(new Heart());
    }

    function animateHearts() {
        ctxHearts.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
        hearts.forEach(heart => {
            heart.update();
            heart.draw();
        });
        requestAnimationFrame(animateHearts);
    }
    animateHearts();

    // ==========================================
    // NO BUTTON EVASION LOGIC
    // ==========================================
    let buttonScale = 1.0;

    function evade(e) {
        // Play alert sound
        playBeep(440, 100); // 440Hz beep (A4 note)
        
        noAttempts++;
        buttonScale = Math.max(0.6, 1.0 - (noAttempts * 0.05)); // Shrink button slowly
        
        // Add evading fixed placement styling
        buttons.noWrapper.classList.add('evading');
        
        // Get dimensions
        const btnRect = buttons.no.getBoundingClientRect();
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        
        // Safety margin
        const margin = 80;
        
        // Calculate random coordinates that are far from cursor/touch point
        let clientX = 0;
        let clientY = 0;
        
        if (e && e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e) {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        let newX, newY;
        let distance = 0;
        let attempts = 0;
        
        // Find a random position sufficiently far from the cursor
        do {
            newX = Math.random() * (winWidth - btnRect.width - margin * 2) + margin;
            newY = Math.random() * (winHeight - btnRect.height - margin * 2) + margin;
            
            // Calculate distance to cursor
            const dx = newX + btnRect.width / 2 - clientX;
            const dy = newY + btnRect.height / 2 - clientY;
            distance = Math.sqrt(dx * dx + dy * dy);
            attempts++;
        } while (distance < 200 && attempts < 50);

        // Apply coordinates
        buttons.noWrapper.style.left = `${newX}px`;
        buttons.noWrapper.style.top = `${newY}px`;
        buttons.no.style.transform = `scale(${buttonScale})`;

        // Show cheeky bubble
        showCheekyBubble(newX + btnRect.width / 2, newY - 20);

        // Reveal give-up options
        if (noAttempts >= 4) {
            containers.giveUp.classList.add('show');
        }

        // Automatic convince page redirect after 10 attempts
        if (noAttempts >= 9) {
            // Soft transition
            setTimeout(() => {
                showView('convince');
                resetNoButton();
            }, 1000);
        }
    }

    function showCheekyBubble(x, y) {
        const comment = config.cheekyComments[Math.floor(Math.random() * config.cheekyComments.length)];
        containers.cheekyBubble.textContent = comment;
        containers.cheekyBubble.style.left = `${x}px`;
        containers.cheekyBubble.style.top = `${y}px`;
        
        // Offset centering
        containers.cheekyBubble.style.transform = 'translate(-50%, -100%) scale(1.05)';
        containers.cheekyBubble.classList.add('show');

        // Hide bubble after 1.5 seconds
        setTimeout(() => {
            containers.cheekyBubble.classList.remove('show');
        }, 1500);
    }

    function resetNoButton() {
        noAttempts = 0;
        buttonScale = 1.0;
        buttons.noWrapper.classList.remove('evading');
        buttons.noWrapper.style.left = '';
        buttons.noWrapper.style.top = '';
        buttons.no.style.transform = 'scale(1)';
        containers.giveUp.classList.remove('show');
    }

    // Evasion Event Listeners
    buttons.no.addEventListener('mouseenter', evade);
    buttons.no.addEventListener('mousemove', evade);
    buttons.no.addEventListener('touchstart', (e) => {
        e.preventDefault();
        evade(e);
    });
    buttons.no.addEventListener('click', (e) => {
        e.preventDefault();
        evade(e);
    });

    // ==========================================
    // REASONS CAROUSEL
    // ==========================================
    const track = document.getElementById('carousel-track');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('carousel-next');
    const prevBtn = document.getElementById('carousel-prev');
    const dotsNav = document.getElementById('carousel-dots');
    let currentSlideIndex = 0;

    // Create dot indicators
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active-dot');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);

    function updateCarousel(targetIndex) {
        slides[currentSlideIndex].classList.remove('active-slide');
        dots[currentSlideIndex].classList.remove('active-dot');

        slides[targetIndex].classList.add('active-slide');
        dots[targetIndex].classList.add('active-dot');

        currentSlideIndex = targetIndex;
    }

    nextBtn.addEventListener('click', () => {
        let nextIndex = currentSlideIndex + 1;
        if (nextIndex >= slides.length) nextIndex = 0;
        updateCarousel(nextIndex);
    });

    prevBtn.addEventListener('click', () => {
        let prevIndex = currentSlideIndex - 1;
        if (prevIndex < 0) prevIndex = slides.length - 1;
        updateCarousel(prevIndex);
    });

    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;
        const targetIndex = dots.indexOf(targetDot);
        updateCarousel(targetIndex);
    });

    // Auto rotate slide every 5 seconds
    setInterval(() => {
        if (views.convince.classList.contains('active')) {
            let nextIndex = currentSlideIndex + 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            updateCarousel(nextIndex);
        }
    }, 5000);

    // ==========================================
    // AUDIO CONTROLLER (YOUTUBE & WEB AUDIO FALLBACK)
    // ==========================================
    const musicPlayer = document.getElementById('music-player');
    const musicDisk = document.getElementById('music-disk');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const musicStatus = musicPlayer.querySelector('.music-status');
    const playIcon = musicToggleBtn.querySelector('.play-icon');
    const pauseIcon = musicToggleBtn.querySelector('.pause-icon');

    // Web Audio Synthesizer fallback
    class RomanticSynth {
        constructor() {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.isPlaying = false;
            this.sequenceInterval = null;
            
            // Sweet chord progression (C - G - Am - F) in arpeggios
            this.chords = [
                [261.63, 329.63, 392.00, 523.25], // C Major
                [196.00, 246.94, 293.66, 392.00], // G Major
                [220.00, 261.63, 329.63, 440.00], // A minor
                [174.61, 220.00, 261.63, 349.23]  // F Major
            ];
        }

        start() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.ctx.resume();
            
            let chordIdx = 0;
            let noteIdx = 0;

            this.sequenceInterval = setInterval(() => {
                const currentChord = this.chords[chordIdx];
                const freq = currentChord[noteIdx];
                this.playNote(freq, 0.4);

                noteIdx = (noteIdx + 1) % currentChord.length;
                if (noteIdx === 0) {
                    chordIdx = (chordIdx + 1) % this.chords.length;
                }
            }, 250); // play arpeggio note every 250ms
        }

        stop() {
            this.isPlaying = false;
            clearInterval(this.sequenceInterval);
        }

        playNote(freq, duration) {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            // Soft sine wave for a romantic chime/lullaby sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        }
    }

    // Play a single beep sound on evading click
    function playBeep(frequency, durationMs) {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            
            osc.type = 'triangle'; // Soft beep
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.05, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (durationMs / 1000));
            
            osc.connect(gain);
            gain.connect(context.destination);
            osc.start();
            osc.stop(context.currentTime + (durationMs / 1000));
        } catch (e) {
            // Context blocked
        }
    }

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Global YouTube API callback
    window.onYouTubeIframeAPIReady = function() {
        youtubePlayer = new YT.Player('youtube-player-container', {
            height: '0',
            width: '0',
            videoId: config.youtubeVideoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                loop: 1,
                playlist: config.youtubeVideoId // required for loop
            },
            events: {
                'onReady': onPlayerReady,
                'onError': onPlayerError
            }
        });
    };

    function onPlayerReady() {
        // Player is loaded and ready
        musicStatus.textContent = "Ready";
    }

    function onPlayerError() {
        // Activate fallback
        audioFallbackActive = true;
    }

    function toggleMusic() {
        if (!audioStarted) {
            audioStarted = true;
            // Initialize Web Audio Synth as fallback
            webAudioSynth = new RomanticSynth();
        }

        const isPlaying = musicDisk.classList.contains('playing');

        if (isPlaying) {
            // Stop Audio
            musicDisk.classList.remove('playing');
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            musicStatus.textContent = "Paused";

            if (audioFallbackActive) {
                webAudioSynth.stop();
            } else if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
                try {
                    youtubePlayer.pauseVideo();
                } catch(e) {
                    webAudioSynth.stop();
                }
            } else if (webAudioSynth) {
                webAudioSynth.stop();
            }
        } else {
            // Start Audio
            musicDisk.classList.add('playing');
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            musicStatus.textContent = "Playing";

            if (audioFallbackActive) {
                webAudioSynth.start();
            } else if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
                try {
                    youtubePlayer.playVideo();
                } catch(e) {
                    audioFallbackActive = true;
                    webAudioSynth.start();
                }
            } else if (webAudioSynth) {
                webAudioSynth.start();
            }
        }
    }

    musicToggleBtn.addEventListener('click', toggleMusic);

    // Auto trigger audio play on first user gesture
    function triggerAudioOnFirstTouch() {
        if (!audioStarted) {
            toggleMusic();
        }
        document.removeEventListener('click', triggerAudioOnFirstTouch);
        document.removeEventListener('touchstart', triggerAudioOnFirstTouch);
    }
    document.addEventListener('click', triggerAudioOnFirstTouch);
    document.addEventListener('touchstart', triggerAudioOnFirstTouch);

    // ==========================================
    // VICTORY CONFETTI EFFECTS
    // ==========================================
    const confettiCanvas = document.getElementById('confetti-canvas');
    const ctxConfetti = confettiCanvas.getContext('2d');
    let confettiArray = [];
    let confettiActive = false;

    function resizeConfettiCanvas() {
        confettiCanvas.width = confettiCanvas.parentElement.clientWidth;
        confettiCanvas.height = confettiCanvas.parentElement.clientHeight;
    }

    class Confetti {
        constructor() {
            this.x = Math.random() * confettiCanvas.width;
            this.y = Math.random() * -100 - 20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 3 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.color = this.getRandomColor();
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
            this.type = Math.random() > 0.4 ? 'circle' : 'heart';
        }

        getRandomColor() {
            const colors = ['#ff3366', '#ff6b6b', '#ffd700', '#ff8da6', '#ffa4b9', '#ff9f43', '#ee5253'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.05) * 0.5;
            this.rotation += this.rotationSpeed;

            if (this.y > confettiCanvas.height + 20) {
                this.y = -20;
                this.x = Math.random() * confettiCanvas.width;
            }
        }

        draw() {
            ctxConfetti.save();
            ctxConfetti.translate(this.x, this.y);
            ctxConfetti.rotate((this.rotation * Math.PI) / 180);
            ctxConfetti.fillStyle = this.color;

            if (this.type === 'circle') {
                ctxConfetti.beginPath();
                ctxConfetti.arc(0, 0, this.size, 0, Math.PI * 2);
                ctxConfetti.fill();
            } else {
                // Heart shape confetti
                ctxConfetti.beginPath();
                ctxConfetti.moveTo(0, 0);
                ctxConfetti.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, -this.size / 3, -this.size, 0);
                ctxConfetti.bezierCurveTo(-this.size, this.size / 2, -this.size / 3, this.size, 0, this.size * 1.4);
                ctxConfetti.bezierCurveTo(this.size / 3, this.size, this.size, this.size / 2, this.size, 0);
                ctxConfetti.bezierCurveTo(this.size, -this.size / 3, this.size / 2, -this.size / 2, 0, 0);
                ctxConfetti.closePath();
                ctxConfetti.fill();
            }
            ctxConfetti.restore();
        }
    }

    function startConfetti() {
        resizeConfettiCanvas();
        confettiArray = [];
        for (let i = 0; i < 75; i++) {
            confettiArray.push(new Confetti());
        }
        confettiActive = true;
        animateConfetti();
        window.addEventListener('resize', resizeConfettiCanvas);
    }

    function stopConfetti() {
        confettiActive = false;
        window.removeEventListener('resize', resizeConfettiCanvas);
    }

    function animateConfetti() {
        if (!confettiActive) return;
        ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiArray.forEach(c => {
            c.update();
            c.draw();
        });
        requestAnimationFrame(animateConfetti);
    }

    // Interactive Letter Envelope opening
    containers.envelope.addEventListener('click', function() {
        this.parentElement.classList.toggle('open');
    });

    // ==========================================
    // LOVE TIMER COUNTER
    // ==========================================
    let timerInterval = null;

    function initLoveTimer() {
        const start = new Date(config.loveStartDate).getTime();
        
        function updateTimer() {
            const now = new Date().getTime();
            const difference = now - start;

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }

        if (timerInterval) clearInterval(timerInterval);
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    // ==========================================
    // EVENT WIREUPS
    // ==========================================
    buttons.yes.addEventListener('click', () => {
        showView('victory');
        resetNoButton();
    });

    buttons.yesConvince.addEventListener('click', () => {
        showView('victory');
    });

    buttons.giveUp.addEventListener('click', () => {
        showView('convince');
        resetNoButton();
    });

    buttons.restart.addEventListener('click', () => {
        if (timerInterval) clearInterval(timerInterval);
        showView('question');
    });
});
