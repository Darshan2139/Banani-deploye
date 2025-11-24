import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract a human-readable error message from any error object
 * Handles various error types: Error objects, Supabase errors, strings, etc.
 */
export function extractErrorMessage(err: any, fallback: string = 'An error occurred'): string {
  if (!err) {
    return fallback;
  }

  // If it's a string, return it directly
  if (typeof err === 'string') {
    return err;
  }

  // Try common error message properties
  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message;
  }

  // Supabase specific error properties
  if (err.error_description && typeof err.error_description === 'string') {
    return err.error_description;
  }

  // Some Supabase errors have these properties
  if (err.details && typeof err.details === 'string') {
    return err.details;
  }

  if (err.hint && typeof err.hint === 'string') {
    return err.hint;
  }

  // Check for response.error format
  if (err.error && typeof err.error.message === 'string') {
    return err.error.message;
  }

  // Try to stringify the error for debugging
  try {
    const stringified = JSON.stringify(err);
    if (stringified && stringified !== '{}' && stringified !== '[]') {
      return stringified;
    }
  } catch {
    // Ignore JSON stringify errors
  }

  // Last resort: return fallback
  return fallback;
}
