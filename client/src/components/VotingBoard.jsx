import React, { useState } from "react";
import { Eye, RotateCcw, Copy, Check, Users } from "lucide-react";

export function VotingBoard({
  roomState,
  currentSocketId,
  submitVote,
  revealVotes,
  clearVotes
}) {
  const [copied, setCopied] = useState(false);

  if (!roomState) return null;

  const users = Object.entries(roomState.users).sort((a, b) => {
    const aObs = a[1].isObserver ? 1 : 0;
    const bObs = b[1].isObserver ? 1 : 0;
    if (bObs !== aObs) {
      return bObs - aObs; // Observers first
    }
    return a[1].username.localeCompare(b[1].username); // Alphabetical secondary sort
  });
  const myUser = roomState.users[currentSocketId];
  const activeVote = myUser?.vote;
  const isObserver = myUser?.isObserver;

  const numberCards = ["0", "0.5", "1", "2", "3", "5", "8"]; // numeric estimates
  const emojiCards = ["☕", "🤔", "😭", "🤷", "♾️"]; // fun emojis (not counted)


  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculations for stats
  // Only numeric votes are considered for stats
  const numericCardSet = new Set(numberCards);
  const votes = Object.values(roomState.users)
    .filter(u => !u.isObserver && numericCardSet.has(u.vote));

  const numericVotes = votes
    .map(u => parseFloat(u.vote))
    .filter(v => !isNaN(v));

  let average = null;
  if (numericVotes.length > 0) {
    const sum = numericVotes.reduce((a, b) => a + b, 0);
    average = (sum / numericVotes.length).toFixed(1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* 1. Card Selection Deck at the top */}
      {!isObserver && (
        <div className="glass" style={{ padding: "1rem", borderRadius: "14px" }}>
          <h3 className="cards-section-title" style={{ fontSize: "0.8rem", marginBottom: "0.6rem", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
            Select Estimate
          </h3>
          <div className="cards-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", marginBottom: 0 }}>
            {numberCards.map((card) => {
              const isSelected = activeVote === card;
              return (
                <div
                  key={card}
                  className={`poker-card ${isSelected ? "selected" : ""}`}
                  onClick={() => submitVote(isSelected ? null : card)}
                  style={{ fontSize: "1.2rem", padding: "0.4rem 0", borderRadius: "8px" }}
                >
                  {card}
                </div>
              );
            })}
          </div>
            {/* Emoji row – clickable, votes shown immediately */}
            <div className="emoji-row" style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
              {emojiCards.map((emoji) => {
                const isSelected = activeVote === emoji;
                return (
                  <div
                    key={emoji}
                    className={`emoji-card ${isSelected ? "selected" : ""}`}
                    onClick={() => submitVote(isSelected ? null : emoji)}
                    style={{ fontSize: "1.5rem", cursor: "pointer" }}
                  >
                    {emoji}
                  </div>
                );
              })}
            </div>
        </div>
      )}

      {/* 2. Players Panel */}
      <div className="players-panel glass" style={{ padding: "1.25rem", margin: 0, borderRadius: "14px" }}>
        <div style={{ display: "flex", justifycontent: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
            <Users size={16} style={{ color: "var(--primary-cyan)" }} />
            Team ({users.length})
          </h3>
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary"
            style={{ width: "auto", padding: "0.35rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px" }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Invite Link"}
          </button>
        </div>

        <div className="players-list" style={{ gap: "0.5rem" }}>
          {users.map(([sockId, user]) => {
            const hasVoted = user.vote !== null && user.vote !== undefined;
            const isUserSelf = sockId === currentSocketId;
            
            if (user.isObserver) {
              return (
                <div key={sockId} className="player-row" style={{ padding: "0.45rem 0.75rem" }}>
                  <div className="player-info" style={{ gap: "0.5rem" }}>
                    <div className="player-avatar observer" style={{ width: "24px", height: "24px", fontSize: "0.7rem" }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>
                      {user.username} {isUserSelf && <span style={{ color: "#64748b", fontSize: "0.7rem" }}>(You)</span>}
                    </span>
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500 }}>Observer</span>
                </div>
              );
            }

            let badgeClass = "player-vote-badge thinking";
            let badgeContent = "?";

            const isEmojiVote = user.vote && !numericCardSet.has(user.vote);

            if (isEmojiVote) {
              // Emoji votes are always shown immediately
              badgeClass = "player-vote-badge voted-revealed";
              badgeContent = user.vote;
            } else if (roomState.isRevealed) {
              if (hasVoted) {
                badgeClass = "player-vote-badge voted-revealed";
                badgeContent = user.vote;
              } else {
                badgeClass = "player-vote-badge thinking";
                badgeContent = "-";
              }
            } else {
              if (hasVoted) {
                badgeClass = "player-vote-badge voted-hidden";
                badgeContent = "✓";
              } else {
                badgeClass = "player-vote-badge thinking";
                badgeContent = "...";
              }
            }

            return (
              <div key={sockId} className="player-row" style={{ padding: "0.45rem 0.75rem" }}>
                <div className="player-info" style={{ gap: "0.5rem" }}>
                  <div className="player-avatar" style={{ width: "24px", height: "24px", fontSize: "0.7rem" }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>
                    {user.username} {isUserSelf && <span style={{ color: "#64748b", fontSize: "0.7rem" }}>(You)</span>}
                  </span>
                </div>
                <div className={badgeClass} style={{ width: "30px", height: "34px", fontSize: "0.9rem", borderRadius: "6px" }}>{badgeContent}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Action Buttons Row (Show Cards / Reset) */}
      <div className="control-panel" style={{ display: "flex", gap: "0.75rem", margin: 0 }}>
        <button className="btn btn-primary" onClick={revealVotes} style={{ flex: 1, padding: "0.6rem", fontSize: "0.9rem", borderRadius: "8px" }}>
          <Eye size={16} />
          Show Cards
        </button>
        <button className="btn btn-secondary" onClick={clearVotes} style={{ flex: 1, padding: "0.6rem", fontSize: "0.9rem", borderRadius: "8px" }}>
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* 4. Average Point Display */}
      {roomState.isRevealed && (
        <div className="stats-panel glass" style={{ padding: "1.25rem", textAlign: "center", margin: 0, borderRadius: "14px" }}>
          <div className="stat-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", tracking: "0.05em", color: "#94a3b8" }}>
            Average Point Estimate
          </div>
          <div className="stat-value" style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--primary-cyan)", marginTop: "0.25rem" }}>
            {average !== null ? average : "-"}
          </div>
        </div>
      )}
    </div>
  );
}
