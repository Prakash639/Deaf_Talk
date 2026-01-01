import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';


export default function Home() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
const handleLogout = () => {
  localStorage.removeItem("user_id"); // remove session
  navigate("/login"); // redirect to login page
};
  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    setUserName(storedName);
  }, []);
  return (
    <>
      {/* Navbar */}
      <nav className="deaf-talk-navbar">
        <div className="navbar-brand">
          🧏‍♀️ Deaf Talk
        </div>
         
    <button onClick={handleLogout} className="accessibility-nav-badge">Logout</button>
  
          
        
      </nav>

      {/* Main Content */}
      <div className="home-container">
        {/* Animated Background Icons */}
        <div className="bg-icon">🧏‍♀️</div>
        <div className="bg-icon">👂</div>
        <div className="bg-icon">✋</div>
        <div className="bg-icon">💬</div>

        {/* Main Card */}
        <div className="home-card">
          {/* Accessibility Badge */}
          {/* <div className="accessibility-badge">♿ Accessible</div> */}

          {/* Title */}
          <h2 className="home-title">🧏‍♀️ Deaf Talk</h2>
          
          
            <p className="welcome-text">Welcome, {userName} 👋</p>
          

          {/* Subtitle */}
          <p className="home-subtitle">
            Real-time Speech ↔ Text ↔ Sign Communication
          </p>

          {/* Speech to Text Button */}
          <button
            className="home-button btn-speech"
            onClick={() => navigate('/speech-to-text')}
          >
            <span>🎤 Speech to Text</span>
          </button>

          {/* Sign to Text Button */}
          <button
            className="home-button btn-sign"
            onClick={() => navigate('/sign-to-text')}
          >
            <span>✋ Sign to Text</span>
          </button>

          {/* Features Grid */}
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-item-icon">⚡</span>
              <div className="feature-item-text">Real-time</div>
            </div>
            <div className="feature-item">
              <span className="feature-item-icon">🔒</span>
              <div className="feature-item-text">Secure</div>
            </div>
            <div className="feature-item">
              <span className="feature-item-icon">🌐</span>
              <div className="feature-item-text">Multilingual</div>
            </div>
            <div className="feature-item">
              <span className="feature-item-icon">📱</span>
              <div className="feature-item-text">Mobile Ready</div>
            </div>
          </div>

          {/* Footer */}
          <footer className="home-footer">
            Made with for the Deaf Community
          </footer>
        </div>
      </div>
    </>
  );
}