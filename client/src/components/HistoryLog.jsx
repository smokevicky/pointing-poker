import React, { useState } from "react";
import { Trash2, History, ChevronDown, ChevronUp } from "lucide-react";

export function HistoryLog({ history, onDelete }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!history || history.length === 0) return null;

  return (
    <div className="history-section" style={{ marginTop: "2rem" }}>
      <div className="history-header" onClick={() => setIsOpen(!isOpen)} style={{ marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <History size={16} style={{ color: "var(--primary-cyan)" }} />
          History ({history.length})
        </h3>
        <button className="btn-icon" style={{ color: "#94a3b8" }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="history-list" style={{ gap: "0.5rem" }}>
          {history.map((item, index) => {
            const roundNumber = history.length - index;
            const voterCount = item.votes ? item.votes.filter(v => !v.isObserver).length : 0;
            return (
              <div key={item.id} className="history-item glass" style={{ padding: "0.6rem 1rem", borderRadius: "10px" }}>
                <div className="history-story-info">
                   <span className="history-story-title" style={{ fontSize: "0.95rem" }}>Round #{roundNumber}</span>
                   <span className="history-story-meta" style={{ fontSize: "0.75rem" }}>
                     Voted by {voterCount} user{voterCount === 1 ? "" : "s"}
                   </span>
                </div>

                <div className="history-stats" style={{ gap: "1rem" }}>
                  <div className="history-stat" style={{ alignItems: "center" }}>
                    <span className="history-stat-label" style={{ fontSize: "0.7rem" }}>AVERAGE</span>
                    <span className="history-stat-value" style={{ fontSize: "0.95rem" }}>{item.average !== null ? item.average : "-"}</span>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={() => onDelete(item.id)}
                    title="Delete from history"
                    style={{ padding: "0.25rem" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
