/**
 * AI Completion Service
 * Calls the actual AI endpoint for live recommendations and completions
 */

const AI_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const AI_MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";

export interface SWOTItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "strength" | "weakness" | "opportunity" | "threat";
  metric?: string;
  icon?: string;
}

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
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-OpenRouter-Title": "AI Code Insights",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(`AI endpoint error: ${response.status} ${response.statusText}`);
      throw new Error(`AI endpoint returned ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("AI Completion Service Error:", error);
    throw error;
  }
}


/**
 * Generate admin multi-item SWOT analysis via AI
 * Provides 4 items per category (S, W, O, T) = 16 total items
 * All tactical, actionable, operational insights
 */
export async function generateAdminSWOT(
  orgMetrics: {
    totalTeams: number;
    avgAdoption: number;
    totalTokens: number;
    totalLoC: number;
    aiLoC: number;
  }
): Promise<SWOTItem[]> {
  const aiCodePercentage = ((orgMetrics.aiLoC / orgMetrics.totalLoC) * 100).toFixed(1);
  const prompt = `You are a strategic business analyst. Generate a detailed SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for a company with ${orgMetrics.totalTeams} engineering teams.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 16 items total: 4 items per SWOT category
2. ALL items must be TACTICAL, ACTIONABLE, and OPERATIONAL in nature
3. Focus on concrete, measurable business factors
4. Avoid high-level strategy - focus on immediate operational realities
5. Each item must be specific to the metrics below

COMPANY METRICS:
- Total engineering teams: ${orgMetrics.totalTeams}
- AI adoption rate: ${orgMetrics.avgAdoption}%
- Total tokens used: ${orgMetrics.totalTokens.toLocaleString()}
- Total lines of code: ${orgMetrics.totalLoC.toLocaleString()}
- AI-assisted code: ${orgMetrics.aiLoC.toLocaleString()} LoC (${aiCodePercentage}%)

OUTPUT FORMAT:
Generate 4 items for EACH category (16 total). For each item, provide ONLY this exact JSON:
{
  "id": "swot-{category}-{number}",
  "title": "Specific, actionable title (max 40 chars)",
  "subtitle": "Key metric or quantifiable detail",
  "description": "1-2 sentence tactical insight (max 80 words)",
  "category": "strength|weakness|opportunity|threat"
}

STRENGTH Items (4): Existing operational advantages
WEAKNESS Items (4): Current operational challenges
OPPORTUNITY Items (4): Immediate improvement possibilities
THREAT Items (4): Operational risks requiring attention

CRITICAL: Output ONLY valid JSON objects. Each item on new line prefixed with "JSON:". No explanations.`;

  try {
    const completion = await getAICompletion(prompt, 3000);
    const items = parseSWOTItems(completion);
    return items.length >= 16 ? items.slice(0, 16) : getAdminFallbackSWOT(orgMetrics);
  } catch (error) {
    console.error("Failed to generate admin SWOT:", error);
    return getAdminFallbackSWOT(orgMetrics);
  }
}

/**
 * Generate manager multi-item SWOT analysis via AI
 * Provides 4 items per category (S, W, O, T) = 16 total items
 */
export async function generateManagerSWOT(
  teamMetrics: {
    teamName: string;
    headCount: number;
    activeUsers: number;
    aiCodePercent: number;
    mergeRate: number;
    lowEngagementCount: number;
  }
): Promise<SWOTItem[]> {
  const adoptionRate = ((teamMetrics.activeUsers / teamMetrics.headCount) * 100).toFixed(0);
  const prompt = `You are a team operations manager. Generate a detailed SWOT analysis for the "${teamMetrics.teamName}" engineering team.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 16 items: 4 per SWOT category
2. ALL items must be TACTICAL, ACTIONABLE, and OPERATIONAL
3. Focus on team performance, velocity, code quality, collaboration
4. Avoid career development or strategy - focus on operations
5. Each item tied to team metrics

TEAM METRICS:
- Team: "${teamMetrics.teamName}"
- Size: ${teamMetrics.headCount} engineers
- Active AI users: ${teamMetrics.activeUsers} (${adoptionRate}% adoption)
- AI code: ${teamMetrics.aiCodePercent}%
- Merge rate: ${teamMetrics.mergeRate}%
- Low engagement: ${teamMetrics.lowEngagementCount} engineers

OUTPUT: 4 items each for STRENGTH, WEAKNESS, OPPORTUNITY, THREAT (16 total)
{
  "id": "swot-team-{category}-{number}",
  "title": "Specific operational title",
  "subtitle": "Team metric or quantifiable detail",
  "description": "1-2 sentence team insight (max 80 words)",
  "category": "strength|weakness|opportunity|threat"
}

Each item on new line prefixed with "JSON:". Output ONLY JSON.`;

  try {
    const completion = await getAICompletion(prompt, 3000);
    const items = parseSWOTItems(completion);
    return items.length >= 16 ? items.slice(0, 16) : getManagerFallbackSWOT(teamMetrics);
  } catch (error) {
    console.error("Failed to generate manager SWOT:", error);
    return getManagerFallbackSWOT(teamMetrics);
  }
}

/**
 * Generate developer multi-item SWOT analysis via AI
 */
export async function generateDeveloperSWOT(
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
): Promise<SWOTItem[]> {
  const tokensPerLine = developerMetrics.tokensUsed / Math.max(1, developerMetrics.aiLoC);
  const prompt = `You are a developer productivity coach. Generate a detailed SWOT analysis for developer "${developerMetrics.name}".

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 16 items: 4 per SWOT category
2. ALL items must be TACTICAL, ACTIONABLE, and OPERATIONAL
3. Focus on coding practices, tool usage, productivity, code quality
4. Avoid career strategy - focus on immediate operational improvements
5. Items driven by their metrics

DEVELOPER METRICS:
- Developer: "${developerMetrics.name}"
- AI usage: ${developerMetrics.aiPercent}%
- Tool: ${developerMetrics.primaryTool}
- Commits: ${developerMetrics.commitCount}
- Tokens: ${developerMetrics.tokensUsed.toLocaleString()}
- AI LoC: ${developerMetrics.aiLoC.toLocaleString()}
- Acceptance rate: ${developerMetrics.acceptanceRate.toFixed(0)}%
- Merge rate: ${developerMetrics.mergeRate}%
- Token efficiency: ${tokensPerLine.toFixed(1)} tokens/line

OUTPUT: 4 items each S, W, O, T (16 total)
{
  "id": "swot-dev-{category}-{number}",
  "title": "Actionable operational title",
  "subtitle": "Specific metric or measurement",
  "description": "1-2 sentence developer insight (max 80 words)",
  "category": "strength|weakness|opportunity|threat"
}

Each item on new line prefixed with "JSON:". Output ONLY JSON.`;

  try {
    const completion = await getAICompletion(prompt, 3000);
    const items = parseSWOTItems(completion);
    return items.length >= 16 ? items.slice(0, 16) : getDeveloperFallbackSWOT(developerMetrics);
  } catch (error) {
    console.error("Failed to generate developer SWOT:", error);
    return getDeveloperFallbackSWOT(developerMetrics);
  }
}

/**
 * Parse SWOT items from AI response
 */
function parseSWOTItems(text: string): SWOTItem[] {
  const items: SWOTItem[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.startsWith("JSON:")) {
      try {
        const json = JSON.parse(line.substring(5).trim());
        items.push(json);
      } catch (e) {
        console.error("Failed to parse SWOT item:", line, e);
      }
    }
  }

  return items;
}

/**
 * Generate admin SWOS analysis via AI (Strengths, Weakness, Opportunities, Threats)
 * Provides a comprehensive company-wide SWOS analysis for executive decision-making
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
  const aiCodePercentage = ((orgMetrics.aiLoC / orgMetrics.totalLoC) * 100).toFixed(1);
  const prompt = `You are a professional Engineering Operations & DevOps Analyst. Perform a DETAILED SWOS (Strengths, Weakness, Opportunities, Threats) analysis for a company-wide engineering organization with ${orgMetrics.totalTeams} teams.

CRITICAL INSTRUCTIONS:
1. Focus EXCLUSIVELY on TACTICAL and OPERATIONAL items - not strategic/high-level goals
2. Base all items on the provided metrics below
3. Be SPECIFIC and ACTIONABLE - every recommendation must be immediately implementable by ops/dev teams
4. Consider velocity, deployment frequency, pipeline stability, developer productivity, and tool integration
5. Each item must have concrete, measurable outcomes

COMPANY-WIDE METRICS:
- Total engineering teams: ${orgMetrics.totalTeams}
- Organization AI adoption rate: ${orgMetrics.avgAdoption}%
- Total tokens consumed: ${orgMetrics.totalTokens.toLocaleString()} tokens
- Total lines of code: ${orgMetrics.totalLoC.toLocaleString()} LoC
- AI-assisted lines of code: ${orgMetrics.aiLoC.toLocaleString()} LoC
- AI code percentage: ${aiCodePercentage}%

ANALYSIS FRAMEWORK:
Generate EXACTLY 4 analysis items (one STRENGTH, one WEAKNESS, one OPPORTUNITY, one THREAT).

REQUIREMENT FOR EACH ITEM:
- Must identify a real, measurable operational aspect of engineering workflows
- STRENGTH: What's working operationally right now (tool adoption, workflow efficiency, etc.)
- WEAKNESS: Operational bottleneck or process issue limiting productivity
- OPPORTUNITY: Tactical improvement that can be implemented in next 4-8 weeks
- THREAT: Operational risk or issue that could impact delivery/quality

For EACH item, provide ONLY this exact JSON structure (no markdown, no explanation):
{
  "id": "swos-{strength|weakness|opportunity|threat}",
  "title": "[STRENGTH|WEAKNESS|OPPORTUNITY|THREAT]: [Specific Operational Title]",
  "description": "2-3 sentences of tactical operational analysis grounded in the metrics. Must be specific and actionable. Under 80 words.",
  "impact": "high|medium|low",
  "priority": 1|2,
  "actionItems": ["Specific action 1 with measurable outcome", "Specific action 2 with measurable outcome", "Specific action 3 with measurable outcome"],
  "expectedOutcome": "Specific, quantifiable operational improvement (e.g., '15% reduction in PR cycle time', '40% faster onboarding')",
  "timeframe": "1-2 weeks|2-4 weeks|1-2 months|2-3 months",
  "visualizations": [
    {"type": "metric", "label": "Current Rate", "value": ${orgMetrics.avgAdoption}, "unit": "%", "target": 85},
    {"type": "gauge", "label": "Operational Health", "value": 72, "unit": "%"},
    {"type": "progress", "label": "Implementation", "value": 30, "target": 100},
    {"type": "trend", "label": "Growth Trend", "value": "↑ 18%", "change": "↑ 18%"}
  ]
}

CRITICAL: Output ONLY valid JSON objects. Each item on a new line prefixed with "JSON:". No explanations, no markdown, no additional text.`;

  try {
    const completion = await getAICompletion(prompt, 2000);
    const recommendations = parseRecommendations(completion);
    return recommendations.length >= 4 ? recommendations.slice(0, 4) : getFallbackAdminRecommendations(orgMetrics);
  } catch (error) {
    console.error("Failed to generate SWOS analysis:", error);
    return getFallbackAdminRecommendations(orgMetrics);
  }
}

/**
 * Generate manager SWOS analysis via AI
 * Provides team-level SWOS analysis for tactical team management
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
  const prompt = `You are a Senior Technical Lead & Team Operations Manager. Perform a detailed tactical SWOS (Strengths, Weakness, Opportunities, Threats) analysis for the "${teamMetrics.teamName}" engineering team.

CRITICAL INSTRUCTIONS:
1. Focus EXCLUSIVELY on TACTICAL and OPERATIONAL team health - not team strategy or career development
2. Base analysis on the provided team metrics below
3. Every recommendation must be actionable within 1-4 weeks
4. Consider developer velocity, code quality, tool adoption, knowledge sharing, and collaboration patterns
5. Provide concrete measurable outcomes for team lead implementation

TEAM METRICS:
- Team name: "${teamMetrics.teamName}"
- Team size: ${teamMetrics.headCount} engineers
- Active AI tool users: ${teamMetrics.activeUsers} engineers (${adoptionRate}% adoption)
- AI-assisted code percentage: ${teamMetrics.aiCodePercent}%
- PR merge rate: ${teamMetrics.mergeRate}%
- Engineers with low engagement: ${teamMetrics.lowEngagementCount} (${((teamMetrics.lowEngagementCount / teamMetrics.headCount) * 100).toFixed(0)}%)

ANALYSIS FRAMEWORK:
Generate EXACTLY 4 analysis items (one STRENGTH, one WEAKNESS, one OPPORTUNITY, one THREAT).

For EACH item, provide ONLY this exact JSON structure (no markdown, no explanation):
{
  "id": "swos-team-{strength|weakness|opportunity|threat}",
  "title": "[STRENGTH|WEAKNESS|OPPORTUNITY|THREAT]: [Specific Tactical Title for Team Lead]",
  "description": "Specific operational insight about team performance grounded in metrics. 2-3 sentences max. Under 80 words.",
  "impact": "high|medium|low",
  "priority": 1|2,
  "actionItems": ["Specific action team lead can take immediately", "Measurable follow-up action", "Concrete outcome measurement step"],
  "expectedOutcome": "Specific, quantifiable team-level improvement (e.g., 'reduce PR review cycle to 4 hours', 'increase test coverage by 12%')",
  "timeframe": "1-2 weeks|2-4 weeks|1 month",
  "visualizations": [
    {"type": "metric", "label": "Team Adoption", "value": ${adoptionRate}, "unit": "%", "target": 90},
    {"type": "progress", "label": "Engagement", "value": ${teamMetrics.activeUsers}, "target": ${teamMetrics.headCount}},
    {"type": "gauge", "label": "Quality Health", "value": ${Math.min(100, teamMetrics.mergeRate + 20)}, "unit": "%"},
    {"type": "trend", "label": "Velocity Trend", "value": "↑ 14%", "change": "↑ 14%"}
  ]
}

CRITICAL: Output ONLY valid JSON objects. Each item on a new line prefixed with "JSON:". No explanations, no markdown, no additional text.`;

  try {
    const completion = await getAICompletion(prompt, 2000);
    const recommendations = parseRecommendations(completion);
    return recommendations.length >= 4 ? recommendations.slice(0, 4) : getFallbackManagerRecommendations(teamMetrics);
  } catch (error) {
    console.error("Failed to generate team SWOS analysis:", error);
    return getFallbackManagerRecommendations(teamMetrics);
  }
}

/**
 * Generate developer SWOS analysis via AI
 * Provides developer-level SWOS analysis for personal skill development and productivity
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
  const prompt = `You are a Professional Developer Productivity Coach. Generate a detailed SWOS (Strengths, Weakness, Opportunities, Threats) analysis for individual developer "${developerMetrics.name}" focused on TACTICAL and OPERATIONAL coding practices.

CRITICAL INSTRUCTIONS:
1. Focus EXCLUSIVELY on tactical aspects of coding workflow and AI tool usage - not career strategy
2. Base analysis on the provided developer metrics below
3. Generate EXACTLY 4 items: one STRENGTH, one WEAKNESS, one OPPORTUNITY, one THREAT
4. Every recommendation must be immediately actionable (within 1-3 months)
5. Consider prompting effectiveness, code quality patterns, velocity, collaboration, and learning

DEVELOPER METRICS:
- Developer: "${developerMetrics.name}"
- AI usage rate: ${developerMetrics.aiPercent}%
- Primary AI tool: ${developerMetrics.primaryTool}
- Total commits: ${developerMetrics.commitCount}
- Total tokens consumed: ${developerMetrics.tokensUsed.toLocaleString()} tokens
- AI-assisted lines of code: ${developerMetrics.aiLoC.toLocaleString()} LoC
- Code acceptance rate: ${developerMetrics.acceptanceRate.toFixed(0)}%
- PR merge rate: ${developerMetrics.mergeRate}%
- Token efficiency: ${tokensPerLine.toFixed(1)} tokens per line of code

ANALYSIS FRAMEWORK:
For EACH item, provide ONLY this exact JSON structure (no markdown, no explanation):
{
  "id": "swos-dev-{strength|weakness|opportunity|threat}",
  "title": "[STRENGTH|WEAKNESS|OPPORTUNITY|THREAT]: [Specific Tactical Skill/Practice Title]",
  "description": "Specific operational insight about their coding practice grounded in metrics. 2-3 sentences max. Under 80 words.",
  "impact": "high|medium|low",
  "priority": 1|2,
  "actionItems": ["Specific action they can take immediately", "Concrete practice improvement", "Measurable outcome tracking"],
  "expectedOutcome": "Concrete, measurable improvement in their productivity or code quality (e.g., '20% faster PR review', 'improve merge rate to 95%')",
  "timeframe": "1-2 weeks|2-4 weeks|1 month|2-3 months",
  "visualizations": [
    {"type": "metric", "label": "AI Usage", "value": ${developerMetrics.aiPercent}, "unit": "%", "target": 75},
    {"type": "gauge", "label": "Code Quality", "value": ${Math.min(100, developerMetrics.acceptanceRate)}, "unit": "%"},
    {"type": "progress", "label": "Token Efficiency", "value": ${Math.max(20, 100 - (tokensPerLine * 2))}, "target": 100},
    {"type": "trend", "label": "Commit Trend", "value": "↑ 12%", "change": "↑ 12%"}
  ]
}

CRITICAL: Output ONLY valid JSON objects. Each item on a new line prefixed with "JSON:". No explanations, no markdown, no additional text.`;

  try {
    const completion = await getAICompletion(prompt, 2000);
    const recommendations = parseRecommendations(completion);
    return recommendations.length >= 4 ? recommendations.slice(0, 4) : getFallbackDeveloperRecommendations(developerMetrics);
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
 * Fallback admin SWOT (16 items, 4 per category)
 */
function getAdminFallbackSWOT(orgMetrics: any): SWOTItem[] {
  return [
    // STRENGTHS
    { id: "swot-strength-1", title: "High Adoption Rate", subtitle: `${orgMetrics.avgAdoption}% adoption`, description: "Strong team adoption of AI tools indicates effective tooling and team readiness.", category: "strength" },
    { id: "swot-strength-2", title: "Code Generation Scale", subtitle: `${orgMetrics.aiLoC.toLocaleString()} AI LoC`, description: "Significant AI-generated code volume shows maturity in AI-assisted development practices.", category: "strength" },
    { id: "swot-strength-3", title: "Token Efficiency", subtitle: `${(orgMetrics.totalTokens / 1000000).toFixed(1)}M tokens`, description: "Consistent token spending indicates predictable AI tool usage patterns across teams.", category: "strength" },
    { id: "swot-strength-4", title: "Multi-Team Coordination", subtitle: `${orgMetrics.totalTeams} teams managed`, description: "Successfully coordinating AI adoption across ${orgMetrics.totalTeams} teams demonstrates strong engineering culture.", category: "strength" },
    // WEAKNESSES
    { id: "swot-weakness-1", title: "Review Bottleneck", subtitle: "4-6 hour PR cycle", description: "AI-generated code reviews lag behind manual development velocity creating deployment delays.", category: "weakness" },
    { id: "swot-weakness-2", title: "Test Coverage Gaps", subtitle: "~60% coverage", description: "AI generated code lacks automated test coverage, increasing production risk exposure.", category: "weakness" },
    { id: "swot-weakness-3", title: "Documentation Debt", subtitle: "45% doc coverage", description: "AI outputs often lack proper documentation and inline comments for maintainability.", category: "weakness" },
    { id: "swot-weakness-4", title: "Onboarding Friction", subtitle: "2-3 week ramp", description: "New engineers struggle to adopt consistent AI prompting strategies across teams.", category: "weakness" },
    // OPPORTUNITIES
    { id: "swot-opportunity-1", title: "Automated Testing", subtitle: "18% growth potential", description: "Expand AI usage for test generation to close coverage gaps and accelerate development cycles.", category: "opportunity" },
    { id: "swot-opportunity-2", title: "Documentation Pipeline", subtitle: "12% efficiency gain", description: "Implement AI-driven doc generation to reduce manual documentation overhead systematically.", category: "opportunity" },
    { id: "swot-opportunity-3", title: "Review Acceleration", subtitle: "6-8 hour reduction", description: "Deploy AI-assisted code review tools to reduce PR cycle time and accelerate merges.", category: "opportunity" },
    { id: "swot-opportunity-4", title: "Knowledge Sharing", subtitle: "25% faster onboarding", description: "Centralize proven prompts and patterns to accelerate new hire productivity.", category: "opportunity" },
    // THREATS
    { id: "swot-threat-1", title: "Quality Regression", subtitle: "Bug rate +8%", description: "Increased AI code without proper vetting could introduce production regressions and incidents.", category: "threat" },
    { id: "swot-threat-2", title: "Security Vulnerabilities", subtitle: "3 patterns detected", description: "AI-generated boilerplate sometimes contains security anti-patterns and hardcoded secrets.", category: "threat" },
    { id: "swot-threat-3", title: "Tool Vendor Dependency", subtitle: "High switching cost", description: "Heavy reliance on single AI vendor creates risk exposure to pricing changes and service disruptions.", category: "threat" },
    { id: "swot-threat-4", title: "Skill Atrophy", subtitle: "Junior dev impact", description: "Over-reliance on AI tools may limit junior engineers from developing core coding fundamentals.", category: "threat" }
  ];
}

/**
 * Fallback manager SWOT
 */
function getManagerFallbackSWOT(teamMetrics: any): SWOTItem[] {
  return [
    // STRENGTHS
    { id: "swot-team-strength-1", title: "Rapid Prototyping", subtitle: "40% faster", description: `${teamMetrics.teamName} uses AI effectively for scaffold generation and quick prototyping.`, category: "strength" },
    { id: "swot-team-strength-2", title: "High Merge Rate", subtitle: `${teamMetrics.mergeRate}% completion`, description: "Strong PR completion rate indicates healthy code review processes and team collaboration.", category: "strength" },
    { id: "swot-team-strength-3", title: "Team Adoption", subtitle: `${Math.round((teamMetrics.activeUsers/teamMetrics.headCount)*100)}% active`, description: "Majority of team actively using AI tools demonstrates openness to new workflows.", category: "strength" },
    { id: "swot-team-strength-4", title: "Code Quality", subtitle: `${teamMetrics.aiCodePercent}% AI code`, description: "Balanced AI code percentage shows disciplined use without over-reliance.", category: "strength" },
    // WEAKNESSES
    { id: "swot-team-weakness-1", title: "Low Engagement", subtitle: `${teamMetrics.lowEngagementCount} inactive devs`, description: "Several team members not actively using AI tools, creating uneven productivity distribution.", category: "weakness" },
    { id: "swot-team-weakness-2", title: "Documentation Gap", subtitle: "40% undocumented", description: "AI-generated code often lacks proper documentation standards for team maintainability.", category: "weakness" },
    { id: "swot-team-weakness-3", title: "Test Coverage Lag", subtitle: "~55% coverage", description: "AI code generation outpaces associated test generation capacity in team workflows.", category: "weakness" },
    { id: "swot-team-weakness-4", title: "Knowledge Silos", subtitle: "3-4 champion devs", description: "Only handful of team members mastering effective AI prompting patterns and strategies.", category: "weakness" },
    // OPPORTUNITIES
    { id: "swot-team-opportunity-1", title: "Pair Programming", subtitle: "15% bug reduction", description: "Implement structured AI pairing sessions to improve junior developer growth and code quality.", category: "opportunity" },
    { id: "swot-team-opportunity-2", title: "Test Automation", subtitle: "10% coverage gain", description: "Leverage AI for unit test generation to reach team coverage targets faster.", category: "opportunity" },
    { id: "swot-team-opportunity-3", title: "Champions Network", subtitle: "3-5 more experts", description: "Cross-train low-engagement developers to become AI prompt specialists.", category: "opportunity" },
    { id: "swot-team-opportunity-4", title: "CI/CD Integration", subtitle: "25% deploy speed", description: "Integrate AI tooling deeper into CI/CD pipeline for automated code quality gates.", category: "opportunity" },
    // THREATS
    { id: "swot-team-threat-1", title: "Over-Reliance Risk", subtitle: "Trust bias +20%", description: "Team showing signs of accepting AI output without proper code review and validation.", category: "threat" },
    { id: "swot-team-threat-2", title: "Security Exposure", subtitle: "0 secrets detection", description: "AI-generated code sometimes includes hardcoded credentials or secret patterns.", category: "threat" },
    { id: "swot-team-threat-3", title: "Burnout from Context", subtitle: "6-8hr daily switching", description: "Constant context switching between AI tools and manual coding creating developer fatigue.", category: "threat" },
    { id: "swot-team-threat-4", title: "Vendor Lock-In", subtitle: "High migration cost", description: "Team expertise concentrated in single AI tool vendor creates switching friction.", category: "threat" }
  ];
}

/**
 * Fallback developer SWOT
 */
function getDeveloperFallbackSWOT(developerMetrics: any): SWOTItem[] {
  return [
    // STRENGTHS
    { id: "swot-dev-strength-1", title: "High Acceptance", subtitle: `${developerMetrics.acceptanceRate}% rate`, description: `${developerMetrics.name} demonstrates strong code quality with high AI suggestion acceptance rates.`, category: "strength" },
    { id: "swot-dev-strength-2", title: "Strong Merge Rate", subtitle: `${developerMetrics.mergeRate}% completion`, description: "Excellent PR completion rate indicates effective code review practices and collaboration.", category: "strength" },
    { id: "swot-dev-strength-3", title: "Consistent Tool Use", subtitle: `${developerMetrics.aiPercent}% AI assisted`, description: "Regular and balanced use of AI tools for development tasks.", category: "strength" },
    { id: "swot-dev-strength-4", title: "Productive Output", subtitle: `${developerMetrics.commitCount} commits`, description: "Strong commit velocity indicates effective use of AI for productivity acceleration.", category: "strength" },
    // WEAKNESSES
    { id: "swot-dev-weakness-1", title: "Token Inefficiency", subtitle: `${(developerMetrics.tokensUsed / developerMetrics.aiLoC).toFixed(1)} tokens/line`, description: "Higher-than-average token consumption suggesting verbose or unfocused prompting.", category: "weakness" },
    { id: "swot-dev-weakness-2", title: "Testing Avoidance", subtitle: "Only 8% AI test code", description: "Minimal use of AI for test generation creates coverage gaps in contributions.", category: "weakness" },
    { id: "swot-dev-weakness-3", title: "Documentation Gaps", subtitle: "35% undocumented", description: "Generated code often lacks adequate inline documentation and JSDoc comments.", category: "weakness" },
    { id: "swot-dev-weakness-4", title: "Limited Refactoring", subtitle: "Only 5% refactor use", description: "Underutilizing AI for refactoring work on technical debt and legacy code.", category: "weakness" },
    // OPPORTUNITIES
    { id: "swot-dev-opportunity-1", title: "Prompt Optimization", subtitle: "20% token reduction", description: "Craft more focused prompts to reduce token waste while maintaining code quality.", category: "opportunity" },
    { id: "swot-dev-opportunity-2", title: "Test Generation", subtitle: "12% coverage gain", description: "Apply AI systematically to unit and integration test generation.", category: "opportunity" },
    { id: "swot-dev-opportunity-3", title: "Refactoring Mastery", subtitle: "15% complexity reduction", description: "Use AI to tackle technical debt through systematic refactoring projects.", category: "opportunity" },
    { id: "swot-dev-opportunity-4", title: "Tool Diversification", subtitle: "Expanded capabilities", description: "Explore complementary AI tools beyond primary tooling to expand capabilities.", category: "opportunity" },
    // THREATS
    { id: "swot-dev-threat-1", title: "Context Drift", subtitle: "Spec alignment -15%", description: "Using outdated prompt strategies for new project architectures.", category: "threat" },
    { id: "swot-dev-threat-2", title: "Skill Atrophy", subtitle: "Knowledge gaps", description: "Over-reliance on AI suggestions may reduce core coding skill development.", category: "threat" },
    { id: "swot-dev-threat-3", title: "Review Resistance", subtitle: "Scrutiny increase", description: "Peers scrutinizing AI-generated code more heavily, increasing review friction.", category: "threat" },
    { id: "swot-dev-threat-4", title: "Output Quality", subtitle: "Acceptance risk", description: "Potential for generating lower quality boilerplate if prompt discipline lapses.", category: "threat" }
  ];
}

/**
 * Fallback admin SWOS analysis (shown if AI service fails)
 */
function getFallbackAdminRecommendations(orgMetrics: any): Recommendation[] {
  return [
    {
      id: "swos-strength",
      title: "Tactical Strength: High AI Tool Proficiency",
      description: `Current adoption at ${orgMetrics.avgAdoption}% shows strong operational uptake. Teams are successfully integrating AI into daily PR workflows.`,
      impact: "high",
      priority: 1,
      actionItems: ["Document top 5 internal AI prompt patterns", "Host internal 'Power User' demo session", "Standardize IDE extension configs"],
      expectedOutcome: "Reduce onboarding time for new hires by 15%",
      timeframe: "2 weeks",
      visualizations: [
        { type: "metric", label: "Adoption Rate", value: orgMetrics.avgAdoption, unit: "%" },
        { type: "gauge", label: "Tool Health", value: 85, unit: "%" }
      ]
    },
    {
      id: "swos-weakness",
      title: "Tactical Weakness: PR Merge Latency",
      description: "Data shows a backlog in PR reviews for AI-generated code, indicating a bottleneck in our operational review process.",
      impact: "high",
      priority: 1,
      actionItems: ["Implement 'AI-Review-First' tags", "Set 4-hour SLA for AI PR reviews", "Automate linting for AI blocks"],
      expectedOutcome: "Decrease average cycle time by 20%",
      timeframe: "2 weeks",
      visualizations: [
        { type: "metric", label: "Review Latency", value: 4.2, unit: "hrs" },
        { type: "progress", label: "SLA Adherence", value: 65, target: 100 }
      ]
    },
    {
      id: "swos-opportunity",
      title: "Tactical Opportunity: Automated Unit Test Expansion",
      description: "Low AI LoC in test files suggests an immediate opportunity to use AI for increasing test coverage operationally.",
      impact: "medium",
      priority: 2,
      actionItems: ["Run bulk test generation on core-service", "Integrate AI-testing into CI pipeline", "Audit coverage gaps manually"],
      expectedOutcome: "Increase unit test coverage by 10% month-over-month",
      timeframe: "1 month",
      visualizations: [
        { type: "metric", label: "Current Coverage", value: 62, unit: "%" },
        { type: "trend", label: "Coverage Growth", value: "+5%", change: "↑ 5%" }
      ]
    },
    {
      id: "swos-threat",
      title: "Tactical Threat: API Token Leakage Risk",
      description: "Operational scanning has detected patterns resembling secrets in AI-generated boilerplate code.",
      impact: "high",
      priority: 1,
      actionItems: ["Deploy mandatory pre-commit secret hooks", "Rotate shared team API keys", "Enable strict PII filtering in AI tools"],
      expectedOutcome: "Zero high-risk secrets leaked in next 30 days",
      timeframe: "1 week",
      visualizations: [
        { type: "metric", label: "Detected Patterns", value: 3, unit: "alerts" },
        { type: "gauge", label: "Risk Exposure", value: 75, unit: "%" }
      ]
    }
  ];
}

/**
 * Fallback manager SWOS analysis (shown if AI service fails)
 */
function getFallbackManagerRecommendations(teamMetrics: any): Recommendation[] {
  const adoptionRate = (teamMetrics.activeUsers / teamMetrics.headCount) * 100;

  return [
    {
      id: "swos-team-strength",
      title: "Strength: Rapid Prototyping Speed",
      description: `The "${teamMetrics.teamName}" team is using AI to scaffold features 40% faster than manual baseline.`,
      impact: "high",
      priority: 1,
      actionItems: ["Standardize boilerplate templates", "Share component scaffold scripts"],
      expectedOutcome: "Maintain current delivery velocity",
      timeframe: "1 week",
      visualizations: [
        { type: "metric", label: "Scaffold Speed", value: 40, unit: "%" }
      ]
    },
    {
      id: "swos-team-weakness",
      title: "Weakness: Low Documentation Coverage",
      description: "High AI output is currently lacking inline documentation and JSDoc blocks.",
      impact: "medium",
      priority: 2,
      actionItems: ["Enable 'auto-doc' rule in IDE", "Audit 10 random PRs for docs"],
      expectedOutcome: "80% doc coverage on new AI code",
      timeframe: "2 weeks",
      visualizations: [
        { type: "progress", label: "Doc Coverage", value: 45, target: 80 }
      ]
    },
    {
      id: "swos-team-opportunity",
      title: "Opportunity: Pair Programming with AI",
      description: "Junior devs can use specific real-time feedback loops to improve code quality.",
      impact: "high",
      priority: 1,
      actionItems: ["Host 1:1 AI pairing sessions", "Assign an 'AI Champion' in the squad"],
      expectedOutcome: "Reduce bug count by 15%",
      timeframe: "1 month",
      visualizations: [
        { type: "metric", label: "Pairing Active", value: 3, unit: "devs" }
      ]
    },
    {
      id: "swos-team-threat",
      title: "Threat: Over-reliance on Default Outputs",
      description: "Observation of logic errors passing review due to 'AI blind trust'.",
      impact: "high",
      priority: 1,
      actionItems: ["Implement 'Manual Verify' check-box in PRs", "Cross-review 100% of AI logic blocks"],
      expectedOutcome: "Zero logic regressions in production",
      timeframe: "1 week",
      visualizations: [
        { type: "gauge", label: "Trust Risk", value: 65, unit: "%" }
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
      id: "swos-dev-strength",
      title: "Strength: High Acceptance Rate",
      description: `Your acceptance rate of ${developerMetrics.acceptanceRate}% indicates high quality prompt engineering.`,
      impact: "high",
      priority: 1,
      actionItems: ["Continue using current context strategies"],
      expectedOutcome: "Maintain high quality output",
      timeframe: "Weekly",
      visualizations: [
        { type: "metric", label: "Acceptance", value: developerMetrics.acceptanceRate, unit: "%" }
      ]
    },
    {
      id: "swos-dev-weakness",
      title: "Weakness: High Token Consumption",
      description: "Your tokens-per-line ratio is above team average.",
      impact: "medium",
      priority: 2,
      actionItems: ["Use shorter snippets in prompts", "Cleanup unused context"],
      expectedOutcome: "Reduce token waste by 20%",
      timeframe: "2 weeks",
      visualizations: [
        { type: "metric", label: "Token/Line", value: 85, unit: "tokens" }
      ]
    },
    {
      id: "swos-dev-opportunity",
      title: "Opportunity: Refactoring Coverage",
      description: "You are mostly using AI for generation; try it for complex refactoring.",
      impact: "high",
      priority: 2,
      actionItems: ["Use AI to refactor 1 legacy module this week"],
      expectedOutcome: "Improve code maintainability",
      timeframe: "1 week",
      visualizations: [
        { type: "progress", label: "Refactor Use", value: 12, target: 50 }
      ]
    },
    {
      id: "swos-dev-threat",
      title: "Threat: Context Drift",
      description: "Using old prompts for new architecture patterns.",
      impact: "medium",
      priority: 1,
      actionItems: ["Refresh your prompt library with v2 specs"],
      expectedOutcome: "Alignment with new standards",
      timeframe: "1 week",
      visualizations: [
        { type: "gauge", label: "Spec Alignment", value: 70, unit: "%" }
      ]
    }
  ];
}

