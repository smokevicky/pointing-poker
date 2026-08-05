import React, { useState } from "react";
import { LogIn, Users } from "lucide-react";

export function RoomLobby({ onJoin, roomId, isCreator }) {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("poker_display_name") || (isCreator ? "Sam" : "");
  });
  const [isObserver, setIsObserver] = useState(isCreator ? true : false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;
    localStorage.setItem("poker_display_name", trimmedUsername);
    onJoin(trimmedUsername, isObserver);
  };

  return (
    <div className="auth-card glass">
      <h2>{isCreator ? "Start Estimation Session" : "Join Estimation Session"}</h2>
      <p>Room ID: <span style={{ color: "var(--primary-cyan)", fontWeight: 600 }}>{roomId}</span></p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Your Display Name</label>
          <input
            id="username"
            type="text"
            className="input-field"
            placeholder="e.g. Vicky, Sophie"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              style={{
                width: "18px",
                height: "18px",
                accentColor: "var(--primary-cyan)",
                cursor: "pointer"
              }}
              checked={isObserver}
              onChange={(e) => setIsObserver(e.target.checked)}
            />
            Join as observer (spectator only)
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          <LogIn size={20} />
          {isCreator ? "Start Session" : "Join Session"}
        </button>
      </form>
    </div>
  );
}
