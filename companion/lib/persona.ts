import type { Persona } from "./types";

export const PERSONAS: { id: Persona; label: string; description: string; icon: string }[] = [
  { id: "standard",         label: "Standard fan",       description: "Regular ticket holder", icon: "person" },
  { id: "family",           label: "Family with kids",    description: "Family-mode routing + reunification", icon: "groups" },
  { id: "pmr",              label: "Reduced mobility",    description: "Step-free lanes, slower stagger", icon: "accessible" },
  { id: "hearing_impaired", label: "Hearing-impaired",    description: "Text + vibration only, no audio", icon: "hearing_disabled" },
  { id: "away_fan",         label: "Away-team supporter", description: "Segregated gate + lane", icon: "shield" },
  { id: "first_time",       label: "First-time visitor",  description: "Slower pace + more guidance", icon: "explore" },
];
