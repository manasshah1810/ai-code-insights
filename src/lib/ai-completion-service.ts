/**
 * AI Completion Service
 * Calls the actual AI endpoint for live recommendations and completions
 */

const AI_ENDPOINT = "http://34.123.31.83:8080/completion";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: 1 | 2;
  actionItems: string[];
  expectedOutcome: string;
  timeframe: string;
  visualizations: Array<{
    type: "metric" | "chart" | "trend" | "gauge" | "progress";
    label: string;
    value: string | number;
    unit?: string;
    target?: string | number;
    change?: string;
  }>;
}

export interface CompletionRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  completion: string;
  tokens: number;
  model: string;
}

/**
 * Call the AI endpoint with a prompt and get live completions
 */
export async function getAICompletion(prompt: string, maxTokens: number = 300): Promise<string> {
  try {
    const request: CompletionRequest = {
      prompt,
      maxTokens,
      temperature: 0.7,
    };

    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.error(`AI endpoint error: ${response.status} ${response.statusText}`);
      throw new Error(`AI endpoint returned ${response.status}`);
    }

    const data: CompletionResponse = await response.json();
    return data.completion || "";
  } catch (error) {
    console.error("AI Completion Service Error:", error);
    throw error;
  }
}

/**
 * Generate admin recommendations via AI
 */
export async function generateAdminRecommendations(
  orgMetrics: {
    totalTeams: number;
    avgAdoption: number;
    totalTokens: number;
    totalLoC: number;
    aiLoC: number;
  }
): Promise<Array<{
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: 1 | 2;
  actionItems: string[];
  expectedOutcome: string;
  timeframe: string;
  visualizations: Array<{
    type: "metric" | "chart" | "trend" | "gauge" | "progress";
    label: string;
    value: string | number;
    unit?: string;
    target?: string | number;
    change?: string;
  }>;
}>> {
  const prompt = `You are an AI adoption strategist. Generate EXACTLY 5 specific, actionable recommendations for an executive overseeing AI adoption across ${orgMetrics.totalTeams} engineering teams.

Organization Metrics:
- Average AI adoption rate: ${orgMetrics.avgAdoption}%
- Total tokens used: ${orgMetrics.totalTokens.toLocaleString()}
- Total lines of code: ${orgMetrics.totalLoC.toLocaleString()}
- AI-assisted lines of code: ${orgMetrics.aiLoC.toLocaleString()}
- AI code percentage: ${((orgMetrics.aiLoC / orgMetrics.totalLoC) * 100).toFixed(1)}%

IMPORTANT: Keep each description to LESS THAN 100 WORDS.

For EACH of the 5 recommendations, provide ONLY this exact JSON structure (no markdown, no explanation):
{
  "id": "admin-{number}",
  "title": "Clear, actionable title",
  "description": "1-2 sentences (less than 100 words) explaining the opportunity",
  "impact": "high|medium|low",
  "priority": 1|2,
  "actionItems": ["action 1", "action 2", "action 3"],
  "expectedOutcome": "Specific, measurable outcome",
  "timeframe": "1-3 months|3-6 months|6-12 months",
  "visualizations": [
    {"type": "metric", "label": "Current Adoption Rate", "value": ${orgMetrics.avgAdoption}, "unit": "%", "target": 85},
    {"type": "gauge", "label": "Implementation Impact", "value": 75, "unit": "%"},
    {"type": "progress", "label": "Team Readiness", "value": ${Math.min(100, orgMetrics.avgAdoption + 15)}, "target": 100},
    {"type": "trend", "label": "Token Velocity", "value": "↑ 23%", "change": "+23%"}
  ]
}

Provide nothing else. Output ONLY 5 valid JSON objects, each item on new line prefixed with "JSON:".`;

  try {
    const completion = await getAICompletion(prompt, 2000);
    const recommendations = parseRecommendations(completion);
    // Ensure we return at least 5 recommendations, otherwise return fallback
    return recommendations.length >= 5 ? recommendations.slice(0, 5) : getFallbackAdminRecommendations(orgMetrics);
  } catch (error) {
    console.error("Failed to generate admin recommendations:", error);
    return getFallbackAdminRecommendations(orgMetrics);
  }
}

/**
 * Generate manager recommendations via AI
 */
export async function generateManagerRecommendations(
  teamMetrics: {
    teamName: string;
    headCount: number;
    activeUsers: number;
    aiCodePercent: number;
    mergeRate: number;
    lowEngagementCount: number;
  }
): Promise<Array<{
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: 1 | 2;
  actionItems: string[];
  expectedOutcome: string;
  timeframe: string;
  visualizations: Array<{
    type: "metric" | "chart" | "trend" | "gauge" | "progress";
    label: string;
    value: string | number;
    unit?: string;
    target?: string | number;
    change?: string;
  }>;
}>> {
  const adoptionRate = ((teamMetrics.activeUsers / teamMetrics.headCount) * 100).toFixed(0);
  const prompt = `You are a team productivity coach specializing in AI adoption. Generate EXACTLY 5 specific, actionable recommendations for a manager overseeing the "${teamMetrics.teamName}" engineering team.

Team Metrics:
- Team size: ${teamMetrics.headCount} engineers
- Active AI users: ${teamMetrics.activeUsers} (${adoptionRate}% adoption)
- Engineers below adoption curve: ${teamMetrics.lowEngagementCount}
- AI code percentage: ${teamMetrics.aiCodePercent}%
- PR merge rate: ${teamMetrics.mergeRate}%

IMPORTANT: Keep each description to LESS THAN 100 WORDS. Focus on team-specific improvements.

For EACH of the 5 recommendations, provide ONLY this exact JSON structure (no markdown, no explanation):
{
  "id": "manager-{number}",
  "title": "Clear, actionable title for this team",
  "description": "1-2 sentences (less than 100 words) specific to this team's situation",
  "impact": "high|medium|low",
  "priority": 1|2,
  "actionItems": ["action 1", "action 2", "action 3"],
  "expectedOutcome": "Specific, measurable outcome for this team",
  "timeframe": "1-3 months|3-6 months|6-12 months",
  "visualizations": [
    {"type": "metric", "label": "Team Adoption Rate", "value": ${adoptionRate}, "unit": "%", "target": 90},
    {"type": "gauge", "label": "Engagement Level", "value": ${Math.max(40, parseInt(adoptionRate) - 20)}, "unit": "%"},
    {"type": "progress", "label": "Active Users Goal", "value": ${teamMetrics.activeUsers}, "target": ${teamMetrics.headCount}},
    {"type": "trend", "label": "Merge Rate Trend", "value": ${teamMetrics.mergeRate}, "unit": "%", "change": "↑ 8%"}
  ]
}

Provide nothing else. Output ONLY 5 valid JSON objects, each item on new line prefixed with "JSON:".`;

  try {
    const completion = await getAICompletion(prompt, 2000);
    const recommendations = parseRecommendations(completion);
    return recommendations.length >= 5 ? recommendations.slice(0, 5) : getFallbackManagerRecommendations(teamMetrics);
  } catch (error) {
    console.error("Failed to generate manager recommendations:", error);
    return getFallbackManagerRecommendations(teamMetrics);
  }
}

/**
 * Generate developer recommendations via AI
 */
export async function generateDeveloperRecommendations(
  developerMetrics: {
    name: string;
    aiPercent: number;
    tokensUsed: number;
    aiLoC: number;
    commitCount: number;
    mergeRate: number;
    acceptanceRate: number;
    primaryTool: string;
  }
): Promise<Array<{
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: 1 | 2;
  actionItems: string[];
  expectedOutcome: string;
  timeframe: string;
  visualizations: Array<{
    type: "metric" | "chart" | "trend" | "gauge" | "progress";
    label: string;
    value: string | number;
    unit?: string;
    target?: string | number;
    change?: string;
  }>;
}>> {
  const tokensPerLine = developerMetrics.tokensUsed / Math.max(1, developerMetrics.aiLoC);
  const prompt = `You are an AI productivity coach for individual developers. Generate EXACTLY 5 specific, actionable recommendations for "${developerMetrics.name}" to improve their AI usage and productivity.

Developer Metrics:
- Current AI usage: ${developerMetrics.aiPercent}%
- Primary AI tool: ${developerMetrics.primaryTool}
- Commits: ${developerMetrics.commitCount}
- Tokens used: ${developerMetrics.tokensUsed.toLocaleString()}
- AI lines of code: ${developerMetrics.aiLoC.toLocaleString()}
- Code acceptance rate: ${developerMetrics.acceptanceRate.toFixed(0)}%
- PR merge rate: ${developerMetrics.mergeRate}%
- Token efficiency: ${tokensPerLine.toFixed(1)} tokens/line

IMPORTANT: Keep each description to LESS THAN 100 WORDS. Be specific to their metrics and situation.

For EACH recommendation (EXACTLY 5), provide ONLY this exact JSON structure (no markdown, no explanation):
{
  "id": "dev-{number}",
  "title": "Clear, actionable title for this developer",
  "description": "1-2 sentences (less than 100 words) specific to their situation and metrics",
  "impact": "high|medium|low",
  "priority": 1|2,
  "actionItems": ["action 1", "action 2", "action 3"],
  "expectedOutcome": "Specific, measurable outcome they can achieve",
  "timeframe": "1-3 months|3-6 months|6-12 months",
  "visualizations": [
    {"type": "metric", "label": "Current AI Usage", "value": ${developerMetrics.aiPercent}, "unit": "%", "target": 70},
    {"type": "gauge", "label": "Code Quality Score", "value": ${Math.min(100, developerMetrics.acceptanceRate)}, "unit": "%"},
    {"type": "progress", "label": "Productivity Growth", "value": ${Math.max(30, developerMetrics.aiPercent - 10)}, "target": 100},
    {"type": "trend", "label": "Merge Rate Trend", "value": ${developerMetrics.mergeRate}, "unit": "%", "change": "↑ 12%"}
  ]
}

Provide nothing else. Output ONLY 5 valid JSON objects, each item on new line prefixed with "JSON:".`;

  try {
    const completion = await getAICompletion(prompt, 2000);
    const recommendations = parseRecommendations(completion);
    return recommendations.length >= 5 ? recommendations.slice(0, 5) : getFallbackDeveloperRecommendations(developerMetrics);
  } catch (error) {
    console.error("Failed to generate developer recommendations:", error);
    return getFallbackDeveloperRecommendations(developerMetrics);
  }
}

/**
 * Parse AI-generated recommendations from response text
 */
function parseRecommendations(text: string): any[] {
  const recommendations = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.startsWith("JSON:")) {
      try {
        const json = JSON.parse(line.substring(5).trim());
        recommendations.push(json);
      } catch (e) {
        console.error("Failed to parse recommendation JSON:", line, e);
      }
    }
  }

  return recommendations;
}

/**
 * Fallback admin recommendations (shown if AI service fails)
 */
function getFallbackAdminRecommendations(orgMetrics: any): Recommendation[] {
  return [
    {
      id: "admin-1",
      title: "Establish AI Adoption Center of Excellence",
      description: "Create a dedicated team to drive AI adoption, establish best practices, and provide training across all teams. This ensures consistent implementation and measurable ROI.",
      impact: "high",
      priority: 1,
      actionItems: ["Form cross-functional CoE team", "Develop AI best practices guide", "Schedule quarterly training", "Track adoption metrics"],
      expectedOutcome: "Increase adoption rate by 25-30% within 6 months",
      timeframe: "3-6 months",
      visualizations: [
        { type: "metric", label: "Current Adoption", value: orgMetrics.avgAdoption, unit: "%", target: 85 },
        { type: "gauge", label: "CoE Readiness", value: 65, unit: "%" },
        { type: "progress", label: "Team Alignment", value: 70, target: 100 },
        { type: "trend", label: "Adoption Velocity", value: "↑ 18%", change: "+18%" }
      ]
    },
    {
      id: "admin-2",
      title: "Implement AI Token Budget & Governance",
      description: "Set up token allocation system per team with monthly reviews. Monitor spending patterns and optimize tool selection to maximize ROI and prevent wastage.",
      impact: "high",
      priority: 1,
      actionItems: ["Define token budgets per team", "Set up monitoring dashboard", "Monthly review cadence", "Optimize tool selection"],
      expectedOutcome: "Reduce token cost per output by 20-25%",
      timeframe: "1-3 months",
      visualizations: [
        { type: "metric", label: "Monthly Token Spend", value: Math.round(orgMetrics.totalTokens / 12), unit: "tokens" },
        { type: "gauge", label: "Budget Efficiency", value: 72, unit: "%" },
        { type: "progress", label: "Cost Optimization", value: 65, target: 100 },
        { type: "trend", label: "Waste Reduction", value: "↓ 22%", change: "-22%" }
      ]
    },
    {
      id: "admin-3",
      title: "Enhance Code Quality Through AI Review",
      description: "Leverage AI tools for automated code reviews and quality gates. Integrate with CI/CD to catch issues early and improve overall code quality metrics.",
      impact: "medium",
      priority: 2,
      actionItems: ["Select code review AI tools", "Integrate with CI/CD pipeline", "Set quality thresholds", "Train teams on new workflows"],
      expectedOutcome: "Reduce defect escape rate by 15-20%",
      timeframe: "3-6 months",
      visualizations: [
        { type: "metric", label: "AI Code %", value: Math.round((orgMetrics.aiLoC / orgMetrics.totalLoC) * 100), unit: "%" },
        { type: "gauge", label: "Quality Score", value: 78, unit: "%" },
        { type: "progress", label: "Review Automation", value: 45, target: 90 },
        { type: "trend", label: "Bug Detection", value: "↑ 35%", change: "+35%" }
      ]
    },
    {
      id: "admin-4",
      title: "Create AI Skills Development Program",
      description: "Launch comprehensive training covering prompt engineering, tool mastery, and advanced techniques. Certify teams to ensure knowledge distribution and consistency.",
      impact: "medium",
      priority: 2,
      actionItems: ["Design curriculum", "Create certification program", "Schedule monthly sessions", "Measure skill progression"],
      expectedOutcome: "Achieve 90%+ team proficiency in AI tools",
      timeframe: "6-12 months",
      visualizations: [
        { type: "metric", label: "Teams Trained", value: Math.min(orgMetrics.totalTeams, Math.round(orgMetrics.totalTeams * 0.6)), unit: `/${orgMetrics.totalTeams}` },
        { type: "gauge", label: "Skill Level", value: 64, unit: "%" },
        { type: "progress", label: "Training Completion", value: 58, target: 100 },
        { type: "trend", label: "Productivity Gain", value: "↑ 28%", change: "+28%" }
      ]
    },
    {
      id: "admin-5",
      title: "Build AI-Powered Innovation Pipeline",
      description: "Establish process for identifying, testing, and scaling AI solutions. Create feedback loops to continuously improve outcomes and stay ahead of competition.",
      impact: "medium",
      priority: 2,
      actionItems: ["Set up innovation framework", "Create fast-track approval process", "Monthly innovation reviews", "Document lessons learned"],
      expectedOutcome: "Launch 3-5 new AI-powered features quarterly",
      timeframe: "6-12 months",
      visualizations: [
        { type: "metric", label: "Active Projects", value: 8, unit: "projects" },
        { type: "gauge", label: "Innovation Score", value: 71, unit: "%" },
        { type: "progress", label: "Pipeline Health", value: 76, target: 100 },
        { type: "trend", label: "Time to Market", value: "↓ 40%", change: "-40%" }
      ]
    }
  ];
}

/**
 * Fallback manager recommendations (shown if AI service fails)
 */
function getFallbackManagerRecommendations(teamMetrics: any): Recommendation[] {
  const adoptionRate = (teamMetrics.activeUsers / teamMetrics.headCount) * 100;
  
  return [
    {
      id: "manager-1",
      title: "Target Low-Adoption Engineers with Personalized Coaching",
      description: `Focus on the ${teamMetrics.lowEngagementCount} engineers below adoption curve. Pair them with AI champions for 1:1 sessions and hands-on training tailored to their role.`,
      impact: "high",
      priority: 1,
      actionItems: ["Identify adoption blockers", "Schedule 1:1 coaching sessions", "Assign AI mentors", "Weekly check-ins for first month"],
      expectedOutcome: `Bring ${teamMetrics.lowEngagementCount} users to 50%+ AI adoption`,
      timeframe: "1-3 months",
      visualizations: [
        { type: "metric", label: "Current Adoption", value: adoptionRate.toFixed(0), unit: "%", target: 90 },
        { type: "gauge", label: "Team Engagement", value: Math.max(40, adoptionRate - 20), unit: "%" },
        { type: "progress", label: "Low-Adoption Coverage", value: teamMetrics.lowEngagementCount, target: teamMetrics.lowEngagementCount },
        { type: "trend", label: "Adoption Trend", value: "↑ 15%", change: "+15%" }
      ]
    },
    {
      id: "manager-2",
      title: "Implement Team-Wide AI Code Review Standards",
      description: "Establish peer review process for AI-assisted code. Share successful patterns and create team knowledge base of effective prompts and techniques.",
      impact: "high",
      priority: 1,
      actionItems: ["Define code standard for AI use", "Create prompt library", "Weekly code review sessions", "Document best practices"],
      expectedOutcome: `Achieve ${teamMetrics.aiCodePercent + 15}%+ AI-assisted code percentage`,
      timeframe: "3-6 months",
      visualizations: [
        { type: "metric", label: "AI Code %", value: teamMetrics.aiCodePercent, unit: "%" },
        { type: "gauge", label: "Standard Adoption", value: 68, unit: "%" },
        { type: "progress", label: "Team Alignment", value: 72, target: 100 },
        { type: "trend", label: "Code Velocity", value: "↑ 22%", change: "+22%" }
      ]
    },
    {
      id: "manager-3",
      title: "Create Monthly AI Innovation Showcase",
      description: "Host showcase events where engineers share AI-powered solutions. Celebrate wins and create friendly competition to drive engagement and knowledge sharing.",
      impact: "medium",
      priority: 2,
      actionItems: ["Schedule monthly showcases", "Define submission criteria", "Recognize achievements", "Collect feedback for improvement"],
      expectedOutcome: "Increase team motivation and knowledge sharing by 30%+",
      timeframe: "1-3 months",
      visualizations: [
        { type: "metric", label: "Monthly Participants", value: Math.round(teamMetrics.headCount * 0.7), unit: `/${teamMetrics.headCount}` },
        { type: "gauge", label: "Team Morale", value: 82, unit: "%" },
        { type: "progress", label: "Knowledge Sharing", value: 65, target: 100 },
        { type: "trend", label: "Engagement Growth", value: "↑ 32%", change: "+32%" }
      ]
    },
    {
      id: "manager-4",
      title: "Optimize Merge Process for AI-Assisted Work",
      description: "Review and streamline PR merge workflow. Reduce friction for AI-assisted code while maintaining quality gates and security standards.",
      impact: "medium",
      priority: 2,
      actionItems: ["Audit current merge process", "Identify bottlenecks", "Implement parallel reviews", "Train team on new workflow"],
      expectedOutcome: `Improve merge rate from ${teamMetrics.mergeRate}% to 85%+`,
      timeframe: "1-3 months",
      visualizations: [
        { type: "metric", label: "Current Merge Rate", value: teamMetrics.mergeRate, unit: "%" },
        { type: "gauge", label: "Process Efficiency", value: 71, unit: "%" },
        { type: "progress", label: "Bottleneck Resolution", value: 58, target: 100 },
        { type: "trend", label: "Throughput", value: "↑ 18%", change: "+18%" }
      ]
    },
    {
      id: "manager-5",
      title: "Establish Team-Level AI Metrics & Goals",
      description: "Set clear, measurable AI adoption goals. Track progress weekly and adjust strategies based on data to drive continuous improvement.",
      impact: "medium",
      priority: 2,
      actionItems: ["Define KPIs for AI usage", "Set team targets", "Weekly metric reviews", "Adjust strategy monthly"],
      expectedOutcome: "Achieve 100% AI tool adoption across team",
      timeframe: "6-12 months",
      visualizations: [
        { type: "metric", label: "Active Users", value: teamMetrics.activeUsers, unit: `/${teamMetrics.headCount}` },
        { type: "gauge", label: "Goal Progress", value: (teamMetrics.activeUsers / teamMetrics.headCount) * 100, unit: "%" },
        { type: "progress", label: "Universal Adoption", value: teamMetrics.activeUsers, target: teamMetrics.headCount },
        { type: "trend", label: "Growth Rate", value: "↑ 12%", change: "+12%" }
      ]
    }
  ];
}

/**
 * Fallback developer recommendations (shown if AI service fails)
 */
function getFallbackDeveloperRecommendations(developerMetrics: any): Recommendation[] {
  return [
    {
      id: "dev-1",
      title: "Master Prompt Engineering for Your Domain",
      description: "Study prompt patterns specific to your coding domain. Learn from successful prompts and iteratively improve them to get better outputs faster.",
      impact: "high",
      priority: 1,
      actionItems: ["Create prompt library", "Document successful patterns", "Test variations daily", "Share with team"],
      expectedOutcome: `Increase code acceptance rate from ${developerMetrics.acceptanceRate}% to 90%+`,
      timeframe: "1-3 months",
      visualizations: [
        { type: "metric", label: "Current AI Usage", value: developerMetrics.aiPercent, unit: "%", target: 70 },
        { type: "gauge", label: "Prompt Quality", value: 68, unit: "%" },
        { type: "progress", label: "Mastery Level", value: developerMetrics.acceptanceRate, target: 95 },
        { type: "trend", label: "Improvement Rate", value: "↑ 24%", change: "+24%" }
      ]
    },
    {
      id: "dev-2",
      title: "Optimize Token Efficiency Per Line",
      description: "Analyze your token-to-output ratio. Break down complex requests into smaller prompts and use context clipping to reduce waste.",
      impact: "high",
      priority: 1,
      actionItems: ["Track token usage", "Break down large tasks", "Use context wisely", "Measure improvements"],
      expectedOutcome: "Reduce tokens per line by 20-25%",
      timeframe: "1-3 months",
      visualizations: [
        { type: "metric", label: "Tokens Used", value: developerMetrics.tokensUsed.toLocaleString(), unit: "total" },
        { type: "gauge", label: "Efficiency Score", value: 65, unit: "%" },
        { type: "progress", label: "Cost Reduction", value: 72, target: 100 },
        { type: "trend", label: "Waste Reduction", value: "↓ 22%", change: "-22%" }
      ]
    },
    {
      id: "dev-3",
      title: "Expand AI-Assisted Code Coverage",
      description: `Currently at ${developerMetrics.aiPercent}% AI usage. Identify more opportunities to use AI for repetitive tasks, boilerplate, and complex logic generation.`,
      impact: "medium",
      priority: 2,
      actionItems: ["Audit manual tasks", "Identify automation opportunities", "Test AI for each pattern", "Integrate into workflow"],
      expectedOutcome: `Increase AI usage to 70%+ of commits`,
      timeframe: "3-6 months",
      visualizations: [
        { type: "metric", label: "AI Commits", value: developerMetrics.commitCount, unit: "commits" },
        { type: "gauge", label: "Coverage", value: developerMetrics.aiPercent, unit: "%" },
        { type: "progress", label: "Expansion Goal", value: developerMetrics.aiPercent, target: 70 },
        { type: "trend", label: "Adoption Rate", value: "↑ 18%", change: "+18%" }
      ]
    },
    {
      id: "dev-4",
      title: "Improve Code Acceptance Rate & PR Merges",
      description: `Your merge rate is ${developerMetrics.mergeRate}%. Focus on code quality and AI output validation to increase acceptance and reduce review iterations.`,
      impact: "medium",
      priority: 2,
      actionItems: ["Review AI output thoroughly", "Add extra validation", "Test edge cases", "Document assumptions"],
      expectedOutcome: `Improve merge rate to 90%+ (from ${developerMetrics.mergeRate}%)`,
      timeframe: "1-3 months",
      visualizations: [
        { type: "metric", label: "Current Merge Rate", value: developerMetrics.mergeRate, unit: "%" },
        { type: "gauge", label: "Code Quality", value: Math.min(100, developerMetrics.acceptanceRate + 5), unit: "%" },
        { type: "progress", label: "Quality Improvement", value: developerMetrics.acceptanceRate, target: 95 },
        { type: "trend", label: "Review Time", value: "↓ 35%", change: "-35%" }
      ]
    },
    {
      id: "dev-5",
      title: "Build Advanced AI Integration Patterns",
      description: "Move beyond basic code generation. Learn advanced patterns: complex refactoring, architecture design, testing, and documentation generation with AI.",
      impact: "medium",
      priority: 2,
      actionItems: ["Study advanced use cases", "Experiment weekly", "Document successful patterns", "Share learnings"],
      expectedOutcome: "Become AI productivity expert in your team",
      timeframe: "6-12 months",
      visualizations: [
        { type: "metric", label: "AI LoC Generated", value: developerMetrics.aiLoC.toLocaleString(), unit: "lines" },
        { type: "gauge", label: "Expertise Level", value: 72, unit: "%" },
        { type: "progress", label: "Advanced Skills", value: 55, target: 100 },
        { type: "trend", label: "Productivity Gain", value: "↑ 40%", change: "+40%" }
      ]
    }
  ];
}
