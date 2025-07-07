import React, { useState, useEffect } from "react";

export default function AddTransaction({ onSuccess }) {
  const [form, setForm] = useState({
    type: "Income",
    amount: "",
    category: "",
    description: ""
  });

  const categories = form.type === "Income"
    ? ["Salary", "Gift", "Allowance", "Other"]
    : ["Food", "Transport", "Groceries", "Rent", "Bill", "Other"];

  
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: categories[0],
    }));
  }, [form.type]);

  const formatWithDots = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatDots = (value) => {
    return value.replace(/\./g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onSuccess();
      setForm({ ...form, amount: "", description: "" });
    } else {
      alert("Failed to add transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Transactions</h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          style={{ flex: 1 }}
        >
          <option>Income</option>
          <option>Expense</option>
        </select>
        <input
          type="text"
          placeholder="Amount"
          value={formatWithDots(form.amount)}
          onChange={(e) => {
            const raw = unformatDots(e.target.value);
            if (!isNaN(raw)) {
              setForm({ ...form, amount: raw });
            }
          }}
          required
          style={{ flex: 2 }}
        />
      </div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ flex: 1 }}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ flex: 2 }}
        />
      </div>
      <button type="submit">Add</button>
    </form>
  );
}