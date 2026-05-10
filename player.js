// player.js - Step 3: Central Animations & Mobile Button

document.addEventListener("DOMContentLoaded", () => {
  // 1. Detect the Host Website's Theme Color
  let themeColor = '#888888'; 
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme && metaTheme.content) {
    themeColor = metaTheme.content;
  }

  // 2. Inject CSS with our new Animation Keyframes and Center Button
  const style = document.createElement('style');
  style.innerHTML = `
    :root { --vaas-theme: ${themeColor}; }
    .vaas-wrapper { position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; display: flex; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin: 0 auto; }
    .vaas-video { width: 100%; height: 100%; object-fit: contain; cursor: pointer; }
    
    /* Bottom Controls */
    .vaas-controls { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 15px; display: flex; align-items: center; opacity: 0; transition: opacity 0.3s ease; z-index: 20; }
    .vaas-wrapper:hover .vaas-controls { opacity: 1; }
    .vaas-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; transition: transform 0.1s ease, color 0.2s ease; }
    .vaas-btn:hover { color: var(--vaas-theme); transform: scale(1.1); }
    .vaas-btn svg { width: 28px; height: 28px; fill: currentColor; }

    /* The Mobile-Friendly Center Button (Visible only when paused) */
    .vaas-center-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(0,0,0,0.6); border-radius: 50%; border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 15; transition: opacity 0.2s, background 0.2s; }
    .vaas-center-btn svg { width: 36px; height: 36px; fill: currentColor; }
    .vaas-center-btn:hover { background: var(--vaas-theme); }
    
    /* Hide center button when playing */
    .vaas-wrapper.is-playing .vaas-center-btn { opacity: 0; pointer-events: none; }
    .vaas-wrapper.is-paused .vaas-center-btn { opacity: 1; pointer-events: auto; }

    /* The YouTube-Style Pop Animation Layer */
    .vaas-animator { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; pointer-events: none; opacity: 0; z-index: 10; }
    .vaas-animator svg { width: 36px; height: 36px; fill: currentColor; }
    
    /* The animation keyframes */
    .vaas-anim-active { animation: vaas-pop 0.5s ease-out; }
    @keyframes vaas-pop {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
    }
  `;
  document.head.appendChild(style);

  // 3. SVG Icons
  const playIcon = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  const pauseIcon = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

  // 4. Setup Players
  document.querySelectorAll('.vaas-player').forEach(container => {
    const videoSrc = container.getAttribute('data-video');
    if (!videoSrc) return;

    // Default state
    container.className = 'vaas-wrapper is-paused';
    
    // Video Element
    const video = document.createElement('video');
    video.src = videoSrc;
    video.className = 'vaas-video';
    video.controlsList = 'nodownload';

    // Animation Layer (Hidden by default, flashes on click)
    const animator = document.createElement('div');
    animator.className = 'vaas-animator';

    // Center Button (For mobile / paused state)
    const centerBtn = document.createElement('button');
    centerBtn.className = 'vaas-center-btn';
    centerBtn.innerHTML = playIcon;
    
    // Bottom Controls
    const controls = document.createElement('div');
    controls.className = 'vaas-controls';
    const playBtn = document.createElement('button');
    playBtn.className = 'vaas-btn';
    playBtn.innerHTML = playIcon; 

    // Assemble DOM
    controls.appendChild(playBtn);
    container.appendChild(video);
    container.appendChild(animator);
    container.appendChild(centerBtn);
    container.appendChild(controls);

    // 5. The "Pop" Animation Function
    function triggerPopAnimation(icon) {
      animator.innerHTML = icon;
      animator.classList.remove('vaas-anim-active');
      void animator.offsetWidth; // Magic trick: forces browser to reflow, restarting the animation
      animator.classList.add('vaas-anim-active');
    }

    // 6. Master Play/Pause Toggle Function
    function togglePlay() {
      if (video.paused) {
        video.play();
        triggerPopAnimation(playIcon);
      } else {
        video.pause();
        triggerPopAnimation(pauseIcon);
      }
    }

    // Bind clicks to the toggle function
    video.addEventListener('click', togglePlay);
    centerBtn.addEventListener('click', togglePlay);
    playBtn.addEventListener('click', togglePlay);

    // 7. Listen to native video events to update UI (Fixes desync issues)
    video.addEventListener('play', () => {
      container.classList.replace('is-paused', 'is-playing');
      playBtn.innerHTML = pauseIcon;
    });

    video.addEventListener('pause', () => {
      container.classList.replace('is-playing', 'is-paused');
      playBtn.innerHTML = playIcon;
    });
  });
});
