import React, { useState, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";
import { RoomLobby } from "./components/RoomLobby";
import { VotingBoard } from "./components/VotingBoard";
import { HistoryLog } from "./components/HistoryLog";
import { Spade, Wifi, WifiOff, PlusCircle } from "lucide-react";

export default function App() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [socketId, setSocketId] = useState("");

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
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => {
          window.history.pushState(null, "", "/");
          setRoomId("");
          setJoined(false);
        }}>
          <Spade size={28} style={{ color: "var(--primary-cyan)" }} />
          <span>pointing poker</span>
        </div>

        {/* Server Status Icon */}
        {roomId && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {isConnected ? (
              <span style={{ fontSize: "0.85rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Wifi size={16} /> Connected
              </span>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "#fb923c", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <WifiOff size={16} /> Disconnected
              </span>
            )}
          </div>
        )}
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
