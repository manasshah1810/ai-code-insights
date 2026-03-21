/**
 * SHA-256 Hashing for Privacy & Compliance (Section 8.1 replacement)
 */
export async function anonymizeId(id: string | number, salt: string = "techcorp-salt"): Promise<string> {
    const msgUint8 = new TextEncoder().encode(id.toString() + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex.substring(0, 12); // Shorter for UI display
}

/**
 * Sync version for mock data mapping if needed
 */
export function anonymizeIdSync(id: string | number): string {
    // Simple fallback for sync environments (e.g. rendering loop if not pre-hashed)
    let hash = 0;
    const str = id.toString() + "static-salt";
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}
