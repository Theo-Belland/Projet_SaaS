import type { ComponentType } from "react";
import {
  Blocks,
  Braces,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Layers,
  Palette,
  Server,
  ShieldCheck,
  Workflow,
  Wrench,
} from "lucide-react";
import {
  SiCss,
  SiDocker,
  SiExpress,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";

type SkillIconComponent = ComponentType<{ className?: string }>;

export const SKILL_ICON_MAP: Record<string, SkillIconComponent> = {
  react: SiReact,
  html5: SiHtml5,
  css3: SiCss,
  javascript: SiJavascript,
  typescript: SiTypescript,
  nodejs: SiNodedotjs,
  express: SiExpress,
  mongodb: SiMongodb,
  docker: SiDocker,
  tailwind: SiTailwindcss,
  git: SiGit,
  github: SiGithub,
  vue: SiVuedotjs,
  code: Code2,
  braces: Braces,
  database: Database,
  cloud: Cloud,
  "git-branch": GitBranch,
  palette: Palette,
  workflow: Workflow,
  security: ShieldCheck,
  layers: Layers,
  blocks: Blocks,
  server: Server,
  tools: Wrench,
};

export const SKILL_ICON_OPTIONS = [
  { value: "", label: "Aucune" },
  { value: "react", label: "React" },
  { value: "html5", label: "HTML5" },
  { value: "css3", label: "CSS3" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "nodejs", label: "Node.js" },
  { value: "express", label: "Express" },
  { value: "mongodb", label: "MongoDB" },
  { value: "docker", label: "Docker" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "git", label: "Git" },
  { value: "github", label: "GitHub" },
  { value: "vue", label: "Vue" },
  { value: "code", label: "Code" },
  { value: "braces", label: "Braces" },
  { value: "database", label: "Database" },
  { value: "server", label: "Server" },
  { value: "cloud", label: "Cloud" },
  { value: "git-branch", label: "Git Branch" },
  { value: "palette", label: "Palette" },
  { value: "workflow", label: "Workflow" },
  { value: "security", label: "Security" },
  { value: "layers", label: "Layers" },
  { value: "blocks", label: "Blocks" },
  { value: "tools", label: "Tools" },
];

type SkillIconProps = {
  iconKey?: string;
  className?: string;
};

export function SkillIcon({ iconKey, className = "h-4 w-4" }: SkillIconProps) {
  if (!iconKey) return null;
  const Icon = SKILL_ICON_MAP[iconKey];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}
