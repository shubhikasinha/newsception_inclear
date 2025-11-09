import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create page URLs for navigation
 */
export function createPageUrl(page: string): string {
  const routes: Record<string, string> = {
    Landing: "/",
    Dashboard: "/dashboard",
    Compare: "/compare",
    Debate: "/debate",
    Feedback: "/feedback",
    Subscriptions: "/subscriptions",
    ArticleDetails: "/article",
  };
  
  return routes[page] || "/";
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
