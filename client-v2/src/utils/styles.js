import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and merges Tailwind classes with twMerge
 * @param {...any} inputs - Class names to combine
 * @returns {string} - Combined and merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Utility for conditional classes
 * @param {string} baseClasses - Base classes
 * @param {string} conditionalClasses - Classes to add conditionally
 * @param {boolean} condition - Whether to add conditional classes
 * @returns {string} - Combined class names
 */
export function conditionalClasses(baseClasses, conditionalClasses, condition) {
  return cn(baseClasses, condition && conditionalClasses);
}