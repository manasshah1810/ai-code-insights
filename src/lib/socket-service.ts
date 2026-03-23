/**
 * WebSockets Simulation Service (Section 8.2 replacement)
 * Replaces polling with event-driven streams for real-time dashboard updates.
 * 
 * Generates rich commit-level telemetry data for the Real-time Telemetry feed.
 * Timing: First commit appears after ~5s, subsequent commits every 3-5 minutes.
 * 
 * This is a TRUE SINGLETON — only one stream runs globally regardless of how
 * many components mount/unmount. Events are pushed to the Zustand store so they
 * persist across navigation and reloads.
 */

import { users, teams, repositories, aiTools } from "@/data/dashboard-data";

type SocketEvent = 'METRIC_UPDATE' | 'VCS_EVENT' | 'SECURITY_ALERT';

type Listener = (data: any) => void;

// ─── Commit message templates ────────────────────────────────────────────────
const COMMIT_PREFIXES = [
    "feat", "fix", "refactor", "chore", "perf", "docs", "test", "ci", "style", "build"
];

const COMMIT_DESCRIPTIONS: Record<string, string[]> = {
    "feat": [
        "Add user authentication middleware",
        "Implement real-time notification system",
        "Add dark mode support for dashboard",
        "Create AI model performance tracker",
        "Implement batch processing pipeline",
        "Add WebSocket connection pooling",
        "Implement rate limiting for API endpoints",
        "Add multi-tenant data isolation layer",
        "Create automated report generation",
        "Implement SSO integration with SAML",
    ],
    "fix": [
        "Resolve memory leak in event listener",
        "Fix race condition in DB connection pool",
        "Correct timezone handling for cron jobs",
        "Fix broken pagination on search results",
        "Resolve CORS issue on staging environment",
        "Fix null pointer in user profile serializer",
        "Correct OAuth token refresh logic",
        "Fix CSS overflow in mobile navigation",
        "Resolve flaky test in CI pipeline",
        "Fix incorrect metric aggregation formula",
    ],
    "refactor": [
        "Optimize database query for analytics dashboard",
        "Restructure service layer for better testability",
        "Migrate legacy REST endpoints to GraphQL",
        "Consolidate duplicate validation logic",
        "Extract shared utilities to common library",
        "Simplify state management with Zustand",
        "Decouple business logic from controller layer",
        "Standardize error handling across microservices",
        "Replace callback patterns with async/await",
        "Modularize CSS into component-scoped styles",
    ],
    "chore": [
        "Upgrade dependencies to latest versions",
        "Update CI/CD pipeline configuration",
        "Configure ESLint strict rules for TypeScript",
        "Add Dockerfile for containerized deployment",
        "Update README with setup instructions",
    ],
    "perf": [
        "Reduce bundle size by 40% with tree shaking",
        "Implement Redis caching for hot queries",
        "Optimize image loading with lazy rendering",
        "Add connection pooling to reduce DB latency",
        "Implement virtual scrolling for large datasets",
    ],
    "test": [
        "Add integration tests for payment flow",
        "Create E2E tests for onboarding wizard",
        "Add unit tests for AI attribution engine",
        "Implement snapshot tests for UI components",
        "Add load testing scripts for API endpoints",
    ],
};

export interface CommitEvent {
    commitId: string;
    commitHeading: string;
    commitDescription: string;
    commitPrefix: string;
    authorName: string;
    authorRole: string;
    authorId: number;
    teamName: string;
    teamId: string;
    repository: string;
    linesAdded: number;
    linesAI: number;
    linesManual: number;
    aiPercent: number;
    tokensUsed: number;
    aiToolSplit: { tool: string; icon: string; color: string; percent: number; lines: number }[];
    source: "AI" | "Manual" | "Hybrid";
    confidence: number;
    timestamp: string;
}

function generateCommitId(): string {
    const chars = "0123456789abcdef";
    let id = "";
    for (let i = 0; i < 40; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateCommitEvent(): CommitEvent {
    // Pick a random user
    const user = users[Math.floor(Math.random() * users.length)];
    const team = teams.find(t => t.id === user.teamId) || teams[0];
    const teamRepos = repositories.filter(r => r.team === team.name);
    const repo = teamRepos.length > 0
        ? teamRepos[Math.floor(Math.random() * teamRepos.length)]
        : repositories[Math.floor(Math.random() * repositories.length)];

    // Pick commit type and message
    const prefix = COMMIT_PREFIXES[Math.floor(Math.random() * COMMIT_PREFIXES.length)];
    const descriptions = COMMIT_DESCRIPTIONS[prefix] || COMMIT_DESCRIPTIONS["feat"];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const heading = `${prefix}: ${description}`;

    // Generate realistic line counts
    const linesAdded = Math.floor(Math.random() * 350) + 15;
    const aiPercent = Math.floor(Math.random() * 60) + 20; // 20-80%
    const linesAI = Math.floor(linesAdded * aiPercent / 100);
    const linesManual = linesAdded - linesAI;

    // Tokens: roughly 40-80 tokens per AI line
    const tokensPerLine = 40 + Math.floor(Math.random() * 40);
    const tokensUsed = linesAI * tokensPerLine;

    // Generate AI tool split for the AI lines
    const availableTools = aiTools.filter(() => Math.random() > 0.3);
    const toolsUsed = availableTools.length > 0 ? availableTools : [aiTools[0]];
    let remainingPercent = 100;
    const aiToolSplit = toolsUsed.map((tool, i) => {
        const isLast = i === toolsUsed.length - 1;
        const percent = isLast
            ? remainingPercent
            : Math.floor(Math.random() * (remainingPercent / (toolsUsed.length - i))) + 5;
        remainingPercent -= percent;
        if (remainingPercent < 0) remainingPercent = 0;
        return {
            tool: tool.shortName,
            icon: tool.icon,
            color: tool.color,
            percent: Math.max(percent, 0),
            lines: Math.floor(linesAI * percent / 100),
        };
    }).filter(t => t.percent > 0);

    // Determine source type
    const source: CommitEvent["source"] = aiPercent > 70 ? "AI" : aiPercent < 30 ? "Manual" : "Hybrid";
    const confidence = 0.7 + Math.random() * 0.28;

    // Extended description
    const commitDescription = `${description}. This change touches ${linesAdded} lines across ${Math.floor(Math.random() * 5) + 1} files in the ${repo.name} repository. ${aiPercent}% of code was AI-assisted using ${toolsUsed.map(t => t.shortName).join(", ")}.`;

    return {
        commitId: generateCommitId(),
        commitHeading: heading,
        commitDescription,
        commitPrefix: prefix,
        authorName: user.name,
        authorRole: user.role,
        authorId: user.id,
        teamName: team.name,
        teamId: team.id,
        repository: repo.name,
        linesAdded,
        linesAI,
        linesManual,
        aiPercent,
        tokensUsed,
        aiToolSplit,
        source,
        confidence,
        timestamp: new Date().toISOString(),
    };
}

class SocketService {
    private listeners: Record<string, Listener[]> = {};
    private timers: ReturnType<typeof setTimeout>[] = [];
    private _isStreaming = false;
    private _isConnected = false;

    /** Whether the live stream is already running */
    get isStreaming() {
        return this._isStreaming;
    }

    /**
     * Connect to the real-time stream (idempotent — safe to call multiple times)
     */
    connect() {
        if (this._isConnected) return;
        this._isConnected = true;
        console.log("[SocketService] Connected to real-time metric stream.");
    }

    /**
     * Listen for specific events
     */
    on(event: SocketEvent, callback: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Stop listening for specific events
     */
    off(event: SocketEvent, callback: Listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== callback);
    }

    /**
     * Broadcast an event (Used by backend/webhooks)
     */
    broadcast(event: SocketEvent, data: any) {
        console.log(`[SocketService] Broadcasting ${event}:`, data);
        if (this.listeners[event]) {
            setTimeout(() => {
                this.listeners[event].forEach(callback => callback(data));
            }, Math.random() * 300 + 100);
        }
    }

    /**
     * Simulate a live commit stream for demonstration.
     * IDEMPOTENT — only starts if not already streaming.
     * - First commit: ~5 seconds after first mount
     * - Subsequent commits: every 3-5 minutes (180,000 - 300,000 ms)
     */
    simulateLiveStream() {
        if (this._isStreaming) return; // Already running, skip
        this._isStreaming = true;

        // First commit comes quickly (5 seconds)
        const firstTimer = setTimeout(() => {
            this.broadcast('METRIC_UPDATE', generateCommitEvent());
            this.scheduleNextCommit();
        }, 5000);
        this.timers.push(firstTimer);
    }

    private scheduleNextCommit() {
        // Random interval between 3-5 minutes (180,000 - 300,000 ms)
        const interval = 180000 + Math.floor(Math.random() * 120000);
        const timer = setTimeout(() => {
            this.broadcast('METRIC_UPDATE', generateCommitEvent());
            this.scheduleNextCommit();
        }, interval);
        this.timers.push(timer);
    }

    /**
     * Cleanup
     */
    disconnect() {
        this.timers.forEach(t => clearTimeout(t));
        this.timers = [];
        this.listeners = {};
        this._isStreaming = false;
        this._isConnected = false;
    }
}

// Singleton instance — lives for the entire app lifecycle
export const socketService = new SocketService();
