import React, { useState, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";
import { RoomLobby } from "./components/RoomLobby";
import { VotingBoard } from "./components/VotingBoard";
import { HistoryLog } from "./components/HistoryLog";
import { Spade, Wifi, WifiOff, PlusCircle, Sun, Moon } from "lucide-react";

export default function App() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [socketId, setSocketId] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("poker_theme") || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("poker_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Extract Room ID from the URL path on mount and popstate
  useEffect(() => {
    const parseRoomId = () => {
      const path = window.location.pathname.replace(/^\/+/, "");
      if (path && /^\d+$/.test(path)) {
        setRoomId(path);
      } else {
        setRoomId("");
        setJoined(false);
      }
    };

    parseRoomId();
    window.addEventListener("popstate", parseRoomId);
    return () => window.removeEventListener("popstate", parseRoomId);
  }, []);

  const {
    roomState,
    isConnected,
    joinRoom,
    submitVote,
    revealVotes,
    clearVotes,
    deleteHistoryItem,
    updateStory
  } = useSocket(roomId);

  // Set the current client's Socket ID once room state updates
  useEffect(() => {
    // Determine my socket ID by inspecting the browser connection or finding a matching entry
    // In socket.io, socket.id is available locally. We can get it via the hook.
    // As a simple fallback/cross-check, we'll store the local username and observe when we join.
  }, [roomState]);

  // Create a new session with a random 6-digit code
  const handleCreateSession = () => {
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem("is_creator_" + randomId, "true");
    window.history.pushState(null, "", `/${randomId}`);
    setRoomId(randomId);
  };

  const handleJoin = (username, isObserver) => {
    joinRoom(username, isObserver);
    setJoined(true);
    
    // Store the username in sessionStorage so we can match socketId if re-rendered
    sessionStorage.setItem("poker_username", username);
  };

  // Find socket id matching the current username from sessionStorage
  const getMySocketId = () => {
    if (!roomState) return null;
    const storedUsername = sessionStorage.getItem("poker_username");
    if (!storedUsername) return null;
    const found = Object.entries(roomState.users).find(
      ([_, u]) => u.username === storedUsername
    );
    return found ? found[0] : null;
  };

  const currentSocketId = getMySocketId();

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="logo" style={{ cursor: "pointer" }} onClick={() => {
            window.history.pushState(null, "", "/");
            setRoomId("");
            setJoined(false);
          }}>
            <Spade size={28} style={{ color: "var(--primary-cyan)" }} />
            <span>pointing poker</span>
          </div>

          {/* GitHub Star Button */}
          <a
            href="https://github.com/smokevicky/pointing-poker"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-color)",
              background: "var(--card-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "6px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary-cyan)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--glass-border)"}
          >
            {/* GitHub logo (octicon-mark-github) */}
            <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.68 7.68 0 012-.27c.68.003 1.37.092 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            {/* Star icon */}
            <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor" aria-hidden="true">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 11.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.873 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
            </svg>
            Star
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Theme Toggler */}
          <button 
            onClick={toggleTheme}
            className="btn-icon"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ 
              color: "var(--text-color)", 
              padding: "0.45rem", 
              borderRadius: "8px",
              background: "var(--card-bg)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-overlay)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Connection Status Icon */}
          {roomId && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {isConnected ? (
                <span style={{ fontSize: "0.85rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 500 }}>
                  <Wifi size={16} /> Connected
                </span>
              ) : (
                <span style={{ fontSize: "0.85rem", color: "#f97316", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 500 }}>
                  <WifiOff size={16} /> Disconnected
                </span>
              )}
            </div>
          )}

</div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {!roomId ? (
          /* HOMEPAGE / CREATOR SCREEN */
          <div className="auth-card glass" style={{ margin: "6rem auto" }}>
            <Spade size={56} style={{ color: "var(--primary-cyan)", marginBottom: "1.5rem" }} />
            <h2>Start Estimating Today</h2>
            <p style={{ marginBottom: "2rem" }}>
              Host instant planning poker sessions with your team. Zero logins, pure speed, fully real-time.
            </p>
            <button className="btn btn-primary" onClick={handleCreateSession}>
              <PlusCircle size={20} />
              Create New Session
            </button>
          </div>
        ) : !joined ? (
          /* LOBBY / NAME ENTRY */
          <RoomLobby roomId={roomId} onJoin={handleJoin} isCreator={sessionStorage.getItem("is_creator_" + roomId) === "true"} />
        ) : !roomState ? (
          /* LOADING / CONNECTION STATE */
          <div className="auth-card glass" style={{ margin: "6rem auto", textAlign: "center" }}>
            <h2 style={{ color: "var(--primary-cyan)" }}>Connecting to Realtime Session...</h2>
            <p style={{ marginTop: "1rem" }}>
              Establishing connection to your Firebase Database.
            </p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "1.5rem", lineHeight: "1.4" }}>
              Note: If this screen stays stuck, check that you have added your Firebase environment variables inside Vercel's Project Settings and triggered a Redeployment.
            </p>
          </div>
        ) : (
          /* ESTIMATION GAME BOARD */
          <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <VotingBoard
              roomState={roomState}
              currentSocketId={currentSocketId}
              submitVote={submitVote}
              revealVotes={revealVotes}
              clearVotes={clearVotes}
            />
            <HistoryLog
              history={roomState?.history}
              onDelete={deleteHistoryItem}
            />
          </div>
        )}
      </main>
    </div>
  );
}
