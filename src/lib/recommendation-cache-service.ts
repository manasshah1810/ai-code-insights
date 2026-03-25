/**
 * Recommendation Cache Service
 * Manages single-call caching of AI recommendations in localStorage
 * Ensures only one API call is made per user session across all pages
 */

import { type Recommendation } from "./ai-completion-service";

const CACHE_KEY_PREFIX = "ai_recommendations_";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedRecommendations {
  role: "Admin" | "Manager" | "Developer";
  data: Recommendation[];
  timestamp: number;
  metrics?: any; // Store metrics used to generate these recommendations
}

/**
 * Generate a unique cache key based on role and metrics
 */
function getCacheKey(role: string): string {
  return `${CACHE_KEY_PREFIX}${role}`;
}

/**
 * Check if cache is valid (exists and not expired)
 */
function isCacheValid(cached: CachedRecommendations | null): boolean {
  if (!cached) return false;
  const age = Date.now() - cached.timestamp;
  return age < CACHE_EXPIRY_MS;
}

/**
 * Get cached recommendations from localStorage
 */
export function getCachedRecommendations(role: "Admin" | "Manager" | "Developer"): Recommendation[] | null {
  try {
    const key = getCacheKey(role);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedRecommendations = JSON.parse(cached);
    if (!isCacheValid(parsed)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Failed to read recommendation cache:", error);
    return null;
  }
}

/**
 * Store recommendations in localStorage
 */
export function cacheRecommendations(
  role: "Admin" | "Manager" | "Developer",
  recommendations: Recommendation[],
  metrics?: any
): void {
  try {
    const key = getCacheKey(role);
    const cacheData: CachedRecommendations = {
      role,
      data: recommendations,
      timestamp: Date.now(),
      metrics,
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Failed to cache recommendations:", error);
  }
}

/**
 * Clear cached recommendations for a specific role
 */
export function clearCacheForRole(role: "Admin" | "Manager" | "Developer"): void {
  try {
    const key = getCacheKey(role);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear recommendation cache:", error);
  }
}

/**
 * Clear all cached recommendations
 */
export function clearAllRecommendationCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to clear all recommendation cache:", error);
  }
}

/**
 * Get cache age in milliseconds (-1 if not cached)
 */
export function getCacheAge(role: "Admin" | "Manager" | "Developer"): number {
  try {
    const key = getCacheKey(role);
    const cached = localStorage.getItem(key);
    if (!cached) return -1;

    const parsed: CachedRecommendations = JSON.parse(cached);
    return Date.now() - parsed.timestamp;
  } catch (error) {
    return -1;
  }
}
