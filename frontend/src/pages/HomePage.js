import React, { useEffect } from "react";
import AddTransaction from "../components/AddTransaction";
import TransactionList from "../components/TransactionList";
import Summary from "../components/Summary";
import LogoutButton from '../components/LogoutButton';

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
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <LogoutButton />
      </div>

    <Summary />
      <hr style={{ margin: "20px 0" }} />

      <AddTransaction onSuccess={() => window.location.reload()} />
      <TransactionList />
    </div>
  );
}
