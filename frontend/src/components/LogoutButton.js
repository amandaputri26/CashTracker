import React from "react";

const LogoutButton = () => {
  const handleLogout = () => {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
    })
      .then(() => {
        window.location.href = "/login";
      })
      .catch((err) => {
        console.error("Logout error", err);
      });
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;