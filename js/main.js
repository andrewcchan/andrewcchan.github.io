document.addEventListener('DOMContentLoaded', () => {
    // Clock
    function updateClock() {
        const now = new Date();
        // Format: YYYY-MM-DD HH:MM:SS
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const clockElement = document.getElementById('system-clock');
        if (clockElement) {
            clockElement.textContent = timeString;
        }
    }

    // Update immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);

    // Theme Switcher Logic
    const themes = ['amber', 'green', 'white', 'blue'];

    function setTheme(theme) {
        if (!themes.includes(theme)) return;

        document.body.classList.remove(...themes.map(t => 'theme-' + t));
        document.body.classList.add('theme-' + theme);

        localStorage.setItem('theme', theme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'amber';
    setTheme(savedTheme);

    // Konami Code Logic
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    let cursor = 0;

    function startMatrixRain(targetTheme, rainColor) {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.style.display = 'block';
        canvas.style.opacity = '1';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%';
        const fontSize = 16;
        const columns = canvas.width / fontSize;

        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        let animationId;

        function draw() {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set rain color
            ctx.fillStyle = rainColor;
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            animationId = requestAnimationFrame(draw);
        }

        draw();

        // Step 2: Change site theme after 2 seconds
        setTimeout(() => {
            setTheme(targetTheme);

            // Reveal easter egg if not already revealed (optional, but requested previously)
            const egg = document.getElementById('easter-egg');
            if (egg) {
                egg.classList.add('found');
                egg.scrollIntoView({ behavior: 'smooth' });
            }

            // Step 3: Fade out canvas
            setTimeout(() => {
                canvas.style.transition = 'opacity 1s';
                canvas.style.opacity = '0';

                // Cleanup
                setTimeout(() => {
                    cancelAnimationFrame(animationId);
                    canvas.style.display = 'none';
                    canvas.style.opacity = '1'; // Reset for next time
                }, 1000);
            }, 1000);
        }, 2000);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[cursor]) {
            cursor++;
            if (cursor === konamiCode.length) {
                // Toggle Logic
                const currentTheme = localStorage.getItem('theme') || 'amber';
                let targetTheme = 'amber';
                let rainColor = '#ffb000'; // Default amber

                if (currentTheme === 'amber') {
                    targetTheme = 'green';
                    rainColor = '#0F0';
                } else if (currentTheme === 'green') {
                    targetTheme = 'amber';
                    rainColor = '#ffb000';
                } else {
                    // If some other theme is active (shouldn't be possible with UI removal, but good for safety)
                    // Default to green matrix
                    targetTheme = 'green';
                    rainColor = '#0F0';
                }

                startMatrixRain(targetTheme, rainColor);
                cursor = 0;
            }
        } else {
            cursor = 0;
        }
    });
});
