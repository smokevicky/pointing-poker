import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove, onDisconnect } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasConfig = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_FIREBASE_API_KEY";

let app = null;
let db = null;

if (hasConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase credentials are not set in your client/.env file. The application will remain in disconnected state.");
}

// Helper to retrieve/create a persistent unique user ID for this browser session
const getUserId = () => {
  let uid = sessionStorage.getItem("poker_uid");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem("poker_uid", uid);
  }
  return uid;
};

const userId = getUserId();

export function useSocket(roomId) {
  const [roomState, setRoomState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // 1. Sync connection status
  useEffect(() => {
    if (!db) return;
    const connectedRef = ref(db, ".info/connected");
    const unsubscribe = onValue(connectedRef, (snap) => {
      setIsConnected(snap.val() === true);
    });
    return unsubscribe;
  }, []);

  // 2. Sync room state updates
  useEffect(() => {
    if (!db || !roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Map history entries back to a sorted list
        let historyArray = [];
        if (val.history) {
          historyArray = Object.entries(val.history)
            .map(([id, item]) => ({ ...item, id }))
            .sort((a, b) => b.id.localeCompare(a.id));
        }

        setRoomState({
          roomId,
          users: val.users || {},
          isRevealed: val.isRevealed || false,
          history: historyArray
        });
      } else {
        setRoomState({
          roomId,
          users: {},
          isRevealed: false,
          history: []
        });
      }
    });

    return unsubscribe;
  }, [roomId]);

  const joinRoom = (username, isObserver) => {
    if (!db || !roomId) return;
    const userRef = ref(db, `rooms/${roomId}/users/${userId}`);

    // Set user entry in Firebase
    set(userRef, {
      username,
      vote: null,
      isObserver
    });

    // Cleanup: remove user immediately if they close the page
    onDisconnect(userRef).remove();
  };

  const submitVote = (vote) => {
    if (!db || !roomId) return;
    const voteRef = ref(db, `rooms/${roomId}/users/${userId}/vote`);
    set(voteRef, vote);
  };

  const revealVotes = () => {
    if (!db || !roomId) return;
    const revealRef = ref(db, `rooms/${roomId}/isRevealed`);
    set(revealRef, true);
  };

  const clearVotes = () => {
    if (!db || !roomId || !roomState) return;

    const updates = {};
    const pathRef = ref(db);

    // If currently revealed, archive results to history
    if (roomState.isRevealed) {
      const votesList = Object.values(roomState.users)
        .filter(u => !u.isObserver && u.vote !== null && u.vote !== undefined && u.vote !== "?");

      const numericVotes = votesList
        .map(u => parseFloat(u.vote))
        .filter(v => !isNaN(v));

      let average = null;
      if (numericVotes.length > 0) {
        const sum = numericVotes.reduce((a, b) => a + b, 0);
        average = parseFloat((sum / numericVotes.length).toFixed(1));
      }

      const historyId = Date.now().toString();
      updates[`rooms/${roomId}/history/${historyId}`] = {
        average: average !== null ? average : null,
        votes: Object.values(roomState.users).map(u => ({
          username: u.username || "",
          vote: u.vote !== undefined ? u.vote : null, // Prevent undefined payload crash
          isObserver: !!u.isObserver
        }))
      };
    }

    // Reset round active state
    updates[`rooms/${roomId}/isRevealed`] = false;
    if (roomState.users) {
      Object.keys(roomState.users).forEach(uid => {
        updates[`rooms/${roomId}/users/${uid}/vote`] = null; // Clear votes
      });
    }

    try {
      update(pathRef, updates);
    } catch (error) {
      console.error("Firebase update failed:", error);
    }
  };

  const deleteHistoryItem = (historyId) => {
    if (!db || !roomId) return;
    const itemRef = ref(db, `rooms/${roomId}/history/${historyId}`);
    remove(itemRef);
  };

  // Kept interface compatability for App.jsx triggers (no-op now)
  const updateStory = () => {};

  return {
    roomState,
    isConnected,
    joinRoom,
    submitVote,
    revealVotes,
    clearVotes,
    deleteHistoryItem,
    updateStory
  };
}
