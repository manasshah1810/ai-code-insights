/**
 * Professional PDF Report Generator — AI Code Insights
 * 
 * Generates branded, structured PDF reports with:
 * - Cover page with CI badge + branding
 * - Executive KPIs in formatted cards
 * - Data tables with zebra striping
 * - Inline bar charts rendered via jsPDF primitives
 * - Role-scoped content (Admin/Manager/Developer)
 * - Footer with page numbers and timestamp
 */

import jsPDF from "jspdf";
import type { UserRole } from "@/data/dashboard-data";
import {
  users, teams, orgData, repositories, aiTools,
  teamToolUsage, formatNumber, productivityData, securityData,
  weeklyTrend
} from "@/data/dashboard-data";
import { currentBrand } from "./brand-config";

// ─── Brand Colors ──────────────────────────────────────────
const COLORS = {
  primary: [79, 70, 229] as [number, number, number],       // indigo-600
  primaryDark: [55, 48, 163] as [number, number, number],    // indigo-800
  secondary: [99, 102, 241] as [number, number, number],     // indigo-500
  accent: [16, 185, 129] as [number, number, number],        // emerald-500
  warning: [245, 158, 11] as [number, number, number],       // amber-500
  danger: [239, 68, 68] as [number, number, number],         // red-500
  dark: [15, 23, 42] as [number, number, number],            // slate-900
  text: [51, 65, 85] as [number, number, number],            // slate-600
  textLight: [148, 163, 184] as [number, number, number],    // slate-400
  bg: [248, 250, 252] as [number, number, number],           // slate-50
  white: [255, 255, 255] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],       // slate-200
  zebraRow: [241, 245, 249] as [number, number, number],     // slate-100
  blue: [59, 130, 246] as [number, number, number],
  manual: [100, 116, 139] as [number, number, number],       // slate-500
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginLeft: 40,
  marginRight: 40,
  marginTop: 50,
  marginBottom: 60,
};

const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight;

// ─── Helpers ─────────────────────────────────────────────────

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = PAGE.height - 30;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(PAGE.marginLeft, y - 8, PAGE.width - PAGE.marginRight, y - 8);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${currentBrand.name}  •  Analytics Pro`, PAGE.marginLeft, y);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`, PAGE.marginLeft, y + 10);
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE.width - PAGE.marginRight, y, { align: "right" } as any);
  doc.text("CONFIDENTIAL", PAGE.width - PAGE.marginRight, y + 10, { align: "right" } as any);
}

function checkNewPage(doc: jsPDF, cursor: number, needed: number): number {
  if (cursor + needed > PAGE.height - PAGE.marginBottom) {
    doc.addPage();
    return PAGE.marginTop;
  }
  return cursor;
}

function drawSectionHeader(doc: jsPDF, title: string, y: number, color: [number, number, number] = COLORS.primary): number {
  // Accent bar
  doc.setFillColor(...color);
  doc.rect(PAGE.marginLeft, y, 4, 16, "F");

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont("helvetica", "bold");
  doc.text(title, PAGE.marginLeft + 12, y + 12);

  return y + 28;
}

function drawKpiCard(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, color: [number, number, number] = COLORS.primary) {
  // Card bg
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  // Top accent strip
  doc.setFillColor(...color);
  doc.rect(x, y, w, 3, "F");

  // Label
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), x + 10, y + 18);

  // Value
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.dark);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 10, y + 36);
}

function drawTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  startY: number,
  colWidths?: number[]
): number {
  const cols = headers.length;
  const defaultWidth = CONTENT_WIDTH / cols;
  const widths = colWidths || Array(cols).fill(defaultWidth);
  const rowHeight = 18;
  const headerHeight = 22;
  let y = startY;

  // Header
  y = checkNewPage(doc, y, headerHeight + 4);
  doc.setFillColor(...COLORS.dark);
  doc.rect(PAGE.marginLeft, y, CONTENT_WIDTH, headerHeight, "F");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");

  let xOffset = PAGE.marginLeft;
  headers.forEach((h, i) => {
    doc.text(h.toUpperCase(), xOffset + 6, y + 14);
    xOffset += widths[i];
  });
  y += headerHeight;

  // Rows
  rows.forEach((row, rowIdx) => {
    y = checkNewPage(doc, y, rowHeight);
    // Zebra
    if (rowIdx % 2 === 0) {
      doc.setFillColor(...COLORS.zebraRow);
      doc.rect(PAGE.marginLeft, y, CONTENT_WIDTH, rowHeight, "F");
    }
    // Border
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(PAGE.marginLeft, y + rowHeight, PAGE.marginLeft + CONTENT_WIDTH, y + rowHeight);

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "normal");

    xOffset = PAGE.marginLeft;
    row.forEach((cell, i) => {
      doc.text(cell, xOffset + 6, y + 12, { maxWidth: widths[i] - 12 } as any);
      xOffset += widths[i];
    });
    y += rowHeight;
  });

  return y + 8;
}

function drawInlineBar(doc: jsPDF, x: number, y: number, width: number, height: number, percent: number, color: [number, number, number] = COLORS.primary) {
  // Background
  doc.setFillColor(...COLORS.zebraRow);
  doc.roundedRect(x, y, width, height, 2, 2, "F");
  // Fill
  doc.setFillColor(...color);
  const fillWidth = Math.max(0, (percent / 100) * width);
  if (fillWidth > 0) {
    doc.roundedRect(x, y, fillWidth, height, 2, 2, "F");
  }
}

// ─── Cover Page ──────────────────────────────────────────────

function drawCoverPage(doc: jsPDF, role: UserRole, subtitle: string) {
  // Full page dark background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");

  // Decorative gradient circles
  doc.setFillColor(79, 70, 229); // indigo with low opacity
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.circle(PAGE.width * 0.8, PAGE.height * 0.2, 200, "F");
  doc.circle(PAGE.width * 0.2, PAGE.height * 0.8, 150, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Logo Rendering
  const logoY = 240;
  // Use badge for logo
  doc.setFillColor(...COLORS.primary);
  doc.circle(PAGE.width / 2, logoY, 40, "F");
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");

  // If we have a text logo, use it, otherwise use first 3 chars or placeholder
  const isImageLogo = currentBrand.logo.includes('.');
  const logoText = isImageLogo ? currentBrand.name.substring(0, 3).toUpperCase() : currentBrand.logo;
  doc.text(logoText, PAGE.width / 2, logoY + 11, { align: "center" } as any);

  // Brand Name
  doc.setFontSize(36);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text(currentBrand.name, PAGE.width / 2, logoY + 80, { align: "center" } as any);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.secondary);
  doc.setFont("helvetica", "normal");
  doc.text("ENTERPRISE INTELLIGENCE", PAGE.width / 2, logoY + 100, { align: "center" } as any);

  // Divider line
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(0.5);
  doc.line(PAGE.width / 2 - 60, logoY + 115, PAGE.width / 2 + 60, logoY + 115);

  // Report title
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text("AI Code Intelligence Report", PAGE.width / 2, logoY + 145, { align: "center" } as any);

  // Scope subtitle
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);
  doc.text(subtitle, PAGE.width / 2, logoY + 165, { align: "center" } as any);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(dateStr, PAGE.width / 2, logoY + 195, { align: "center" } as any);

  // Role badge
  const roleBadge = role === "Admin" ? "🛡️ Organization-Wide Report" : role === "Manager" ? "👥 Team Performance Report" : "👤 Personal Analytics Report";
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.secondary);
  doc.text(roleBadge, PAGE.width / 2, logoY + 215, { align: "center" } as any);

  // Bottom info
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.text("CONFIDENTIAL  •  FOR INTERNAL USE ONLY", PAGE.width / 2, PAGE.height - 40, { align: "center" } as any);
}

// ─── Admin Report ────────────────────────────────────────────

function generateAdminReport(doc: jsPDF) {
  let y = PAGE.marginTop;

  // ─── Executive Summary KPIs ───
  y = drawSectionHeader(doc, "Executive Summary", y);

  // Calculations for cost and efficiency
  const tokens = users.reduce((acc, u) => acc + u.tokensUsed, 0);
  const totalCost = aiTools.reduce((acc, t) => acc + (t.totalTokens * t.costPer1kTokens / 1000), 0);
  const efficiency = orgData.aiLoC > 0 ? (tokens / orgData.aiLoC).toFixed(2) : "0";

  const kpiW = (CONTENT_WIDTH - 12) / 3;
  drawKpiCard(doc, PAGE.marginLeft, y, kpiW, 50, "Total Developers", `${orgData.totalDevelopers}`, COLORS.primary);
  drawKpiCard(doc, PAGE.marginLeft + kpiW + 6, y, kpiW, 50, "AI Adoption Rate", `${orgData.aiAdoptionRate}%`, COLORS.accent);
  drawKpiCard(doc, PAGE.marginLeft + (kpiW + 6) * 2, y, kpiW, 50, "AI Code Percentage", `${orgData.aiCodePercent}%`, COLORS.secondary);
  y += 60;

  drawKpiCard(doc, PAGE.marginLeft, y, kpiW, 50, "Total Lines of Code", formatNumber(orgData.totalLoC), COLORS.dark);
  drawKpiCard(doc, PAGE.marginLeft + kpiW + 6, y, kpiW, 50, "Avg. Tokens / Line", `${efficiency}`, COLORS.accent);
  drawKpiCard(doc, PAGE.marginLeft + (kpiW + 6) * 2, y, kpiW, 50, "Monthly AI Investment", `$${formatNumber(totalCost)}`, COLORS.warning);
  y += 60;

  drawKpiCard(doc, PAGE.marginLeft, y, kpiW, 50, "AI Lines of Code", formatNumber(orgData.aiLoC), COLORS.secondary);
  drawKpiCard(doc, PAGE.marginLeft + kpiW + 6, y, kpiW, 50, "Manual Lines of Code", formatNumber(orgData.manualLoC), COLORS.manual);
  drawKpiCard(doc, PAGE.marginLeft + (kpiW + 6) * 2, y, kpiW, 50, "Time Saved (Hours)", formatNumber(productivityData.timeSavedHours), COLORS.accent);
  y += 70;

  // ─── AI vs Manual Code Split Bar ───
  y = checkNewPage(doc, y, 60);
  y = drawSectionHeader(doc, "Code Origin Split", y);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(`AI Generated: ${orgData.aiCodePercent}%`, PAGE.marginLeft, y + 8);
  doc.text(`Manual Crafted: ${(100 - orgData.aiCodePercent).toFixed(1)}%`, PAGE.marginLeft + CONTENT_WIDTH, y + 8, { align: "right" } as any);
  y += 14;

  // Stacked bar
  const barH = 14;
  const aiW = (orgData.aiCodePercent / 100) * CONTENT_WIDTH;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(PAGE.marginLeft, y, aiW, barH, 3, 3, "F");
  doc.setFillColor(...COLORS.border);
  doc.roundedRect(PAGE.marginLeft + aiW, y, CONTENT_WIDTH - aiW, barH, 3, 3, "F");
  y += barH + 20;

  // ─── Adoption Trend ───
  y = checkNewPage(doc, y, 120);
  y = drawSectionHeader(doc, "AI Adoption Trend (16 Weeks)", y);

  // Mini bar chart
  const barWidth = (CONTENT_WIDTH - 30) / weeklyTrend.length;
  const maxAi = Math.max(...weeklyTrend.map(w => w.aiPercent));
  const chartHeight = 80;

  weeklyTrend.forEach((w, i) => {
    const bx = PAGE.marginLeft + 15 + i * barWidth;
    const bh = (w.aiPercent / maxAi) * chartHeight;
    const by = y + chartHeight - bh;

    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(bx, by, barWidth - 2, bh, 1, 1, "F");

    // Label
    if (i % 4 === 0) {
      doc.setFontSize(5);
      doc.setTextColor(...COLORS.textLight);
      doc.text(w.week, bx + (barWidth - 2) / 2, y + chartHeight + 8, { align: "center" } as any);
    }
  });
  y += chartHeight + 20;

  // ─── NEW PAGE: Teams ───
  doc.addPage();
  y = PAGE.marginTop;
  y = drawSectionHeader(doc, "Team Performance Overview", y);

  const teamHeaders = ["Team", "Head Count", "AI %", "Manual %", "Merge Rate", "Primary Tool", "Total LoC"];
  const teamRows = teams
    .sort((a, b) => b.aiCodePercent - a.aiCodePercent)
    .map(t => [
      t.name,
      `${t.headCount}`,
      `${t.aiCodePercent}%`,
      `${(100 - t.aiCodePercent).toFixed(1)}%`,
      `${t.aiMergeRate}%`,
      t.primaryTool,
      formatNumber(t.totalLoC),
    ]);
  const teamColWidths = [130, 55, 50, 55, 60, 70, 70];
  y = drawTable(doc, teamHeaders, teamRows, y, teamColWidths);

  // ─── AI Tools ───
  y = checkNewPage(doc, y, 140);
  y = drawSectionHeader(doc, "AI Tool Attribution", y, COLORS.secondary);

  const toolHeaders = ["AI Tool", "% of AI Code", "Merge Rate", "Active Users", "Avg Cycle Time"];
  const toolRows = aiTools.map(t => [
    t.name,
    `${t.percentOfAI}%`,
    `${t.mergeRate}%`,
    `${t.activeUsers}`,
    `${t.avgCycleTime} min`,
  ]);
  const toolColWidths = [130, 90, 90, 90, 90];
  y = drawTable(doc, toolHeaders, toolRows, y, toolColWidths);

  // ─── Top 15 Engineers ───
  y = checkNewPage(doc, y, 60);
  y = drawSectionHeader(doc, "Top 15 Engineers by AI Adoption", y, COLORS.accent);

  const engHeaders = ["Rank", "Engineer", "Team", "AI %", "Manual %", "LoC", "Merge Rate", "Status"];
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank).slice(0, 15);
  const engRows = sortedUsers.map(u => [
    `#${u.rank}`,
    u.name,
    u.team,
    `${u.aiPercent}%`,
    `${(100 - u.aiPercent).toFixed(1)}%`,
    formatNumber(u.totalLoC),
    `${u.aiMergeRate}%`,
    u.status,
  ]);
  const engColWidths = [35, 85, 90, 45, 50, 55, 60, 70];
  y = drawTable(doc, engHeaders, engRows, y, engColWidths);

  // ─── NEW PAGE: Repositories ───
  doc.addPage();
  y = PAGE.marginTop;
  y = drawSectionHeader(doc, "Repository Inventory", y, COLORS.blue);

  const repoHeaders = ["Repository", "Team", "Total LoC", "AI %", "Merge Rate", "Primary Tool"];
  const repoRows = repositories.map(r => [
    r.name,
    r.team,
    formatNumber(r.totalLoC),
    `${r.aiPercent}%`,
    `${r.mergeRate}%`,
    r.primaryTool,
  ]);
  const repoColWidths = [110, 100, 65, 55, 65, 75];
  y = drawTable(doc, repoHeaders, repoRows, y, repoColWidths);

  // ─── Security Summary ───
  y = checkNewPage(doc, y, 100);
  y = drawSectionHeader(doc, "Security & Guardrail Summary", y, COLORS.danger);

  const secKpiW = (CONTENT_WIDTH - 6) / 2;
  drawKpiCard(doc, PAGE.marginLeft, y, secKpiW, 50, "AI Flaws Detected", formatNumber(securityData.totalAIFlawsDetected), COLORS.danger);
  drawKpiCard(doc, PAGE.marginLeft + secKpiW + 6, y, secKpiW, 50, "Interventions", formatNumber(securityData.interventionsCount), COLORS.warning);
  y += 60;

  drawKpiCard(doc, PAGE.marginLeft, y, secKpiW, 50, "AI Risk Score", `${orgData.aiRiskScore} / 100`, COLORS.dark);
  drawKpiCard(doc, PAGE.marginLeft + secKpiW + 6, y, secKpiW, 50, "Intervention Rate", `${orgData.aiRiskInterventionRate}%`, COLORS.accent);
  y += 70;

  const riskHeaders = ["Risk Type", "Occurrences"];
  const riskRows = securityData.topRiskTypes.map(r => [r.type, formatNumber(r.count)]);
  y = drawTable(doc, riskHeaders, riskRows, y, [350, CONTENT_WIDTH - 350]);
}

// ─── Manager Report ──────────────────────────────────────────

function generateManagerReport(doc: jsPDF, teamId: string, managerId: number) {
  const team = teams.find(t => t.id === teamId);
  const manager = users.find(u => u.id === managerId);
  if (!team || !manager) return;

  const teamMembers = users.filter(u => u.teamId === teamId);
  const teamRepos = repositories.filter(r => r.team === team.name);
  const teamTotalLoC = teamMembers.reduce((a, u) => a + u.totalLoC, 0);
  const teamAiLoC = teamMembers.reduce((a, u) => a + u.aiLoC, 0);
  const teamManualLoC = teamMembers.reduce((a, u) => a + u.manualLoC, 0);
  const teamAiPercent = ((teamAiLoC / teamTotalLoC) * 100).toFixed(1);
  const avgMergeRate = (teamMembers.reduce((a, u) => a + u.aiMergeRate, 0) / teamMembers.length).toFixed(1);
  const teamTokens = teamMembers.reduce((a, u) => a + u.tokensUsed, 0);
  const powerUsers = teamMembers.filter(u => u.status === "Power User").length;

  let y = PAGE.marginTop;

  // ─── Team KPIs ───
  y = drawSectionHeader(doc, `${team.name} — Team Dashboard`, y, COLORS.blue);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(`Manager: ${manager.name} (${manager.role})  •  ${teamMembers.length} engineers`, PAGE.marginLeft + 12, y);
  y += 18;

  const efficiency = teamAiLoC > 0 ? (teamTokens / teamAiLoC).toFixed(2) : "0";

  const kpiW = (CONTENT_WIDTH - 12) / 3;
  drawKpiCard(doc, PAGE.marginLeft, y, kpiW, 50, "Team AI Code %", `${teamAiPercent}%`, COLORS.blue);
  drawKpiCard(doc, PAGE.marginLeft + kpiW + 6, y, kpiW, 50, "Avg. Tokens / Line", `${efficiency}`, COLORS.accent);
  drawKpiCard(doc, PAGE.marginLeft + (kpiW + 6) * 2, y, kpiW, 50, "Avg Merge Rate", `${avgMergeRate}%`, COLORS.accent);
  y += 60;

  drawKpiCard(doc, PAGE.marginLeft, y, kpiW, 50, "Team Size", `${teamMembers.length}`, COLORS.dark);
  drawKpiCard(doc, PAGE.marginLeft + kpiW + 6, y, kpiW, 50, "Power Users", `${powerUsers}`, COLORS.warning);
  drawKpiCard(doc, PAGE.marginLeft + (kpiW + 6) * 2, y, kpiW, 50, "Tokens Consumed", formatNumber(teamTokens), COLORS.secondary);
  y += 70;

  // ─── Members ───
  y = checkNewPage(doc, y, 60);
  y = drawSectionHeader(doc, "Member Performance", y, COLORS.blue);

  const memHeaders = ["Engineer", "Role", "AI %", "Manual %", "Total LoC", "Merge Rate", "Commits", "Status"];
  const memRows = teamMembers
    .sort((a, b) => b.aiPercent - a.aiPercent)
    .map(u => [u.name, u.role, `${u.aiPercent}%`, `${(100 - u.aiPercent).toFixed(1)}%`, formatNumber(u.totalLoC), `${u.aiMergeRate}%`, `${u.commits}`, u.status]);
  const memColWidths = [80, 70, 45, 50, 55, 55, 50, 70];
  y = drawTable(doc, memHeaders, memRows, y, memColWidths);

  // ─── Team AI Tools ───
  y = checkNewPage(doc, y, 80);
  y = drawSectionHeader(doc, "AI Tools Used by Team", y, COLORS.secondary);

  const toolData = teamToolUsage.find(t => t.teamId === teamId);
  if (toolData) {
    const tHeaders = ["AI Tool", "Share %", "Lines of Code"];
    const tRows = toolData.tools.map(t => {
      const at = aiTools.find(a => a.id === t.toolId);
      return [at?.name || t.toolId, `${t.percent}%`, formatNumber(t.loC)];
    });
    y = drawTable(doc, tHeaders, tRows, y, [200, 140, 140]);
  }

  // ─── Team Repos ───
  y = checkNewPage(doc, y, 60);
  y = drawSectionHeader(doc, "Team Repositories", y, COLORS.accent);

  const rHeaders = ["Repository", "Total LoC", "AI %", "Merge Rate", "Primary Tool"];
  const rRows = teamRepos.map(r => [r.name, formatNumber(r.totalLoC), `${r.aiPercent}%`, `${r.mergeRate}%`, r.primaryTool]);
  y = drawTable(doc, rHeaders, rRows, y, [140, 90, 80, 80, 100]);
}

// ─── Developer Report ────────────────────────────────────────

function generateDeveloperReport(doc: jsPDF, userId: number) {
  const user = users.find(u => u.id === userId);
  if (!user) return;

  let y = PAGE.marginTop;

  // ─── Profile ───
  y = drawSectionHeader(doc, `${user.name} — Personal Report`, y, COLORS.accent);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(`${user.role}  •  ${user.team}  •  Primary Tool: ${user.primaryTool}  •  Rank: #${user.rank} of ${users.length}  •  Status: ${user.status}`, PAGE.marginLeft + 12, y);
  y += 20;

  // ─── Personal KPIs ───
  const kpiW = (CONTENT_WIDTH - 12) / 3;
  const efficiency = user.aiLoC > 0 ? (user.tokensUsed / user.aiLoC).toFixed(2) : "0";

  drawKpiCard(doc, PAGE.marginLeft, y, kpiW, 50, "AI Code %", `${user.aiPercent}%`, COLORS.primary);
  drawKpiCard(doc, PAGE.marginLeft + kpiW + 6, y, kpiW, 50, "Avg. Tokens / Line", `${efficiency}`, COLORS.accent);
  drawKpiCard(doc, PAGE.marginLeft + (kpiW + 6) * 2, y, kpiW, 50, "Total Commits", `${user.commits}`, COLORS.dark);
  y += 60;

  drawKpiCard(doc, PAGE.marginLeft, y, kpiW, 50, "Total LoC", formatNumber(user.totalLoC), COLORS.secondary);
  drawKpiCard(doc, PAGE.marginLeft + kpiW + 6, y, kpiW, 50, "AI Merge Rate", `${user.aiMergeRate}%`, COLORS.accent);
  drawKpiCard(doc, PAGE.marginLeft + (kpiW + 6) * 2, y, kpiW, 50, "PR Success Rate", `${user.prMergeRate}%`, COLORS.warning);
  y += 60;

  const kpi2W = (CONTENT_WIDTH - 18) / 4;
  drawKpiCard(doc, PAGE.marginLeft, y, kpi2W, 50, "AI Lines of Code", formatNumber(user.aiLoC), COLORS.primary);
  drawKpiCard(doc, PAGE.marginLeft + kpi2W + 6, y, kpi2W, 50, "Manual Lines of Code", formatNumber(user.manualLoC), COLORS.manual);
  drawKpiCard(doc, PAGE.marginLeft + (kpi2W + 6) * 2, y, kpi2W, 50, "Tokens Used", formatNumber(user.tokensUsed), COLORS.blue);
  drawKpiCard(doc, PAGE.marginLeft + (kpi2W + 6) * 3, y, kpi2W, 50, "PRs Merged", `${user.prsMerged}/${user.prsOpened}`, COLORS.accent);
  y += 70;

  // ─── Code Split Bar ───
  y = checkNewPage(doc, y, 50);
  y = drawSectionHeader(doc, "Code Origin", y);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(`AI: ${user.aiPercent}% (${formatNumber(user.aiLoC)} LoC)`, PAGE.marginLeft, y + 8);
  doc.text(`Manual: ${(100 - user.aiPercent).toFixed(1)}% (${formatNumber(user.manualLoC)} LoC)`, PAGE.marginLeft + CONTENT_WIDTH, y + 8, { align: "right" } as any);
  y += 14;
  const barH = 12;
  const aiWidth = (user.aiPercent / 100) * CONTENT_WIDTH;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(PAGE.marginLeft, y, aiWidth, barH, 3, 3, "F");
  doc.setFillColor(...COLORS.border);
  doc.roundedRect(PAGE.marginLeft + aiWidth, y, CONTENT_WIDTH - aiWidth, barH, 3, 3, "F");
  y += barH + 24;

  // ─── Weekly Trend ───
  y = checkNewPage(doc, y, 80);
  y = drawSectionHeader(doc, "Adoption Trend (30 Days)", y);

  const trendData = user.weeklyTrend;
  const barW = 80;
  const chartH = 60;
  const maxP = Math.max(...trendData.map(w => w.aiPercent));

  trendData.forEach((w, i) => {
    const bx = PAGE.marginLeft + 20 + i * (barW + 20);
    const bh = (w.aiPercent / maxP) * chartH;
    const by = y + chartH - bh;

    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(bx, by, barW, bh, 2, 2, "F");

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(`${w.aiPercent}%`, bx + barW / 2, by - 4, { align: "center" } as any);

    doc.setFontSize(6);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont("helvetica", "normal");
    doc.text(w.week, bx + barW / 2, y + chartH + 10, { align: "center" } as any);
  });
  y += chartH + 24;

  // ─── Recent PRs ───
  y = checkNewPage(doc, y, 60);
  y = drawSectionHeader(doc, "Recent Pull Requests", y, COLORS.secondary);

  const prHeaders = ["PR Title", "Status", "AI %", "Date"];
  const prRows = user.recentPRs.map(pr => [pr.title, pr.status, `${pr.aiPercent}%`, pr.date]);
  y = drawTable(doc, prHeaders, prRows, y, [230, 80, 80, 80]);

  // ─── Tooling stats ───
  y = checkNewPage(doc, y, 60);
  y = drawSectionHeader(doc, "AI Tooling Details", y);

  const toolHeaders = ["Metric", "Value"];
  const toolRows = [
    ["Cursor Accept Rate", `${user.cursorAcceptRate.toFixed(1)}%`],
    ["Copilot Accept Rate", `${user.copilotAcceptRate.toFixed(1)}%`],
    ["Cursor Completions", formatNumber(user.cursorCompletions)],
    ["Copilot Suggestions", formatNumber(user.copilotSuggestions)],
  ];
  drawTable(doc, toolHeaders, toolRows, y, [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2]);
}

// ─── Main Export Orchestrator ────────────────────────────────

export async function exportReport(
  role: UserRole,
  userId?: number,
  teamId?: string
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // Determine scope label
  let subtitle = "Organization-Wide Analytics";
  if (role === "Manager") {
    const team = teams.find(t => t.id === teamId);
    subtitle = `Team Report — ${team?.name || "Unknown Team"}`;
  } else if (role === "Developer") {
    const user = users.find(u => u.id === userId);
    subtitle = `Personal Report — ${user?.name || "Unknown Developer"}`;
  }

  // ─── Cover Page ───
  drawCoverPage(doc, role, subtitle);

  // ─── Content Pages ───
  doc.addPage();

  switch (role) {
    case "Admin":
      generateAdminReport(doc);
      break;
    case "Manager":
      generateManagerReport(doc, teamId || "infra", userId || 6);
      break;
    case "Developer":
      generateDeveloperReport(doc, userId || 3);
      break;
  }

  // ─── Add footers to all pages (except cover) ───
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i - 1, totalPages - 1);
  }

  // ─── Save ───
  const timestamp = new Date().toISOString().slice(0, 10);
  const roleName = role.toLowerCase();
  doc.save(`ai-code-insights-${roleName}-report-${timestamp}.pdf`);
}

/**
 * Export HTML element to PDF
 * @param elementId - ID of the HTML element to export
 * @param filename - Name of the PDF file (without extension)
 */
export async function exportToPdf(elementId: string, filename: string): Promise<void> {
  try {
    const { default: html2canvas } = await import("html2canvas");

    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID '${elementId}' not found`);
      return;
    }

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#f8fafb",
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "mm",
      format: [canvas.width * 0.264583, canvas.height * 0.264583],
    });

    doc.addImage(imgData, "PNG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
  }
}

