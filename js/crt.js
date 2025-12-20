// CRT Theme Interactions and Easter Egg

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const toggleButton = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (toggleButton && navbarCollapse) {
        toggleButton.addEventListener('click', () => {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Smooth Scrolling for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Close mobile menu if open
                if (navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Easter Egg: Konami Code
    // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const konamiCode = [
        'ArrowUp', 'ArrowUp',
        'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateEasterEgg() {
        document.body.classList.toggle('matrix-mode');

        // Optional: Show a message
        const message = document.createElement('div');
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.background = '#000';
        message.style.border = '2px solid var(--crt-amber)';
        message.style.padding = '2rem';
        message.style.zIndex = '2000';
        message.style.fontFamily = "'VT323', monospace";
        message.style.fontSize = '2rem';
        message.style.color = 'var(--crt-amber)';
        message.style.textShadow = 'var(--crt-shadow)';

        if (document.body.classList.contains('matrix-mode')) {
            message.innerText = "SYSTEM HACKED: MATRIX MODE ACTIVATED";
        } else {
            message.innerText = "SYSTEM RESTORED: AMBER MODE ACTIVATED";
        }

        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 2000);
    }
});
