import { useEffect, useMemo, useState } from "react";
import { SKILL_ICON_MAP, SKILL_ICON_OPTIONS, SkillIcon } from "../lib/skillIcons";

type Skill = {
  _id: string;
  name: string;
  category: "frontend" | "backend" | "devops" | "other";
  level: number;
  icon?: string;
  order?: number;
};

type SkillFormState = {
  name: string;
  category: Skill["category"];
  level: number;
  icon: string;
  order: number;
};

const emptyForm = (): SkillFormState => ({
  name: "",
  category: "other",
  level: 50,
  icon: "",
  order: 0,
});

const apiBase = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/skills`;

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form, setForm] = useState<SkillFormState>(emptyForm());

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    };
  };

  const loadSkills = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiBase);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible de charger les compétences");
      }

      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const grouped = useMemo(() => {
    const buckets: Record<Skill["category"], Skill[]> = {
      frontend: [],
      backend: [],
      devops: [],
      other: [],
    };

    skills.forEach((skill) => {
      buckets[skill.category]?.push(skill);
    });

    return buckets;
  }, [skills]);

  const openCreateForm = () => {
    setEditingSkill(null);
    setForm(emptyForm());
    setIsFormOpen(true);
  };

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      icon: skill.icon ?? "",
      order: skill.order ?? 0,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingSkill(null);
    setForm(emptyForm());
    setIsFormOpen(false);
  };

  const handleChange = (field: keyof SkillFormState, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      category: form.category,
      level: Math.max(0, Math.min(100, Number(form.level) || 0)),
      icon: form.icon.trim(),
      order: Number(form.order) || 0,
    };

    try {
      const method = editingSkill ? "PUT" : "POST";
      const url = editingSkill ? `${apiBase}/${editingSkill._id}` : apiBase;

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible d'enregistrer la compétence");
      }

      await loadSkills();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette compétence ?")) return;

    setDeletingId(id);
    setError("");

    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible de supprimer la compétence");
      }

      await loadSkills();
      if (editingSkill?._id === id) {
        closeForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDeletingId(null);
    }
  };

  const categoryLabel: Record<Skill["category"], string> = {
    frontend: "Frontend",
    backend: "Backend",
    devops: "DevOps",
    other: "Autre",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-600">Gestion des compétences</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Nom, catégorie et pourcentage depuis le back</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Le portfolio lit ces compétences en public via l'API et affiche automatiquement le niveau en pourcentage.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadSkills}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Actualiser
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Nouvelle compétence
          </button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {isFormOpen && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{editingSkill ? "Modifier la compétence" : "Créer une compétence"}</h3>
              <p className="mt-1 text-sm text-slate-500">Le niveau est une valeur de 0 à 100.</p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Fermer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nom</span>
              <input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Catégorie</span>
              <select
                value={form.category}
                onChange={(event) => handleChange("category", event.target.value as Skill["category"])}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="devops">DevOps</option>
                <option value="other">Autre</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Niveau (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.level}
                onChange={(event) => handleChange("level", Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Ordre</span>
              <input
                type="number"
                value={form.order}
                onChange={(event) => handleChange("order", Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Icône</span>
              <div className="flex items-center gap-3">
                <select
                value={form.icon}
                onChange={(event) => handleChange("icon", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  {SKILL_ICON_OPTIONS.map((option) => (
                    <option key={option.value || "none"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                  <SkillIcon iconKey={form.icon} className="h-5 w-5" />
                </div>
              </div>
            </label>

            <div className="flex justify-end gap-3 lg:col-span-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : editingSkill ? "Modifier" : "Créer"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {(Object.keys(grouped) as Skill["category"][]).map((category) => (
          <section key={category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{categoryLabel[category]}</h3>

            {loading ? (
              <p className="mt-4 text-sm text-slate-500">Chargement...</p>
            ) : grouped[category].length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Aucune compétence dans cette catégorie.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {grouped[category].map((skill) => (
                  <div key={skill._id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="inline-flex items-center gap-2 font-medium text-slate-900">
                        <SkillIcon iconKey={skill.icon} className="h-4 w-4" />
                        {!SKILL_ICON_MAP[skill.icon ?? ""] && skill.icon ? <span>{skill.icon}</span> : null}
                        <span>{skill.name}</span>
                      </p>
                      <p className="text-sm font-semibold text-cyan-700">{skill.level}%</p>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${skill.level}%` }} />
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(skill)}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(skill._id)}
                        disabled={deletingId === skill._id}
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        {deletingId === skill._id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}