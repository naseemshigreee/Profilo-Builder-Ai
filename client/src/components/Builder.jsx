import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import Editor from "./Editor.jsx";
import Preview from "./Preview.jsx";

const SAVE_DELAY = 800;

export default function Builder({ id, onBack }) {
  const [portfolio, setPortfolio] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | idle | saving | saved | error
  const [mobileTab, setMobileTab] = useState("edit"); // edit | preview
  const saveTimer = useRef(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    api
      .get(id)
      .then(({ portfolio }) => {
        setPortfolio(portfolio);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  useEffect(() => {
    if (!portfolio || firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    setStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.update(id, portfolio);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, SAVE_DELAY);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio]);

  const copyShareLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/view/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("link-copied");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  if (status === "loading") return <div className="builder__loading">Loading portfolio…</div>;
  if (status === "error" && !portfolio)
    return (
      <div className="builder__loading">
        Couldn't find that portfolio.{" "}
        <button className="btn btn--outline" onClick={onBack}>
          Back home
        </button>
      </div>
    );

  const statusLabel = {
    idle: "All changes saved",
    saving: "Saving…",
    saved: "All changes saved",
    error: "Couldn't save — check the server",
    "link-copied": "Preview link copied",
  }[status];

  return (
    <div className="desk">
      <header className="desk__toolbar">
        <button className="btn btn--ghost" onClick={onBack}>
          ← All portfolios
        </button>
        <span className={`desk__status desk__status--${status}`}>{statusLabel}</span>
        <button className="btn btn--outline" onClick={copyShareLink}>
          Copy preview link
        </button>
      </header>

      <div className="desk__mobile-tabs">
        <button className={mobileTab === "edit" ? "is-active" : ""} onClick={() => setMobileTab("edit")}>
          Edit
        </button>
        <button className={mobileTab === "preview" ? "is-active" : ""} onClick={() => setMobileTab("preview")}>
          Preview
        </button>
      </div>

      <div className="desk__panels">
        <div className={`desk__panel desk__panel--edit ${mobileTab === "edit" ? "is-visible" : ""}`}>
          <Editor portfolio={portfolio} onChange={setPortfolio} />
        </div>
        <div className={`desk__seam`} aria-hidden="true" />
        <div className={`desk__panel desk__panel--preview ${mobileTab === "preview" ? "is-visible" : ""}`}>
          <p className="blueprint__eyebrow blueprint__eyebrow--paper">02 — Live preview</p>
          <Preview portfolio={portfolio} />
        </div>
      </div>
    </div>
  );
}
