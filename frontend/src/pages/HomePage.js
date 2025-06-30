import React, { useEffect } from "react";
import AddTransaction from "../components/AddTransaction";
import TransactionList from "../components/TransactionList";
import Summary from "../components/Summary";
import LogoutButton from '../components/LogoutButton';
import logo from '../CashTrack.png'; // ✅ Make sure this file exists

export default function HomePage() {
  useEffect(() => {
    fetch("http://localhost:4000/check", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  return (
    <div className="container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <img src={logo} alt="CashTrack Logo" />
          <h2>Dashboard</h2>
        </div>
        <LogoutButton />
      </div>

      <Summary />

      <AddTransaction onSuccess={() => window.location.reload()} />
      <TransactionList />
    </div>
  );
}
