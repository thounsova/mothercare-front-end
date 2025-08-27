// ./app/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Use ClassValue[] instead of any[]
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
