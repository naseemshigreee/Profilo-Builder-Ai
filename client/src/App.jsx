import { useEffect, useState } from "react";
import Home from "./components/Home.jsx";
import Builder from "./components/Builder.jsx";
import Preview from "./components/Preview.jsx";
import { api } from "./api.js";

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [route, id] = hash.split("/");
  return { route: route || "home", id };
}

function StandaloneView({ id }) {
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(id)
      .then(({ portfolio }) => setPortfolio(portfolio))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="builder__loading">Couldn't find that portfolio.</div>;
  if (!portfolio) return <div className="builder__loading">Loading…</div>;

  return (
    <div className="standalone">
      <Preview portfolio={portfolio} standalone />
    </div>
  );
}

export default function App() {
  const [{ route, id }, setLocation] = useState(parseHash());

  useEffect(() => {
    const onHashChange = () => setLocation(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  if (route === "view" && id) return <StandaloneView id={id} />;
  if (route === "edit" && id) return <Builder id={id} onBack={() => navigate("/home")} />;
  return <Home onOpen={(newId) => navigate(`/edit/${newId}`)} />;
}
