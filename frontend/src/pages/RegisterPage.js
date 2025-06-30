import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Successful registration, please login.");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

return (
  <div className="auth-background">
    <form onSubmit={handleRegister} className="auth-card">
      <h3>Let's create an account</h3>
      <h2>Register</h2>
      <input
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        required
      />
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
      <button type="submit">Register</button>
      <p>Already have an Account? <a href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Login</a></p>
    </form>
  </div>
);

}
