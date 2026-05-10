// player.js - Step 1: Polished Play/Pause

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject our custom CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .vaas-wrapper { position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; display: flex; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin: 0 auto; }
    .vaas-video { width: 100%; height: 100%; object-fit: contain; }
    .vaas-controls { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 15px; display: flex; align-items: center; opacity: 0; transition: opacity 0.3s ease; }
    .vaas-wrapper:hover .vaas-controls { opacity: 1; }
    
    /* Polished Button Styling */
    .vaas-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; transition: transform 0.1s ease, color 0.2s ease; }
    .vaas-btn:hover { color: #00ffcc; transform: scale(1.1); }
    .vaas-btn svg { width: 28px; height: 28px; fill: currentColor; }
  `;
  document.head.appendChild(style);

  // SVG Icons
  const playIcon = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  const pauseIcon = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

  // 2. Find all places the developer wants a player
  const playerContainers = document.querySelectorAll('.vaas-player');

  playerContainers.forEach(container => {
    const videoSrc = container.getAttribute('data-video');
    if (!videoSrc) return;

    // 3. Setup wrapper and video
    container.className = 'vaas-wrapper';
    const video = document.createElement('video');
    video.src = videoSrc;
    video.className = 'vaas-video';
    video.controlsList = 'nodownload';
    
    // 4. Create Controls & Play Button
    const controls = document.createElement('div');
    controls.className = 'vaas-controls';

    const playBtn = document.createElement('button');
    playBtn.className = 'vaas-btn';
    playBtn.innerHTML = playIcon; // Start with the Play icon

    // Assemble
    controls.appendChild(playBtn);
    container.appendChild(video);
    container.appendChild(controls);

    // 5. Add Play/Pause Logic
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playBtn.innerHTML = pauseIcon; // Switch to pause icon
      } else {
        video.pause();
        playBtn.innerHTML = playIcon; // Switch back to play icon
      }
    });

    // Bonus: Click the video itself to play/pause
    video.addEventListener('click', () => {
      playBtn.click();
    });
  });
});
