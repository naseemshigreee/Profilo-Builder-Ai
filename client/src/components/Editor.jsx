import { useState } from "react";
import { api } from "../api.js";

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

export default function Editor({ portfolio, onChange }) {
  const p = portfolio;
  const set = (patch) => onChange({ ...p, ...patch });
  const setSocial = (key, value) => onChange({ ...p, socials: { ...p.socials, [key]: value } });

  const [skillInput, setSkillInput] = useState("");
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | error
  const [aiError, setAiError] = useState("");

  const generateWithAI = async () => {
    setAiStatus("loading");
    setAiError("");
    try {
      const result = await api.generateBio({
        name: p.name,
        title: p.title,
        tagline: p.tagline,
        location: p.location,
        skills: p.skills || [],
      });
      set({
        bio: result.bio || p.bio,
        tagline: result.tagline || p.tagline,
      });
      setAiStatus("idle");
    } catch (err) {
      setAiStatus("error");
      setAiError(err.message || "Something went wrong.");
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    const s = skillInput.trim();
    if (!s) return;
    set({ skills: [...(p.skills || []), s] });
    setSkillInput("");
  };
  const removeSkill = (i) => set({ skills: p.skills.filter((_, idx) => idx !== i) });

  const addProject = () =>
    set({
      projects: [
        ...(p.projects || []),
        { id: crypto.randomUUID(), title: "", description: "", link: "", tags: [] },
      ],
    });
  const updateProject = (id, patch) =>
    set({ projects: p.projects.map((proj) => (proj.id === id ? { ...proj, ...patch } : proj)) });
  const removeProject = (id) => set({ projects: p.projects.filter((proj) => proj.id !== id) });

  return (
    <div className="blueprint">
      <p className="blueprint__eyebrow">01 — Draft your details</p>

      <fieldset className="blueprint__group">
        <legend>Identity</legend>
        <Field label="Full name">
          <input value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Naseem Khan" />
        </Field>
        <Field label="Professional title">
          <input value={p.title} onChange={(e) => set({ title: e.target.value })} placeholder="Full-Stack & Android Developer" />
        </Field>
        <Field label="Tagline / motto">
          <input value={p.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="I build things that ship." />
        </Field>
        <Field label="Location">
          <input value={p.location} onChange={(e) => set({ location: e.target.value })} placeholder="Gilgit Baltistan" />
        </Field>
        <Field label="Avatar image URL">
          <input value={p.avatarUrl} onChange={(e) => set({ avatarUrl: e.target.value })} placeholder="https://..." />
        </Field>
      </fieldset>

      <fieldset className="blueprint__group">
        <legend>About</legend>
        <Field label="Bio">
          <textarea
            rows={4}
            value={p.bio}
            onChange={(e) => set({ bio: e.target.value })}
            placeholder="A couple of sentences about who you are and what you do."
          />
        </Field>
        <div className="ai-generate">
          <button
            type="button"
            className="btn btn--outline"
            onClick={generateWithAI}
            disabled={aiStatus === "loading"}
          >
            {aiStatus === "loading" ? "Generating…" : "✨ Generate tagline & bio with AI"}
          </button>
          <span className="ai-generate__hint">
            Uses your name, title, location & skills above. Fills in the tagline and bio for you — edit freely after.
          </span>
          {aiStatus === "error" && <span className="ai-generate__error">{aiError}</span>}
        </div>
      </fieldset>

      <fieldset className="blueprint__group">
        <legend>Skills</legend>
        <div className="chip-input">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill(e)}
            placeholder="e.g. React — press Enter"
          />
          <button type="button" onClick={addSkill}>Add</button>
        </div>
        <ul className="paper__pills">
          {(p.skills || []).map((s, i) => (
            <li key={i} className="pill pill--removable">
              {s}
              <button type="button" aria-label={`Remove ${s}`} onClick={() => removeSkill(i)}>×</button>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="blueprint__group">
        <legend>Projects</legend>
        {(p.projects || []).map((proj) => (
          <div className="project-editor" key={proj.id}>
            <Field label="Title">
              <input value={proj.title} onChange={(e) => updateProject(proj.id, { title: e.target.value })} placeholder="Project name" />
            </Field>
            <Field label="Description">
              <textarea rows={2} value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} placeholder="What it does and your role" />
            </Field>
            <Field label="Link">
              <input value={proj.link} onChange={(e) => updateProject(proj.id, { link: e.target.value })} placeholder="https://github.com/..." />
            </Field>
            <Field label="Tags (comma separated)">
              <input
                value={(proj.tags || []).join(", ")}
                onChange={(e) =>
                  updateProject(proj.id, {
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="React, Firebase, MySQL"
              />
            </Field>
            <button type="button" className="btn btn--ghost btn--danger" onClick={() => removeProject(proj.id)}>
              Remove project
            </button>
            <hr className="project-editor__divider" />
          </div>
        ))}
        <button type="button" className="btn btn--outline" onClick={addProject}>
          + Add project
        </button>
      </fieldset>

      <fieldset className="blueprint__group">
        <legend>Contact & socials</legend>
        <Field label="Email">
          <input value={p.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" />
        </Field>
        <Field label="Website">
          <input value={p.socials?.website} onChange={(e) => setSocial("website", e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="GitHub">
          <input value={p.socials?.github} onChange={(e) => setSocial("github", e.target.value)} placeholder="https://github.com/..." />
        </Field>
        <Field label="LinkedIn">
          <input value={p.socials?.linkedin} onChange={(e) => setSocial("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
        </Field>
        <Field label="Twitter / X">
          <input value={p.socials?.twitter} onChange={(e) => setSocial("twitter", e.target.value)} placeholder="https://x.com/..." />
        </Field>
      </fieldset>
    </div>
  );
}
