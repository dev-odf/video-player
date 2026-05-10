// player.js - HLS Engine with Working Quality Menu

document.addEventListener("DOMContentLoaded", () => {
  const hlsScript = document.createElement('script');
  hlsScript.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
  document.head.appendChild(hlsScript);

  hlsScript.onload = () => {
    initPlayers();
  };

  function initPlayers() {
    let themeColor = '#888888'; 
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme && metaTheme.content) themeColor = metaTheme.content;

    const style = document.createElement('style');
    style.innerHTML = `
      :root { --vaas-theme: ${themeColor}; }
      .vaas-wrapper { position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; display: flex; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin: 0 auto; user-select: none; }
      .vaas-video { width: 100%; height: 100%; object-fit: contain; cursor: pointer; }
      .vaas-controls { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); padding: 10px 15px; display: flex; flex-direction: column; gap: 5px; opacity: 0; transition: opacity 0.3s ease; z-index: 20; }
      .vaas-wrapper:hover .vaas-controls { opacity: 1; }
      .vaas-bottom-row { display: flex; align-items: center; justify-content: space-between; }
      .vaas-left-controls { display: flex; align-items: center; gap: 10px; }
      .vaas-right-controls { display: flex; align-items: center; gap: 5px; }
      .vaas-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; transition: transform 0.1s ease, color 0.2s ease; position: relative;}
      .vaas-btn:hover { color: var(--vaas-theme); transform: scale(1.1); }
      .vaas-btn svg { width: 26px; height: 26px; fill: currentColor; }
      .vaas-time { color: white; font-size: 13px; font-variant-numeric: tabular-nums; opacity: 0.9; margin-left: 5px; font-weight: 500; }
      
      /* Progress Bar */
      .vaas-progress-container { width: 100%; height: 16px; display: flex; align-items: center; cursor: pointer; position: relative; }
      .vaas-progress-track { width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; position: relative; transition: height 0.2s ease; }
      .vaas-progress-container:hover .vaas-progress-track { height: 6px; }
      .vaas-progress-buffer { position: absolute; top: 0; left: 0; height: 100%; background: rgba(255,255,255,0.3); border-radius: 2px; width: 0%; pointer-events: none; transition: width 0.2s; }
      .vaas-progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--vaas-theme); border-radius: 2px; width: 0%; pointer-events: none; }
      .vaas-playhead { position: absolute; top: 50%; right: -6px; transform: translateY(-50%) scale(0); width: 12px; height: 12px; background: var(--vaas-theme); border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .vaas-progress-container:hover .vaas-playhead { transform: translateY(-50%) scale(1); }

      /* Settings Menu */
      .vaas-settings-menu { position: absolute; bottom: 50px; right: 15px; background: rgba(28, 28, 28, 0.95); border-radius: 8px; padding: 10px 0; min-width: 120px; color: white; display: none; flex-direction: column; backdrop-filter: blur(10px); box-shadow: 0 5px 20px rgba(0,0,0,0.5); z-index: 30; }
      .vaas-settings-menu.is-open { display: flex; }
      .vaas-quality-option { background: none; border: none; color: white; padding: 8px 20px; text-align: left; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s; display: flex; justify-content: space-between; align-items: center; }
      .vaas-quality-option:hover { background: rgba(255,255,255,0.1); }
      .vaas-quality-option.is-active { color: var(--vaas-theme); }

      /* Animations */
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

    function formatTime(timeInSeconds) {
      if (isNaN(timeInSeconds)) return "0:00";
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    const playIcon = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseIcon = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const pipIcon = `<svg viewBox="0 0 24 24"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>`;
    const fsIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
    const settingsIcon = `<svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>`;
    const checkIcon = `<svg style="width:16px;height:16px;margin-left:8px;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

    document.querySelectorAll('.vaas-player').forEach(container => {
      const videoSrc = container.getAttribute('data-video');
      if (!videoSrc) return;

      container.className = 'vaas-wrapper is-paused';
      
      const video = document.createElement('video');
      video.className = 'vaas-video';
      video.controlsList = 'nodownload';

      // UI Assembly
      const animator = document.createElement('div'); animator.className = 'vaas-animator';
      const centerBtn = document.createElement('button'); centerBtn.className = 'vaas-center-btn'; centerBtn.innerHTML = playIcon;
      const controls = document.createElement('div'); controls.className = 'vaas-controls';

      const progressContainer = document.createElement('div'); progressContainer.className = 'vaas-progress-container';
      const progressTrack = document.createElement('div'); progressTrack.className = 'vaas-progress-track';
      const progressBuffer = document.createElement('div'); progressBuffer.className = 'vaas-progress-buffer';
      const progressFill = document.createElement('div'); progressFill.className = 'vaas-progress-fill';
      const playhead = document.createElement('div'); playhead.className = 'vaas-playhead';
      progressFill.appendChild(playhead); progressTrack.appendChild(progressBuffer); progressTrack.appendChild(progressFill); progressContainer.appendChild(progressTrack);

      const bottomRow = document.createElement('div'); bottomRow.className = 'vaas-bottom-row';
      const leftControls = document.createElement('div'); leftControls.className = 'vaas-left-controls';
      const playBtn = document.createElement('button'); playBtn.className = 'vaas-btn'; playBtn.innerHTML = playIcon; 
      const timeDisplay = document.createElement('div'); timeDisplay.className = 'vaas-time'; timeDisplay.innerText = "0:00 / 0:00";
      
      const rightControls = document.createElement('div'); rightControls.className = 'vaas-right-controls';
      const pipBtn = document.createElement('button'); pipBtn.className = 'vaas-btn'; pipBtn.innerHTML = pipIcon;
      const fsBtn = document.createElement('button'); fsBtn.className = 'vaas-btn'; fsBtn.innerHTML = fsIcon;

      // Settings DOM Elements
      const settingsBtn = document.createElement('button');
      settingsBtn.className = 'vaas-btn';
      settingsBtn.innerHTML = settingsIcon;
      settingsBtn.style.display = 'none'; // Hidden until HLS parses qualities
      
      const settingsMenu = document.createElement('div');
      settingsMenu.className = 'vaas-settings-menu';

      leftControls.appendChild(playBtn); leftControls.appendChild(timeDisplay);
      rightControls.appendChild(settingsBtn); rightControls.appendChild(pipBtn); rightControls.appendChild(fsBtn);
      bottomRow.appendChild(leftControls); bottomRow.appendChild(rightControls);
      controls.appendChild(progressContainer); controls.appendChild(bottomRow);

      container.appendChild(video); container.appendChild(animator); container.appendChild(centerBtn); container.appendChild(controls); container.appendChild(settingsMenu);

      // === THE MISSING HLS LOGIC ===
      if (Hls.isSupported() && videoSrc.includes('.m3u8')) {
        const hls = new Hls({ autoStartLoad: true });
        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        // Wait for HLS to read the manifest and find the qualities
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
          const availableQualities = hls.levels;

          if (availableQualities.length > 1) {
            settingsBtn.style.display = 'flex'; // Show the gear icon

            function renderMenu() {
              settingsMenu.innerHTML = ''; 
              
              // Add "Auto" option (-1 is HLS.js code for Auto)
              const autoBtn = document.createElement('button');
              const isAuto = hls.currentLevel === -1;
              autoBtn.className = `vaas-quality-option ${isAuto ? 'is-active' : ''}`;
              autoBtn.innerHTML = `<span>Auto</span> ${isAuto ? checkIcon : ''}`;
              autoBtn.addEventListener('click', () => {
                hls.currentLevel = -1; // Set to Auto
                settingsMenu.classList.remove('is-open');
                renderMenu();
              });
              settingsMenu.appendChild(autoBtn);

              // Sort qualities highest to lowest for the menu
              const sortedLevels = availableQualities.map((l, i) => ({...l, originalIndex: i}))
                                                     .sort((a, b) => b.height - a.height);

              sortedLevels.forEach(level => {
                const btn = document.createElement('button');
                const isActive = hls.currentLevel === level.originalIndex;
                btn.className = `vaas-quality-option ${isActive ? 'is-active' : ''}`;
                btn.innerHTML = `<span>${level.height}p</span> ${isActive ? checkIcon : ''}`;
                
                btn.addEventListener('click', () => {
                  hls.currentLevel = level.originalIndex; // Force specific quality
                  settingsMenu.classList.remove('is-open');
                  renderMenu();
                });
                settingsMenu.appendChild(btn);
              });
            }

            renderMenu();

            settingsBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              settingsMenu.classList.toggle('is-open');
            });

            // Close menu when clicking away
            container.addEventListener('click', (e) => {
              if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsMenu.classList.remove('is-open');
              }
            });
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
      } else {
        video.src = videoSrc;
      }

      // Interactions
      function triggerPopAnimation(icon) { animator.innerHTML = icon; animator.classList.remove('vaas-anim-active'); void animator.offsetWidth; animator.classList.add('vaas-anim-active'); }
      function togglePlay() { if (video.paused) { video.play(); triggerPopAnimation(playIcon); } else { video.pause(); triggerPopAnimation(pauseIcon); } }
      video.addEventListener('click', togglePlay); centerBtn.addEventListener('click', togglePlay); playBtn.addEventListener('click', togglePlay);
      video.addEventListener('play', () => { container.classList.replace('is-paused', 'is-playing'); playBtn.innerHTML = pauseIcon; });
      video.addEventListener('pause', () => { container.classList.replace('is-playing', 'is-paused'); playBtn.innerHTML = playIcon; });

      pipBtn.addEventListener('click', async () => { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else if (document.pictureInPictureEnabled) await video.requestPictureInPicture(); });
      fsBtn.addEventListener('click', () => { if (!document.fullscreenElement) container.requestFullscreen(); else document.exitFullscreen(); });

      video.addEventListener('timeupdate', () => {
        const current = video.currentTime; const duration = video.duration;
        timeDisplay.innerText = `${formatTime(current)} / ${formatTime(duration)}`;
        if (duration) progressFill.style.width = `${(current / duration) * 100}%`;
      });

      video.addEventListener('progress', () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          if (video.duration) progressBuffer.style.width = `${(bufferedEnd / video.duration) * 100}%`;
        }
      });

      video.addEventListener('loadedmetadata', () => { timeDisplay.innerText = `0:00 / ${formatTime(video.duration)}`; });

      let isScrubbing = false;
      function updateProgress(e) {
        const rect = progressContainer.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        video.currentTime = pos * video.duration;
      }
      progressContainer.addEventListener('mousedown', (e) => { isScrubbing = true; updateProgress(e); video.pause(); });
      document.addEventListener('mousemove', (e) => { if (isScrubbing) updateProgress(e); });
      document.addEventListener('mouseup', () => { if (isScrubbing) { isScrubbing = false; video.play(); } });
    });
  }
});
