export async function onRequest(context) {
  // 1. Intercept the Request URL
  const url = new URL(context.request.url);
  
  // 2. Extract the video file URL from the query parameters
  const videoFileUrl = url.searchParams.get('video');

  // 3. Backend Validation: Ensure a video URL was provided
  if (!videoFileUrl) {
    return new Response(JSON.stringify({ 
      error: "Missing video source.", 
      usage: "/embed?video=YOUR_VIDEO_URL" 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 4. Generate the HTML Player (Injecting the video URL directly)
  const playerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Custom Video Player</title>
      <style>
        /* Sleek, full-bleed player styling */
        body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; font-family: sans-serif; }
        .player-container { position: relative; width: 100%; height: 100%; }
        video { width: 100%; height: 100%; object-fit: contain; }
        
        /* Custom UI Overlay */
        .controls {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 15px; display: flex; gap: 15px;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .player-container:hover .controls { opacity: 1; }
        button { background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer; backdrop-filter: blur(4px); }
        button:hover { background: rgba(255,255,255,0.4); }
      </style>
    </head>
    <body>

      <div class="player-container" id="playerContainer">
        <!-- The Video Element injected with the URL from the API parameter -->
        <video id="mainVideo" src="${videoFileUrl}" controlsList="nodownload"></video>
        
        <div class="controls">
          <button id="playBtn">Play / Pause</button>
          <button id="pipBtn">Picture-in-Picture</button>
          <button id="fsBtn">Fullscreen</button>
        </div>
      </div>

      <script>
        const video = document.getElementById('mainVideo');
        const container = document.getElementById('playerContainer');

        // Play/Pause
        document.getElementById('playBtn').addEventListener('click', () => {
          video.paused ? video.play() : video.pause();
        });

        // Picture in Picture
        document.getElementById('pipBtn').addEventListener('click', async () => {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled) {
            await video.requestPictureInPicture();
          }
        });

        // Fullscreen
        document.getElementById('fsBtn').addEventListener('click', () => {
          if (!document.fullscreenElement) {
            container.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        });
      </script>
    </body>
    </html>
  `;

  // 5. Return the HTML as the API response
  return new Response(playerHTML, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Access-Control-Allow-Origin': '*' // Crucial for allowing other sites to embed this iframe
    }
  });
}
