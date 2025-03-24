// utilitaire pour la gestion des classes css dans l'application
// combine clsx (gestion conditionnelle des classes) et tailwind-merge (fusion intelligente des classes tailwind)

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 