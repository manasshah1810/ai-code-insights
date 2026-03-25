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
  lastActiveDate: string;
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
  lastSyncDate: string;
}

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
  costPer1kTokens: number; // USD
  linesAccepted: number;
}

// Helper for formatting
export const formatNumber = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
  return n.toString();
};

// --- DATA GENERATION ---

export const teams: Team[] = [
  { id: "platform", name: "Platform Engineering", headCount: 12, aiUsers: 10, aiCodePercent: 68.4, aiMergeRate: 84.2, primaryTool: "Cursor", totalTokens: 8420000, totalLoC: 245000, aiLoC: 167580, manualLoC: 77420, members: [], lastSyncDate: "Mar 21" },
  { id: "frontend", name: "Frontend Core", headCount: 15, aiUsers: 14, aiCodePercent: 72.1, aiMergeRate: 78.5, primaryTool: "Cursor", totalTokens: 9200000, totalLoC: 312000, aiLoC: 224952, manualLoC: 87048, members: [], lastSyncDate: "Mar 21" },
  { id: "data-ml", name: "Data & ML", headCount: 10, aiUsers: 8, aiCodePercent: 42.5, aiMergeRate: 62.1, primaryTool: "Copilot", totalTokens: 4150000, totalLoC: 184000, aiLoC: 78200, manualLoC: 105800, members: [], lastSyncDate: "Mar 20" },
  { id: "security", name: "Cyber Security", headCount: 8, aiUsers: 6, aiCodePercent: 35.2, aiMergeRate: 91.0, primaryTool: "Copilot", totalTokens: 2800000, totalLoC: 92000, aiLoC: 32384, manualLoC: 59616, members: [], lastSyncDate: "Mar 21" },
  { id: "mobile", name: "Mobile App", headCount: 14, aiUsers: 12, aiCodePercent: 58.0, aiMergeRate: 75.4, primaryTool: "Cursor", totalTokens: 6700000, totalLoC: 198000, aiLoC: 114840, manualLoC: 83160, members: [], lastSyncDate: "Mar 19" },
  { id: "infra", name: "Infrastructure/SRE", headCount: 9, aiUsers: 9, aiCodePercent: 81.5, aiMergeRate: 88.0, primaryTool: "Cursor", totalTokens: 7100000, totalLoC: 145000, aiLoC: 118175, manualLoC: 26825, members: [], lastSyncDate: "Mar 21" },
  { id: "devtools", name: "Developer Experience", headCount: 7, aiUsers: 7, aiCodePercent: 92.0, aiMergeRate: 94.5, primaryTool: "Cursor", totalTokens: 5200000, totalLoC: 112000, aiLoC: 103040, manualLoC: 8960, members: [], lastSyncDate: "Mar 21" },
  { id: "product-api", name: "Product API", headCount: 11, aiUsers: 9, aiCodePercent: 54.6, aiMergeRate: 71.2, primaryTool: "Copilot", totalTokens: 4800000, totalLoC: 176000, aiLoC: 96096, manualLoC: 79904, members: [], lastSyncDate: "Mar 18" },
  { id: "growth", name: "Growth & Experiments", headCount: 6, aiUsers: 6, aiCodePercent: 65.4, aiMergeRate: 68.9, primaryTool: "Cursor", totalTokens: 3100000, totalLoC: 78000, aiLoC: 51012, manualLoC: 26988, members: [], lastSyncDate: "Mar 20" },
  { id: "qa-aut", name: "QA Automation", headCount: 8, aiUsers: 8, aiCodePercent: 88.2, aiMergeRate: 82.1, primaryTool: "Copilot", totalTokens: 3900000, totalLoC: 84000, aiLoC: 74088, manualLoC: 9912, members: [], lastSyncDate: "Mar 21" },
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
    ],
    lastActiveDate: `Mar ${Math.floor(Math.random() * 10 + 10)}`
  };
});

// Calculate Ranks
users.sort((a, b) => b.aiPercent - a.aiPercent);
users.forEach((u, i) => u.rank = i + 1);

const totalTokensEstimate = users.reduce((acc, u) => acc + u.tokensUsed, 0);
const totalAiLoCEstimate = users.reduce((acc, u) => acc + u.aiLoC, 0);

export const aiTools: AITool[] = [
  {
    id: "claude",
    name: "Claude (Anthropic)",
    shortName: "Claude",
    color: "#D97706",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: "🧠",
    totalLoC: Math.floor(totalAiLoCEstimate * 0.32),
    percentOfAI: 32.0,
    mergeRate: 91.2,
    avgAcceptRate: 78.4,
    avgConfidence: 94.1,
    activeUsers: 28,
    totalTokens: Math.floor(totalTokensEstimate * 0.34),
    avgCycleTime: 32,
    costPer1kTokens: 0.015,
    linesAccepted: Math.floor(totalAiLoCEstimate * 0.32),
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    shortName: "Copilot",
    color: "#6366F1",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: "🤖",
    totalLoC: Math.floor(totalAiLoCEstimate * 0.28),
    percentOfAI: 28.0,
    mergeRate: 82.5,
    avgAcceptRate: 64.5,
    avgConfidence: 87.3,
    activeUsers: 35,
    totalTokens: Math.floor(totalTokensEstimate * 0.26),
    avgCycleTime: 41,
    costPer1kTokens: 0.01,
    linesAccepted: Math.floor(totalAiLoCEstimate * 0.28),
  },
  {
    id: "cursor",
    name: "Cursor AI / Windsurf",
    shortName: "Cursor",
    color: "#8B5CF6",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    icon: "⚡",
    totalLoC: Math.floor(totalAiLoCEstimate * 0.22),
    percentOfAI: 22.0,
    mergeRate: 88.7,
    avgAcceptRate: 72.1,
    avgConfidence: 91.8,
    activeUsers: 22,
    totalTokens: Math.floor(totalTokensEstimate * 0.24),
    avgCycleTime: 35,
    costPer1kTokens: 0.01,
    linesAccepted: Math.floor(totalAiLoCEstimate * 0.22),
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    shortName: "Gemini",
    color: "#2563EB",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "💎",
    totalLoC: Math.floor(totalAiLoCEstimate * 0.12),
    percentOfAI: 12.0,
    mergeRate: 85.9,
    avgAcceptRate: 68.2,
    avgConfidence: 89.5,
    activeUsers: 14,
    totalTokens: Math.floor(totalTokensEstimate * 0.10),
    avgCycleTime: 38,
    costPer1kTokens: 0.007,
    linesAccepted: Math.floor(totalAiLoCEstimate * 0.12),
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    shortName: "ChatGPT",
    color: "#10B981",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "💬",
    totalLoC: Math.floor(totalAiLoCEstimate * 0.06),
    percentOfAI: 6.0,
    mergeRate: 74.3,
    avgAcceptRate: 58.1,
    avgConfidence: 82.4,
    activeUsers: 8,
    totalTokens: Math.floor(totalTokensEstimate * 0.06),
    avgCycleTime: 48,
    costPer1kTokens: 0.01,
    linesAccepted: Math.floor(totalAiLoCEstimate * 0.06),
  },
];

export const orgData = {
  totalDevelopers: users.length,
  activeAIUsers: users.filter(u => u.aiPercent > 0).length,
  aiAdoptionRate: parseFloat(((users.filter(u => u.aiPercent > 0).length / users.length) * 100).toFixed(1)),
  totalLoC: users.reduce((acc, u) => acc + u.totalLoC, 0),
  aiLoC: totalAiLoCEstimate,
  manualLoC: users.reduce((acc, u) => acc + u.manualLoC, 0),
  aiCodePercent: 0, // Calculated below
  aiMergeRate: 78.2,
  totalTokens: totalTokensEstimate,
  copilotSuggestionsShown: 412000,
  copilotAcceptRate: 64.5,
  cursorCompletionsAccepted: 285400,
  prMergeRate: 82.4,
  aiRiskScore: 14.8,
  aiRiskInterventionRate: 19.5,
  totalAiCost: aiTools.reduce((acc, t) => acc + (t.totalTokens * t.costPer1kTokens / 1000), 0),
  linesPerMillionTokens: Math.floor((totalAiLoCEstimate / totalTokensEstimate) * 1000000), // Comparison metric
};
orgData.aiCodePercent = parseFloat(((orgData.aiLoC / orgData.totalLoC) * 100).toFixed(1));

// --- 16 WEEKS (4 MONTHS) OF TREND DATA ---
const monthNames = ["Dec", "Jan", "Feb", "Mar"];
export const weeklyTrend = Array.from({ length: 16 }).map((_, i) => {
  const monthName = monthNames[Math.floor(i / 4)];
  const year = i < 4 ? 2025 : 2026; // Dec: 2025, Jan-Mar: 2026
  const weekInMonth = (i % 4) + 1;
  const label = `${monthName} ${weekInMonth * 7 - 6}, ${year} - ${monthName} ${weekInMonth * 7}, ${year}`;

  const aiLoC = 80000 + i * 10000 + Math.floor(Math.random() * 5000);
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
  { name: "core-api-service", team: "Platform Engineering", totalLoC: 84000, aiPercent: 72, mergeRate: 89, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "web-client-v2", team: "Frontend Core", totalLoC: 124000, aiPercent: 65, mergeRate: 82, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "auth-central", team: "Platform Engineering", totalLoC: 45000, aiPercent: 58, mergeRate: 94, primaryTool: "Cursor", lastCommit: "Mar 20" },
  { name: "data-lake-ingestion", team: "Data & ML", totalLoC: 92000, aiPercent: 34, mergeRate: 64, primaryTool: "Copilot", lastCommit: "Mar 19" },
  { name: "mobile-ios-app", team: "Mobile App", totalLoC: 76000, aiPercent: 61, mergeRate: 78, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "mobile-android-app", team: "Mobile App", totalLoC: 78000, aiPercent: 59, mergeRate: 75, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "security-scanner", team: "Cyber Security", totalLoC: 34000, aiPercent: 88, mergeRate: 96, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "infra-provisioner", team: "Infrastructure/SRE", totalLoC: 56000, aiPercent: 82, mergeRate: 87, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "ml-training-hub", team: "Data & ML", totalLoC: 68000, aiPercent: 41, mergeRate: 59, primaryTool: "Copilot", lastCommit: "Mar 18" },
  { name: "design-system-react", team: "Frontend Core", totalLoC: 28000, aiPercent: 74, mergeRate: 85, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "legacy-payment-gw", team: "Product API", totalLoC: 145000, aiPercent: 12, mergeRate: 45, primaryTool: "None", lastCommit: "Feb 28" },
  { name: "customer-portal", team: "Product API", totalLoC: 52000, aiPercent: 48, mergeRate: 72, primaryTool: "Copilot", lastCommit: "Mar 15" },
  { name: "analytics-edge", team: "Data & ML", totalLoC: 41000, aiPercent: 55, mergeRate: 70, primaryTool: "Cursor", lastCommit: "Mar 20" },
  { name: "dev-portal-v3", team: "Developer Experience", totalLoC: 32000, aiPercent: 91, mergeRate: 98, primaryTool: "Cursor", lastCommit: "Mar 21" },
  { name: "experiment-engine", team: "Growth & Experiments", totalLoC: 18000, aiPercent: 70, mergeRate: 81, primaryTool: "Cursor", lastCommit: "Mar 21" },
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

// --- USER ADOPTION & USAGE PATTERNS ---
// Daily active users for last 30 days
export const dailyActiveUsers = Array.from({ length: 30 }).map((_, i) => {
  const baseUsers = 4500;
  const growthFactor = 1 + (i * 0.008); // Gradual growth
  const variance = Math.sin(i * 0.3) * 200; // Wave pattern
  const noise = Math.random() * 300 - 150;
  const count = Math.floor(baseUsers * growthFactor + variance + noise);
  
  const today = new Date();
  const date = new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
  
  return {
    day: `${dayName} ${date.getDate()}`,
    date: date.toISOString().split('T')[0],
    uniqueUsers: Math.max(2000, count),
  };
});

// Weekly active users for 16 weeks (4 months)
export const weeklyActiveUsers = Array.from({ length: 16 }).map((_, i) => {
  const monthNames = ["Dec", "Jan", "Feb", "Mar"];
  const monthName = monthNames[Math.floor(i / 4)];
  const year = i < 4 ? 2025 : 2026;
  const weekInMonth = (i % 4) + 1;
  const weekLabel = `${monthName} W${weekInMonth}`;

  const baseUsers = 5800;
  const growthFactor = 1 + (i * 0.015);
  const variance = Math.sin(i * 0.4) * 300;
  const noise = Math.random() * 400 - 200;
  const count = Math.floor(baseUsers * growthFactor + variance + noise);

  return {
    week: `W${i + 1}`,
    weekLabel,
    uniqueUsers: Math.max(4000, count),
  };
});

// Monthly active users for 4 months
export const monthlyActiveUsers = Array.from({ length: 4 }).map((_, i) => {
  const monthNames = ["December 2025", "January 2026", "February 2026", "March 2026"];
  const baseUsers = 6200;
  const growthFactor = 1 + (i * 0.18);
  const noise = Math.random() * 500 - 250;
  const count = Math.floor(baseUsers * growthFactor + noise);

  return {
    month: monthNames[i],
    shortMonth: ["Dec", "Jan", "Feb", "Mar"][i],
    uniqueUsers: Math.max(5000, count),
  };
});

// Team-specific user activity (for role-based filtering)
export const teamUserActivity = teams.map((team) => {
  const baseTeamUsers = Math.floor(team.headCount * 0.85); // 85% adoption rate
  const weeklyData = Array.from({ length: 16 }).map((_, i) => {
    const variance = Math.sin(i * 0.3) * 20;
    const noise = Math.random() * (baseTeamUsers * 0.1) - (baseTeamUsers * 0.05);
    return {
      week: `W${i + 1}`,
      uniqueUsers: Math.max(1, Math.floor(baseTeamUsers * (1 + i * 0.01) + variance + noise)),
    };
  });

  const monthlyData = Array.from({ length: 4 }).map((_, i) => {
    const variance = Math.sin(i * 0.5) * 30;
    const noise = Math.random() * (baseTeamUsers * 0.15) - (baseTeamUsers * 0.075);
    return {
      month: ["Dec", "Jan", "Feb", "Mar"][i],
      uniqueUsers: Math.max(1, Math.floor(baseTeamUsers * (1 + i * 0.05) + variance + noise)),
    };
  });

  return {
    teamId: team.id,
    teamName: team.name,
    totalMembers: team.headCount,
    activeMembers: baseTeamUsers,
    weeklyTrend: weeklyData,
    monthlyTrend: monthlyData,
  };
});

// Overall user adoption metrics
export const userAdoptionMetrics = {
  last30DayActiveUsers: dailyActiveUsers.slice(-30).reduce((acc, d) => Math.max(acc, d.uniqueUsers), 0),
  last7DayActiveUsers: dailyActiveUsers.slice(-7).reduce((acc, d) => Math.max(acc, d.uniqueUsers), 0),
  dailyActiveUsers: dailyActiveUsers[dailyActiveUsers.length - 1].uniqueUsers,
  last30DayPrevious: Math.floor(6656 * 0.95),
  last7DayPrevious: Math.floor(6075 * 0.96),
  dailyPrevious: Math.floor(3865 * 0.92),
  totalUniqueUsersAllTime: 8420,
};

// --- INTELLIGENT RECOMMENDATIONS ---
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: 1 | 2;
  actionItems: string[];
  expectedOutcome: string;
  timeframe: string;
}

export function getAdminRecommendations(): Recommendation[] {
  const lowAdoptionTeams = teams.filter(t => t.aiCodePercent < 50);
  const highPerformingTeams = teams.filter(t => t.aiMergeRate > 85);
  const toolUsageImbalance = aiTools.find(t => t.activeUsers < 10);

  return [
    {
      id: "admin-adoption-gap",
      title: "Address AI Adoption Gap in Backend Teams",
      description: `${lowAdoptionTeams.length} teams have adoption rates below 50%. Teams like ${lowAdoptionTeams.slice(0, 2).map(t => t.name).join(", ")} are underutilizing AI tools. Consider promoting successful team practices across the organization.`,
      impact: "high",
      priority: 1,
      actionItems: [
        "Schedule knowledge-sharing sessions with Platform Engineering (68% adoption) for teams below 50%",
        "Provide advanced prompt engineering training to unlock better AI outputs",
        "Review tool licensing - ensure teams have access to best-fit tools (Claude for complex logic, Cursor for rapid development)",
        "Create AI adoption roadmap with clear milestones: 60% adoption in 6 weeks, 75% in 12 weeks"
      ],
      expectedOutcome: "5-10% increase in organization-wide AI adoption within 2-3 months",
      timeframe: "2-3 weeks to implement"
    },
    {
      id: "admin-tool-focus",
      title: "Optimize Tool Portfolio - Focus on High-ROI Tools",
      description: `While using 5 AI tools, ${aiTools.filter(t => t.activeUsers < 15).length} tools have limited adoption. Claude (34% of output, 28 users) and Cursor (24% of output, 22 users) are driving bulk of value. Consider consolidating spend on top performers.`,
      impact: "medium",
      priority: 2,
      actionItems: [
        "Increase Claude licenses for backend teams - highest quality code (91.2% merge rate)",
        "Expand Cursor adoption in frontend teams (72.1% merge rate)",
        "Negotiate enterprise licenses with top 2 tools for better pricing",
        "Evaluate ChatGPT & Gemini ROI - consider reducing seats if not delivering value"
      ],
      expectedOutcome: "20-25% reduction in AI tooling costs while maintaining output quality",
      timeframe: "4-6 weeks"
    },
    {
      id: "admin-quality-gates",
      title: "Establish AI Code Quality Standards & Review Processes",
      description: `With higher AI adoption comes responsibility for code quality guardrails. Currently 14.8 security flaws detected per 1,000 AI lines - need systematic review processes to maintain enterprise standards.`,
      impact: "high",
      priority: 1,
      actionItems: [
        "Define AI-generated code acceptance criteria: min 80% merge rate, zero security flaws",
        "Implement mandatory security scanning for all AI-assisted PRs",
        "Create code review checklist specifically for AI outputs (prompt quality, context completeness)",
        "Establish feedback loop: rejected AI code informs team training priorities"
      ],
      expectedOutcome: "Reduce security issues in AI code by 40%, improve overall merge rate to 85%+",
      timeframe: "1-2 weeks to implement"
    },
    {
      id: "admin-roi-tracking",
      title: "Measure & Communicate AI Investment ROI",
      description: `Org is $2.1M annual AI investment with 72% velocity gain. Need better measurement framework to justify spend and optimize allocation across teams.`,
      impact: "medium",
      priority: 2,
      actionItems: [
        "Create executive dashboard: cost per feature, ROI by tool, velocity impact per team",
        "Monthly business reviews with finance to track: cost/line of code, cost per delivered feature",
        "Share success stories with board/stakeholders - 8,420 hours saved YTD, 72.1% velocity boost",
        "Establish AI CoE (Center of Excellence) to coordinate strategy across 10 teams"
      ],
      expectedOutcome: "Gain stakeholder confidence, unlock budget for innovation initiatives",
      timeframe: "2-3 weeks"
    }
  ];
}

export function getManagerRecommendations(teamId: string): Recommendation[] {
  const managerTeam = teams.find(t => t.id === teamId);
  const teamData = teamUserActivity.find(t => t.teamId === teamId);
  
  if (!managerTeam || !teamData) return [];

  const adoptionRate = managerTeam.aiUsers / managerTeam.headCount;
  const mergeRateGap = 85 - managerTeam.aiMergeRate; // Target 85%
  const lowEngagementUsers = users.filter(u => u.teamId === teamId && u.aiPercent < 20);
  const topPerformers = users.filter(u => u.teamId === teamId && u.aiPercent > 70);

  return [
    {
      id: "manager-engagement",
      title: `Increase Team Engagement - ${managerTeam.aiUsers}/${managerTeam.headCount} Using AI`,
      description: `Your team has ${(adoptionRate * 100).toFixed(0)}% AI adoption. ${lowEngagementUsers.length} team members are underutilizing AI tools. This represents untapped productivity potential and skill growth opportunities.`,
      impact: "high",
      priority: 1,
      actionItems: [
        `One-on-one check-ins with ${lowEngagementUsers.slice(0, 2).map(u => u.name).join(", ")} to understand adoption barriers`,
        "Host weekly 30-min AI best practices sessions showcasing real examples from your codebase",
        "Create team-specific prompt templates for common tasks in your domain",
        "Celebrate wins: highlight team members who improved their AI usage month-over-month"
      ],
      expectedOutcome: "Increase team adoption from ${(adoptionRate * 100).toFixed(0)}% to 90%+ within 6 weeks",
      timeframe: "1-2 weeks to start"
    },
    {
      id: "manager-quality",
      title: `Improve Code Quality - Merge Rate ${managerTeam.aiMergeRate}% (Target: 85%+)`,
      description: `Your team's AI-assisted code has a ${managerTeam.aiMergeRate}% merge rate. There's a ${mergeRateGap}% gap to best-in-class teams. Higher merge rates mean better code quality and fewer iterations.`,
      impact: "medium",
      priority: 2,
      actionItems: [
        "Review recent rejected PRs with team - identify quality patterns to avoid",
        "Encourage use of Claude for complex architectures (91.2% merge rate vs team average)",
        "Host code review training: what makes AI-assisted code more mergeable",
        "Implement PR quality checklist specific to AI-assisted code (security, tests, documentation)"
      ],
      expectedOutcome: `Improve merge rate to 82%+ and reduce PR cycles by 1-2 iterations`,
      timeframe: "2-3 weeks"
    },
    {
      id: "manager-peer-learning",
      title: `Leverage High Performers - Deploy ${topPerformers.length} Power Users as Mentors`,
      description: `${topPerformers.length} team members are already using AI at 70%+. These power users have cracked the code - use them as internal experts to accelerate team adoption and knowledge sharing.`,
      impact: "high",
      priority: 1,
      actionItems: [
        `Ask ${topPerformers[0]?.name || "top performers"} to lead weekly 20-min "AI Office Hours" Q&A sessions`,
        "Create peer mentorship pairs: pair each power user with 1-2 underperformers",
        "Record 5-min screen recordings of your power users in action - build internal knowledge base",
        "Nominate power users for company-wide AI best practices competition/recognition"
      ],
      expectedOutcome: `Accelerate team adoption by 3x through peer influence, improve code quality by 10%`,
      timeframe: "1 week to kick off"
    },
    {
      id: "manager-tool-optimization",
      title: `Optimize Tool Stack - Your Team Uses ${managerTeam.primaryTool} Effectively`,
      description: `Your team is strongest with ${managerTeam.primaryTool} (${managerTeam.aiMergeRate}% merge rate). Some team members might benefit from complementary tools for different task types.`,
      impact: "medium",
      priority: 2,
      actionItems: [
        `Ensure all ${managerTeam.aiUsers} active users have primary tool (${managerTeam.primaryTool}) licenses`,
        "For complex logic, recommend Claude to ${Math.ceil(managerTeam.headCount * 0.3)} team members - higher quality",
        "Track which tools work best for different tasks in your domain (e.g., frontend vs backend)",
        "Quarterly tool effectiveness review: which tool drives best results for your team?"
      ],
      expectedOutcome: `Better tool-task matching, 15% fewer iterations on AI-assisted code`,
      timeframe: "Ongoing/quarterly review"
    }
  ];
}

export function getDeveloperRecommendations(userId: number): Recommendation[] {
  const developer = users.find(u => u.id === userId);
  
  if (!developer) return [];

  const tokensPerLine = developer.tokensUsed / Math.max(1, developer.aiLoC);
  const acceptanceRate = (developer.tokensUsed > 0 
    ? ((developer.cursorAcceptRate * developer.cursorCompletions + developer.copilotAcceptRate * developer.copilotSuggestions) 
       / (developer.cursorCompletions + developer.copilotSuggestions)) 
    : 0);
  const underperforming = developer.aiPercent < 30;

  const recommendations: Recommendation[] = [];

  if (tokensPerLine > 70) {
    recommendations.push({
      id: "dev-prompt-efficiency",
      title: "Improve Prompt Efficiency - Reduce Token Waste",
      description: `Your prompt efficiency is ${tokensPerLine.toFixed(0)} tokens/line (benchmark: 60). You're using ${((tokensPerLine / 60 - 1) * 100).toFixed(0)}% more tokens than ideal. Better prompts = lower costs and faster iterations.`,
      impact: "medium",
      priority: 1,
      actionItems: [
        "Be more specific with context: include file structure, existing patterns, constraints upfront",
        "Break large requests into smaller, focused prompts - one feature per request",
        "Use examples in your prompts: 'Similar to the existing fetchUser pattern, create fetchTeam'",
        "Test prompt variations: compare token usage for detailed vs brief prompts to find your sweet spot"
      ],
      expectedOutcome: `Reduce token usage by 15-20%, faster completions, lower AI costs`,
      timeframe: "1-2 weeks to master"
    });
  }

  if (acceptanceRate < 60) {
    recommendations.push({
      id: "dev-completion-rate",
      title: "Improve Code Acceptance Rate - Quality Over Quantity",
      description: `Your completion acceptance rate is ${acceptanceRate.toFixed(0)}% (high-performers: 75%+). Lower acceptance means more time spent refining AI output than using it productively.`,
      impact: "high",
      priority: 1,
      actionItems: [
        "Provide more context in prompts: error messages, test expectations, coding standards",
        "Review rejected completions - identify patterns (e.g., missing error handling, style issues)",
        "Try Claude for complex logic - tends to have better acceptance on architectural decisions",
        "Create a personal prompt template library: save your best formulas for recurring task types"
      ],
      expectedOutcome: `Increase acceptance rate to 70%+, save 3-5 hours/week on code review`,
      timeframe: "2-3 weeks"
    });
  }

  if (underperforming) {
    recommendations.push({
      id: "dev-adoption",
      title: `Increase AI Usage - You're at ${developer.aiPercent}%, Opportunity at 50%+`,
      description: `You have ${developer.aiPercent}% AI-assisted code. Peers with 50%+ adoption are delivering faster while growing their skills. Start with routine tasks to build confidence.`,
      impact: "high",
      priority: 1,
      actionItems: [
        "Begin with repetitive tasks: test generation, boilerplate, documentation, refactoring",
        "Use AI as a pair programmer for complex features - get an external perspective",
        "Set a weekly goal: use AI on 5 commits minimum to build muscle memory",
        "Schedule 1-hour 'AI exploration session' weekly: try it on different problem types"
      ],
      expectedOutcome: `Reach 40%+ AI adoption within 4 weeks, 20% faster feature delivery`,
      timeframe: "Immediate"
    });
  } else {
    recommendations.push({
      id: "dev-skills",
      title: "Level Up AI Mastery - From User to Power User",
      description: `You're already at ${developer.aiPercent}% adoption! Now's the time to deepen your skills. Power users combine AI with architectural thinking for ${developer.aiPercent > 75 ? "even Higher" : "higher"} quality output.`,
      impact: "medium",
      priority: 2,
      actionItems: [
        "Learn system prompts: structure prompts like a senior engineer would communicate",
        "Master context management: share relevant code patterns before asking for new code",
        "Explore multi-turn conversations: iterate with Claude/Cursor to refine outputs",
        "Study your team's best-reviewed AI code: reverse-engineer what makes it great"
      ],
      expectedOutcome: `Unlock 30% faster shipping by knowing which tasks to delegate to AI`,
      timeframe: "1-3 weeks"
    });
  }

  // Add a general productivity recommendation for all developers
  recommendations.push({
    id: "dev-daily-workflow",
    title: "Optimize Daily Workflow with AI",
    description: `Integrating AI into your daily routine compounds over time. Small changes to how you approach coding with AI can yield 20-30% productivity gains.`,
    impact: "medium",
    priority: 2,
    actionItems: [
      `Start your day with AI: generate today's task list using ${developer.primaryTool}`,
      "Use AI for code reviews: have it spot potential bugs before human review",
      "Delegate tedious work: docs, logging, error handling, type definitions - AI excels here",
      "Weekly reflection: which tasks did AI accelerate most? Double down on those patterns"
    ],
    expectedOutcome: `5-10 hours/week saved through better workflow integration`,
    timeframe: "1 week to establish habit"
  });

  return recommendations;
}

export type UserRole = "Admin" | "Manager" | "Developer";
