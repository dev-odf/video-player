// player.js - Step 4: Premium Progress Bar & Time Display

document.addEventListener("DOMContentLoaded", () => {
  // 1. Detect the Host Website's Theme Color
  let themeColor = '#888888'; 
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme && metaTheme.content) {
    themeColor = metaTheme.content;
  }

  // 2. Inject Premium CSS
  const style = document.createElement('style');
  style.innerHTML = `
    :root { --vaas-theme: ${themeColor}; }
    .vaas-wrapper { position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; display: flex; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin: 0 auto; user-select: none; }
    .vaas-video { width: 100%; height: 100%; object-fit: contain; cursor: pointer; }
    
    /* Control Layout */
    .vaas-controls { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); padding: 10px 15px; display: flex; flex-direction: column; gap: 5px; opacity: 0; transition: opacity 0.3s ease; z-index: 20; }
    .vaas-wrapper:hover .vaas-controls { opacity: 1; }
    
    /* Bottom Row (Buttons & Time) */
    .vaas-bottom-row { display: flex; align-items: center; justify-content: space-between; }
    .vaas-left-controls { display: flex; align-items: center; gap: 10px; }
    .vaas-right-controls { display: flex; align-items: center; gap: 5px; }

    /* Button Styling */
    .vaas-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; transition: transform 0.1s ease, color 0.2s ease; }
    .vaas-btn:hover { color: var(--vaas-theme); transform: scale(1.1); }
    .vaas-btn svg { width: 26px; height: 26px; fill: currentColor; }

    /* Time Display */
    .vaas-time { color: white; font-size: 13px; font-variant-numeric: tabular-nums; opacity: 0.9; margin-left: 5px; font-weight: 500; }

    /* === PREMIUM PROGRESS BAR === */
    .vaas-progress-container { width: 100%; height: 16px; display: flex; align-items: center; cursor: pointer; position: relative; }
    
    /* The track itself */
    .vaas-progress-track { width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; position: relative; transition: height 0.2s ease; }
    .vaas-progress-container:hover .vaas-progress-track { height: 6px; /* Expands on hover */ }
    
    /* The buffered (loaded) bar */
    .vaas-progress-buffer { position: absolute; top: 0; left: 0; height: 100%; background: rgba(255,255,255,0.3); border-radius: 2px; width: 0%; pointer-events: none; transition: width 0.2s; }
    
    /* The active progress fill */
    .vaas-progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--vaas-theme); border-radius: 2px; width: 0%; pointer-events: none; }
    
    /* The Playhead Dot */
    .vaas-playhead { position: absolute; top: 50%; right: -6px; transform: translateY(-50%) scale(0); width: 12px; height: 12px; background: var(--vaas-theme); border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .vaas-progress-container:hover .vaas-playhead { transform: translateY(-50%) scale(1); /* Pops out on hover */ }

    /* Central Animations (From Step 3) */
    .vaas-center-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(0,0,0,0.6); border-radius: 50%; border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 15; transition: opacity 0.2s, background 0.2s; }
    .vaas-center-btn svg { width: 36px; height: 36px; fill: currentColor; }
    .vaas-center-btn:hover { background: var(--vaas-theme); }
    .vaas-wrapper.is-playing .vaas-center-btn { opacity: 0; pointer-events: none; }
    .vaas-wrapper.is-paused .vaas-center-btn { opacity: 1; pointer-events: auto; }
    .vaas-animator { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; pointer-events: none; opacity: 0; z-index: 10; }
    .vaas-animator svg { width: 36px; height: 36px; fill: currentColor; }
    .vaas-anim-active { animation: vaas-pop 0.5s ease-out; }
    @keyframes vaas-pop { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); } }
  `;
  document.head.appendChild(style);

  // Helper: Format seconds into M:SS
  function formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Icons
  const playIcon = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  const pauseIcon = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
  const pipIcon = `<svg viewBox="0 0 24 24"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>`;
  const fsIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;

  document.querySelectorAll('.vaas-player').forEach(container => {
    const videoSrc = container.getAttribute('data-video');
    if (!videoSrc) return;

    container.className = 'vaas-wrapper is-paused';
    
    const video = document.createElement('video');
    video.src = videoSrc;
    video.className = 'vaas-video';
    video.controlsList = 'nodownload';

    const animator = document.createElement('div');
    animator.className = 'vaas-animator';
    const centerBtn = document.createElement('button');
    centerBtn.className = 'vaas-center-btn';
    centerBtn.innerHTML = playIcon;
    
    // === DOM ASSEMBLY ===
    const controls = document.createElement('div');
    controls.className = 'vaas-controls';

    // 1. Progress Bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'vaas-progress-container';
    
    const progressTrack = document.createElement('div');
    progressTrack.className = 'vaas-progress-track';
    
    const progressBuffer = document.createElement('div');
    progressBuffer.className = 'vaas-progress-buffer';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'vaas-progress-fill';
    
    const playhead = document.createElement('div');
    playhead.className = 'vaas-playhead';

    progressFill.appendChild(playhead);
    progressTrack.appendChild(progressBuffer);
    progressTrack.appendChild(progressFill);
    progressContainer.appendChild(progressTrack);

    // 2. Bottom Row
    const bottomRow = document.createElement('div');
    bottomRow.className = 'vaas-bottom-row';

    const leftControls = document.createElement('div');
    leftControls.className = 'vaas-left-controls';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'vaas-btn';
    playBtn.innerHTML = playIcon; 

    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'vaas-time';
    timeDisplay.innerText = "0:00 / 0:00";

    const rightControls = document.createElement('div');
    rightControls.className = 'vaas-right-controls';

    const pipBtn = document.createElement('button');
    pipBtn.className = 'vaas-btn';
    pipBtn.innerHTML = pipIcon;

    const fsBtn = document.createElement('button');
    fsBtn.className = 'vaas-btn';
    fsBtn.innerHTML = fsIcon;

    // Put it together
    leftControls.appendChild(playBtn);
    leftControls.appendChild(timeDisplay);
    rightControls.appendChild(pipBtn);
    rightControls.appendChild(fsBtn);
    bottomRow.appendChild(leftControls);
    bottomRow.appendChild(rightControls);
    
    controls.appendChild(progressContainer);
    controls.appendChild(bottomRow);

    container.appendChild(video);
    container.appendChild(animator);
    container.appendChild(centerBtn);
    container.appendChild(controls);

    // === LOGIC ===
    function triggerPopAnimation(icon) {
      animator.innerHTML = icon;
      animator.classList.remove('vaas-anim-active');
      void animator.offsetWidth; 
      animator.classList.add('vaas-anim-active');
    }

    function togglePlay() {
      if (video.paused) { video.play(); triggerPopAnimation(playIcon); } 
      else { video.pause(); triggerPopAnimation(pauseIcon); }
    }

    video.addEventListener('click', togglePlay);
    centerBtn.addEventListener('click', togglePlay);
    playBtn.addEventListener('click', togglePlay);

    video.addEventListener('play', () => {
      container.classList.replace('is-paused', 'is-playing');
      playBtn.innerHTML = pauseIcon;
    });

    video.addEventListener('pause', () => {
      container.classList.replace('is-playing', 'is-paused');
      playBtn.innerHTML = playIcon;
    });

    // PiP & Fullscreen
    pipBtn.addEventListener('click', async () => {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (document.pictureInPictureEnabled) await video.requestPictureInPicture();
    });

    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) container.requestFullscreen();
      else document.exitFullscreen();
    });

    // === PROGRESS BAR LOGIC ===
    
    // Update Time and Bar Width
    video.addEventListener('timeupdate', () => {
      const current = video.currentTime;
      const duration = video.duration;
      
      timeDisplay.innerText = `${formatTime(current)} / ${formatTime(duration)}`;
      
      if (duration) {
        const percent = (current / duration) * 100;
        progressFill.style.width = `${percent}%`;
      }
    });

    // Update Buffered Amount (Light grey bar)
    video.addEventListener('progress', () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration) {
          progressBuffer.style.width = `${(bufferedEnd / duration) * 100}%`;
        }
      }
    });

    // Initial Time Load
    video.addEventListener('loadedmetadata', () => {
      timeDisplay.innerText = `0:00 / ${formatTime(video.duration)}`;
    });

    // Click & Scrubbing Logic
    let isScrubbing = false;

    function updateProgress(e) {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      // Clamp between 0 and 1
      const scrubPercent = Math.max(0, Math.min(1, pos));
      video.currentTime = scrubPercent * video.duration;
    }

    progressContainer.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      updateProgress(e);
      video.pause(); // Pause while dragging for smoother scrubbing
    });

    document.addEventListener('mousemove', (e) => {
      if (isScrubbing) updateProgress(e);
    });

    document.addEventListener('mouseup', () => {
      if (isScrubbing) {
        isScrubbing = false;
        video.play();
      }
    });
  });
});
