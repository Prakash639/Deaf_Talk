// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SpeechToText from './pages/SpeechToText';
import SignToText from './pages/SignToText';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/speech-to-text" element={<SpeechToText />} />
      <Route path="/sign-to-text" element={<SignToText />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
