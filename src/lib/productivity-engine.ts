import { z } from "zod";

const ProductivityMetricSchema = z.object({
    taskId: z.string(),
    source: z.enum(["AI", "Manual"]),
    cycleTimeMinutes: z.number(),
    complexity: z.enum(["Low", "Medium", "High"]),
    isMerged: z.boolean(),
});

export type ProductivityMetric = z.infer<typeof ProductivityMetricSchema>;

export interface ROIData {
    aiCycleTimeAvg: number;
    manualCycleTimeAvg: number;
    velocityBoostPercent: number;
    timeSavedHours: number;
}

export class ProductivityEngine {
    /**
     * Extract ticket ID from branch name or commit message.
     * Pattern: PROJ-123 or ABC-456
     */
    extractTicketId(text: string): string | null {
        const match = text.match(/([A-Z]{2,10}-\d+)/);
        return match ? match[1] : null;
    }

    /**
     * Calculate Cycle Time from Ticket Start to PR Merge.
     */
    calculateCycleTime(startTime: Date, mergeTime: Date): number {
        const diffMs = mergeTime.getTime() - startTime.getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60))); // Minutes
    }

    /**
     * Compares Cycle Time of AI-heavy tasks vs Manual tasks.
     */
    calculateROI(metrics: ProductivityMetric[]): ROIData {
        const aiTasks = metrics.filter(m => m.source === "AI" && m.isMerged);
        const manualTasks = metrics.filter(m => m.source === "Manual" && m.isMerged);

        const aiCycleTimeAvg = aiTasks.length > 0
            ? aiTasks.reduce((sum, t) => sum + t.cycleTimeMinutes, 0) / aiTasks.length
            : 0;

        const manualCycleTimeAvg = manualTasks.length > 0
            ? manualTasks.reduce((sum, t) => sum + t.cycleTimeMinutes, 0) / manualTasks.length
            : 0;

        // ROI = (Manual Avg - AI Avg) / Manual Avg
        let velocityBoostPercent = 0;
        if (manualCycleTimeAvg > 0) {
            velocityBoostPercent = ((manualCycleTimeAvg - aiCycleTimeAvg) / manualCycleTimeAvg) * 100;
        }

        // Rough estimation of total time saved in hours
        const timeSavedHours = (manualCycleTimeAvg - aiCycleTimeAvg) * aiTasks.length / 60;

        return {
            aiCycleTimeAvg,
            manualCycleTimeAvg,
            velocityBoostPercent: parseFloat(velocityBoostPercent.toFixed(1)),
            timeSavedHours: parseFloat(timeSavedHours.toFixed(1)),
        };
    }
}

export const productivityEngine = new ProductivityEngine();
