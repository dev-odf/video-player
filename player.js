/**
 * VaaS Premium Player - "One-File Zip" Edition
 * Handles: .mp4, .m3u8, and .zip (Multi-quality HLS packages)
 */

(function() {
    // 1. Load Dependencies Dynamically
    const libs = [
        "https://cdn.jsdelivr.net/npm/hls.js@1",
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
    ];

    let loadedCount = 0;
    libs.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedCount++;
            if (loadedCount === libs.length) initVaaS();
        };
        document.head.appendChild(script);
    });

    function initVaaS() {
        // --- CSS INJECTION ---
        let themeColor = '#00ffcc'; 
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
            .vaas-progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--vaas-theme); border-radius: 2px; width: 0%; pointer-events: none; }
            .vaas-playhead { position: absolute; top: 50%; right: -6px; transform: translateY(-50%) scale(0); width: 12px; height: 12px; background: var(--vaas-theme); border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .vaas-progress-container:hover .vaas-playhead { transform: translateY(-50%) scale(1); }

            /* Settings Menu */
            .vaas-settings-menu { position: absolute; bottom: 50px; right: 15px; background: rgba(28, 28, 28, 0.95); border-radius: 8px; padding: 10px 0; min-width: 120px; color: white; display: none; flex-direction: column; backdrop-filter: blur(10px); box-shadow: 0 5px 20px rgba(0,0,0,0.5); z-index: 30; }
            .vaas-settings-menu.is-open { display: flex; }
            .vaas-quality-option { background: none; border: none; color: white; padding: 8px 20px; text-align: left; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; justify-content: space-between; }
            .vaas-quality-option:hover { background: rgba(255,255,255,0.1); }
            .vaas-quality-option.is-active { color: var(--vaas-theme); }

            /* Center Animation */
            .vaas-animator { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; pointer-events: none; opacity: 0; z-index: 10; }
            .vaas-anim-active { animation: vaas-pop 0.5s ease-out; }
            @keyframes vaas-pop { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); } }
            
            /* Loading Spinner for ZIPs */
            .vaas-loader { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 14px; text-align: center; z-index: 25; }
        `;
        document.head.appendChild(style);

        // --- ICONS ---
        const playIcon = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        const pauseIcon = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        const settingsIcon = `<svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z"/></svg>`;
        const checkIcon = `<svg style="width:16px;height:16px;margin-left:8px;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

        document.querySelectorAll('.vaas-player').forEach(async container => {
            const videoSrc = container.getAttribute('data-video');
            if (!videoSrc) return;

            // --- BUILD UI ---
            container.className = 'vaas-wrapper';
            const video = document.createElement('video');
            video.className = 'vaas-video';
            
            const animator = document.createElement('div'); animator.className = 'vaas-animator';
            const controls = document.createElement('div'); controls.className = 'vaas-controls';
            const loader = document.createElement('div'); loader.className = 'vaas-loader';
            
            const progressContainer = document.createElement('div'); progressContainer.className = 'vaas-progress-container';
            const progressTrack = document.createElement('div'); progressTrack.className = 'vaas-progress-track';
            const progressFill = document.createElement('div'); progressFill.className = 'vaas-progress-fill';
            const playhead = document.createElement('div'); playhead.className = 'vaas-playhead';
            
            const bottomRow = document.createElement('div'); bottomRow.className = 'vaas-bottom-row';
            const playBtn = document.createElement('button'); playBtn.className = 'vaas-btn'; playBtn.innerHTML = playIcon;
            const settingsBtn = document.createElement('button'); settingsBtn.className = 'vaas-btn'; settingsBtn.innerHTML = settingsIcon;
            settingsBtn.style.display = 'none';
            const settingsMenu = document.createElement('div'); settingsMenu.className = 'vaas-settings-menu';

            // Assembly
            progressFill.appendChild(playhead); progressTrack.appendChild(progressFill); progressContainer.appendChild(progressTrack);
            bottomRow.appendChild(playBtn); bottomRow.appendChild(settingsBtn);
            controls.appendChild(progressContainer); controls.appendChild(bottomRow);
            container.append(video, animator, controls, loader, settingsMenu);

            const hls = new Hls();

            // --- ZIP PROCESSING LOGIC ---
            if (videoSrc.endsWith('.zip')) {
                loader.innerText = "Extracting Video Package...";
                try {
                    const resp = await fetch(videoSrc);
                    const blob = await resp.blob();
                    const zip = await JSZip.loadAsync(blob);
                    
                    const fileMap = {};
                    for (const name in zip.files) {
                        const data = await zip.files[name].async("blob");
                        fileMap[name] = URL.createObjectURL(data);
                    }

                    const masterKey = Object.keys(fileMap).find(k => k.endsWith('master.m3u8'));
                    if (masterKey) {
                        let manifestText = await zip.files[masterKey].async("string");
                        // Redirect all file paths in manifest to Blobs
                        Object.keys(fileMap).forEach(key => {
                            manifestText = manifestText.split(key).join(fileMap[key]);
                        });
                        const masterBlob = URL.createObjectURL(new Blob([manifestText], { type: 'application/x-mpegURL' }));
                        hls.loadSource(masterBlob);
                        hls.attachMedia(video);
                        loader.style.display = 'none';
                    }
                } catch (e) {
                    loader.innerText = "Error loading ZIP.";
                }
            } else {
                // Regular MP4/HLS Fallback
                loader.style.display = 'none';
                if (videoSrc.includes('.m3u8')) {
                    hls.loadSource(videoSrc);
                    hls.attachMedia(video);
                } else {
                    video.src = videoSrc;
                }
            }

            // --- QUALITY MENU LOGIC ---
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (hls.levels.length > 1) {
                    settingsBtn.style.display = 'flex';
                    const renderMenu = () => {
                        settingsMenu.innerHTML = '';
                        const qualities = [{name: 'Auto', index: -1}, ...hls.levels.map((l, i) => ({name: l.height + 'p', index: i}))];
                        qualities.reverse().forEach(q => {
                            const btn = document.createElement('button');
                            btn.className = `vaas-quality-option ${hls.currentLevel === q.index ? 'is-active' : ''}`;
                            btn.innerHTML = `<span>${q.name}</span> ${hls.currentLevel === q.index ? checkIcon : ''}`;
                            btn.onclick = () => { hls.currentLevel = q.index; settingsMenu.classList.remove('is-open'); renderMenu(); };
                            settingsMenu.appendChild(btn);
                        });
                    };
                    renderMenu();
                    settingsBtn.onclick = (e) => { e.stopPropagation(); settingsMenu.classList.toggle('is-open'); };
                }
            });

            // --- PLAYER CONTROLS ---
            const toggle = () => { 
                if (video.paused) { video.play(); anim(playIcon); } 
                else { video.pause(); anim(pauseIcon); } 
            };
            const anim = (ic) => { animator.innerHTML = ic; animator.classList.remove('vaas-anim-active'); void animator.offsetWidth; animator.classList.add('vaas-anim-active'); };

            playBtn.onclick = toggle;
            video.onclick = toggle;
            video.onplay = () => playBtn.innerHTML = pauseIcon;
            video.onpause = () => playBtn.innerHTML = playIcon;
            video.ontimeupdate = () => {
                const p = (video.currentTime / video.duration) * 100;
                progressFill.style.width = p + '%';
            };
            progressContainer.onclick = (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                video.currentTime = pos * video.duration;
            };
        });
    }
})();
