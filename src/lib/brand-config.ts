/**
 * Centralized branding configuration for multi-brand (white-label) support.
 */

export const BRAND_CONFIG = {
    company: {
        name: "Company AI-Code-Insights",
        logo: "ACI",
    },
    persistent: {
        name: "persistent AI-Code-Insights",
        logo: "/persistent-logo.png",
    },
    cogniify: {
        name: "Cogniify AI-Code-Insights",
        logo: "/cogniify-logo.png",
    }
};

// Types for brand keys
export type BrandKey = keyof typeof BRAND_CONFIG;

// Detect current brand from environment variable
// Support for both process.env (Standard/Next) and import.meta.env (Vite)
const rawBrand = (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_BRAND : undefined) ||
    (import.meta.env?.VITE_BRAND) ||
    (import.meta.env?.NEXT_PUBLIC_BRAND) ||
    "company";

// Normalize to lowercase for matching
const brand = rawBrand.toLowerCase();

/**
 * The configuration for the current brand.
 */
export const currentBrand = (BRAND_CONFIG[brand as BrandKey] || BRAND_CONFIG.company) as {
    name: string;
    logo: string;
};
