import { useEffect, useState } from "react";

type Project = {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags?: string[];
  stack?: string[];
  github?: string;
  demo?: string;
  image?: string;
  images?: string[];
  featured?: boolean;
  order?: number;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ProjectFormState = {
  title: string;
  description: string;
  longDescription: string;
  tags: string;
  stack: string;
  github: string;
  demo: string;
  imagesText: string;
  featured: boolean;
  order: number;
  published: boolean;
};

const emptyForm = (): ProjectFormState => ({
  title: "",
  description: "",
  longDescription: "",
  tags: "",
  stack: "",
  github: "",
  demo: "",
  imagesText: "",
  featured: false,
  order: 0,
  published: true,
});

const apiBase = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/projects`;
const mediaBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const resolveMediaUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${mediaBase}${value}`;
};

const toList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormState>(emptyForm());
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = token;
    }

    return headers;
  };

  const loadProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/admin/all`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible de charger les projets");
      }

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreateForm = () => {
    setEditingProject(null);
    setForm(emptyForm());
    setImageFiles([]);
    setImagePreviews([]);
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title ?? "",
      description: project.description ?? "",
      longDescription: project.longDescription ?? "",
      tags: project.tags?.join(", ") ?? "",
      stack: project.stack?.join(", ") ?? "",
      github: project.github ?? "",
      demo: project.demo ?? "",
      imagesText: (project.images?.length ? project.images : project.image ? [project.image] : []).join(", "),
      featured: Boolean(project.featured),
      order: project.order ?? 0,
      published: project.published ?? true,
    });
    setImageFiles([]);
    setImagePreviews((project.images?.length ? project.images : project.image ? [project.image] : []).map((value) => resolveMediaUrl(value)));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setForm(emptyForm());
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleChange = (field: keyof ProjectFormState, value: string | boolean | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("longDescription", form.longDescription.trim());
    payload.append("tags", toList(form.tags).join(","));
    payload.append("stack", toList(form.stack).join(","));
    payload.append("github", form.github.trim());
    payload.append("demo", form.demo.trim());
    payload.append("featured", String(form.featured));
    payload.append("order", String(Number(form.order) || 0));
    payload.append("published", String(form.published));

    const textImages = toList(form.imagesText);

    textImages.forEach((imageUrl) => {
      payload.append("images", imageUrl);
    });

    imageFiles.forEach((file) => {
      payload.append("images", file);
    });

    if (textImages.length === 0 && editingProject?.images?.length) {
      payload.append("images", editingProject.images.join(","));
    } else if (textImages.length === 0 && editingProject?.image) {
      payload.append("images", editingProject.image);
    }

    try {
      const method = editingProject ? "PUT" : "POST";
      const url = editingProject ? `${apiBase}/${editingProject._id}` : apiBase;

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible d'enregistrer le projet");
      }

      await loadProjects();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm("Supprimer ce projet ?")) return;

    setDeletingId(projectId);
    setError("");

    try {
      const res = await fetch(`${apiBase}/${projectId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible de supprimer le projet");
      }

      await loadProjects();
      if (editingProject?._id === projectId) {
        closeForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDeletingId(null);
    }
  };

  const totalProjects = projects.length;
  const publishedCount = projects.filter((project) => project.published).length;
  const featuredCount = projects.filter((project) => project.featured).length;
  const averageOrder = totalProjects ? Math.round(projects.reduce((sum, project) => sum + (project.order ?? 0), 0) / totalProjects) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-600">Gestion des projets</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Créer, modifier et publier les projets</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Cette vue pilote les données exposées sur le portfolio public et sur le dashboard admin.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadProjects}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Actualiser
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Nouveau projet
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Projets</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalProjects}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Publiés</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{publishedCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Mis en avant</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{featuredCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ordre moyen</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{averageOrder}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isFormOpen && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {editingProject ? "Modifier le projet" : "Créer un projet"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Les champs texte peuvent être utilisés tels quels sur le portfolio public.
              </p>
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
              <span className="text-sm font-medium text-slate-700">Titre</span>
              <input
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
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
              <span className="text-sm font-medium text-slate-700">Description courte</span>
              <textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </label>

            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Description longue</span>
              <textarea
                value={form.longDescription}
                onChange={(event) => handleChange("longDescription", event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tags séparés par des virgules</span>
              <input
                value={form.tags}
                onChange={(event) => handleChange("tags", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="web, ui, branding"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Stack séparée par des virgules</span>
              <input
                value={form.stack}
                onChange={(event) => handleChange("stack", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="React, Tailwind, Node"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Lien GitHub</span>
              <input
                value={form.github}
                onChange={(event) => handleChange("github", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Lien demo</span>
              <input
                value={form.demo}
                onChange={(event) => handleChange("demo", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Images par URL</span>
              <input
                value={form.imagesText}
                onChange={(event) => handleChange("imagesText", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="https://... , https://..."
              />
              <p className="text-xs text-slate-500">Sépare les URLs par des virgules si tu veux garder des images externes.</p>
            </label>

            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Images du projet</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
              />
              <p className="text-xs text-slate-500">
                Choisis une ou plusieurs images locales. Elles seront affichées en slider sur le portfolio.
              </p>
            </label>

            {(imagePreviews.length > 0 || form.imagesText.trim()) && (
              <div className="lg:col-span-2">
                <p className="mb-2 text-sm font-medium text-slate-700">Aperçu</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={`${preview}-${index}`}
                      src={preview}
                      alt={`Aperçu ${index + 1}`}
                      className="h-48 w-full rounded-2xl border border-slate-200 object-cover"
                    />
                  ))}
                  {imagePreviews.length === 0 && toList(form.imagesText).map((imageUrl, index) => (
                    <img
                      key={`${imageUrl}-${index}`}
                      src={resolveMediaUrl(imageUrl)}
                      alt={`Aperçu ${index + 1}`}
                      className="h-48 w-full rounded-2xl border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 lg:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => handleChange("featured", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Mis en avant
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => handleChange("published", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Publié
              </label>
            </div>

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
                {saving ? "Enregistrement..." : editingProject ? "Modifier" : "Créer"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Liste des projets</h3>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">Chargement des projets...</div>
        ) : projects.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Aucun projet pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Projet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Visibilité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Ordre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Mise en avant</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {projects.map((project) => (
                  <tr key={project._id} className="align-top">
                    <td className="px-6 py-4">
                      <div className="max-w-xl">
                        <p className="font-semibold text-slate-900">{project.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{project.description}</p>
                        {((project.images?.length ?? 0) > 0 || project.image) && (
                          <div className="mt-3 flex items-center gap-3">
                            <img
                              src={resolveMediaUrl(project.images?.[0] ?? project.image)}
                              alt={project.title}
                              className="h-28 w-40 rounded-xl object-cover"
                            />
                            {(project.images?.length ?? 0) > 1 && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                {project.images?.length} photos
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          {(project.tags ?? []).slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${project.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {project.published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{project.order ?? 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${project.featured ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-600"}`}>
                        {project.featured ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(project)}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project._id)}
                          disabled={deletingId === project._id}
                          className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                        >
                          {deletingId === project._id ? "Suppression..." : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
