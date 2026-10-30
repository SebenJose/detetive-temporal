"use client";

import { useEffect, useReducer, useState } from "react";
import { gameReducer, initialState, parseSave, SAVE_KEY } from "./state";

export function useProgress() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const saved = parseSave(localStorage.getItem(SAVE_KEY));
      if (saved) dispatch({ type: "LOAD", state: saved });
    } catch { setStorageAvailable(false); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
    catch { setStorageAvailable(false); }
  }, [state, ready]);

  return { state, dispatch, ready, storageAvailable };
}
