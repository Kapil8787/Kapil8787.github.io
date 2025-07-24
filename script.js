document.addEventListener('DOMContentLoaded', function() {

    // --- Header Scroll Effect ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // --- Typed.js Initialization ---
    if (document.getElementById('typed-text')) {
        new Typed('#typed-text', {
            strings: ['Frontend Developer', 'Backend Enthusiast', 'Full-Stack Engineer', 'UI/UX Designer'],
            typeSpeed: 70,
            backSpeed: 50,
            loop: true,
            smartBackspace: true,
        });
    }

    // --- ScrollReveal Initialization for animations ---
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '60px',
        duration: 1500,
        delay: 200,
        reset: false, // Animations repeat only once
    });

    // Targeting elements for reveal animations
    sr.reveal('.reveal', { delay: 200 });
    sr.reveal('.reveal-top', { origin: 'top', delay: 400 });
    sr.reveal('.reveal-left', { origin: 'left', distance: '80px', delay: 200 });
    sr.reveal('.reveal-right', { origin: 'right', distance: '80px', delay: 200 });
    sr.reveal('.reveal-card', { interval: 100 });


    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // 50% of the section must be visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('mobile-menu-hidden');
        mobileMenu.classList.toggle('mobile-menu-visible');
    });

    // Close mobile menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('mobile-menu-hidden');
            mobileMenu.classList.remove('mobile-menu-visible');
        });
    });

    // --- Modal Logic ---
    const modal = document.getElementById('message-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }

    if(modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // --- Gemini API: AI Bio Generator ---
    const generateBioBtn = document.getElementById('generate-bio-btn');
    const bioKeywords = document.getElementById('bio-keywords');
    const bioLoading = document.getElementById('bio-loading');
    const generatedBioContainer = document.getElementById('generated-bio-container');
    const generatedBioText = document.getElementById('generated-bio-text');
    const btnText = document.getElementById('btn-text');

    if(generateBioBtn) {
        generateBioBtn.addEventListener('click', async () => {
            const keywords = bioKeywords.value.trim();
            if (!keywords) {
                showModal("Input Required", "Please enter some keywords to generate a bio.");
                return;
            }
    
            // --- Show loading state ---
            bioLoading.classList.remove('hidden');
            generatedBioContainer.classList.add('hidden');
            generateBioBtn.disabled = true;
            btnText.textContent = 'Generating...';
    
            const prompt = `Based on the following keywords: "${keywords}", write a compelling and professional "About Me" bio for a developer's portfolio. The bio should be 2-3 sentences long, written in the first person, and have a creative and engaging tone.`;
    
            try {
                let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
                const payload = { contents: chatHistory };
                const apiKey = ""; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
    
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
    
                const result = await response.json();
    
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    const text = result.candidates[0].content.parts[0].text;
                    generatedBioText.textContent = text;
                    generatedBioContainer.classList.remove('hidden');
                } else {
                    throw new Error("Invalid response structure from API.");
                }
    
            } catch (error) {
                console.error("Error generating bio:", error);
                showModal("Generation Failed", "Sorry, something went wrong while generating the bio. Please try again later.");
            } finally {
                // --- Hide loading state ---
                bioLoading.classList.add('hidden');
                generateBioBtn.disabled = false;
                btnText.textContent = 'Generate Bio with AI';
            }
        });
    }

    // --- Gemini API: Project Idea Generator ---
    const generateProjectBtn = document.getElementById('generate-project-btn');
    const projectIdeaLoading = document.getElementById('project-idea-loading');
    const projectIdeaContainer = document.getElementById('project-idea-container');
    const projectIdeaTitle = document.getElementById('project-idea-title');
    const projectIdeaDescription = document.getElementById('project-idea-description');

    if (generateProjectBtn) {
        generateProjectBtn.addEventListener('click', async () => {
            // --- Show loading state ---
            projectIdeaLoading.classList.remove('hidden');
            projectIdeaContainer.classList.add('hidden');
            generateProjectBtn.disabled = true;

            // Dynamically get skills from the skills section
            const skillElements = document.querySelectorAll('#skills .reveal-card span');
            const skills = Array.from(skillElements).map(el => el.textContent).join(', ');

            const prompt = `You are a creative tech project manager. Based on the following developer skills: ${skills}. Suggest one unique and impressive web application project idea. The project should be interesting for a developer to build for their portfolio. Provide a response in JSON format with two keys: "title" and "description". The description should be a short paragraph (2-4 sentences).`;

            try {
                // Using a schema for a structured JSON response
                const payload = {
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                "title": { "type": "STRING" },
                                "description": { "type": "STRING" }
                            },
                            required: ["title", "description"]
                        }
                    }
                };
                
                const apiKey = ""; // Handled by environment
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const result = await response.json();
                
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    const jsonText = result.candidates[0].content.parts[0].text;
                    const idea = JSON.parse(jsonText);
                    
                    projectIdeaTitle.textContent = idea.title;
                    projectIdeaDescription.textContent = idea.description;
                    projectIdeaContainer.classList.remove('hidden');
                } else {
                    throw new Error("Invalid response structure from API.");
                }

            } catch (error) {
                console.error("Error generating project idea:", error);
                showModal("Generation Failed", "Sorry, something went wrong while generating a project idea. Please try again later.");
            } finally {
                // --- Hide loading state ---
                projectIdeaLoading.classList.add('hidden');
                generateProjectBtn.disabled = false;
            }
        });
    }

    // --- Particle Network Animation ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();

        // Particle class
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        // Create particle array
        function init() {
            particles = [];
            let numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * .4) - .2;
                let directionY = (Math.random() * .4) - .2;
                let color = 'rgba(34, 211, 238, 0.5)';
                particles.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, innerWidth, innerHeight);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
        }

        // Connect particles
        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                        + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(34, 211, 238, ${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Window resize event
        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });

        init();
        animate();
    }
});
