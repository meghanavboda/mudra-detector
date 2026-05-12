const videoEl = document.getElementById('video');
const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');
const statusEl = document.getElementById('status');
const handCountEl = document.getElementById('hand-count');
const landmarkCountEl = document.getElementById('landmark-count');

// Keep canvas dimensions in sync with its rendered size.
function syncCanvasSize() {
  canvasEl.width = canvasEl.offsetWidth;
  canvasEl.height = canvasEl.offsetHeight;
}
syncCanvasSize();
window.addEventListener('resize', syncCanvasSize);

// MediaPipe Hands result callback
function onResults(results) {
  const w = canvasEl.width;
  const h = canvasEl.height;

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // Mirror horizontally to match the CSS-mirrored video.
  ctx.translate(w, 0);
  ctx.scale(-1, 1);

  // Draw the camera frame behind landmarks.
  ctx.drawImage(results.image, 0, 0, w, h);

  let totalLandmarks = 0;

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (const landmarks of results.multiHandLandmarks) {
      totalLandmarks += landmarks.length;

      // Connections between landmarks (skeleton)
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
        color: '#a78bfa',
        lineWidth: 2,
      });

      // Individual landmark dots
      drawLandmarks(ctx, landmarks, {
        color: '#60a5fa',
        fillColor: '#1e1b4b',
        lineWidth: 1,
        radius: 4,
      });
    }

    setStatus('Hand detected', true);
    handCountEl.textContent = results.multiHandLandmarks.length;
    landmarkCountEl.textContent = totalLandmarks;
  } else {
    setStatus('No hand detected');
    handCountEl.textContent = '0';
    landmarkCountEl.textContent = '0';
  }

  ctx.restore();
}

function setStatus(msg, hide = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle('hidden', hide);
}

// Initialise MediaPipe Hands
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,   // 0 = lite, 1 = full
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.6,
});

hands.onResults(onResults);

// Use MediaPipe Camera to feed frames at the right rate
const camera = new Camera(videoEl, {
  onFrame: async () => {
    await hands.send({ image: videoEl });
  },
  width: 1280,
  height: 960,
});

camera.start()
  .then(() => setStatus('Camera ready — show your hands!'))
  .catch((err) => {
    console.error('Camera error:', err);
    setStatus('Camera access denied. Please allow camera and reload.');
  });
