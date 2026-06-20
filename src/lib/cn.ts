import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GRADIENTS: Record<string, string> = {
  aurora: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
  crimson: "linear-gradient(135deg,#200122,#6f0000)",
  sunset: "linear-gradient(135deg,#42275a,#734b6d)",
  graphite: "linear-gradient(135deg,#232526,#414345)",
  violet: "linear-gradient(135deg,#3a1c71,#5b3fd6)",
  midnight: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
  ember: "linear-gradient(135deg,#f12711,#f5af19)",
  ocean: "linear-gradient(135deg,#2193b0,#6dd5ed)",
};

export function gradientFor(key: string) {
  return GRADIENTS[key] || GRADIENTS.violet;
}
