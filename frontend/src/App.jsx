// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SpeechToText from './pages/SpeechToText';
import SignToText from './pages/SignToText';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/speech-to-text" element={<SpeechToText />} />
      <Route path="/sign-to-text" element={<SignToText />} />
    </Routes>
  );
}
