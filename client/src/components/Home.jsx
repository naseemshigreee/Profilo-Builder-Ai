import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Home({ onOpen }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const createNew = async () => {
    setError("");
    try {
      const { id } = await api.create({ name: "" });
      onOpen(id);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="home">
      <div className="home__hero">
        <p className="home__eyebrow">Portfolio Builder</p>
        <h1>Draft it on the left. It becomes a page on the right.</h1>
        <p className="home__lede">
          Create a personal portfolio, edit every section, and watch the finished page take
          shape in real time.
        </p>
        <button className="btn btn--primary" onClick={createNew}>
          + Start a new portfolio
        </button>
      </div>

      <div className="home__list">
        <h2>Your portfolios</h2>
        {loading && <p className="home__muted">Loading…</p>}
        {error && <p className="home__error">{error}</p>}
        {!loading && list.length === 0 && (
          <p className="home__muted">Nothing here yet — start one above.</p>
        )}
        <ul>
          {list.map((item) => (
            <li key={item.id} className="home__item" onClick={() => onOpen(item.id)}>
              <div>
                <strong>{item.name || "Untitled portfolio"}</strong>
                {item.title && <span className="home__item-title"> — {item.title}</span>}
              </div>
              <span className="home__item-date">
                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
