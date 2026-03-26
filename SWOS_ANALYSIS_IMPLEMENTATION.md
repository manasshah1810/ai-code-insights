# SWOS Analysis Implementation - Complete Guide

## Overview
The application has been rebranded from "AI Recommendations" to **SWOS Analysis** (Strengths, Weaknesses, Opportunities, Threats) with tactical and operational focus.

---

## 1. Core Features

### 1.1 Three-Tier SWOS Analysis
The system provides role-specific SWOS analyses:

#### **Admin Level (Company-Wide)**
- **URL**: `/ai-summary`
- **Title**: "Executive SWOS Analysis"
- **Scope**: Entire organization across all teams
- **Metrics Used**:
  - Total teams
  - Average AI adoption rate
  - Total tokens consumed
  - Total lines of code
  - AI-assisted lines of code percentage
- **Output**: 4 analyses (Strength, Weakness, Opportunity, Threat)

#### **Manager Level (Team-Specific)**
- **URL**: `/ai-summary`
- **Title**: "Team SWOS Analysis"
- **Scope**: Specific team performance
- **Metrics Used**:
  - Team size
  - Active AI tool users (adoption rate)
  - AI-assisted code percentage
  - PR merge rate
  - Low engagement count
- **Output**: 4 analyses (one per SWOS category)

#### **Developer Level (Individual)**
- **URL**: `/ai-summary`
- **Title**: "Personal SWOS Analysis"
- **Scope**: Individual developer productivity
- **Metrics Used**:
  - AI usage percentage
  - Token consumption
  - AI-assisted lines of code
  - Commit count
  - Code acceptance rate
  - PR merge rate
  - Primary AI tool
- **Output**: 4 analyses (one per SWOS category)

---

## 2. AI Engine Configuration

### 2.1 API Integration
- **Provider**: OpenRouter
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Model**: `qwen/qwen3-next-80b-a3b-instruct:free`
- **API Key**: Configured in `src/lib/ai-completion-service.ts`

### 2.2 Request Parameters
- **Temperature**: 0.7 (balanced responses)
- **Max Tokens**: 2000 (comprehensive analysis)
- **Response Format**: JSON with specific structure

---

## 3. Prompt Architecture

### 3.1 Admin SWOS Prompt
```
Focus: Company-wide tactical & operational insights
Contains: Detailed metrics for ${totalTeams} teams
Output: 4 JSON objects (one per SWOS category)
Examples:
- STRENGTH: High AI tool adoption rates
- WEAKNESS: PR merge latency issues
- OPPORTUNITY: Automated test expansion
- THREAT: Token leakage risks
```

### 3.2 Manager SWOS Prompt
```
Focus: Team health & productivity
Contains: Team metric analysis
Output: 4 JSON objects (one per SWOS category)
Examples:
- STRENGTH: Rapid prototyping speed
- WEAKNESS: Documentation coverage
- OPPORTUNITY: Pair programming with AI
- THREAT: Over-reliance on ML outputs
```

### 3.3 Developer SWOS Prompt
```
Focus: Individual coding practices & efficiency
Contains: Developer productivity metrics
Output: 4 JSON objects (one per SWOS category)
Examples:
- STRENGTH: High acceptance rate
- WEAKNESS: Token consumption
- OPPORTUNITY: Refactoring usage
- THREAT: Context drift
```

---

## 4. Response Structure

Each SWOS analysis item includes:

```json
{
  "id": "swos-{category}",
  "title": "[STRENGTH|WEAKNESS|OPPORTUNITY|THREAT]: [Specific Title]",
  "description": "2-3 sentence tactical insight (< 80 words)",
  "impact": "high|medium|low",
  "priority": 1|2,
  "actionItems": [
    "Specific action 1",
    "Specific action 2",
    "Specific action 3"
  ],
  "expectedOutcome": "Quantifiable operational improvement",
  "timeframe": "1-2 weeks|2-4 weeks|1-2 months|2-3 months",
  "visualizations": [
    {"type": "metric", "label": "...", "value": ..., "unit": "..."},
    {"type": "gauge", "label": "...", "value": ..., "unit": "..."},
    {"type": "progress", "label": "...", "value": ..., "target": ...},
    {"type": "trend", "label": "...", "value": "...", "change": "..."}
  ]
}
```

---

## 5. UI Components

### 5.1 AISummaryPage
Located at: `src/pages/AISummaryPage.tsx`

Features:
- Role-based analysis generation
- Loading states with Qwen engine indicator
- Error handling with recovery option
- Expandable analysis cards
- SWOS-colored badges (Strength=Green, Weakness=Gray, Opportunity=Blue, Threat=Red)
- Summary statistics (Priority Actions, High Impact Items, Implementation Time)

### 5.2 Navigation
- **Navigation Item**: "SWOS Analysis"
- **Icon**: Sparkles
- **Roles**: Admin, Manager, Developer
- **Location**: Main sidebar in `AppSidebar.tsx`

---

## 6. Key Innovations

### 6.1 Tactical vs Strategic Focus
- ✅ All analyses focus on **operational** and **tactical** improvements
- ✅ Excludes high-level strategy or organizational redesign
- ✅ Actionable within 1-4 weeks timeframe

### 6.2 Detailed Prompts
- ✅ Comprehensive metric context provided
- ✅ Specific output format enforced (JSON)
- ✅ Role-specific language and examples
- ✅ Clear success metrics definition

### 6.3 Intelligent Fallback
- If OpenRouter API fails, fallback recommendations are provided
- Fallback data is contextually relevant to metrics
- User experience maintained without API dependency

### 6.4 Visualization System
- 4 visualization types: Metric, Gauge, Progress, Trend
- Role-appropriate metrics and targets
- Color-coded by visualization type
- Animated display with staggered timing

---

## 7. Usage Flow

### 7.1 Admin Workflow
1. Navigate to `/ai-summary` or click "SWOS Analysis" in sidebar
2. System loads organizational metrics
3. OpenRouter Qwen model generates executive-level SWOS
4. 4 analyses displayed (Strength, Weakness, Opportunity, Threat)
5. Click to expand for detailed actions and metrics
6. Filter or regenerate as needed

### 7.2 Manager Workflow
1. Navigate to `/ai-summary`
2. System automatically detects manager's team
3. Team-specific SWOS analysis generated
4. 4 analyses with team-focused action items
5. Actionable items for immediate team improvement

### 7.3 Developer Workflow
1. Navigate to `/ai-summary`
2. System loads individual developer's metrics
3. Personal productivity SWOS analysis generated
4. 4 analyses with individual skill improvement
5. Actionable items for skill development

---

## 8. Data Flow

```
User Role Detected (via useAppStore)
    ↓
Metrics Aggregated (orgData, teamData, userData)
    ↓
Prompt Generated with Metrics
    ↓
OpenRouter API Call (Qwen Model)
    ↓
Response Parsing (JSON extraction)
    ↓
Fallback if API Fails
    ↓
Recommendations Cached (localStorage)
    ↓
UI Rendering (AISummaryPage)
    ↓
User Interaction (expand, view details)
```

---

## 9. Configuration Details

### 9.1 API Key Management
```typescript
const OPENROUTER_API_KEY = "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";
const AI_MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";
const AI_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
```

### 9.2 Cache Configuration
- **Strategy**: localStorage-based
- **Key Prefix**: `ai_recommendations_`
- **TTL**: 24 hours
- **Metrics Tracking**: Cached with analysis data

---

## 10. Implementation Checklist

✅ SWOS terminology implemented throughout  
✅ Navigation branded as "SWOS Analysis"  
✅ Four-item SWOS structure (S, W, O, T)  
✅ OpenRouter + Qwen model integrated  
✅ Detailed tactical prompts created  
✅ Admin company-wide analysis  
✅ Manager team-level analysis  
✅ Developer individual analysis  
✅ Response parsing and validation  
✅ Fallback mechanisms  
✅ caching system  
✅ Rich UI with visualizations  
✅ Error handling  
✅ Loading states  

---

## 11. Next Steps (Optional)

1. **Real-time Updates**: Connect to live webhook events
2. **Export Functionality**: PDF export of SWOS analysis
3. **Historical Tracking**: Compare SWOS analyses over time
4. **Team Collaboration**: Shared SWOS discussion boards
5. **Custom Metrics**: Allow admins to add custom metrics to analysis

---

## 12. Testing Guide

### Manual Testing
1. Switch to Admin role → Navigate to SWOS Analysis
2. Verify company-wide metrics are displayed
3. Click "Regenerate SWOS" to test OpenRouter API
4. Switch to Manager role → Verify team-specific analysis
5. Switch to Developer role → Verify personal analysis

### API Testing
```bash
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"model":"qwen/qwen3-next-80b-a3b-instruct:free","messages":[{"role":"user","content":"test"}]}'
```

---

## 13. Support & Troubleshooting

### API Rate Limiting
- Free tier has usage limits
- Implement proper error handling
- Cache results to minimize API calls

### Response Parsing
- Expects JSON prefixed with "JSON:"
- Falls back to hardcoded recommendations if parsing fails
- Check browser console for detailed errors

### Performance
- Large token counts may slow response
- Caching greatly improves subsequent loads
- Consider pagination for large organizations

---

## 14. File Reference

| File | Purpose |
|------|---------|
| `src/lib/ai-completion-service.ts` | SWOS generation functions |
| `src/pages/AISummaryPage.tsx` | SWOS display UI |
| `src/components/AppSidebar.tsx` | Navigation branding |
| `src/lib/recommendation-cache-service.ts` | Caching logic |
| `src/store/app-store.ts` | Role management |
| `src/data/dashboard-data.ts` | Metrics source |

---

## Document: Generated March 26, 2026
**Status**: ✅ COMPLETE & READY FOR PRODUCTION
