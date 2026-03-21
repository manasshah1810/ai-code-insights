import { toast } from "sonner";

export interface TicketMetadata {
    id: string;
    source: "Jira" | "Linear";
    title: string;
    status: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

export class IssueTrackerService {
    private jiraConfig = { host: "", apiToken: "", email: "" };
    private linearConfig = { apiKey: "" };

    /**
     * Mock implementation of fetchTicketFromJira
     */
    async fetchTicket(ticketId: string): Promise<TicketMetadata | null> {
        // For now, returning mock data until API keys are configured in Settings.
        console.log(`Fetching ticket ${ticketId} from Jira/Linear...`);

        // Simulating response
        return {
            id: ticketId,
            source: ticketId.startsWith("LIN-") ? "Linear" : "Jira",
            title: "Add new feature with AI optimization",
            status: "Merged",
            createdAt: new Date(Date.now() - 3600000 * 48), // 2 days ago
            startedAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
            completedAt: new Date(),
        };
    }

    /**
     * Updates integration configuration
     */
    updateConfig(platform: "Jira" | "Linear", config: any) {
        if (platform === "Jira") {
            this.jiraConfig = { ...this.jiraConfig, ...config };
        } else {
            this.linearConfig = { ...this.linearConfig, ...config };
        }
    }

    /**
     * Proactive check if integration is configured
     */
    isConfigured(platform: "Jira" | "Linear"): boolean {
        if (platform === "Jira") {
            return !!(this.jiraConfig.host && this.jiraConfig.apiToken);
        }
        return !!this.linearConfig.apiKey;
    }
}

export const issueTrackerService = new IssueTrackerService();

/**
 * Integration Point: Map Git Commit to Ticket and analyze Cycle Time
 */
export async function analyzeCommitProductivity(commitMsg: string, pushTime: Date) {
    const { productivityEngine } = await import("./productivity-engine");
    const ticketId = productivityEngine.extractTicketId(commitMsg);

    if (ticketId) {
        const ticket = await issueTrackerService.fetchTicket(ticketId);
        if (ticket && ticket.startedAt) {
            const minutes = productivityEngine.calculateCycleTime(ticket.startedAt, pushTime);
            console.log(`Commit ${commitMsg} mapped to Ticket ${ticketId}. Cycle Time: ${minutes} mins.`);
            return minutes;
        }
    }
    return null;
}
