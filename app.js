const videoEl = document.getElementById('video');
const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');
const statusEl = document.getElementById('status');
const handCountEl = document.getElementById('hand-count');
const landmarkCountEl = document.getElementById('landmark-count');
const mudraDisplayEl = document.getElementById('mudra-display');

// Keep canvas dimensions in sync with its rendered size.
function syncCanvasSize() {
  canvasEl.width = canvasEl.offsetWidth;
  canvasEl.height = canvasEl.offsetHeight;
}
syncCanvasSize();
window.addEventListener('resize', syncCanvasSize);

/**
 * Classifies each finger as 'extended' or 'folded' based on landmark positions.
 * @param {Array} landmarks - MediaPipe hand landmarks (21 points)
 * @returns {Object} Object with keys: thumb, index, middle, ring, pinky
 */
function getFingerStates(landmarks) {
  // Landmark indices:
  // Wrist: 0
  // Thumb: 1(CMC), 2(MCP), 3(IP), 4(tip)
  // Index: 5(MCP), 6(PIP), 7(DIP), 8(tip)
  // Middle: 9(MCP), 10(PIP), 11(DIP), 12(tip)
  // Ring: 13(MCP), 14(PIP), 15(DIP), 16(tip)
  // Pinky: 17(MCP), 18(PIP), 19(DIP), 20(tip)

  // When extended, tip Y is LESS than MCP Y (inverted coordinates)
  const isFingerExtended = (tipY, knuckleY) => tipY < knuckleY - 0.08;

  // Thumb: check X-distance from palm (wrist) to thumb tip
  const palmX = landmarks[0].x;
  const thumbTipX = landmarks[4].x;
  const thumbBaseX = landmarks[2].x;
  const thumbExtendedDistance = Math.abs(thumbTipX - palmX);
  const thumbBaseDistance = Math.abs(thumbBaseX - palmX);
  const thumbExtended = thumbExtendedDistance > thumbBaseDistance + 0.01;

  return {
    thumb: thumbExtended ? 'extended' : 'folded',
    index: isFingerExtended(landmarks[8].y, landmarks[5].y) ? 'extended' : 'folded',
    middle: isFingerExtended(landmarks[12].y, landmarks[9].y) ? 'extended' : 'folded',
    ring: isFingerExtended(landmarks[16].y, landmarks[13].y) ? 'extended' : 'folded',
    pinky: isFingerExtended(landmarks[20].y, landmarks[17].y) ? 'extended' : 'folded',
  };
}

/**
 * Calculates Euclidean distance between two landmarks.
 * @param {Object} p1 - Landmark with x, y, z properties
 * @param {Object} p2 - Landmark with x, y, z properties
 * @returns {number} Distance between the two points
 */
function getDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Detects mudra gesture from hand landmarks.
 * @param {Array} landmarks - MediaPipe hand landmarks (21 points)
 * @returns {Object|null} { name, description } or null if no mudra detected
 */
function detectMudra(landmarks) {
  const states = getFingerStates(landmarks);
  const allExtended = Object.values(states).every(s => s === 'extended');

  // Check for Tripatāka first (specific ring finger condition)
  if (
    states.thumb === 'extended' &&
    states.index === 'extended' &&
    states.middle === 'extended' &&
    states.ring === 'folded' &&
    states.pinky === 'extended'
  ) {
    return {
      name: 'Tripatāka',
      description: 'Three parts of a flag — four fingers extended, ring finger folded',
    };
  }

  // Check for Mayūra (ring + thumb touching, others extended)
  const ringTipIndex = 16;
  const thumbTipIndex = 4;
  const thumbRingDistance = getDistance(landmarks[thumbTipIndex], landmarks[ringTipIndex]);

  if (
    thumbRingDistance < 0.08 &&
    states.index === 'extended' &&
    states.middle === 'extended' &&
    states.pinky === 'extended'
  ) {
    return {
      name: 'Mayūra',
      description: 'Peacock — ring and thumb tips touching, other fingers extended',
    };
  }

  // Check for Patāka (four fingers extended, thumb folded, held close)
  if (
    states.thumb === 'folded' &&
    states.index === 'extended' &&
    states.middle === 'extended' &&
    states.ring === 'extended' &&
    states.pinky === 'extended'
  ) {
    // Check if fingers are held relatively close together by measuring spread
    const indexTipIndex = 8;
    const middleTipIndex = 12;
    const pinkyTipIndex = 20;

    const indexMiddleDistance = getDistance(
      landmarks[indexTipIndex],
      landmarks[middleTipIndex]
    );
    const middlePinkyDistance = getDistance(
      landmarks[middleTipIndex],
      landmarks[pinkyTipIndex]
    );

    // If fingers are reasonably close (not spread wide), it's Patāka
    if (indexMiddleDistance < 0.18 && middlePinkyDistance < 0.18) {
      return {
        name: 'Patāka',
        description: 'Forest/Flag — four fingers extended together, thumb folded',
      };
    }
  }

  return null;
}

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
  let detectedMudra = null;

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

      // Detect mudra from the first hand
      if (!detectedMudra) {
        detectedMudra = detectMudra(landmarks);
      }
    }

    setStatus('Hand detected', true);
    handCountEl.textContent = results.multiHandLandmarks.length;
    landmarkCountEl.textContent = totalLandmarks;
  } else {
    setStatus('No hand detected');
    handCountEl.textContent = '0';
    landmarkCountEl.textContent = '0';
    detectedMudra = null;
  }

  // Update mudra display
  if (detectedMudra) {
    mudraDisplayEl.textContent = detectedMudra.name;
    mudraDisplayEl.classList.add('detected');
  } else {
    mudraDisplayEl.textContent = 'Awaiting Gesture...';
    mudraDisplayEl.classList.remove('detected');
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
