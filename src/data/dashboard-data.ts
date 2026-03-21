// Types and Interfaces
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

export interface Team {
  id: string;
  name: string;
  headCount: number;
  aiUsers: number;
  aiCodePercent: number;
  aiMergeRate: number;
  primaryTool: string;
  totalTokens: number;
  totalLoC: number;
  aiLoC: number;
  manualLoC: number;
  members: number[];
}

// Helper for formatting
export const formatNumber = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
  return n.toString();
};

// --- DATA GENERATION ---

export const teams: Team[] = [
  { id: "platform", name: "Platform Engineering", headCount: 12, aiUsers: 10, aiCodePercent: 68.4, aiMergeRate: 84.2, primaryTool: "Cursor", totalTokens: 8420000, totalLoC: 245000, aiLoC: 167580, manualLoC: 77420, members: [] },
  { id: "frontend", name: "Frontend Core", headCount: 15, aiUsers: 14, aiCodePercent: 72.1, aiMergeRate: 78.5, primaryTool: "Cursor", totalTokens: 9200000, totalLoC: 312000, aiLoC: 224952, manualLoC: 87048, members: [] },
  { id: "data-ml", name: "Data & ML", headCount: 10, aiUsers: 8, aiCodePercent: 42.5, aiMergeRate: 62.1, primaryTool: "Copilot", totalTokens: 4150000, totalLoC: 184000, aiLoC: 78200, manualLoC: 105800, members: [] },
  { id: "security", name: "Cyber Security", headCount: 8, aiUsers: 6, aiCodePercent: 35.2, aiMergeRate: 91.0, primaryTool: "Copilot", totalTokens: 2800000, totalLoC: 92000, aiLoC: 32384, manualLoC: 59616, members: [] },
  { id: "mobile", name: "Mobile App", headCount: 14, aiUsers: 12, aiCodePercent: 58.0, aiMergeRate: 75.4, primaryTool: "Cursor", totalTokens: 6700000, totalLoC: 198000, aiLoC: 114840, manualLoC: 83160, members: [] },
  { id: "infra", name: "Infrastructure/SRE", headCount: 9, aiUsers: 9, aiCodePercent: 81.5, aiMergeRate: 88.0, primaryTool: "Cursor", totalTokens: 7100000, totalLoC: 145000, aiLoC: 118175, manualLoC: 26825, members: [] },
  { id: "devtools", name: "Developer Experience", headCount: 7, aiUsers: 7, aiCodePercent: 92.0, aiMergeRate: 94.5, primaryTool: "Cursor", totalTokens: 5200000, totalLoC: 112000, aiLoC: 103040, manualLoC: 8960, members: [] },
  { id: "product-api", name: "Product API", headCount: 11, aiUsers: 9, aiCodePercent: 54.6, aiMergeRate: 71.2, primaryTool: "Copilot", totalTokens: 4800000, totalLoC: 176000, aiLoC: 96096, manualLoC: 79904, members: [] },
  { id: "growth", name: "Growth & Experiments", headCount: 6, aiUsers: 6, aiCodePercent: 65.4, aiMergeRate: 68.9, primaryTool: "Cursor", totalTokens: 3100000, totalLoC: 78000, aiLoC: 51012, manualLoC: 26988, members: [] },
  { id: "qa-aut", name: "QA Automation", headCount: 8, aiUsers: 8, aiCodePercent: 88.2, aiMergeRate: 82.1, primaryTool: "Copilot", totalTokens: 3900000, totalLoC: 84000, aiLoC: 74088, manualLoC: 9912, members: [] },
];

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah", "Ronald", "Stephanie"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

const roles = ["Senior Engineer", "Mid-Level Engineer", "Junior Engineer", "Staff Engineer", "Principal Engineer", "Tech Lead"];

// Generate 80 Users
export const users: User[] = Array.from({ length: 80 }).map((_, i) => {
  const team = teams[i % teams.length];
  const id = i + 1;
  const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
  const totalLoC = 5000 + Math.floor(Math.random() * 45000);
  const aiPercent = i < 5 ? 85 + Math.random() * 10 : Math.random() < 0.1 ? 0 : 20 + Math.random() * 60;
  const aiLoC = Math.floor((totalLoC * aiPercent) / 100);
  const commits = 20 + Math.floor(Math.random() * 200);
  const tokens = aiLoC * 60 + Math.floor(Math.random() * 10000);

  const status: "Power User" | "Active" | "License Idle" =
    aiPercent > 75 ? "Power User" :
      aiPercent === 0 ? "License Idle" : "Active";

  team.members.push(id);

  return {
    id,
    name,
    role: roles[i % roles.length],
    team: team.name,
    teamId: team.id,
    primaryTool: team.primaryTool,
    commits,
    totalLoC,
    aiLoC,
    manualLoC: totalLoC - aiLoC,
    aiPercent: parseFloat(aiPercent.toFixed(1)),
    aiMergeRate: parseFloat((60 + Math.random() * 35).toFixed(1)),
    tokensUsed: tokens,
    cursorFastTokens: team.primaryTool === "Cursor" ? Math.floor(tokens * 0.7) : 0,
    cursorSlowTokens: team.primaryTool === "Cursor" ? Math.floor(tokens * 0.3) : 0,
    cursorCompletions: Math.floor(tokens / 120),
    cursorAcceptRate: 65 + Math.random() * 25,
    copilotSuggestions: team.primaryTool === "Copilot" ? tokens / 50 : 0,
    copilotAcceptRate: 50 + Math.random() * 30,
    prsOpened: Math.floor(commits / 4),
    prsMerged: Math.floor(commits / 4.5),
    prMergeRate: parseFloat((70 + Math.random() * 25).toFixed(1)),
    rank: 0, // Will sort later
    status,
    avatar: name.split(' ').map(n => n[0]).join(''),
    weeklyTrend: [
      { week: "Week 1", aiPercent: Math.max(0, aiPercent - 15) },
      { week: "Week 2", aiPercent: Math.max(0, aiPercent - 10) },
      { week: "Week 3", aiPercent: Math.max(0, aiPercent - 5) },
      { week: "Week 4", aiPercent: aiPercent },
    ],
    recentPRs: [
      { title: `feat: Integrated ${team.id} module`, status: "Merged", aiPercent: Math.floor(aiPercent + 5), date: "Mar 19" },
      { title: `fix: Resolved ${team.id} latency`, status: "Merged", aiPercent: Math.floor(aiPercent - 4), date: "Mar 17" },
      { title: `refactor: Optimize ${team.id} logic`, status: "Rejected", aiPercent: 92, date: "Mar 15" },
      { title: `feat: Added ${team.id} tests`, status: "Open", aiPercent: 45, date: "Mar 14" },
    ]
  };
});

// Calculate Ranks
users.sort((a, b) => b.aiPercent - a.aiPercent);
users.forEach((u, i) => u.rank = i + 1);

export const orgData = {
  totalDevelopers: users.length,
  activeAIUsers: users.filter(u => u.aiPercent > 0).length,
  aiAdoptionRate: parseFloat(((users.filter(u => u.aiPercent > 0).length / users.length) * 100).toFixed(1)),
  totalLoC: users.reduce((acc, u) => acc + u.totalLoC, 0),
  aiLoC: users.reduce((acc, u) => acc + u.aiLoC, 0),
  manualLoC: users.reduce((acc, u) => acc + u.manualLoC, 0),
  aiCodePercent: 0, // Calculated below
  aiMergeRate: 78.2,
  totalTokens: users.reduce((acc, u) => acc + u.tokensUsed, 0),
  copilotSuggestionsShown: 412000,
  copilotAcceptRate: 64.5,
  cursorCompletionsAccepted: 285400,
  prMergeRate: 82.4,
  aiRiskScore: 14.8,
  aiRiskInterventionRate: 19.5,
};
orgData.aiCodePercent = parseFloat(((orgData.aiLoC / orgData.totalLoC) * 100).toFixed(1));

// --- 16 WEEKS (4 MONTHS) OF TREND DATA ---
const monthNames = ["Dec", "Jan", "Feb", "Mar"];
export const weeklyTrend = Array.from({ length: 16 }).map((_, i) => {
  const monthIdx = Math.floor(i / 4) % 12;
  const weekInMonth = (i % 4) + 1;
  const monthName = monthNames[Math.floor(i / 4)];
  const year = i < 4 ? 2025 : 2026; // Dec: 2025, Jan-Mar: 2026

  const label = `${monthName} ${weekInMonth * 7 - 6}, ${year} - ${monthName} ${weekInMonth * 7}, ${year}`;

  // Progression: AI LoC grows from 80k to 240k over 4 months
  const aiLoC = 80000 + i * 10000 + Math.floor(Math.random() * 5000);
  // Manual LoC stays between 150k and 180k
  const manualLoC = 180000 - i * 2000 + Math.floor(Math.random() * 5000);
  const total = aiLoC + manualLoC;

  return {
    week: `W${i + 1}`,
    label,
    aiLoC,
    manualLoC,
    aiPercent: parseFloat(((aiLoC / total) * 100).toFixed(1)),
    aiMergeRate: parseFloat((62 + (i * 1.2) + Math.random() * 3).toFixed(1))
  };
});

export const repositories = [
  { name: "core-api-service", team: "Platform Engineering", totalLoC: 84000, aiPercent: 72, mergeRate: 89, primaryTool: "Cursor" },
  { name: "web-client-v2", team: "Frontend Core", totalLoC: 124000, aiPercent: 65, mergeRate: 82, primaryTool: "Cursor" },
  { name: "auth-central", team: "Platform Engineering", totalLoC: 45000, aiPercent: 58, mergeRate: 94, primaryTool: "Cursor" },
  { name: "data-lake-ingestion", team: "Data & ML", totalLoC: 92000, aiPercent: 34, mergeRate: 64, primaryTool: "Copilot" },
  { name: "mobile-ios-app", team: "Mobile App", totalLoC: 76000, aiPercent: 61, mergeRate: 78, primaryTool: "Cursor" },
  { name: "mobile-android-app", team: "Mobile App", totalLoC: 78000, aiPercent: 59, mergeRate: 75, primaryTool: "Cursor" },
  { name: "security-scanner", team: "Cyber Security", totalLoC: 34000, aiPercent: 88, mergeRate: 96, primaryTool: "Cursor" },
  { name: "infra-provisioner", team: "Infrastructure/SRE", totalLoC: 56000, aiPercent: 82, mergeRate: 87, primaryTool: "Cursor" },
  { name: "ml-training-hub", team: "Data & ML", totalLoC: 68000, aiPercent: 41, mergeRate: 59, primaryTool: "Copilot" },
  { name: "design-system-react", team: "Frontend Core", totalLoC: 28000, aiPercent: 74, mergeRate: 85, primaryTool: "Cursor" },
  { name: "legacy-payment-gw", team: "Product API", totalLoC: 145000, aiPercent: 12, mergeRate: 45, primaryTool: "None" },
  { name: "customer-portal", team: "Product API", totalLoC: 52000, aiPercent: 48, mergeRate: 72, primaryTool: "Copilot" },
  { name: "analytics-edge", team: "Data & ML", totalLoC: 41000, aiPercent: 55, mergeRate: 70, primaryTool: "Cursor" },
  { name: "dev-portal-v3", team: "Developer Experience", totalLoC: 32000, aiPercent: 91, mergeRate: 98, primaryTool: "Cursor" },
  { name: "experiment-engine", team: "Growth & Experiments", totalLoC: 18000, aiPercent: 70, mergeRate: 81, primaryTool: "Cursor" },
];

export const mergeAnalytics = {
  aiLoCWritten: orgData.aiLoC,
  aiLoCInPRs: Math.floor(orgData.aiLoC * 0.9),
  aiLoCMerged: Math.floor(orgData.aiLoC * 0.75),
  manualMergeRate: 84.5,
  rejectedPRs: users.slice(0, 15).map(u => ({
    title: `feat: Auto-generated ${u.teamId} logic`,
    author: u.name,
    aiPercent: Math.floor(Math.random() * 20 + 80),
    reason: ["High complexity", "Unit test failure", "Security vulnerability", "Performance regression", "Coding standard violation"][Math.floor(Math.random() * 5)],
    date: "Mar 18"
  }))
};

export const productivityData = {
  aiCycleTimeAvg: 38,
  manualCycleTimeAvg: 124,
  velocityBoostPercent: 72.1,
  timeSavedHours: 8420,
  tasksMatched: 3450,
  roiMetrics: Array.from({ length: 16 }).map((_, i) => ({
    week: `W${i + 1}`,
    boost: 35 + (i * 2.4) + Math.random() * 5
  }))
};

export const securityData = {
  totalAIFlawsDetected: 12450,
  interventionsCount: 2840,
  interventionTrend: Array.from({ length: 16 }).map((_, i) => ({
    week: `W${i + 1}`,
    interventions: 180 + i * 30,
    flaws: 600 + i * 90
  })),
  topRiskTypes: [
    { type: "Insecure Credential Storage", count: 2840 },
    { type: "Injection Vulnerabilities", count: 1950 },
    { type: "Inefficient Loops", count: 4100 },
    { type: "Memory Leaks", count: 1240 },
    { type: "Non-standard Imports", count: 2320 },
  ]
};

// --- AI TOOL ATTRIBUTION DATA ---

export interface AITool {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string; // emoji fallback
  totalLoC: number;
  percentOfAI: number;
  mergeRate: number;
  avgAcceptRate: number;
  avgConfidence: number;
  activeUsers: number;
  totalTokens: number;
  avgCycleTime: number; // minutes
}

export const aiTools: AITool[] = [
  {
    id: "claude",
    name: "Claude (Anthropic)",
    shortName: "Claude",
    color: "#D97706",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: "🧠",
    totalLoC: Math.floor(orgData.aiLoC * 0.32),
    percentOfAI: 32.0,
    mergeRate: 91.2,
    avgAcceptRate: 78.4,
    avgConfidence: 94.1,
    activeUsers: 28,
    totalTokens: Math.floor(orgData.totalTokens * 0.34),
    avgCycleTime: 32,
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    shortName: "Copilot",
    color: "#6366F1",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: "🤖",
    totalLoC: Math.floor(orgData.aiLoC * 0.28),
    percentOfAI: 28.0,
    mergeRate: 82.5,
    avgAcceptRate: 64.5,
    avgConfidence: 87.3,
    activeUsers: 35,
    totalTokens: Math.floor(orgData.totalTokens * 0.26),
    avgCycleTime: 41,
  },
  {
    id: "cursor",
    name: "Cursor AI / Windsurf",
    shortName: "Cursor",
    color: "#8B5CF6",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    icon: "⚡",
    totalLoC: Math.floor(orgData.aiLoC * 0.22),
    percentOfAI: 22.0,
    mergeRate: 88.7,
    avgAcceptRate: 72.1,
    avgConfidence: 91.8,
    activeUsers: 22,
    totalTokens: Math.floor(orgData.totalTokens * 0.24),
    avgCycleTime: 35,
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    shortName: "Gemini",
    color: "#2563EB",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "💎",
    totalLoC: Math.floor(orgData.aiLoC * 0.12),
    percentOfAI: 12.0,
    mergeRate: 85.9,
    avgAcceptRate: 68.2,
    avgConfidence: 89.5,
    activeUsers: 14,
    totalTokens: Math.floor(orgData.totalTokens * 0.10),
    avgCycleTime: 38,
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    shortName: "ChatGPT",
    color: "#10B981",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "💬",
    totalLoC: Math.floor(orgData.aiLoC * 0.06),
    percentOfAI: 6.0,
    mergeRate: 74.3,
    avgAcceptRate: 58.1,
    avgConfidence: 82.4,
    activeUsers: 8,
    totalTokens: Math.floor(orgData.totalTokens * 0.06),
    avgCycleTime: 48,
  },
];

// Per-team tool usage breakdown
export const teamToolUsage = teams.map((team) => {
  const isBackend = ["platform", "infra", "product-api", "security"].includes(team.id);
  const isML = team.id === "data-ml";
  const isFrontend = ["frontend", "mobile", "growth", "devtools"].includes(team.id);

  return {
    teamId: team.id,
    teamName: team.name,
    tools: [
      { toolId: "claude", percent: isBackend ? 38 : isML ? 42 : 28, loC: Math.floor(team.aiLoC * (isBackend ? 0.38 : isML ? 0.42 : 0.28)) },
      { toolId: "copilot", percent: isFrontend ? 32 : isML ? 18 : 26, loC: Math.floor(team.aiLoC * (isFrontend ? 0.32 : isML ? 0.18 : 0.26)) },
      { toolId: "cursor", percent: isFrontend ? 24 : isBackend ? 20 : 16, loC: Math.floor(team.aiLoC * (isFrontend ? 0.24 : isBackend ? 0.20 : 0.16)) },
      { toolId: "gemini", percent: isML ? 18 : 10, loC: Math.floor(team.aiLoC * (isML ? 0.18 : 0.10)) },
      { toolId: "chatgpt", percent: isML ? 6 : isFrontend ? 4 : 6, loC: Math.floor(team.aiLoC * (isML ? 0.06 : isFrontend ? 0.04 : 0.06)) },
    ],
  };
});

// Monthly trend per AI tool (4 months)
export const aiToolMonthlyTrend = Array.from({ length: 4 }).map((_, i) => {
  const months = ["Dec '25", "Jan '26", "Feb '26", "Mar '26"];
  const baseGrowth = 1 + i * 0.24;
  return {
    month: months[i],
    claude: Math.floor(12000 * baseGrowth + Math.random() * 3000),
    copilot: Math.floor(14000 * (1 + i * 0.12) + Math.random() * 2000),
    cursor: Math.floor(8000 * (1 + i * 0.36) + Math.random() * 2500),
    gemini: Math.floor(5000 * (1 + i * 0.30) + Math.random() * 1500),
    chatgpt: Math.floor(3000 * (1 + i * 0.08) + Math.random() * 1000),
  };
});

// Repository-level tool attribution
export const repoToolAttribution = repositories.map((repo) => {
  const isBackendRepo = ["core-api-service", "auth-central", "infra-provisioner", "security-scanner"].includes(repo.name);
  const isMLRepo = ["data-lake-ingestion", "ml-training-hub", "analytics-edge"].includes(repo.name);

  return {
    repoName: repo.name,
    team: repo.team,
    totalAiLoC: Math.floor(repo.totalLoC * repo.aiPercent / 100),
    tools: [
      { toolId: "claude", percent: isBackendRepo ? 40 : isMLRepo ? 45 : 28 },
      { toolId: "copilot", percent: isBackendRepo ? 25 : isMLRepo ? 15 : 35 },
      { toolId: "cursor", percent: isBackendRepo ? 20 : isMLRepo ? 15 : 22 },
      { toolId: "gemini", percent: isMLRepo ? 20 : 10 },
      { toolId: "chatgpt", percent: isMLRepo ? 5 : 5 },
    ],
  };
});

// Quality metrics per AI tool
export const aiToolQualityMetrics = [
  { toolId: "claude", bugRate: 2.1, securityFlaws: 14, codeSmells: 8.2, testCoverage: 82.4, docQuality: 91 },
  { toolId: "copilot", bugRate: 3.8, securityFlaws: 28, codeSmells: 14.1, testCoverage: 71.2, docQuality: 65 },
  { toolId: "cursor", bugRate: 2.6, securityFlaws: 18, codeSmells: 10.5, testCoverage: 78.9, docQuality: 84 },
  { toolId: "gemini", bugRate: 3.2, securityFlaws: 22, codeSmells: 12.3, testCoverage: 74.5, docQuality: 78 },
  { toolId: "chatgpt", bugRate: 5.4, securityFlaws: 38, codeSmells: 18.7, testCoverage: 62.1, docQuality: 58 },
];

export type UserRole = "Admin" | "Manager" | "Developer";
