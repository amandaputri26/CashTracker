import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      onLogin();
      navigate("/");
    } else {
      alert(data.message);
    }
  };

return (
  <div className="auth-background">
    <form onSubmit={handleLogin} className="auth-card">
      <h3>Welcome to CashTrack</h3>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        required
      />
      <button type="submit">Login</button>
      <p>Don't have an Account yet? <a href="/register" style={{ color: '#fff', textDecoration: 'underline' }}>Register Here!</a></p>
    </form>
  </div>
);
}
