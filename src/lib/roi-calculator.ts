/**
 * Fiscal ROI Calculator (Section 8.1 replacement)
 * Calculates financial metrics for AI adoption.
 */

export interface FiscalMetrics {
    aiCostPerLoc: number;
    manualCostPerLoc: number;
    aiCostPerFeature: number;
    manualCostPerFeature: number;
    monthlySavings: number;
    roiPercentage: number;
}

export class RoiCalculator {
    /**
     * Calculates fiscal ROI metrics
     */
    static calculate(params: {
        monthlySeatCost: number;
        manualHourlyRate: number;
        teamSize: number;
        aiLoC: number;
        manualLoC: number;
        timeSavedHours: number;
        aiFeatures: number;
        manualFeatures: number;
    }): FiscalMetrics {
        const totalAiCost = params.monthlySeatCost * params.teamSize;

        // Cost per LoC
        // Manual: estimated as (Total Manual Time * Rate) / Manual LoC. 
        // Since we don't have total manual time directly, we can estimate average manual developer hours.
        // Let's assume 160 hours/month per dev for manual baseline.
        const manualTotalTimeHours = params.teamSize * 160;
        const manualCostPerLoc = (manualTotalTimeHours * params.manualHourlyRate) / (params.manualLoC || 1);

        // AI: Incremental cost of the seat / LoC produced
        const aiCostPerLoc = totalAiCost / (params.aiLoC || 1);

        // Cost per Feature (Ticket)
        const manualCostPerFeature = (manualTotalTimeHours * params.manualHourlyRate) / (params.manualFeatures || 1);
        const aiCostPerFeature = totalAiCost / (params.aiFeatures || 1);

        // Monthly Savings: (Manual Hourly Rate * Time Saved by AI) - Seat Cost
        const totalAIGrossSavings = params.manualHourlyRate * params.timeSavedHours;
        const monthlySavings = totalAIGrossSavings - totalAiCost;

        // ROI Percentage: (Net Savings / Investment) * 100
        const roiPercentage = totalAiCost > 0 ? (monthlySavings / totalAiCost) * 100 : 0;

        return {
            aiCostPerLoc,
            manualCostPerLoc,
            aiCostPerFeature,
            manualCostPerFeature,
            monthlySavings,
            roiPercentage,
        };
    }
}
