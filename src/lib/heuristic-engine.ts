import { z } from "zod";

const HeuristicResultSchema = z.object({
    source: z.enum(["AI", "Manual", "Uncertain"]),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
});

export type HeuristicResult = z.infer<typeof HeuristicResultSchema>;

export interface CommitMetadata {
    id: string;
    diff: string;
    locAdded: number;
    message: string;
    timestamp: Date;
    previousCommitTimestamp?: Date;
}

const GENERIC_MESSAGES = [
    "update",
    "fix",
    "chore",
    "refactor",
    "feat",
    "wip",
    "automated",
    "sync",
    "upd",
    "changes",
];

export class GitHeuristicEngine {
    /**
     * Main entry point to analyze a commit for AI signatures using metadata heuristics.
     */
    async analyzeCommit(commit: CommitMetadata): Promise<HeuristicResult> {
        const velocityResult = this.checkVelocityThreshold(commit);
        if (velocityResult.confidence > 0.8 && velocityResult.source === "AI") {
            return velocityResult;
        }

        const signatureResult = this.analyzeSignatures(commit.diff);

        // Weighted combination
        if (velocityResult.confidence > signatureResult.confidence) {
            return velocityResult;
        }

        return signatureResult;
    }

    private isGenericMessage(message: string): boolean {
        const lower = message.toLowerCase().trim();
        return (
            lower.length < 10 ||
            GENERIC_MESSAGES.some(m => lower === m || lower.startsWith(m + ":") || lower.startsWith(m + "("))
        );
    }

    /**
     * Requirement: High-volume LoC changes within short time intervals + generic message.
     */
    private checkVelocityThreshold(commit: CommitMetadata): HeuristicResult {
        // 500+ LoC with generic message
        if (commit.locAdded >= 500 && this.isGenericMessage(commit.message)) {
            return {
                source: "AI",
                confidence: 0.85,
                reason: `High velocity detected: ${commit.locAdded} LoC added in a single commit with a generic message ("${commit.message}").`,
            };
        }

        // Checking time intervals (if previous timestamp is available)
        if (commit.previousCommitTimestamp) {
            const timeDiffSeconds = (commit.timestamp.getTime() - commit.previousCommitTimestamp.getTime()) / 1000;
            // High LoC (e.g. 200+) in very short time (e.g. < 2 mins)
            if (commit.locAdded > 200 && timeDiffSeconds < 120) {
                return {
                    source: "AI",
                    confidence: 0.9,
                    reason: `Abnormal coding speed: ${commit.locAdded} LoC in ${Math.round(timeDiffSeconds)}s.`,
                };
            }
        }

        return { source: "Uncertain", confidence: 0, reason: "No velocity anomaly detected." };
    }

    /**
     * Analyze diff for 'AI Signatures' (formatting, lack of typos, etc.)
     */
    private analyzeSignatures(diff: string): HeuristicResult {
        const indicators: string[] = [];
        let confidence = 0;

        // 1. Lack of typos in comments (Heuristic: no common typos in long comments)
        // For a real app, this would use a spellcheck library. 
        // Here we use a simpler heuristic: high comment-to-code ratio in new blocks with perfect capitalization/punctuation.
        const commentLines = diff.split("\n").filter(l => l.trim().startsWith("+") && l.includes("//") || l.includes("/*")).length;
        if (commentLines > 5) {
            indicators.push("highly structured comments");
            confidence += 0.2;
        }

        // 2. Specific formatting patterns (e.g. placeholder comments like // TODO: implement, etc.)
        if (diff.includes("// TODO:") || diff.includes("/* TODO:")) {
            // AI often adds these if prompted
        }

        // 3. Perfect indentation or specific boilerplate (Cursor/Copilot spesso producono certi pattern)
        // This is hard to detect in a generic way, so we'll look for "Block boilerplate"
        if (diff.match(/try\s*\{\s*.*\s*\}\s*catch\s*\(.*\)\s*\{\s*.*\s*\}/s)) {
            // Very standard block formatting
        }

        if (confidence > 0) {
            return {
                source: "AI",
                confidence: Math.min(confidence, 0.6),
                reason: `Potential AI signatures: ${indicators.join(", ")}.`,
            };
        }

        return { source: "Manual", confidence: 0.1, reason: "Code patterns appear consistent with manual writing." };
    }
}

export const heuristicEngine = new GitHeuristicEngine();
