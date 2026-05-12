# मुद्रा विज्ञान - Mudra Detector

A real-time hand gesture recognition system for classical Indian Bharatanatyam dance mudras, powered by MediaPipe Hand Pose Estimation.

## 🎭 About Mudras

Mudras (मुद्रा) are symbolic hand gestures used in classical Indian dance forms like Bharatanatyam. Each mudra carries specific meanings and emotions, forming the vocabulary of classical dance expression.

This project detects three fundamental mudras in real-time:

### Supported Mudras

1. **Patāka** (पटाक) - Forest/Flag
   - Four fingers extended and held close together
   - Thumb folded
   - Represents openness, breadth, and vastness

2. **Mayūra** (मयूर) - Peacock
   - Ring finger and thumb tips touching
   - Index, middle, and pinky fingers extended
   - Symbolizes grace and beauty

3. **Tripatāka** (त्रिपटाक) - Three Parts of a Flag
   - Thumb, index, middle, and pinky extended
   - Ring finger folded downward
   - Represents specific hand positions in dance sequences

## ✨ Features

- **Real-time Detection**: Instant mudra recognition via webcam
- **Live Visualization**: Hand landmarks and skeleton overlay
- **Elegant UI**: Bharatanatyam-inspired color palette and typography
- **Performance Metrics**: Displays detected hands and landmark count
- **Smooth Animations**: Beautiful transitions and glow effects when mudras are detected

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Hand Detection**: [MediaPipe Hands](https://mediapipe.dev/solutions/hands)
- **Camera Access**: MediaPipe Camera Utils
- **Drawing**: MediaPipe Drawing Utils

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Edge, Firefox, or Safari)
- Webcam access
- Internet connection (for MediaPipe CDN scripts)

### Installation

1. Clone the repository or download the files
2. Navigate to the project directory:
   ```bash
   cd Mudra-Detector
   ```

3. Start a local development server:
   ```bash
   python3 -m http.server 8080
   ```

4. Open your browser to `http://localhost:8080`

5. Allow camera permissions when prompted

## 📖 How to Use

1. **Position Your Hand**: Place your hand in front of the camera
2. **Form a Mudra**: Create one of the three supported mudras
3. **See Recognition**: The detected mudra name appears in large text with a glow effect
4. **Track Landmarks**: Watch the hand skeleton and joints being tracked in real-time

## 🧠 How It Works

### Hand Detection Pipeline

1. **Capture**: MediaPipe Camera continuously captures video frames
2. **Detect**: MediaPipe Hands processes frames and detects hand landmarks (21 points per hand)
3. **Analyze**: Custom finger state detection determines if each finger is extended or folded
4. **Classify**: Mudra detection rules match the finger configuration to a known mudra
5. **Display**: Results are rendered on the canvas with live visualization

### Finger State Detection

- **Regular Fingers** (index, middle, ring, pinky): Y-coordinate comparison (tip vs. knuckle)
- **Thumb**: X-coordinate distance from palm (due to different orientation)
- **Threshold**: 0.08 normalized units for extended state

### Mudra Classification

Each mudra is defined by a specific pattern of extended/folded fingers:

```javascript
Patāka:    thumb=folded, index=extended, middle=extended, ring=extended, pinky=extended
Mayūra:    thumb + ring tips touching, others extended
Tripatāka: thumb=extended, index=extended, middle=extended, ring=folded, pinky=extended
```

## 📁 Project Structure

```
Mudra-Detector/
├── index.html          # HTML structure
├── style.css          # Styling and layout
├── app.js             # Main application logic
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## 🎨 UI Design

The interface follows a warm Bharatanatyam-inspired color palette:
- **Background**: Soft cream and beige gradients
- **Primary Colors**: Warm rust and burgundy tones
- **Accents**: Peachy salmon and terracotta
- **Typography**: Classical serif fonts (Georgia, Garamond)

## 🔧 Configuration

Edit the `app.js` file to customize:

- **Detection Confidence**: Adjust `minDetectionConfidence` and `minTrackingConfidence` in the Hands options
- **Model Complexity**: Change `modelComplexity` (0 = lite, 1 = full)
- **Max Hands**: Modify `maxNumHands` to detect more or fewer hands
- **Finger Thresholds**: Adjust the comparison thresholds in `getFingerStates()`

## 🎯 Future Enhancements

- Add more mudras (Ardhachandrasana, Chandrakala, etc.)
- Support for hand orientation detection
- Mudra sequence recognition
- Historical/cultural information display
- Recording and playback features
- Mobile app version

## 📚 References

- [MediaPipe Hands Documentation](https://mediapipe.dev/solutions/hands)
- [Bharatanatyam Mudras](https://en.wikipedia.org/wiki/Mudra#Bharatanatyam_mudras)
- [Classical Indian Hand Gestures](https://en.wikipedia.org/wiki/Mudra)

## 📝 License

Open source - feel free to use and modify

## 🙏 Credits

Built with MediaPipe by Google, inspired by classical Indian dance traditions.

---

**Note**: This project requires browser camera permissions. All processing happens locally on your device—no data is sent to external servers.
