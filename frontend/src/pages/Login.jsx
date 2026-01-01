import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Login.css";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post("http://localhost:4000/api/login", {
        email,
        password,
      });
     localStorage.setItem("user_name", res.data.user.name);
localStorage.setItem("user_id", res.data.user.id);

      alert(res.data.message);

      
     
        navigate("/");
      
    } catch (err) {
      console.error("Error:", err);
      if (err.response) {
        alert(err.response.data.error || "Server error");
      }
    }
  };

  return (
    <div className="login-page-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
  );
}

export default Login;
