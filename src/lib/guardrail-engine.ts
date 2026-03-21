/**
 * Security & Hallucination Guardrail Engine (Section 8.1 replacement)
 * Scans AI-generated code for common hallucination and security risks.
 */

import { z } from "zod";

export const GuardrailResultSchema = z.object({
    riskScore: z.number().min(0).max(100),
    findings: z.array(z.object({
        type: z.enum(["Hallucination", "Security", "Placeholder"]),
        severity: z.enum(["Low", "Medium", "High"]),
        message: z.string(),
    })),
});

export type GuardrailResult = z.infer<typeof GuardrailResultSchema>;

export class GuardrailEngine {
    private static MOCK_KEYS = [
        /sk-ant-api03/i,
        /sk-[a-zA-Z0-9]{48}/, // OpenAI-like
        /AKIA[0-9A-Z]{16}/,   // AWS
        /AIza[0-9A-Za-z\\-_]{35}/, // Google
        /placeholder-key/i,
        /your-api-key/i,
        /test-token/i
    ];

    private static VULNERABLE_PATTERNS = [
        { pattern: /dangerouslySetInnerHTML/g, type: "Security", message: "Use of dangerouslySetInnerHTML detected." },
        { pattern: /eval\(/g, type: "Security", message: "Use of eval() detected." },
        { pattern: /innerHTML/g, type: "Security", message: "Direct innerHTML mutation detected." },
        { pattern: /process\.env\.[A-Z0-9_]+/g, type: "Security", message: "Environment variable leak potential." }
    ];

    /**
     * Scans a code snippet for risks
     */
    static scanSnippet(code: string, installedLibs: string[] = []): GuardrailResult {
        const findings: GuardrailResult["findings"] = [];
        let riskScore = 0;

        // 1. Check for Hardcoded Placeholders/Mock Keys
        this.MOCK_KEYS.forEach(regex => {
            if (regex.test(code)) {
                findings.push({
                    type: "Placeholder",
                    severity: "High",
                    message: `Potential hardcoded secret or placeholder detected: ${regex.toString()}`
                });
                riskScore += 25;
            }
        });

        // 2. Check for Hallucinated Library Imports
        const importRegex = /(?:import|from)\s+['"]([^'.\/][^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            const lib = match[1];
            // Only check major library names (not deep imports)
            const baseLib = lib.split('/')[0];
            if (installedLibs.length > 0 && !installedLibs.includes(baseLib) && !baseLib.startsWith('@types/')) {
                findings.push({
                    type: "Hallucination",
                    severity: "Medium",
                    message: `Potentially hallucinated library import: '${baseLib}'`
                });
                riskScore += 15;
            }
        }

        // 3. Check for Vulnerable Patterns
        this.VULNERABLE_PATTERNS.forEach(({ pattern, type, message }) => {
            if (pattern.test(code)) {
                findings.push({
                    type: "Security",
                    severity: "High",
                    message
                });
                riskScore += 30;
            }
        });

        return {
            riskScore: Math.min(riskScore, 100),
            findings
        };
    }

    /**
     * Calculate Org-wide Intervention Rate
     */
    static calculateInterventionRate(totalAIFlaws: number, interventions: number): number {
        if (totalAIFlaws === 0) return 0;
        return (interventions / totalAIFlaws) * 100;
    }
}
