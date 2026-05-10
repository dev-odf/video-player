const video = document.getElementById('mainVideo');
const container = document.getElementById('playerContainer');
const playBtn = document.getElementById('playBtn');

// 1. Get the video ID from the iframe URL (e.g., ?id=123)
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');

// 2. Call the backend API to get the video source
if (videoId) {
  fetch(`/api/video?id=${videoId}`)
    .then(response => response.json())
    .then(data => {
      // Plug the data from the API into the video player
      video.src = data.url; 
    })
    .catch(error => console.error("Error fetching video:", error));
} else {
  console.error("No video ID in URL parameters.");
}

// 3. Button Controls
playBtn.addEventListener('click', () => {
  if (video.paused) {
    video.play();
    playBtn.innerText = 'Pause';
  } else {
    video.pause();
    playBtn.innerText = 'Play';
  }
});

document.getElementById('pipBtn').addEventListener('click', async () => {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
  } else if (document.pictureInPictureEnabled) {
    await video.requestPictureInPicture();
  }
});

document.getElementById('fsBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    container.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
