
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SpeechToText.css";

export default function SpeechToText() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [listening, setListening] = useState(false);
  const [inputLang, setInputLang] = useState("en-US");
  const [targetLang, setTargetLang] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [savedTexts, setSavedTexts] = useState([]);
  const [lastSavedText, setLastSavedText] = useState("");
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
const [selectedSpeech, setSelectedSpeech] = useState("");
const handleLogout = () => {
  localStorage.removeItem("user_id"); // remove session
  navigate("/login"); // redirect to login page
};
  
  // Fetch saved speech texts on load
  useEffect(() => {
    fetchSavedSpeech();
  }, []);

  const translateText = async (inputText, target) => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(
          inputText
        )}`
      );
      const data = await response.json();
      const translation = data[0][0][0];
      setTranslatedText(translation);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = inputLang;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      if (listening) recognition.start();
    };
    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setText(transcript);
      translateText(transcript, targetLang);

      // Auto-save if new speech
      if (transcript && transcript !== lastSavedText) {
        saveSpeech(transcript);
        setLastSavedText(transcript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  // Save speech text to backend
  const saveSpeech = async (content) => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return alert("User not logged in!");

    try {
      await axios.post("http://localhost:4000/api/speech/save", {
        user_id,
        text: content,
      });
      fetchSavedSpeech();
    } catch (err) {
      console.error(err);
    }
  };

  // Get saved speech from backend
  const fetchSavedSpeech = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;

    try {
      const res = await axios.get(
        `http://localhost:4000/api/speech/list/${user_id}`
      );
      setSavedTexts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
    <div className="speech-to-text-page">
      {/* Navbar */}
      <nav className="deaf-talk-navbar">
        <div className="navbar-brand">
          🧏‍♀️ Speech Detect
        </div>
                   <button onClick={handleLogout} className="accessibility-nav-badge">Logout</button>
      </nav>

      {/* Main Container */}
      <div className="speech-container">
        {/* Animated Background Icons */}
        <div className="speech-bg-icon">🎤</div>
        <div className="speech-bg-icon">🗣️</div>
        <div className="speech-bg-icon">🌐</div>
        <div className="speech-bg-icon">💬</div>

        <div className="speech-content">
          {/* Instructions Card */}
          <div className="instructions-card">
            <h3 className="instructions-title">📋 How to Use</h3>
            <ul className="instructions-list">
              <li className="instruction-item">Select your speaking language</li>
              <li className="instruction-item">Choose target language for translation</li>
              <li className="instruction-item">Click "Start Listening" and speak clearly</li>
              <li className="instruction-item">Speech is auto-saved and translated</li>
            </ul>
          </div>

          {/* Main Card */}
          <div className="speech-card">
            <h2 className="speech-title">
              <span className="speech-title-highlight">🎤 Speech to Text</span> + Translation
            </h2>

            {/* Listening Status Badge */}
            <div className={`listening-badge ${listening ? 'active' : 'inactive'}`}>
              {listening ? '🔴 Listening...' : '⚪ Not Listening'}
            </div>

            {/* Language Selection */}
            <div className="speech-select-box">
              <label className="speech-label">🎙️ Select Language to Speak:</label>
              <select
                value={inputLang}
                onChange={(e) => setInputLang(e.target.value)}
                disabled={listening}
                className="speech-select"
              >
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi (India)</option>
                <option value="ta-IN">Tamil (India)</option>
                <option value="ml-IN">Malayalam (India)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="fr-FR">French (France)</option>
                <option value="ja-JP">Japanese (Japan)</option>
              </select>
            </div>

            <div className="speech-select-box">
              <label className="speech-label">🌐 Select Language to Translate to:</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={listening}
                className="speech-select"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="ml">Malayalam</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="ja">Japanese</option>
              </select>
            </div>

            {/* Features Info */}
            <div className="features-info">
              <div className="feature-info-item">
                <div className="feature-info-icon">🎯</div>
                <div className="feature-info-text">Real-time</div>
              </div>
              <div className="feature-info-item">
                <div className="feature-info-icon">💾</div>
                <div className="feature-info-text">Auto-Save</div>
              </div>
            </div>

            {/* Control Buttons */}
            {!listening ? (
              <button
                className="speech-button btn-start"
                onClick={startListening}
              >
                <span>▶️ Start Listening</span>
              </button>
            ) : (
              <button
                className="speech-button btn-stop"
                onClick={stopListening}
              >
                <span>⏹ Stop Listening</span>
              </button>
            )}

            {/* Output Box */}
            <div className={`speech-output-box ${!text ? 'empty' : ''}`}>
              {text || "🎙️ Speak something..."}
            </div>

            {/* Translation Box */}
            {loading ? (
              <p className="loading-text">🔄 Translating...</p>
            ) : (
              translatedText && (
                <div className="speech-translation-box">
                  <span className="translation-label">📝 Translation:</span>
                  {translatedText}
                </div>
              )
            )}

            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="speech-button btn-back"
            >
              <span>⬅ Back to Home</span>
            </button>
          </div>

          {/* Saved Speech Section */}
          <div className="saved-speech-section">
            <h4 className="saved-speech-title">
              <span>💾 Saved Speech History</span>
              <button
                onClick={fetchSavedSpeech}
                className="speech-button btn-refresh"
              >
                <span>🔄 Refresh</span>
              </button>
            </h4>
             {savedTexts.length > 0 ? (
              <ul className="saved-speech-list">
                {savedTexts.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => setSelectedSpeech(item.content)}
                    className="saved-speech-item"
                  >
                    {item.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved speech yet</p>
            )}
          </div>
        </div>
      </div></div>
    </>
  );
}