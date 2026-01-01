import React, { useState } from "react";
import axios from "axios";
import "./Register.css";
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/api/register", {
        name,
        email,
        password,
      });

      alert(res.data.message);
    } catch (err) {
      console.error("Error:", err);
      if (err.response) {
        alert(err.response.data.error || "Server error");
      }
    }
  };

 return (
    <div className="register-page-container">
      <form onSubmit={handleRegister}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
}

export default Register;