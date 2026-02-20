/**
 * Utility to generate floating particles in a container.
 * @param {string} containerId - The ID of the container element.
 * @param {number} count - Number of particles to generate.
 */
function initParticles(containerId, count = 15) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${12 + Math.random() * 8}s`;
        container.appendChild(particle);
    }
}

// Auto-init if standard container exists
document.addEventListener('DOMContentLoaded', () => {
    initParticles('particles');
});
