
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignToText.css";

export default function SignToText() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [status, setStatus] = useState("⏳ Loading hand model...");
  const [recognizedText, setRecognizedText] = useState("Show a sign...");
  const [savedTexts, setSavedTexts] = useState([]);
  const navigate = useNavigate();
  const [lastSavedText, setLastSavedText] = useState("");
const handleLogout = () => {
  localStorage.removeItem("user_id"); // remove session
  navigate("/login"); // redirect to login page
};
  
  // Load HandPose model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
          runtime: "tfjs",
          modelType: "full",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
        };
        const newDetector = await handPoseDetection.createDetector(
          model,
          detectorConfig
        );
        setDetector(newDetector);
        setStatus("✅ Model loaded! Ready to detect.");
      } catch (error) {
        console.error("Model load error:", error);
        setStatus("❌ Failed to load model.");
      }
    };
    loadModel();
  }, []);

  // Run detection every 200ms
  useEffect(() => {
    if (!detector) return;
    const interval = setInterval(detectHand, 200);
    return () => clearInterval(interval);
  }, [detector]);

  // Fetch saved signs on load
  useEffect(() => {
    fetchSavedSigns();
  }, []);

  const detectHand = async () => {
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== 4 || !detector) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const hands = await detector.estimateHands(video);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (hands.length > 0) {
      let landmarks = hands[0].keypoints;

      // Flip x-coordinates
      landmarks = landmarks.map((p) => ({
        ...p,
        x: videoWidth - p.x,
      }));

      const sign = classifySign(landmarks);
      setRecognizedText(sign);
      setStatus("✋ Hand detected!");
      drawHand(landmarks, ctx);

      // Auto-save if different from last saved text
      if (
  sign &&
  sign !== "Hand detected, gesture not recognized." &&
  sign !== "No landmarks"
) {
  saveSign(sign);   // Save EVERY sign
}

    } else {
      setStatus("❌ No hand detected");
      setRecognizedText("Show a sign...");
    }
  };

  const classifySign = (lm) => {
    if (!lm || lm.length < 21) return "No landmarks";

    const wrist = lm[0];
    const thumbTip = lm[4];
    const indexTip = lm[8];
    const middleTip = lm[12];
    const ringTip = lm[16];
    const pinkyTip = lm[20];
    const indexBase = lm[5];
    const middleBase = lm[9];
    const ringBase = lm[13];
    const pinkyBase = lm[17];

    const isThumbUp = thumbTip.y < indexTip.y && thumbTip.y < pinkyTip.y;
    const isThumbDown = thumbTip.y > indexTip.y && thumbTip.y > pinkyTip.y;
    const isFist =
      indexTip.y > indexBase.y &&
      middleTip.y > middleBase.y &&
      ringTip.y > ringBase.y &&
      pinkyTip.y > pinkyBase.y;
    const isOpenPalm =
      indexTip.y < indexBase.y &&
      middleTip.y < middleBase.y &&
      ringTip.y < ringBase.y &&
      pinkyTip.y < pinkyBase.y;
    const isVictory =
      indexTip.y < indexBase.y &&
      middleTip.y < middleBase.y &&
      ringTip.y > ringBase.y &&
      pinkyTip.y > pinkyBase.y;

    if (isThumbUp) return "👍 Thumbs Up!";
    if (isThumbDown) return "👎 Thumbs Down!";
    if (isVictory) return "✌️ Victory!";
    if (isFist) return "✊ Fist!";
    if (isOpenPalm) return "🖐️ Open Palm!";
    return "Hand detected, gesture not recognized.";
  };

  const drawHand = (points, ctx) => {
    if (!points) return;
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ];

    ctx.strokeStyle = "deepskyblue";
    ctx.lineWidth = 2;
    connections.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(points[a].x, points[a].y);
      ctx.lineTo(points[b].x, points[b].y);
      ctx.stroke();
    });

    ctx.fillStyle = "lime";
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // Save sign to backend
// Save sign to backend (correct format)
const saveSign = async (text) => {
  const user_id = localStorage.getItem("user_id");
  if (!user_id) return;

  try {
    await axios.post("http://localhost:4000/api/sign/save", {
      user_id,
      text,  // <-- correct field required by backend
    });

    fetchSavedSigns();
  } catch (err) {
    console.error("Save error:", err);
  }
};

  // FETCH SAVED SIGNS
  const fetchSavedSigns = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;

    try {
      const res = await axios.get(
        `http://localhost:4000/api/sign/list/${user_id}`
      );

      setSavedTexts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };
  return (
    <>
      {/* Navbar */}
      <nav className="deaf-talk-navbar">
        <div className="navbar-brand">
          🧏‍♀️ Hand Sence
        </div>
      <button onClick={handleLogout} className="accessibility-nav-badge">Logout</button>
      </nav>

      {/* Main Container */}
      <div className="sign-container">
        {/* Animated Background Icons */}
        <div className="sign-bg-icon">✋</div>
        <div className="sign-bg-icon">👁️</div>
        <div className="sign-bg-icon">🎥</div>
        <div className="sign-bg-icon">💬</div>

        <div className="sign-content">
          {/* Header */}
          <div className="sign-header">
            <h2 className="sign-title">✋ Real-Time Sign to Text</h2>
            <p className="sign-status">{status}</p>
          </div>

          {/* Instructions Card */}
          <div className="instructions-card">
            <h3 className="instructions-title">📋 How to Use</h3>
            <ul className="instructions-list">
              <li className="instruction-item">Show your hand to the camera</li>
              <li className="instruction-item">Make clear hand gestures (thumbs up, victory, fist, etc.)</li>
              <li className="instruction-item">Recognized signs are automatically saved</li>
            </ul>
          </div>

          {/* Video Section */}
          <div className="video-container">
            <Webcam
              ref={webcamRef}
              mirrored={true}
              className="video-webcam"
            />
            <canvas
              ref={canvasRef}
              className="video-canvas"
            />
          </div>

          {/* Recognition Result */}
          <div className="recognition-result">
            <h3 className="recognition-text">{recognizedText}</h3>
          </div>

          {/* Buttons */}
          <div className="button-group">
            <button
              onClick={() => navigate("/")}
              className="sign-button"
            >
              ⬅ Back to Home
            </button>
            <button
              onClick={fetchSavedSigns}
              className="sign-button"
            >
              🔄 Refresh Signs
            </button>
          </div>

          {/* Saved Signs Section */}
          <div className="saved-signs-section">
            <h4 className="saved-signs-title">📝 Saved Signs History</h4>
            {savedTexts.length > 0 ? (
              <ul className="saved-signs-list">
                {savedTexts.map((item) => (
                  <li key={item.id} className="saved-sign-item">
                    {item.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-saved-signs">No saved signs yet. Start making gestures!</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}