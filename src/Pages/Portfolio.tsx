import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SKILL_ICON_MAP, SkillIcon } from "../lib/skillIcons";

const highlights = [
  { label: "Projets livrés", value: "0" },
  { label: "Clients accompagnés", value: "8" },
  { label: "Années d'expérience", value: "4" },
];

type PortfolioProject = {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  images?: string[];
  tags?: string[];
  stack?: string[];
  github?: string;
  demo?: string;
};

type PortfolioSkill = {
  _id: string;
  name: string;
  category: "frontend" | "backend" | "devops" | "other";
  level: number;
  icon?: string;
  order?: number;
};

const services = [
  "Conception de portfolio et landing pages",
  "Intégration React / Tailwind",
  "Optimisation des parcours utilisateur",
  "Mise en place d'un dashboard de suivi",
];

const processSteps = [
  {
    step: "01",
    title: "Cadrage",
    text: "On définit l'objectif, les priorités et le rendu attendu avant de produire quoi que ce soit.",
  },
  {
    step: "02",
    title: "Conception",
    text: "Je structure l'interface pour qu'elle soit lisible, rapide à naviguer et cohérente visuellement.",
  },
  {
    step: "03",
    title: "Livraison",
    text: "Le site est intégré, testé et prêt à être mis en ligne sans noyer l'utilisateur dans le superflu.",
  },
];

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const mediaBase = apiBase;

const resolveMediaUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${mediaBase}${value}`;
};

const getProjectImages = (project: PortfolioProject) => {
  const images = (project.images ?? []).filter(Boolean);

  if (images.length > 0) {
    return images;
  }

  return project.image ? [project.image] : [];
};

type ProjectImageSliderProps = {
  images: string[];
  title: string;
  variant?: "card" | "detail";
};

function ProjectImageSlider({ images, title, variant = "card" }: ProjectImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % images.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-300 ${variant === "detail" ? "h-72" : "h-48"}`}>
        Aucune image
      </div>
    );
  }

  const goToPrevious = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCurrentIndex((previous) => (previous - 1 + images.length) % images.length);
  };

  const goToNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCurrentIndex((previous) => (previous + 1) % images.length);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 ${variant === "detail" ? "h-72" : "h-48"}`}>
      <img
        src={resolveMediaUrl(images[currentIndex])}
        alt={`${title} - image ${currentIndex + 1}`}
        className="h-full w-full object-cover"
      />

      {images.length > 1 && (
        <>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs text-white backdrop-blur">
              {currentIndex + 1}/{images.length}
            </span>
          </div>

          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
            <button
              type="button"
              onClick={goToPrevious}
              className="rounded-full bg-slate-950/70 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-slate-950"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="rounded-full bg-slate-950/70 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-slate-950"
            >
              Next
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3">
            {images.map((_, index) => (
              <button
                key={`${title}-dot-${index}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition ${index === currentIndex ? "w-8 bg-cyan-300" : "w-2 bg-white/60"}`}
                aria-label={`Voir l'image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type ProjectCardProps = {
  project: PortfolioProject;
  onOpen: (project: PortfolioProject) => void;
};

function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const images = getProjectImages(project);

  return (
    <article
      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(project);
        }
      }}
    >
      <ProjectImageSlider images={images} title={project.title} />

      <span className="mt-4 inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
        {(project.tags && project.tags[0]) || (project.stack && project.stack[0]) || "Projet"}
      </span>

      <h3 className="mt-4 text-xl font-semibold text-white">{project.title}</h3>

      <div className="mt-6 flex flex-wrap gap-3">
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
          >
            Voir la demo
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Code source
          </a>
        )}
      </div>
    </article>
  );
}

export default function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [skills, setSkills] = useState<PortfolioSkill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError("");

      try {
        const res = await fetch(`${apiBase}/api/projects`);
        if (!res.ok) {
          throw new Error("Impossible de charger les projets");
        }

        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setProjectsError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      setSkillsLoading(true);
      setSkillsError("");

      try {
        const res = await fetch(`${apiBase}/api/skills`);
        if (!res.ok) {
          throw new Error("Impossible de charger les compétences");
        }

        const data = await res.json();
        setSkills(Array.isArray(data) ? data : []);
      } catch (err) {
        setSkillsError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    if (projects.length <= 3) return;

    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projects.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [projects.length]);

  useEffect(() => {
    if (!projects.length || projects.length <= 3) {
      setCurrentSlide(0);
      return;
    }

    if (currentSlide >= projects.length) {
      setCurrentSlide(0);
    }
  }, [projects.length, currentSlide]);

  const goToPrevious = () => {
    if (projects.length <= 3) return;
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToNext = () => {
    if (projects.length <= 3) return;
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const visibleProjects =
    projects.length <= 3
      ? projects
      : Array.from({ length: 3 }, (_, offset) => projects[(currentSlide + offset) % projects.length]);

  const selectedImages = selectedProject ? getProjectImages(selectedProject) : [];

  const openDetails = (project: PortfolioProject) => {
    setSelectedProject(project);
  };

  const closeDetails = () => {
    setSelectedProject(null);
  };

  const dynamicHighlights = highlights.map((item) =>
    item.label === "Projets livrés"
      ? { ...item, value: projectsLoading ? "..." : String(projects.length) }
      : item
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,1))]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-10">
          <div className="mb-8 flex items-center justify-between text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              Portfolio / Project Manager
            </span>
            <Link to="/login" className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-cyan-100 transition hover:bg-cyan-400/20">
              Se connecter
            </Link>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-cyan-300">Développeur frontend</p>
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Je crée des portfolios et interfaces qui mettent le travail en avant.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Cette page sert d'accueil publique. Le login reste disponible sur une route dédiée, pendant que le portfolio prend la première place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#projets" className="rounded-full bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-100">
                  Voir les projets
                </a>
                <Link to="/login" className="rounded-full border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/10">
                  Accéder au dashboard
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {dynamicHighlights.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-slate-900/90 p-6">
                <p className="text-sm text-cyan-300">Disponible pour</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Freelance, portfolio et dashboard</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Interface claire, sections visibles dès l'arrivée, et parcours orienté vers la prise de contact.
                </p>

                <div className="mt-6 space-y-3 text-sm text-slate-200">
                  {services.map((service) => (
                    <div key={service} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projets" className="border-t border-white/10 bg-slate-950 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Sélection</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Quelques réalisations</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              Une structure simple pour montrer les projets principaux sans forcer l'utilisateur à passer par la connexion.
            </p>
          </div>

          {projectsLoading ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Chargement des projets...
            </div>
          ) : projectsError ? (
            <div className="rounded-[1.75rem] border border-rose-300/30 bg-rose-500/10 p-6 text-sm text-rose-100">
              {projectsError}
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Aucun projet publié pour le moment.
            </div>
          ) : (
            <div className="space-y-6">
              {projects.length > 3 && (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    Prec
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    Suiv
                  </button>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-3">
                {visibleProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} onOpen={openDetails} />
                ))}
              </div>

              {projects.length > 3 && (
                <div className="flex flex-wrap gap-2">
                  {projects.map((project, index) => (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2.5 rounded-full transition ${index === currentSlide ? "w-10 bg-cyan-300" : "w-2.5 bg-white/30 hover:bg-white/50"}`}
                      aria-label={`Aller au projet ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" onClick={closeDetails}>
              <div
                className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-slate-900 p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Projet</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{selectedProject.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    Fermer
                  </button>
                </div>

                <div className="mb-6">
                  <ProjectImageSlider key={selectedProject._id} images={selectedImages} title={selectedProject.title} variant="detail" />
                </div>

                <p className="text-sm leading-7 text-slate-200">{selectedProject.description}</p>

                {selectedProject.longDescription && (
                  <p className="mt-4 text-sm leading-7 text-slate-300">{selectedProject.longDescription}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {(selectedProject.tags ?? []).map((tag) => (
                    <span key={`${selectedProject._id}-tag-${tag}`} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {tag}
                    </span>
                  ))}
                  {(selectedProject.stack ?? []).map((item) => (
                    <span key={`${selectedProject._id}-stack-${item}`} className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/60 px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Compétences</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Stack et approche</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
              Une base claire pour présenter le travail de manière crédible, sans forcer l'accès au dashboard privé.
            </p>
            {skillsLoading ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Chargement des compétences...</div>
            ) : skillsError ? (
              <div className="mt-8 rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4 text-sm text-rose-100">{skillsError}</div>
            ) : skills.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Aucune compétence pour le moment.</div>
            ) : (
              <div className="mt-8 space-y-4">
                {skills.map((skill) => (
                  <div key={skill._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-100">
                        <SkillIcon iconKey={skill.icon} className="h-4 w-4" />
                        {!SKILL_ICON_MAP[skill.icon ?? ""] && skill.icon ? <span>{skill.icon}</span> : null}
                        <span>{skill.name}</span>
                      </p>
                      <p className="text-xs font-semibold text-cyan-200">{skill.level}%</p>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400" style={{ width: `${Math.max(0, Math.min(100, skill.level))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {processSteps.map((item) => (
              <div key={item.step} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-cyan-300">{item.step}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Contact</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Prêt à lancer ton portfolio ou ton dashboard</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-100/80">
                La vitrine publique est séparée du login. On pourra ensuite brancher la création, l'édition et l'automatisation de mise à jour sur le VPS via GitHub.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="rounded-full bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-100">
                Me contacter
              </Link>
              <Link to="/login" className="rounded-full border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10">
                Accès admin
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}