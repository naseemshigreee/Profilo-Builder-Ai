export default function Preview({ portfolio, standalone = false }) {
  const p = portfolio;
  const hasContent = p.name || p.title || p.bio || p.projects?.length;

  return (
    <div className={`paper ${standalone ? "paper--standalone" : ""}`}>
      <div className="paper__ruler" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={i % 4 === 0 ? "tick tick--major" : "tick"} />
        ))}
      </div>

      {!hasContent ? (
        <div className="paper__empty">
          <p className="paper__empty-eyebrow">Nothing drafted yet</p>
          <p>Fill in the form on the left — this page fills in as you type.</p>
        </div>
      ) : (
        <article className="paper__content">
          <header className="paper__header">
            {p.avatarUrl ? (
              <img className="paper__avatar" src={p.avatarUrl} alt={p.name || "Avatar"} />
            ) : (
              <div className="paper__avatar paper__avatar--placeholder">
                {(p.name || "?").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="paper__name">{p.name || "Your Name"}</h1>
              {p.title && <p className="paper__title">{p.title}</p>}
              {p.location && <p className="paper__location">{p.location}</p>}
            </div>
          </header>

          {p.tagline && <p className="paper__tagline">“{p.tagline}”</p>}

          {p.bio && (
            <section className="paper__section">
              <h2>About</h2>
              <p>{p.bio}</p>
            </section>
          )}

          {p.skills?.length > 0 && (
            <section className="paper__section">
              <h2>Skills</h2>
              <ul className="paper__pills">
                {p.skills.map((s, i) => (
                  <li key={i} className="pill">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.projects?.length > 0 && (
            <section className="paper__section">
              <h2>Projects</h2>
              <div className="paper__projects">
                {p.projects.map((proj) => (
                  <div className="project-card" key={proj.id}>
                    <div className="project-card__head">
                      <h3>{proj.title || "Untitled project"}</h3>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer">
                          View →
                        </a>
                      )}
                    </div>
                    {proj.description && <p>{proj.description}</p>}
                    {proj.tags?.length > 0 && (
                      <ul className="paper__pills paper__pills--sm">
                        {proj.tags.map((t, i) => (
                          <li key={i} className="pill pill--sm">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(p.email || p.socials?.github || p.socials?.linkedin || p.socials?.website || p.socials?.twitter) && (
            <footer className="paper__footer">
              <h2>Get in touch</h2>
              <ul className="paper__contacts">
                {p.email && <li><a href={`mailto:${p.email}`}>{p.email}</a></li>}
                {p.socials?.website && <li><a href={p.socials.website} target="_blank" rel="noreferrer">Website</a></li>}
                {p.socials?.github && <li><a href={p.socials.github} target="_blank" rel="noreferrer">GitHub</a></li>}
                {p.socials?.linkedin && <li><a href={p.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
                {p.socials?.twitter && <li><a href={p.socials.twitter} target="_blank" rel="noreferrer">Twitter / X</a></li>}
              </ul>
            </footer>
          )}
        </article>
      )}
    </div>
  );
}
