export const orgData = {
  totalDevelopers: 6,
  activeAIUsers: 5,
  aiAdoptionRate: 83,
  totalLoC: 124800,
  aiLoC: 61152,
  manualLoC: 63648,
  aiCodePercent: 49.0,
  aiMergeRate: 73.4,
  totalTokens: 4218500,
  copilotSuggestionsShown: 38400,
  copilotAcceptRate: 61.2,
  cursorCompletionsAccepted: 22750,
  prMergeRate: 85,
};

export const teams = [
  {
    id: "platform-engineering",
    name: "Platform Engineering",
    headCount: 2,
    aiUsers: 2,
    aiCodePercent: 62.1,
    aiMergeRate: 81.0,
    primaryTool: "Cursor",
    totalTokens: 1840000,
    totalLoC: 46400,
    aiLoC: 28814,
    manualLoC: 17586,
    members: [1, 2],
  },
  {
    id: "frontend-product",
    name: "Frontend Product",
    headCount: 2,
    aiUsers: 2,
    aiCodePercent: 51.4,
    aiMergeRate: 74.2,
    primaryTool: "GitHub Copilot",
    totalTokens: 1510000,
    totalLoC: 40800,
    aiLoC: 20971,
    manualLoC: 19829,
    members: [3, 4],
  },
  {
    id: "data-ml",
    name: "Data & ML Engineering",
    headCount: 2,
    aiUsers: 1,
    aiCodePercent: 28.3,
    aiMergeRate: 58.5,
    primaryTool: "GitHub Copilot",
    totalTokens: 868500,
    totalLoC: 37600,
    aiLoC: 10639,
    manualLoC: 26961,
    members: [5, 6],
  },
];

export interface User {
  id: number;
  name: string;
  role: string;
  team: string;
  teamId: string;
  primaryTool: string;
  commits: number;
  totalLoC: number;
  aiLoC: number;
  manualLoC: number;
  aiPercent: number;
  aiMergeRate: number;
  tokensUsed: number;
  cursorFastTokens: number;
  cursorSlowTokens: number;
  cursorCompletions: number;
  cursorAcceptRate: number;
  copilotSuggestions: number;
  copilotAcceptRate: number;
  prsOpened: number;
  prsMerged: number;
  prMergeRate: number;
  rank: number;
  status: "Power User" | "Active" | "License Idle";
  avatar: string;
  weeklyTrend: { week: string; aiPercent: number }[];
  recentPRs: { title: string; status: "Merged" | "Open" | "Rejected"; aiPercent: number; date: string }[];
}

export const users: User[] = [
  {
    id: 1,
    name: "Jordan Lee",
    role: "Senior Engineer",
    team: "Platform Engineering",
    teamId: "platform-engineering",
    primaryTool: "Cursor",
    commits: 84,
    totalLoC: 26400,
    aiLoC: 18480,
    manualLoC: 7920,
    aiPercent: 70.0,
    aiMergeRate: 86.0,
    tokensUsed: 1120000,
    cursorFastTokens: 780000,
    cursorSlowTokens: 340000,
    cursorCompletions: 14200,
    cursorAcceptRate: 74.3,
    copilotSuggestions: 0,
    copilotAcceptRate: 0,
    prsOpened: 21,
    prsMerged: 19,
    prMergeRate: 90.5,
    rank: 1,
    status: "Power User",
    avatar: "JL",
    weeklyTrend: [
      { week: "Week 1", aiPercent: 62 },
      { week: "Week 2", aiPercent: 66 },
      { week: "Week 3", aiPercent: 72 },
      { week: "Week 4", aiPercent: 78 },
    ],
    recentPRs: [
      { title: "feat: Add API rate limiter", status: "Merged", aiPercent: 75, date: "Mar 19" },
      { title: "refactor: Auth middleware", status: "Merged", aiPercent: 68, date: "Mar 17" },
      { title: "fix: Cache invalidation bug", status: "Merged", aiPercent: 82, date: "Mar 15" },
      { title: "feat: Webhook retry logic", status: "Open", aiPercent: 71, date: "Mar 14" },
      { title: "chore: Update dependencies", status: "Merged", aiPercent: 45, date: "Mar 12" },
    ],
  },
  {
    id: 2,
    name: "Alex Reyes",
    role: "Staff Engineer",
    team: "Platform Engineering",
    teamId: "platform-engineering",
    primaryTool: "Cursor + Copilot",
    commits: 72,
    totalLoC: 20000,
    aiLoC: 10800,
    manualLoC: 9200,
    aiPercent: 54.0,
    aiMergeRate: 76.0,
    tokensUsed: 720000,
    cursorFastTokens: 420000,
    cursorSlowTokens: 180000,
    cursorCompletions: 8550,
    cursorAcceptRate: 68.1,
    copilotSuggestions: 12000,
    copilotAcceptRate: 58.4,
    prsOpened: 18,
    prsMerged: 15,
    prMergeRate: 83.3,
    rank: 2,
    status: "Power User",
    avatar: "AR",
    weeklyTrend: [
      { week: "Week 1", aiPercent: 48 },
      { week: "Week 2", aiPercent: 52 },
      { week: "Week 3", aiPercent: 55 },
      { week: "Week 4", aiPercent: 60 },
    ],
    recentPRs: [
      { title: "feat: GraphQL schema gen", status: "Merged", aiPercent: 62, date: "Mar 18" },
      { title: "feat: Service mesh config", status: "Merged", aiPercent: 55, date: "Mar 16" },
      { title: "fix: gRPC timeout handling", status: "Rejected", aiPercent: 48, date: "Mar 14" },
      { title: "refactor: DB migrations", status: "Merged", aiPercent: 51, date: "Mar 11" },
      { title: "docs: API documentation", status: "Merged", aiPercent: 70, date: "Mar 9" },
    ],
  },
  {
    id: 3,
    name: "Sam Okafor",
    role: "Mid-Level Engineer",
    team: "Frontend Product",
    teamId: "frontend-product",
    primaryTool: "GitHub Copilot",
    commits: 65,
    totalLoC: 22400,
    aiLoC: 13440,
    manualLoC: 8960,
    aiPercent: 60.0,
    aiMergeRate: 72.0,
    tokensUsed: 890000,
    cursorFastTokens: 0,
    cursorSlowTokens: 0,
    cursorCompletions: 0,
    cursorAcceptRate: 0,
    copilotSuggestions: 15200,
    copilotAcceptRate: 65.8,
    prsOpened: 16,
    prsMerged: 13,
    prMergeRate: 81.3,
    rank: 3,
    status: "Active",
    avatar: "SO",
    weeklyTrend: [
      { week: "Week 1", aiPercent: 52 },
      { week: "Week 2", aiPercent: 57 },
      { week: "Week 3", aiPercent: 62 },
      { week: "Week 4", aiPercent: 68 },
    ],
    recentPRs: [
      { title: "feat: Dashboard widgets", status: "Merged", aiPercent: 65, date: "Mar 19" },
      { title: "feat: Dark mode support", status: "Merged", aiPercent: 58, date: "Mar 17" },
      { title: "fix: Layout shifts on mobile", status: "Merged", aiPercent: 72, date: "Mar 15" },
      { title: "feat: Chart animations", status: "Open", aiPercent: 61, date: "Mar 13" },
      { title: "refactor: Component library", status: "Merged", aiPercent: 55, date: "Mar 10" },
    ],
  },
  {
    id: 4,
    name: "Maya Thornton",
    role: "Junior Engineer",
    team: "Frontend Product",
    teamId: "frontend-product",
    primaryTool: "GitHub Copilot",
    commits: 48,
    totalLoC: 18400,
    aiLoC: 7360,
    manualLoC: 11040,
    aiPercent: 40.0,
    aiMergeRate: 65.0,
    tokensUsed: 620000,
    cursorFastTokens: 0,
    cursorSlowTokens: 0,
    cursorCompletions: 0,
    cursorAcceptRate: 0,
    copilotSuggestions: 11200,
    copilotAcceptRate: 55.3,
    prsOpened: 12,
    prsMerged: 10,
    prMergeRate: 83.3,
    rank: 4,
    status: "Active",
    avatar: "MT",
    weeklyTrend: [
      { week: "Week 1", aiPercent: 32 },
      { week: "Week 2", aiPercent: 36 },
      { week: "Week 3", aiPercent: 42 },
      { week: "Week 4", aiPercent: 48 },
    ],
    recentPRs: [
      { title: "feat: Form validation", status: "Merged", aiPercent: 42, date: "Mar 18" },
      { title: "feat: User onboarding flow", status: "Merged", aiPercent: 38, date: "Mar 16" },
      { title: "fix: Accessibility issues", status: "Merged", aiPercent: 35, date: "Mar 14" },
      { title: "style: Design system updates", status: "Open", aiPercent: 50, date: "Mar 12" },
      { title: "test: Unit test coverage", status: "Merged", aiPercent: 44, date: "Mar 10" },
    ],
  },
  {
    id: 5,
    name: "Daniel Kim",
    role: "Senior Engineer",
    team: "Data & ML Engineering",
    teamId: "data-ml",
    primaryTool: "GitHub Copilot",
    commits: 56,
    totalLoC: 21600,
    aiLoC: 10800,
    manualLoC: 10800,
    aiPercent: 50.0,
    aiMergeRate: 58.5,
    tokensUsed: 868500,
    cursorFastTokens: 0,
    cursorSlowTokens: 0,
    cursorCompletions: 0,
    cursorAcceptRate: 0,
    copilotSuggestions: 9800,
    copilotAcceptRate: 62.1,
    prsOpened: 14,
    prsMerged: 11,
    prMergeRate: 78.6,
    rank: 5,
    status: "Active",
    avatar: "DK",
    weeklyTrend: [
      { week: "Week 1", aiPercent: 42 },
      { week: "Week 2", aiPercent: 46 },
      { week: "Week 3", aiPercent: 51 },
      { week: "Week 4", aiPercent: 58 },
    ],
    recentPRs: [
      { title: "feat: ML pipeline refactor", status: "Merged", aiPercent: 52, date: "Mar 19" },
      { title: "feat: Data validation layer", status: "Merged", aiPercent: 48, date: "Mar 16" },
      { title: "fix: Model drift detection", status: "Rejected", aiPercent: 55, date: "Mar 14" },
      { title: "feat: Feature store integration", status: "Merged", aiPercent: 45, date: "Mar 11" },
      { title: "chore: Update ML dependencies", status: "Merged", aiPercent: 60, date: "Mar 8" },
    ],
  },
  {
    id: 6,
    name: "Priya Nair",
    role: "Mid-Level Engineer",
    team: "Data & ML Engineering",
    teamId: "data-ml",
    primaryTool: "None",
    commits: 42,
    totalLoC: 16000,
    aiLoC: 0,
    manualLoC: 16000,
    aiPercent: 0,
    aiMergeRate: 0,
    tokensUsed: 0,
    cursorFastTokens: 0,
    cursorSlowTokens: 0,
    cursorCompletions: 0,
    cursorAcceptRate: 0,
    copilotSuggestions: 0,
    copilotAcceptRate: 0,
    prsOpened: 10,
    prsMerged: 9,
    prMergeRate: 90.0,
    rank: 6,
    status: "License Idle",
    avatar: "PN",
    weeklyTrend: [
      { week: "Week 1", aiPercent: 0 },
      { week: "Week 2", aiPercent: 0 },
      { week: "Week 3", aiPercent: 0 },
      { week: "Week 4", aiPercent: 0 },
    ],
    recentPRs: [
      { title: "feat: ETL pipeline optimization", status: "Merged", aiPercent: 0, date: "Mar 18" },
      { title: "fix: Data quality checks", status: "Merged", aiPercent: 0, date: "Mar 15" },
      { title: "feat: Batch processing module", status: "Merged", aiPercent: 0, date: "Mar 13" },
      { title: "refactor: Query optimizer", status: "Open", aiPercent: 0, date: "Mar 11" },
      { title: "docs: Data dictionary update", status: "Merged", aiPercent: 0, date: "Mar 8" },
    ],
  },
];

export const weeklyTrend = [
  { week: "Week 1", label: "Feb 22 - Mar 1", aiLoC: 12800, manualLoC: 17200, aiPercent: 42.7, aiMergeRate: 68.2 },
  { week: "Week 2", label: "Mar 2 - Mar 8", aiLoC: 14100, manualLoC: 16400, aiPercent: 46.2, aiMergeRate: 71.0 },
  { week: "Week 3", label: "Mar 9 - Mar 15", aiLoC: 16200, manualLoC: 15800, aiPercent: 50.6, aiMergeRate: 74.5 },
  { week: "Week 4", label: "Mar 16 - Mar 20", aiLoC: 18052, manualLoC: 14248, aiPercent: 55.9, aiMergeRate: 79.3 },
];

export const repositories = [
  { name: "api-gateway", team: "Platform Engineering", totalLoC: 14200, aiPercent: 68, mergeRate: 88, primaryTool: "Cursor" },
  { name: "auth-service", team: "Platform Engineering", totalLoC: 12200, aiPercent: 55, mergeRate: 82, primaryTool: "Cursor" },
  { name: "web-dashboard", team: "Frontend Product", totalLoC: 18400, aiPercent: 58, mergeRate: 76, primaryTool: "Copilot" },
  { name: "component-library", team: "Frontend Product", totalLoC: 10200, aiPercent: 42, mergeRate: 71, primaryTool: "Copilot" },
  { name: "ml-pipeline", team: "Data & ML Engineering", totalLoC: 15600, aiPercent: 35, mergeRate: 62, primaryTool: "Copilot" },
  { name: "data-ingestion", team: "Data & ML Engineering", totalLoC: 11400, aiPercent: 18, mergeRate: 55, primaryTool: "None" },
  { name: "shared-utils", team: "Platform Engineering", totalLoC: 8800, aiPercent: 62, mergeRate: 85, primaryTool: "Cursor" },
  { name: "design-system", team: "Frontend Product", totalLoC: 7200, aiPercent: 48, mergeRate: 73, primaryTool: "Copilot" },
];

export const mergeAnalytics = {
  aiLoCWritten: 61152,
  aiLoCInPRs: 55400,
  aiLoCMerged: 44866,
  manualMergeRate: 82,
  rejectedPRs: [
    { title: "feat: Auto-generated API tests", author: "Alex Reyes", aiPercent: 92, reason: "Code quality issues", date: "Mar 14" },
    { title: "feat: ML model serving layer", author: "Daniel Kim", aiPercent: 88, reason: "Performance regression", date: "Mar 12" },
    { title: "refactor: Auto-migrate schemas", author: "Jordan Lee", aiPercent: 85, reason: "Breaking changes", date: "Mar 8" },
    { title: "feat: Generated UI components", author: "Sam Okafor", aiPercent: 78, reason: "Design inconsistency", date: "Mar 6" },
    { title: "feat: Automated data pipeline", author: "Daniel Kim", aiPercent: 74, reason: "Missing error handling", date: "Mar 3" },
  ],
};

export type UserRole = "Admin" | "Manager" | "Developer";

export const formatNumber = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
  return n.toString();
};
