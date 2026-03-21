import { heuristicEngine, type CommitMetadata } from "./heuristic-engine";
import { attributionEngine, type AttributionResult } from "./attribution-engine";
import { socketService } from "./socket-service";
import { toast } from "sonner";

/**
 * Requirement (Section 8.3 Replacement):
 * This service acts as the VCS Webhook listener that processes every push event.
 * It replaces the 'Local Log Ingestion Agent' by using the Git Metadata Heuristic Engine.
 */
export class VCSWebhookHandler {
    /**
     * Mock entry point for a VCS Webhook (e.g., GitHub push event)
     */
    async onPushEvent(commitPayload: any) {
        console.log("Push event received, analyzing commit...");

        // 1. Data transformation: map raw webhook data to our Metadata format
        // For now assuming a payload with commit info.
        const commit: CommitMetadata = {
            id: commitPayload.id || "commit-" + Date.now(),
            diff: commitPayload.diff || "",
            locAdded: commitPayload.stats?.additions || 0,
            message: commitPayload.message || "",
            timestamp: new Date(),
            previousCommitTimestamp: undefined, // Ideally fetch from historical data
        };

        // 2. Perform Heuristic Analysis (Fast, automatic signature detection)
        const heuristicResult = await heuristicEngine.analyzeCommit(commit);

        // 3. Fallback to LLM for higher accuracy (Section 8.1 we refactored before)
        // If heuristic is low-confidence, we can use the LLM to verify.
        let finalResult = heuristicResult;
        if (heuristicResult.source === "Uncertain" || heuristicResult.confidence < 0.5) {
            console.log("Heuristic result uncertain, falling back to LLM Attribution Engine...");
            const llmResult = await attributionEngine.attributeSnippet(commit.diff);
            finalResult = {
                ...llmResult,
                reason: `[LLM-Augmented] ${llmResult.reason}`
            };
        }

        // 4. Persistence / Notify Dashboard (placeholder for store update)
        console.log(`Analyzed commit ${commit.id}: ${finalResult.source} with ${finalResult.confidence} confidence.`);

        // 5. Broadcast real-time update to dashboard (Section 8.2 WebSocket Integration)
        socketService.broadcast('METRIC_UPDATE', {
            commitId: commit.id,
            source: finalResult.source,
            confidence: finalResult.confidence,
            timestamp: new Date().toISOString()
        });

        return finalResult;
    }
}

export const vcsWebhookHandler = new VCSWebhookHandler();
