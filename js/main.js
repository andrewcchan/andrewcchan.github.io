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

    // Theme Switcher
    const themes = ['amber', 'green', 'white', 'blue'];

    window.setTheme = function(theme) {
        if (!themes.includes(theme)) return;

        document.body.classList.remove(...themes.map(t => 'theme-' + t));
        document.body.classList.add('theme-' + theme);

        // Also remove matrix-mode if it exists to ensure clean slate,
        // though matrix-mode shares styles with theme-green, it's safer to rely on the new system.
        document.body.classList.remove('matrix-mode');

        localStorage.setItem('theme', theme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'amber';

    // If we are already in matrix mode (from easter egg before reload?), respect it?
    // Actually, local storage is better.
    // However, if the user triggered the easter egg, it adds .matrix-mode but doesn't save to local storage in the original code.
    // If I want the easter egg to be persistent or interact with this, I might need to change the easter egg code.
    // For now, I'll just load the saved theme.
    setTheme(savedTheme);
});
