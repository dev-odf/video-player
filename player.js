// player.js - The VaaS Core Engine

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject our custom CSS into the third-party developer's website
  const style = document.createElement('style');
  style.innerHTML = `
    .vaas-wrapper { position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; display: flex; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin: 0 auto; }
    .vaas-video { width: 100%; height: 100%; object-fit: contain; }
    .vaas-controls { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); padding: 15px; display: flex; gap: 10px; opacity: 0; transition: opacity 0.3s ease; }
    .vaas-wrapper:hover .vaas-controls { opacity: 1; }
    .vaas-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; backdrop-filter: blur(5px); font-weight: bold; transition: background 0.2s; }
    .vaas-btn:hover { background: rgba(255,255,255,0.4); }
  `;
  document.head.appendChild(style);

  // 2. Find all places the developer wants a player
  const playerContainers = document.querySelectorAll('.vaas-player');

  playerContainers.forEach(container => {
    const videoSrc = container.getAttribute('data-video');
    if (!videoSrc) return; // Skip if they didn't provide a video link

    // 3. Apply wrapper class for styling
    container.className = 'vaas-wrapper';

    // 4. Create the raw video element
    const video = document.createElement('video');
    video.src = videoSrc;
    video.className = 'vaas-video';
    video.controlsList = 'nodownload'; // Disable native download button
    
    // 5. Create the Control Bar and Buttons
    const controls = document.createElement('div');
    controls.className = 'vaas-controls';

    const playBtn = document.createElement('button');
    playBtn.className = 'vaas-btn';
    playBtn.innerText = 'Play';

    const pipBtn = document.createElement('button');
    pipBtn.className = 'vaas-btn';
    pipBtn.innerText = 'PiP';

    const fsBtn = document.createElement('button');
    fsBtn.className = 'vaas-btn';
    fsBtn.innerText = 'Fullscreen';

    // 6. Assemble the player inside the developer's container
    controls.appendChild(playBtn);
    controls.appendChild(pipBtn);
    controls.appendChild(fsBtn);
    container.appendChild(video);
    container.appendChild(controls);

    // 7. Add Button Functionality
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playBtn.innerText = 'Pause';
      } else {
        video.pause();
        playBtn.innerText = 'Play';
      }
    });

    pipBtn.addEventListener('click', async () => {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    });

    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  });
});
